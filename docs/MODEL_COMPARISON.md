# Model Comparison

This compares the two models used as the generation engines in this POC's
Quality Gate — **GPT-4o-mini** (primary) and **GPT-4o** (fallback / judge) —
across the dimensions the assessment asks for. A third column,
**Llama 3.x on Groq**, is included as a reference point from prior experience,
since it represents a different cost/latency/quality trade-off.

> Pricing figures are OpenAI and Groq list prices current as of mid-2026 and
> should be re-verified against the providers' official pricing pages at
> submission time. Latency figures are indicative ranges from typical short
> requests, not benchmark guarantees — replace them with the numbers you
> observe when you run the POC with your own key.

---

## Summary table

| Dimension | GPT-4o-mini | GPT-4o | Llama 3.x (Groq) |
|---|---|---|---|
| **Response quality** | Good for straightforward tasks; weaker on nuanced reasoning | Strong reasoning and instruction-following | Good; below GPT-4o-class on nuance |
| **Latency** | Low | Moderate (slower than mini) | Very low (Groq's throughput is a key selling point) |
| **Structured-output reliability** | Mostly reliable; occasional stray fields/preamble | Most reliable of the three | Least reliable; needs tighter prompting + validation |
| **Cost (per 1M input / output tokens)** | ~$0.15 / $0.60 | ~$2.50 / $10.00 | ~$0.05 / $0.08 (8B) to ~$0.59 / $0.79 (70B) |
| **Best-suited use cases** | High-volume first-pass generation | Escalation, evaluation/judging, hard cases | Latency-sensitive, cost-sensitive workloads; open-model use |
| **Production recommendation** | Default workhorse | Reserve for fallback + judging | Strong option where speed/cost dominate over frontier quality |

---

## Dimension-by-dimension

### Response quality
GPT-4o handles ambiguous prompts, multi-step reasoning, and strict constraints
best. GPT-4o-mini is very capable on clear, well-scoped tasks but is more
likely to miss subtle requirements — which is why the POC sends it first but
validates hard and escalates on failure. Llama 3.x on Groq is competitive for
general text but, as an open model a generation behind the frontier, trails
GPT-4o on nuanced correctness.

### Latency
Groq is purpose-built for speed and typically returns fastest. GPT-4o-mini is
fast among OpenAI models; GPT-4o is noticeably slower per call. In the POC,
latency is measured per attempt and surfaced in the trace, so the cost of
escalating to GPT-4o is always visible.

### Structured-output reliability
This is the dimension the Quality Gate cares about most. GPT-4o adheres to a
JSON schema most consistently. GPT-4o-mini is usually fine but sometimes wraps
JSON in prose or adds fields — caught deterministically by the `jsonschema`
check and repaired via the `RESPONSE_REPAIR` strategy. Open Llama models are
the most prone to structural drift and benefit most from the gate.

### Limitations
- **GPT-4o-mini** — weaker reasoning; occasional schema drift.
- **GPT-4o** — 4–8x the cost of mini and higher latency; wasteful if used for every request.
- **Llama 3.x (Groq)** — weaker structured-output discipline; open-model quality ceiling below GPT-4o; catalog limited to what Groq hosts.

### Cost vs. performance
GPT-4o-mini gives the best quality-per-dollar for the common case. GPT-4o costs
roughly 16x more on input than mini, so it is only cost-justified when the
cheaper path has failed or when evaluation reliability is essential (the judge
role). Groq's Llama pricing is extremely competitive, especially at the 8B tier,
making it the cheapest of the three for high-volume work where its quality is
sufficient.

---

## Production recommendation

The architecture this POC already implements **is** the recommendation:

1. **GPT-4o-mini as the primary model** — cheap and fast, handles the majority
   of requests that pass the gate on the first try.
2. **GPT-4o as the fallback and judge** — invoked only after the primary has
   exhausted its retries, and used for scoring, where reliability matters more
   than cost.
3. **A validation gate on every response** — so a cheaper, faster model can be
   used aggressively without sacrificing output reliability, because anything
   that fails is caught and recovered automatically.

**Where Groq/Llama fits:** for a latency- or cost-dominated product (very high
request volume, tight budget, tolerant of slightly lower quality), swapping the
primary to Llama 3.x on Groq is attractive — and because this POC abstracts the
provider behind a single `complete()` interface, that swap is a config change,
not a code change. The gate then does the heavy lifting of keeping the open
model's output production-safe.

**Net:** tiered models behind a validation gate beat picking any single model —
you get the cost profile of a small model with a reliability floor close to a
large one.
