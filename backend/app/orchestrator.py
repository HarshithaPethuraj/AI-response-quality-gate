import time
import uuid
from .config import settings
from .models import (ExecuteRequest, ExecutionResult, Attempt,
                     FailureType, RecoveryStrategy)
from .providers import complete, ProviderError
from .validator import validate_response
from . import recovery


def _overall(v) -> float:
    """Single number to pick the 'best attempt' if we never fully pass."""
    if v is None:
        return 0.0
    base = (v.grounding_score + v.completeness_score + v.quality_score) / 3
    if not v.schema_valid:
        base *= 0.5
    if v.contradictions or v.hallucinations:
        base *= 0.8
    return base


async def run_execution(req: ExecuteRequest) -> ExecutionResult:
    exec_id = str(uuid.uuid4())
    t0 = time.perf_counter()
    max_retries = req.max_retries if req.max_retries is not None else settings.max_retries

    trace: list[Attempt] = []
    provider, model = settings.primary_provider, settings.primary_model
    strategy = RecoveryStrategy.NONE
    system, user = recovery.initial_prompt(req)

    best = None            # (score, Attempt)
    fallback_used = False
    attempts_on_model = 0

    while True:
        a0 = time.perf_counter()
        try:
            raw = await complete(provider, model, system, user)
        except (ProviderError, Exception):
            raw = ""        # empty response -> validation fails, loop continues
        latency = (time.perf_counter() - a0) * 1000

        validation = await validate_response(
            req.prompt, req.source_content, req.expected_schema, raw)
        failure = recovery.classify(validation)

        attempt = Attempt(
            attempt=len(trace), provider=provider, model=model,
            strategy_applied=strategy, prompt_used=user, raw_response=raw,
            validation=validation, failure_type=failure,
            latency_ms=round(latency, 1),
        )
        trace.append(attempt)

        score = _overall(validation)
        if best is None or score > best[0]:
            best = (score, attempt)

        if validation.passed:
            break

        attempts_on_model += 1
        if attempts_on_model > max_retries:
            if not fallback_used:                     # escalate to stronger model
                fallback_used = True
                provider, model = settings.fallback_provider, settings.fallback_model
                strategy = RecoveryStrategy.FALLBACK_MODEL
                attempts_on_model = 0
                system, user = recovery.corrective_prompt(
                    RecoveryStrategy.PROMPT_REWRITE, req, validation, raw)
                continue
            break                                     # give up, return best attempt

        strategy = recovery.select_strategy(failure, attempts_on_model - 1)
        system, user = recovery.corrective_prompt(strategy, req, validation, raw)

    total = (time.perf_counter() - t0) * 1000
    best_attempt = best[1]
    passed = best_attempt.validation.passed

    return ExecutionResult(
        id=exec_id,
        prompt=req.prompt,
        passed=passed,
        final_response=best_attempt.raw_response,
        final_validation=best_attempt.validation,
        failure_type=FailureType.NONE if passed else best_attempt.failure_type,
        retry_count=max(len(trace) - 1, 0),
        fallback_used=fallback_used,
        total_latency_ms=round(total, 1),
        recommended_actions=recovery.recommend(best_attempt.failure_type, passed),
        trace=trace,
        created_at=time.time(),
    )
