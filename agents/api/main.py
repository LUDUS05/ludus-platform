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


def build_ludus_prompt(message: str, language: str, history: list[dict]) -> str:
    """Build LUDUS-specific prompt with context and conversation history."""
    
    # LUDUS system context
    if language.startswith("ar"):
        system_context = """أنت مساعد ذكي لمنصة LUDUS، منصة الأنشطة الاجتماعية في السعودية. 
أنت متخصص في:
- مساعدة المستخدمين في العثور على الأنشطة المناسبة
- إدارة الحجوزات والدفعات
- تنسيق مع مقدمي الخدمات
- تقديم الدعم باللغة العربية

اجب باختصار ومفيد، وكن ودوداً ومهذباً."""
    else:
        system_context = """You are an intelligent assistant for LUDUS, a social activities platform in Saudi Arabia.
You specialize in:
- Helping users find suitable activities
- Managing bookings and payments
- Coordinating with service providers
- Providing support in English

Answer briefly and helpfully, be friendly and polite."""
    
    # Build conversation context
    context_lines = [system_context]
    
    # Add recent history (last 3 exchanges)
    recent_history = history[-6:] if len(history) > 6 else history
    for entry in recent_history:
        if entry["role"] == "user":
            context_lines.append(f"User: {entry['content']}")
        else:
            context_lines.append(f"Assistant: {entry['content']}")
    
    # Add current message
    context_lines.append(f"User: {message}")
    context_lines.append("Assistant:")
    
    return "\n".join(context_lines)


@app.post("/chat")
async def chat(req: ChatRequest):
    session_id = req.session_id or str(uuid.uuid4())
    history = load_history(session_id)
    language = req.language or "ar"

    # Build LUDUS-specific prompt with context
    full_prompt = build_ludus_prompt(req.message, language, history)
    
    reply_text = None

    # Try Ollama with enhanced prompt
    try:
        resp = requests.post(
            f"{OLLAMA_HOST}/api/generate",
            json={
                "model": OLLAMA_MODEL, 
                "prompt": full_prompt,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "max_tokens": 200
                }
            },
            timeout=30,
        )
        if resp.ok:
            data = resp.json()
            reply_text = data.get("response", "").strip()
            
            # Clean up response (remove any system context that might leak)
            if "Assistant:" in reply_text:
                reply_text = reply_text.split("Assistant:")[-1].strip()
                
    except Exception as e:
        print(f"Ollama error: {e}")
        reply_text = None

    # Fallback response
    if not reply_text or len(reply_text) < 3:
        if language.startswith("ar"):
            reply_text = f"مرحباً! أنا مساعد LUDUS. كيف يمكنني مساعدتك اليوم؟ (تلقيت رسالتك: {req.message})"
        else:
            reply_text = f"Hello! I'm your LUDUS assistant. How can I help you today? (Received: {req.message})"

    # Save conversation
    history.append({"role": "user", "content": req.message, "language": language})
    history.append({"role": "assistant", "content": reply_text, "language": language})
    save_history(session_id, history)

    return {"reply": reply_text, "language": language, "session_id": session_id}
