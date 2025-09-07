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
    agent_type: str | None = "customer_service"


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


def get_agent_context(agent_type: str, language: str) -> str:
    """Get specialized context for different agent types."""
    
    contexts = {
        "customer_service": {
            "ar": """أنت وكيل خدمة عملاء متخصص لمنصة LUDUS. أنت متخصص في:
- مساعدة المستخدمين في الاستفسارات العامة
- حل المشاكل التقنية
- تقديم الدعم الفني
- الإجابة على أسئلة المنصة

كن مفيداً ومهذباً، وقدم حلول عملية للمستخدمين.""",
            "en": """You are a customer service specialist for LUDUS platform. You specialize in:
- Helping users with general inquiries
- Solving technical problems
- Providing technical support
- Answering platform questions

Be helpful and polite, provide practical solutions to users."""
        },
        "booking": {
            "ar": """أنت وكيل حجوزات متخصص لمنصة LUDUS. أنت متخصص في:
- إدارة الحجوزات والمواعيد
- معالجة طلبات الحجز
- تنسيق المواعيد مع مقدمي الخدمات
- إدارة الدفعات والمدفوعات

كن دقيقاً ومنظماً في إدارة الحجوزات.""",
            "en": """You are a booking specialist for LUDUS platform. You specialize in:
- Managing bookings and appointments
- Processing booking requests
- Coordinating schedules with service providers
- Managing payments and transactions

Be precise and organized in managing bookings."""
        },
        "vendor": {
            "ar": """أنت وكيل تنسيق موردين متخصص لمنصة LUDUS. أنت متخصص في:
- التنسيق مع مقدمي الخدمات
- إدارة علاقات الموردين
- تنسيق الجداول والمواعيد
- حل مشاكل التنسيق

كن محترفاً في التعامل مع الموردين.""",
            "en": """You are a vendor coordination specialist for LUDUS platform. You specialize in:
- Coordinating with service providers
- Managing vendor relationships
- Scheduling and appointment coordination
- Resolving coordination issues

Be professional in dealing with vendors."""
        },
        "search": {
            "ar": """أنت وكيل بحث أنشطة متخصص لمنصة LUDUS. أنت متخصص في:
- البحث عن الأنشطة المناسبة
- تقديم توصيات شخصية
- تحليل تفضيلات المستخدمين
- اقتراح أنشطة جديدة

كن مبدعاً ومفيداً في التوصيات.""",
            "en": """You are an activity search specialist for LUDUS platform. You specialize in:
- Finding suitable activities
- Providing personalized recommendations
- Analyzing user preferences
- Suggesting new activities

Be creative and helpful in recommendations."""
        }
    }
    
    return contexts.get(agent_type, contexts["customer_service"]).get(language, contexts["customer_service"]["en"])


def build_ludus_prompt(message: str, language: str, history: list[dict], agent_type: str = "customer_service") -> str:
    """Build LUDUS-specific prompt with context and conversation history."""
    
    # Get agent-specific context
    system_context = get_agent_context(agent_type, language)
    
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
    agent_type = req.agent_type or "customer_service"

    # Build LUDUS-specific prompt with context
    full_prompt = build_ludus_prompt(req.message, language, history, agent_type)
    
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

    # Fallback response based on agent type
    if not reply_text or len(reply_text) < 3:
        fallback_responses = {
            "customer_service": {
                "ar": f"مرحباً! أنا وكيل خدمة العملاء في LUDUS. كيف يمكنني مساعدتك؟ (تلقيت رسالتك: {req.message})",
                "en": f"Hello! I'm your LUDUS customer service agent. How can I help you? (Received: {req.message})"
            },
            "booking": {
                "ar": f"مرحباً! أنا وكيل الحجوزات في LUDUS. كيف يمكنني مساعدتك في حجز نشاط؟ (تلقيت رسالتك: {req.message})",
                "en": f"Hello! I'm your LUDUS booking agent. How can I help you book an activity? (Received: {req.message})"
            },
            "vendor": {
                "ar": f"مرحباً! أنا وكيل تنسيق الموردين في LUDUS. كيف يمكنني مساعدتك في التنسيق؟ (تلقيت رسالتك: {req.message})",
                "en": f"Hello! I'm your LUDUS vendor coordination agent. How can I help you coordinate? (Received: {req.message})"
            },
            "search": {
                "ar": f"مرحباً! أنا وكيل البحث عن الأنشطة في LUDUS. كيف يمكنني مساعدتك في العثور على نشاط؟ (تلقيت رسالتك: {req.message})",
                "en": f"Hello! I'm your LUDUS activity search agent. How can I help you find an activity? (Received: {req.message})"
            }
        }
        
        agent_fallbacks = fallback_responses.get(agent_type, fallback_responses["customer_service"])
        reply_text = agent_fallbacks.get(language, agent_fallbacks["en"])

    # Save conversation with agent type
    history.append({
        "role": "user", 
        "content": req.message, 
        "language": language,
        "agent_type": agent_type
    })
    history.append({
        "role": "assistant", 
        "content": reply_text, 
        "language": language,
        "agent_type": agent_type
    })
    save_history(session_id, history)

    return {
        "reply": reply_text, 
        "language": language, 
        "session_id": session_id,
        "agent_type": agent_type
    }


@app.get("/agents")
async def get_agents():
    """Get available agents and their information."""
    agents = {
        "customer_service": {
            "id": "customer_service",
            "name": "Customer Service Agent",
            "name_ar": "وكيل خدمة العملاء",
            "description": "Helps with general inquiries and support",
            "description_ar": "يساعد في الاستفسارات العامة والدعم",
            "icon": "🎧",
            "color": "#667eea"
        },
        "booking": {
            "id": "booking",
            "name": "Booking Agent",
            "name_ar": "وكيل الحجوزات",
            "description": "Manages bookings and reservations",
            "description_ar": "يدير الحجوزات والمواعيد",
            "icon": "📅",
            "color": "#764ba2"
        },
        "vendor": {
            "id": "vendor",
            "name": "Vendor Coordination Agent",
            "name_ar": "وكيل تنسيق الموردين",
            "description": "Coordinates with service providers",
            "description_ar": "يتنسق مع مقدمي الخدمات",
            "icon": "🤝",
            "color": "#f093fb"
        },
        "search": {
            "id": "search",
            "name": "Activity Search Agent",
            "name_ar": "وكيل البحث عن الأنشطة",
            "description": "Finds and recommends activities",
            "description_ar": "يجد ويوصي بالأنشطة",
            "icon": "🔍",
            "color": "#4facfe"
        }
    }
    return {"agents": agents}
