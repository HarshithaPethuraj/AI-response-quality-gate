# Approach & Design Notes

This document explains *how* the AI Response Quality Gate works and *why* it is
built the way it is — the reasoning behind the architecture, not just the
feature list.

## The core idea

An LLM is treated as an **unreliable component**. Instead of trusting a raw
response, every response passes through a **quality gate**; if it fails, the
system attempts **automatic recovery** before returning anything. The whole
process is fully observable so a human can see exactly what happened and why.

## The execution loop

```
POST /api/execute
  -> build prompt (inject SOURCE + SCHEMA)
  -> call MODEL (primary)
  -> VALIDATE (schema check + LLM judge)
       pass -> return
       fail -> CLASSIFY failure -> SELECT recovery strategy
               -> rebuild prompt / repair / retry
               -> loop up to max_retries
               -> then escalate to FALLBACK model
               -> if still failing, return best attempt + recommended actions
```

## Scoring: two layers

1. **Deterministic schema check** (`jsonschema`) — fast, reliable, no model
   needed. If structured output was requested, this is a hard gate.
2. **LLM-as-judge** — a second model call scores grounding, completeness, and
   quality on a 0–1 rubric and lists contradictions/hallucinations. A lexical
   token-overlap fallback runs when no judge model is configured, so the system
   works offline in `mock` mode.

**Grounding** is the primary hallucination signal: the fraction of the
response's claims actually supported by the source. Low grounding = the model
is inventing things.

## Failure classification -> recovery strategy

| Failure | First strategy | Rationale |
|---|---|---|
| `SCHEMA_INVALID` | `RESPONSE_REPAIR` | Reformat only — cheapest fix, no re-reasoning |
| `CONTRADICTION` | `PROMPT_REWRITE` | Point out the conflict explicitly |
| `HALLUCINATION` | `PROMPT_REWRITE` | Constrain the model back to the source |
| `INCOMPLETE` | `PROMPT_REWRITE` | Demand full coverage |
| `LOW_QUALITY` | `RETRY` then `PROMPT_REWRITE` | A fresh sample may suffice first |

Retries on the primary are capped by `MAX_RETRIES`. When exhausted, the system
escalates to a stronger **fallback model**. If that also fails, it returns the
*best attempt seen* (highest composite score), flagged as unresolved, with
recommended actions — never nothing.

## Why this design

- **Cheap-primary / strong-fallback** mirrors a real production cost pattern:
  spend little on the common case, escalate only when needed.
- **Provider abstraction** (`complete()`) means OpenAI, Anthropic, Groq, or a
  mock can be swapped by config alone — no code changes.
- **Full trace + latency per attempt** turns an opaque pipeline into something
  debuggable, which is the entire point of the React front-end.

## Known limitations

- History is in-memory; a `Store` interface makes swapping to SQLite/Postgres a
  one-file change.
- The judge is itself an LLM and can be imperfect — its scores are a strong
  signal, not ground truth.
- `mock` mode's lexical grounding is a coarse proxy for the semantic judgement a
  real judge model provides.
