<<<<<<< HEAD
import os
=======
>>>>>>> a7d0c06 (Initial commit: AI Response Quality Gate POC (FastAPI backend + React debugger))
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .models import ExecuteRequest, ExecutionResult
from .orchestrator import run_execution
from .store import store

app = FastAPI(title="AI Response Quality Gate", version="1.0")

<<<<<<< HEAD
# CORS: defaults to "*" so local dev works with no config. In production,
# set ALLOWED_ORIGINS to your frontend URL, e.g.
#   ALLOWED_ORIGINS=https://your-app.vercel.app
# (comma-separated for multiple).
_origins = os.getenv("ALLOWED_ORIGINS", "*")
allow_origins = ["*"] if _origins.strip() == "*" else \
    [o.strip() for o in _origins.split(",") if o.strip()]

app.add_middleware(CORSMiddleware, allow_origins=allow_origins,
                   allow_methods=["*"], allow_headers=["*"])


@app.get("/")
def root():
    """Simple health check so hitting the base URL doesn't 404."""
    return {"status": "ok", "service": "AI Response Quality Gate",
            "docs": "/docs"}


=======
# Allow the React dev server to call us.
app.add_middleware(CORSMiddleware, allow_origins=["*"],
                   allow_methods=["*"], allow_headers=["*"])


>>>>>>> a7d0c06 (Initial commit: AI Response Quality Gate POC (FastAPI backend + React debugger))
@app.post("/api/execute", response_model=ExecutionResult)
async def execute(req: ExecuteRequest):
    result = await run_execution(req)
    store.save(result)
    return result


@app.get("/api/execution/{exec_id}", response_model=ExecutionResult)
def get_execution(exec_id: str):
    r = store.get(exec_id)
    if not r:
        raise HTTPException(status_code=404, detail="execution not found")
    return r


@app.get("/api/failures")
def list_failures():
    return [
        {"id": r.id, "prompt": r.prompt, "failure_type": r.failure_type,
         "retry_count": r.retry_count, "fallback_used": r.fallback_used}
        for r in store.failures()
    ]


# Extra convenience endpoint for the debugger's history panel.
@app.get("/api/executions")
def list_executions():
    return [
        {"id": r.id, "prompt": r.prompt[:80], "passed": r.passed,
         "total_latency_ms": r.total_latency_ms, "created_at": r.created_at}
        for r in store.all()
    ]
