from fastapi import FastAPI
from pydantic import BaseModel
import os
import json
import uuid
import requests
import redis

app = FastAPI(title="LUDUS Agents API")

REDIS_URL = os.environ.get("REDIS_URL")
OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "llama3.1")

redis_client = None
if REDIS_URL:
    try:
        redis_client = redis.from_url(REDIS_URL, decode_responses=True)
    except Exception:
        redis_client = None


class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None
    language: str | None = "ar"


def _session_key(session_id: str) -> str:
    return f"agents:session:{session_id}"


def load_history(session_id: str) -> list[dict]:
    if not redis_client:
        return []
    data = redis_client.get(_session_key(session_id))
    if not data:
        return []
    try:
        return json.loads(data)
    except Exception:
        return []


def save_history(session_id: str, history: list[dict]) -> None:
    if not redis_client:
        return
    redis_client.setex(_session_key(session_id), 60 * 60 * 6, json.dumps(history))


@app.get("/health")
async def health():
    status = {"status": "ok"}
    # Redis check
    if redis_client:
        try:
            pong = redis_client.ping()
            status["redis"] = "ok" if pong else "down"
        except Exception:
            status["redis"] = "down"
    else:
        status["redis"] = "not_configured"
    # Ollama check
    try:
        r = requests.get(f"{OLLAMA_HOST}/api/tags", timeout=2)
        status["ollama"] = "ok" if r.ok else "down"
    except Exception:
        status["ollama"] = "down"
    return status


@app.post("/chat")
async def chat(req: ChatRequest):
    session_id = req.session_id or str(uuid.uuid4())
    history = load_history(session_id)

    prompt_prefix = "يرجى الرد باللغة العربية باختصار: " if (req.language or "ar").startswith("ar") else "Reply briefly in English: "
    user_prompt = f"{prompt_prefix}{req.message}"

    reply_text = None

    # Try Ollama
    try:
        resp = requests.post(
            f"{OLLAMA_HOST}/api/generate",
            json={"model": OLLAMA_MODEL, "prompt": user_prompt},
            timeout=30,
        )
        if resp.ok:
            data = resp.json()
            # ollama /api/generate streams; in blocking request, 'response' may contain final
            reply_text = data.get("response") or data.get("message") or ""
    except Exception:
        reply_text = None

    if not reply_text:
        reply_text = ("تلقى النظام رسالتك." if (req.language or "ar").startswith("ar") else "The system received your message.") + f" ({req.message})"

    history.append({"role": "user", "content": req.message, "language": req.language})
    history.append({"role": "assistant", "content": reply_text, "language": req.language})
    save_history(session_id, history)

    return {"reply": reply_text, "language": req.language, "session_id": session_id}
