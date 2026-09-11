from enum import Enum
from typing import Any
from pydantic import BaseModel


class FailureType(str, Enum):
    NONE = "NONE"
    SCHEMA_INVALID = "SCHEMA_INVALID"
    CONTRADICTION = "CONTRADICTION"
    HALLUCINATION = "HALLUCINATION"
    INCOMPLETE = "INCOMPLETE"
    LOW_QUALITY = "LOW_QUALITY"


class RecoveryStrategy(str, Enum):
    NONE = "NONE"
    RETRY = "RETRY"                    # same prompt again
    PROMPT_REWRITE = "PROMPT_REWRITE"  # rebuild prompt with corrective feedback
    RESPONSE_REPAIR = "RESPONSE_REPAIR"  # reformat the bad output, no re-reasoning
    FALLBACK_MODEL = "FALLBACK_MODEL"  # switch to the stronger model


class ExecuteRequest(BaseModel):
    prompt: str
    source_content: str = ""                 # ground truth to validate against
    expected_schema: dict[str, Any] | None = None
    max_retries: int | None = None           # optional per-request override


class ValidationResult(BaseModel):
    schema_valid: bool
    grounding_score: float
    completeness_score: float
    quality_score: float
    contradictions: list[str] = []
    hallucinations: list[str] = []
    passed: bool
    reasoning: str = ""


class Attempt(BaseModel):
    """One trip through the loop. The trace is a list of these."""
    attempt: int
    provider: str
    model: str
    strategy_applied: RecoveryStrategy
    prompt_used: str
    raw_response: str
    validation: ValidationResult | None = None
    failure_type: FailureType = FailureType.NONE
    latency_ms: float


class ExecutionResult(BaseModel):
    id: str
    prompt: str
    passed: bool
    final_response: str
    final_validation: ValidationResult | None
    failure_type: FailureType
    retry_count: int
    fallback_used: bool
    total_latency_ms: float
    recommended_actions: list[str]
    trace: list[Attempt]
    created_at: float
