# AI Response Quality Gate

A Proof of Concept that treats an LLM as an **unreliable component**: every
generated response is validated against source content and a JSON schema,
scored for quality / grounding / completeness / accuracy, checked for
contradictions and hallucinations, and — when it fails — **automatically
recovered** via retries, prompt rewriting, response repair, or a fallback
model. A React "AI Execution Debugger" gives full observability: validation
scores, failure type, recovery strategy, retry count, fallback usage, the
complete execution trace, and latency.

## Architecture

```
POST /api/execute
      -> ORCHESTRATOR (retry/recovery loop)
           build prompt (inject SOURCE + SCHEMA)
             -> MODEL (primary) -> VALIDATOR (schema check + LLM judge)
                  pass -> DONE
                  fail -> CLASSIFY FAILURE -> SELECT STRATEGY
                          (retry / rewrite / repair / fallback-model)
                          loop, up to max_retries, then escalate to fallback
      -> ExecutionResult: final response, full trace, scores,
         retry count, fallback used, latency, recommended actions
```

- **Grounding** – fraction of response claims supported by the source (primary hallucination signal)
- **Completeness** – how fully the response covers the task
- **Quality** – overall relevance and correctness
- **Schema validity** – deterministic `jsonschema` check (hard gate)
- **Contradictions / Hallucinations** – lists surfaced by the judge

Schema validity is deterministic. The three fuzzy scores come from an
LLM-as-judge (a second model call), with a lexical token-overlap fallback so
the whole system runs offline in `mock` mode with no API keys.

## Tech stack

- **Backend:** Python, FastAPI, Pydantic, jsonschema, httpx
- **Frontend:** React + Vite (plain CSS, no UI library)

## Setup

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env              # defaults to mock providers (no API keys needed)
uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`. Interactive API docs (Swagger) at
`http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Debugger runs at `http://localhost:5173` and proxies `/api` to the backend.

## Using it

Open the debugger, click **Load example**, then **Execute request**. In mock
mode the first attempt deliberately invents a fact absent from the source; the
gate flags a `HALLUCINATION`, rewrites the prompt, and the repaired attempt
passes. The full sequence is visible in the Execution Trace.

### Using real models

Edit `backend/.env`:

```env
PRIMARY_PROVIDER=openai
PRIMARY_MODEL=gpt-4o-mini
FALLBACK_PROVIDER=openai
FALLBACK_MODEL=gpt-4o
JUDGE_PROVIDER=openai
JUDGE_MODEL=gpt-4o
OPENAI_API_KEY=sk-...
```

`anthropic` is also supported. Providers are per-role, so you can mix vendors.

<<<<<<< HEAD
## Deployment

The app is two programs — a FastAPI backend and a React frontend — so they
deploy to two hosts and connect via URL. Recommended free hosts: **Render**
(backend) and **Vercel** (frontend).

### 1. Backend on Render

Option A — Blueprint (uses the included `render.yaml`):
1. Push this repo to GitHub.
2. Render dashboard -> New -> Blueprint -> select the repo. It reads `render.yaml`.
3. When prompted, set the secret `OPENAI_API_KEY` (it is intentionally not in the file).
4. Deploy. You get a URL like `https://quality-gate-api.onrender.com`.

Option B — manual Web Service:
- Root directory: `backend`
- Build: `pip install -r requirements.txt`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Environment: add the same variables listed in `backend/.env.example`, plus `OPENAI_API_KEY`.

After deploy, set `ALLOWED_ORIGINS` to your Vercel URL (below) to lock down CORS.

### 2. Frontend on Vercel

1. Vercel -> Add New -> Project -> import the repo.
2. Root directory: `frontend` (framework auto-detected as Vite).
3. Add environment variable `VITE_API_BASE` = your Render backend URL (no trailing slash).
4. Deploy. You get a public URL like `https://your-app.vercel.app`.
5. Back in Render, set `ALLOWED_ORIGINS` to that Vercel URL and redeploy.

### Notes on the free tier

- Render's free backend **sleeps after ~15 min idle**; the first request then takes
  30–50s to wake. For a live demo, open the backend URL once to warm it up first.
- A public deployment with your key means anyone using it spends your OpenAI
  credits. Set a usage limit in the OpenAI dashboard, and/or keep the URL private.
- Secrets (`OPENAI_API_KEY`) are set in each host's dashboard, never committed —
  `.env` stays gitignored.

=======
>>>>>>> a7d0c06 (Initial commit: AI Response Quality Gate POC (FastAPI backend + React debugger))
## API

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/execute` | Run a prompt through the quality gate + recovery loop |
| GET  | `/api/execution/{id}` | Fetch a full execution result by id |
| GET  | `/api/failures` | List executions that failed the gate |
| GET  | `/api/executions` | List all executions (debugger history) |

## Project layout

```
quality-gate/
├── backend/
│   └── app/
│       ├── config.py         # env-driven settings
│       ├── models.py         # Pydantic schemas + enums
│       ├── providers.py      # OpenAI / Anthropic / mock abstraction
│       ├── validator.py      # scoring: schema + grounding + judge
│       ├── recovery.py       # classify failure, pick strategy, craft prompts
│       ├── orchestrator.py   # the execute -> validate -> recover loop
│       ├── store.py          # in-memory execution + failure history
│       └── main.py           # FastAPI app + routes
└── frontend/
    └── src/
        ├── App.jsx
        ├── api.js
        └── components/       # PromptForm, SummaryBar, ValidationPanel,
                              # ScoreBar, TracePanel, HistoryPanel
```

<<<<<<< HEAD
## Additional documentation

Full write-ups live in [`docs/`](docs/):

- [`docs/APPROACH.md`](docs/APPROACH.md) — how the quality gate + recovery loop works and why
- [`docs/AI_MODEL_DISCLOSURE.md`](docs/AI_MODEL_DISCLOSURE.md) — every AI model used (name, type, platform, deployment, reason, limitation)
- [`docs/MODEL_COMPARISON.md`](docs/MODEL_COMPARISON.md) — GPT-4o-mini vs GPT-4o (vs Llama on Groq) across quality, latency, structured-output reliability, cost, and production recommendation

=======
>>>>>>> a7d0c06 (Initial commit: AI Response Quality Gate POC (FastAPI backend + React debugger))
## Notes / limitations

- History is in-memory; swap `store.py` for SQLite/Postgres to persist.
- The judge is itself an LLM and can be imperfect — its scores are a
  quality signal, not ground truth.
- Mock mode uses lexical overlap for grounding, which is a coarse proxy for
  the semantic judgment a real judge model provides.
