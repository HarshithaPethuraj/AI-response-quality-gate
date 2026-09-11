import json
import re
from jsonschema import validate as js_validate, ValidationError
from .config import settings
from .models import ValidationResult
from .providers import complete


# ---------- helpers ----------
def extract_json(text: str):
    """Pull the first JSON object out of a model response, tolerating
    code fences and surrounding prose."""
    if not text:
        return None
    t = re.sub(r"```(?:json)?", "", text).replace("```", "").strip()
    try:
        return json.loads(t)
    except Exception:
        pass
    start = t.find("{")
    if start == -1:
        return None
    depth = 0
    for i in range(start, len(t)):
        if t[i] == "{":
            depth += 1
        elif t[i] == "}":
            depth -= 1
            if depth == 0:
                try:
                    return json.loads(t[start:i + 1])
                except Exception:
                    return None
    return None


def check_schema(text: str, schema: dict | None):
    """Deterministic: does the output match the required JSON shape?"""
    if not schema:
        return True, []
    obj = extract_json(text)
    if obj is None:
        return False, ["response is not valid JSON"]
    try:
        js_validate(obj, schema)
        return True, []
    except ValidationError as e:
        return False, [e.message]


def _tokens(s: str):
    return set(re.findall(r"[a-z0-9]+", (s or "").lower()))


def lexical_scores(source: str, response: str) -> dict:
    """No-API fallback. Crude token-overlap grounding so the app runs offline."""
    st, rt = _tokens(source), _tokens(response)
    if not rt:
        return dict(grounding=0.0, completeness=0.0, quality=0.0,
                    contradictions=[], hallucinations=[], reasoning="empty response")
    grounding = len(rt & st) / len(rt) if st else 1.0
    completeness = len(rt & st) / len(st) if st else 0.8
    # If the response introduces many tokens absent from the source, flag it.
    extra = rt - st
    halluc = []
    if st and grounding < settings.grounding_threshold:
        halluc = ["response contains claims not found in the source"]
    return dict(grounding=round(grounding, 2), completeness=round(min(completeness, 1.0), 2),
                quality=0.8, contradictions=[], hallucinations=halluc,
                reasoning="lexical fallback (no judge model)")


# ---------- the LLM judge ----------
JUDGE_SYSTEM = (
    "You are a strict evaluator of AI outputs. You compare a RESPONSE against "
    "SOURCE material and a task PROMPT. Return ONLY JSON, no prose."
)

JUDGE_TEMPLATE = """PROMPT:
{prompt}

SOURCE (ground truth; if empty, judge general correctness):
{source}

RESPONSE TO EVALUATE:
{response}

Return JSON with exactly these keys:
{{
  "grounding": <0..1, fraction of response claims supported by SOURCE>,
  "completeness": <0..1, how fully it addresses the PROMPT>,
  "quality": <0..1, overall relevance and correctness>,
  "contradictions": [<claims that conflict with SOURCE>],
  "hallucinations": [<claims not supported by SOURCE>],
  "reasoning": "<one short sentence>"
}}"""


async def _judge(prompt: str, source: str, response: str) -> dict:
    out = await complete(settings.judge_provider, settings.judge_model,
                         JUDGE_SYSTEM,
                         JUDGE_TEMPLATE.format(prompt=prompt, source=source,
                                               response=response))
    data = extract_json(out) or {}
    return dict(
        grounding=float(data.get("grounding", 0.0)),
        completeness=float(data.get("completeness", 0.0)),
        quality=float(data.get("quality", 0.0)),
        contradictions=list(data.get("contradictions", [])),
        hallucinations=list(data.get("hallucinations", [])),
        reasoning=str(data.get("reasoning", "")),
    )


# ---------- public entry point ----------
async def validate_response(prompt, source, schema, response) -> ValidationResult:
    schema_valid, schema_errors = check_schema(response, schema)

    if settings.judge_provider == "mock":
        s = lexical_scores(source, response)
    else:
        s = await _judge(prompt, source, response)

    # If no source was given, there's nothing to hallucinate against.
    if not (source or "").strip():
        s["grounding"] = 1.0
        s["contradictions"], s["hallucinations"] = [], []

    passed = (
        schema_valid
        and s["grounding"] >= settings.grounding_threshold
        and s["completeness"] >= settings.completeness_threshold
        and s["quality"] >= settings.quality_threshold
        and not s["contradictions"]
        and not s["hallucinations"]
    )
    reasoning = s["reasoning"] or ""
    if schema_errors:
        reasoning = f"Schema: {schema_errors[0]}. " + reasoning

    return ValidationResult(
        schema_valid=schema_valid,
        grounding_score=s["grounding"],
        completeness_score=s["completeness"],
        quality_score=s["quality"],
        contradictions=s["contradictions"],
        hallucinations=s["hallucinations"],
        passed=passed,
        reasoning=reasoning.strip(),
    )
