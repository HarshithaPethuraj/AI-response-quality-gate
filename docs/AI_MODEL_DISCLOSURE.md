# AI Model Disclosure

This document discloses the AI models I have worked with, covering both models
used in **this assessment** and models used in **prior projects**. For each
model I note the type (LLM vs SLM), the use case, the platform, the deployment
type, why it was selected, and one concrete limitation I observed in practice.

> **Note on specifics:** a few exact model identifiers below are marked
> `⟨confirm⟩` — replace them with the precise version string from your own
> project history before submitting, so every claim is verifiable.

---

## 1. OpenAI GPT-4o-mini

| Field | Detail |
|---|---|
| **Model name** | GPT-4o-mini |
| **Type** | LLM (large language model) |
| **Use case** | Primary generation model in this POC's Quality Gate — first-pass structured answers constrained to source content |
| **Platform used** | OpenAI API |
| **Deployment type** | API (hosted) |
| **Reason for selection** | Very low cost ($0.15 / $0.60 per 1M input/output tokens) and low latency make it the right choice for the *common case*, where most requests should pass the gate on the first attempt. Spending little per call and escalating only on failure is a deliberate cost-control pattern. |
| **One limitation observed** | On strict JSON-schema tasks it occasionally adds unrequested fields or a short natural-language preamble around the JSON, which is exactly the failure the gate's schema check and `RESPONSE_REPAIR` strategy exist to catch. |

## 2. OpenAI GPT-4o

| Field | Detail |
|---|---|
| **Model name** | GPT-4o |
| **Type** | LLM |
| **Use case** | Fallback generation model **and** the LLM-as-judge (scoring grounding, completeness, and quality) in this POC |
| **Platform used** | OpenAI API |
| **Deployment type** | API (hosted) |
| **Reason for selection** | Stronger reasoning and better instruction-following than GPT-4o-mini, justifying its higher cost only when the cheaper model has repeatedly failed the gate. As the judge, its more reliable evaluation is worth the premium because a weak judge would undermine the entire quality signal. |
| **One limitation observed** | ~4–8x the cost of GPT-4o-mini and noticeably higher latency, so using it for every request would be wasteful — it earns its place only as an escalation target and evaluator. |

## 3. Meta Llama 3.x (served via Groq)

| Field | Detail |
|---|---|
| **Model name** | Llama 3.x `⟨confirm — e.g. Llama 3.1 8B Instant or Llama 3.3 70B Versatile⟩` |
| **Type** | LLM (open-weight, hosted on Groq's inference infrastructure) |
| **Use case** | `⟨confirm — e.g. fast chat responses / summarization / experimentation with open models⟩` |
| **Platform used** | Groq API |
| **Deployment type** | API (hosted third-party inference) |
| **Reason for selection** | Groq's hardware delivers extremely high tokens-per-second throughput at low cost (Llama 3.1 8B is roughly $0.05 / $0.08 per 1M tokens), so it is attractive where latency and price matter more than frontier reasoning quality. Using an open-weight model also avoids lock-in to a single proprietary vendor. |
| **One limitation observed** | The open Llama models are weaker than GPT-4o-class models at strict structured-output adherence and nuanced instruction-following, so they need tighter prompting and validation to be production-safe. |

## 4. HuggingFace model (run locally)

| Field | Detail |
|---|---|
| **Model name** | `⟨confirm — the exact HuggingFace repo/model you ran, e.g. distilbert-base-uncased or google/flan-t5-base⟩` |
| **Type** | SLM (small language model) — small enough to run on local hardware |
| **Use case** | `⟨confirm — e.g. text classification / sentiment / local experimentation without API cost⟩` |
| **Platform used** | HuggingFace `transformers` (local) |
| **Deployment type** | Local (self-hosted, no external API) |
| **Reason for selection** | Running locally means zero per-token cost, no data leaving the machine (a privacy benefit), and full control over the model — useful for learning how models behave without an API bill or rate limits. |
| **One limitation observed** | Local inference on consumer hardware is slow without a capable GPU, and small models have far weaker general reasoning than hosted LLMs, so they suit narrow, well-defined tasks rather than open-ended generation. |

## 5. Mock provider (deterministic test harness — this POC)

| Field | Detail |
|---|---|
| **Model name** | `mock` (built into this project) |
| **Type** | Not a real model — a deterministic stub |
| **Use case** | Lets the entire Quality Gate + recovery loop run offline with no API key, returning a deliberately flawed first response so the validation → classification → recovery flow is demonstrable and testable |
| **Platform used** | Local (in-process Python) |
| **Deployment type** | Local |
| **Reason for selection** | Makes the POC reproducible for reviewers who have no API key, and gives deterministic behaviour for testing the orchestration logic independently of any real model's variability. |
| **One limitation observed** | It does not exercise real model behaviour, so its grounding scores come from lexical token overlap rather than genuine semantic judgement — it validates the *plumbing*, not model quality. |

---

## Deployment types at a glance

| Model | Type | Deployment | Platform |
|---|---|---|---|
| GPT-4o-mini | LLM | API (hosted) | OpenAI |
| GPT-4o | LLM | API (hosted) | OpenAI |
| Llama 3.x | LLM | API (hosted, 3rd-party) | Groq |
| HuggingFace model | SLM | Local | HuggingFace `transformers` |
| mock | stub | Local | in-process |

This spread — proprietary hosted APIs, third-party open-model inference, and
fully local self-hosting — reflects hands-on experience across the main ways
models are deployed in practice, each with different cost, privacy, latency,
and quality trade-offs.
