from .config import settings
from .models import ValidationResult, FailureType, RecoveryStrategy, ExecuteRequest


def classify(v: ValidationResult) -> FailureType:
    """Priority order matters: schema is the hardest gate, quality the softest."""
    if v.passed:
        return FailureType.NONE
    if not v.schema_valid:
        return FailureType.SCHEMA_INVALID
    if v.contradictions:
        return FailureType.CONTRADICTION
    if v.hallucinations or v.grounding_score < settings.grounding_threshold:
        return FailureType.HALLUCINATION
    if v.completeness_score < settings.completeness_threshold:
        return FailureType.INCOMPLETE
    return FailureType.LOW_QUALITY


def select_strategy(failure: FailureType, prior_attempts: int) -> RecoveryStrategy:
    if failure == FailureType.SCHEMA_INVALID:
        # First try a cheap reformat; if that fails, rewrite the whole prompt.
        return RecoveryStrategy.RESPONSE_REPAIR if prior_attempts == 0 \
            else RecoveryStrategy.PROMPT_REWRITE
    if failure in (FailureType.HALLUCINATION, FailureType.CONTRADICTION,
                   FailureType.INCOMPLETE):
        return RecoveryStrategy.PROMPT_REWRITE
    if failure == FailureType.LOW_QUALITY:
        return RecoveryStrategy.RETRY if prior_attempts == 0 \
            else RecoveryStrategy.PROMPT_REWRITE
    return RecoveryStrategy.RETRY


SYSTEM = ("You are a careful assistant. Use ONLY the SOURCE. "
          "Return output that strictly matches the JSON SCHEMA. Output JSON only.")


def initial_prompt(req: ExecuteRequest) -> tuple[str, str]:
    user = (f"SOURCE:\n{req.source_content}\n\n"
            f"SCHEMA:\n{req.expected_schema}\n\n"
            f"TASK:\n{req.prompt}")
    return SYSTEM, user


def corrective_prompt(strategy, req, v: ValidationResult, last_raw: str):
    """Build the next prompt based on the chosen recovery strategy."""
    if strategy == RecoveryStrategy.RESPONSE_REPAIR:
        user = (f"Your previous output did not match the required JSON schema. "
                f"Reformat it to strictly match. Do NOT add or change facts.\n\n"
                f"SCHEMA:\n{req.expected_schema}\n\n"
                f"PREVIOUS OUTPUT:\n{last_raw}\n\nReturn JSON only.")
        return SYSTEM, user

    if strategy == RecoveryStrategy.RETRY:
        return initial_prompt(req)  # same prompt, fresh sample

    # PROMPT_REWRITE / FALLBACK_MODEL: inject specific corrective feedback.
    problems = []
    if v.hallucinations:
        problems.append("You invented: " + "; ".join(v.hallucinations))
    if v.contradictions:
        problems.append("You contradicted the source: " + "; ".join(v.contradictions))
    if v.completeness_score < settings.completeness_threshold:
        problems.append("You missed required detail - answer the task fully.")
    if not v.schema_valid:
        problems.append("Your output must be valid JSON matching the schema.")
    feedback = " ".join(problems) or "Improve accuracy and completeness."

    user = (f"SOURCE:\n{req.source_content}\n\n"
            f"SCHEMA:\n{req.expected_schema}\n\n"
            f"TASK:\n{req.prompt}\n\n"
            f"IMPORTANT - your last attempt failed. {feedback} "
            f"Use ONLY facts present in the SOURCE. Output JSON only.")
    return SYSTEM, user


def recommend(failure: FailureType, passed: bool) -> list[str]:
    if passed:
        return ["Response passed all quality gates. Safe to use."]
    tips = {
        FailureType.SCHEMA_INVALID: "Enforce structure via function/tool calling; lower temperature.",
        FailureType.HALLUCINATION: "Strengthen grounding - add retrieval (RAG) or trim the source to essentials.",
        FailureType.CONTRADICTION: "Check source quality; the source may itself be ambiguous.",
        FailureType.INCOMPLETE: "Increase max tokens or split the task into smaller steps.",
        FailureType.LOW_QUALITY: "Use a stronger primary model for this class of prompt.",
    }
    return [tips.get(failure, "Review manually."), "Escalate to human review."]
