<<<<<<< HEAD
import os
=======
>>>>>>> a7d0c06 (Initial commit: AI Response Quality Gate POC (FastAPI backend + React debugger))
import re
import httpx
from .config import settings


class ProviderError(Exception):
    pass


async def _openai(model: str, system: str, user: str) -> str:
    if not settings.openai_api_key:
        raise ProviderError("OPENAI_API_KEY not set")
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        "temperature": 0.2,
    }
    headers = {"Authorization": f"Bearer {settings.openai_api_key}"}
    async with httpx.AsyncClient(timeout=60) as c:
        r = await c.post("https://api.openai.com/v1/chat/completions",
                         headers=headers, json=payload)
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"]


async def _anthropic(model: str, system: str, user: str) -> str:
    if not settings.anthropic_api_key:
        raise ProviderError("ANTHROPIC_API_KEY not set")
    payload = {
        "model": model,
        "max_tokens": 1024,
        "system": system,
        "messages": [{"role": "user", "content": user}],
    }
    headers = {
        "x-api-key": settings.anthropic_api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }
    async with httpx.AsyncClient(timeout=60) as c:
        r = await c.post("https://api.anthropic.com/v1/messages",
                         headers=headers, json=payload)
        r.raise_for_status()
        return r.json()["content"][0]["text"]


<<<<<<< HEAD
async def _groq(model: str, system: str, user: str) -> str:
    groq_key = settings.groq_api_key or os.environ.get("GROQ_API_KEY")
    if not groq_key:
        raise ProviderError("GROQ_API_KEY not set")
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        "temperature": 0.2,
    }
    headers = {"Authorization": f"Bearer {groq_key}"}
    async with httpx.AsyncClient(timeout=60) as c:
        r = await c.post("https://api.groq.com/openai/v1/chat/completions",
                         headers=headers, json=payload)
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"]


=======
>>>>>>> a7d0c06 (Initial commit: AI Response Quality Gate POC (FastAPI backend + React debugger))
async def _mock(model: str, system: str, user: str) -> str:
    """Offline demo model. Fakes a slightly-flawed first answer so you can
    see the recovery loop kick in, then a cleaner one after a rewrite."""
    source = ""
    m = re.search(r"SOURCE:\n(.*?)\n\nSCHEMA", user, re.S)
    if m:
        source = m.group(1).strip()
<<<<<<< HEAD
    if "reformat" in user.lower() or "you missed" in user.lower() \
            or "your last attempt failed" in user.lower():
        return '{"answer": "%s", "confidence": 0.9}' % source[:80]
=======
    # If we're being asked to repair/rewrite, return well-formed JSON.
    if "reformat" in user.lower() or "you missed" in user.lower() \
            or "your last attempt failed" in user.lower():
        return '{"answer": "%s", "confidence": 0.9}' % source[:80]
    # First pass: return JSON but with an invented fact (to trigger the gate).
>>>>>>> a7d0c06 (Initial commit: AI Response Quality Gate POC (FastAPI backend + React debugger))
    return '{"answer": "%s Also, it was founded in 1801.", "confidence": 0.5}' % source[:80]


async def complete(provider: str, model: str, system: str, user: str) -> str:
    if provider == "openai":
        return await _openai(model, system, user)
    if provider == "anthropic":
        return await _anthropic(model, system, user)
<<<<<<< HEAD
    if provider == "groq":
        return await _groq(model, system, user)
    if provider == "mock":
        return await _mock(model, system, user)
    raise ProviderError(f"Unknown provider: {provider}")
=======
    if provider == "mock":
        return await _mock(model, system, user)
    raise ProviderError(f"Unknown provider: {provider}")
>>>>>>> a7d0c06 (Initial commit: AI Response Quality Gate POC (FastAPI backend + React debugger))
