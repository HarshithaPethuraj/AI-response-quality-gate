# AI Model Disclosure

This document discloses the AI models I have worked with, covering both models
used in this assessment and models used in prior projects. For each model I note
the type (LLM vs SLM), the use case, the platform, the deployment type, why it
was selected, and one concrete limitation I observed in practice.

---

## 1. OpenAI GPT-4o-mini

| Field | Detail |
|---|---|
| **Model name** | GPT-4o-mini |
| **Type** | LLM (large language model) |
| **Use case** | Primary generation model in this POC's Quality Gate — first-pass structured answers constrained to source content |
| **Platform used** | OpenAI API |
| **Deployment type** | API (hosted) |
| **Reason for selection** | Very low cost ($0.15 / $0.60 per 1M input/output tokens) and low latency make it the right choice for the common case, where most requests should pass the gate on the first attempt. Spending little per call and escalating only on failure is a deliberate cost-control pattern. |
| **One limitation observed** | On strict JSON-schema tasks it occasionally adds unrequested fields or a short natural-language preamble around the JSON, which is exactly the failure the gate's schema check and RESPONSE_REPAIR strategy exist to catch. |

## 2. OpenAI GPT-4o

| Field | Detail |
|---|---|
| **Model name** | GPT-4o |
| **Type** | LLM |
| **Use case** | Fallback generation model and the LLM-as-judge (scoring grounding, completeness, and quality) in this POC |
| **Platform used** | OpenAI API |
| **Deployment type** | API (hosted) |
| **Reason for selection** | Stronger reasoning and better instruction-following than GPT-4o-mini, justifying its higher cost only when the cheaper model has repeatedly failed the gate. As the judge, its more reliable evaluation is worth the premium because a weak judge would undermine the entire quality signal. |
| **One limitation observed** | ~4–8x the cost of GPT-4o-mini and noticeably higher latency, so using it for every request would be wasteful — it earns its place only as an escalation target and evaluator. |

## 3. Groq — openai/gpt-oss-20b and openai/gpt-oss-120b

| Field | Detail |
|---|---|
| **Model name** | `openai/gpt-oss-20b` (primary) and `openai/gpt-oss-120b` (fallback + judge) |
| **Type** | LLM (open-weight models hosted on Groq's LPU inference infrastructure) |
| **Use case** | Primary generation and judge/fallback roles in this POC — gpt-oss-20b handles first-pass structured-output generation; gpt-oss-120b provides stronger evaluation as the LLM-as-judge and catches failures the smaller model couldn't recover from |
| **Platform used** | Groq API |
| **Deployment type** | API (hosted third-party inference) |
| **Reason for selection** | Groq's LPU hardware delivers extremely high tokens-per-second throughput at very low cost with a generous free tier, making it ideal for a POC that needs real model behavior without OpenAI rate limits. The two-model setup mirrors the cheap-primary / strong-fallback production pattern the POC is built around. |
| **One limitation observed** | Groq's model catalog is narrower than OpenAI's — standard Llama models were not available on the free-tier account, so the GPT-OSS family was used instead. Structured-output adherence also required the validation gate to catch and repair occasional schema drift. |

## 4. Meta Llama (via Groq API — prior experience)

| Field | Detail |
|---|---|
| **Model name** | Llama 3.x (exact size not noted at time of use) |
| **Type** | LLM (open-weight) |
| **Use case** | Fast chat responses and summarization — prior experimentation with open-weight models via Groq's inference API before this assessment |
| **Platform used** | Groq API |
| **Deployment type** | API (hosted third-party inference) |
| **Reason for selection** | Llama on Groq offers near-zero cost and very low latency, making it practical for high-volume experimentation. Using an open-weight model also avoids vendor lock-in to proprietary APIs. |
| **One limitation observed** | Weaker than GPT-4o-class models on nuanced instruction-following and strict structured-output tasks — benefits most from a validation gate like the one built in this POC. |

## 5. HuggingFace model (run locally — prior experience)

| Field | Detail |
|---|---|
| **Model name** | A small NLP model from HuggingFace (text classification / experimentation) |
| **Type** | SLM (small language model) — small enough to run on local hardware |
| **Use case** | Local experimentation with NLP tasks — text classification and model behavior exploration without API cost or rate limits |
| **Platform used** | HuggingFace `transformers` (local) |
| **Deployment type** | Local (self-hosted, no external API) |
| **Reason for selection** | Running locally means zero per-token cost, no data leaving the machine (a privacy benefit), and full control over the model — useful for learning how transformer models work without an API bill. |
| **One limitation observed** | Local inference on consumer hardware is slow without a capable GPU, and small models have far weaker general reasoning than hosted LLMs, so they suit narrow, well-defined tasks rather than open-ended generation. |

## 6. Mock provider (deterministic test harness — this POC)

| Field | Detail |
|---|---|
| **Model name** | `mock` (built into this project) |
| **Type** | Not a real model — a deterministic stub |
| **Use case** | Lets the entire Quality Gate + recovery loop run offline with no API key, returning a deliberately flawed first response so the validation → classification → recovery flow is demonstrable and testable |
| **Platform used** | Local (in-process Python) |
| **Deployment type** | Local |
| **Reason for selection** | Makes the POC reproducible for reviewers who have no API key, and gives deterministic behaviour for testing the orchestration logic independently of any real model's variability. |
| **One limitation observed** | It does not exercise real model behaviour — its grounding scores come from lexical token overlap rather than genuine semantic judgement. It validates the plumbing, not model quality. |

---

## Deployment types at a glance

| Model | Type | Deployment | Platform |
|---|---|---|---|
| GPT-4o-mini | LLM | API (hosted) | OpenAI |
| GPT-4o | LLM | API (hosted) | OpenAI |
| gpt-oss-20b / gpt-oss-120b | LLM | API (hosted, 3rd-party) | Groq |
| Llama 3.x | LLM | API (hosted, 3rd-party) | Groq |
| HuggingFace model | SLM | Local | HuggingFace `transformers` |
| mock | stub | Local | in-process |

This spread — proprietary hosted APIs, third-party open-model inference, and
fully local self-hosting — reflects hands-on experience across the main ways
models are deployed in practice, each with different cost, privacy, latency,
and quality trade-offs.
