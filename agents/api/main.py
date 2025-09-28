from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import json
import uuid
import requests
import redis
from datetime import datetime
from .booking_agent import BookingAgent, BookingRequest
from .vendor_agent import VendorAgent, VendorRequest
from .search_agent import SearchAgent, SearchRequest
from .ui_ux_agent import UIUXAgent, DesignRequest, DesignType, DesignComplexity
from .fullstack_agent import FullstackAgent, DevelopmentRequest, DevelopmentType, TechStack
from .debugging_agent import DebuggingAgent, DebuggingRequest, IssueType, Severity
from .workflow_engine import WorkflowEngine, WorkflowTemplate, WorkflowStatus
from .agents_creation_agent import (
    AgentsCreationAgent,
    CreateAgentSpec,
    CreateAgentResponse,
    AgentBlueprintType,
)
from .monitoring import MonitoringSystem
from .notion_project_manager_agent import router as notion_pm_router
from .recommendation_agent import router as recommendation_router
from .onboard_agent import SelenaOnboardAgent, OnboardingRequest, OnboardingResponse

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

# Initialize specialized agents
booking_agent = BookingAgent(redis_client)
vendor_agent = VendorAgent(redis_client)
search_agent = SearchAgent(redis_client)
onboard_agent = SelenaOnboardAgent(redis_client)

# Initialize automated workflow agents
ui_ux_agent = UIUXAgent(redis_client)
fullstack_agent = FullstackAgent(redis_client)
debugging_agent = DebuggingAgent(redis_client)
workflow_engine = WorkflowEngine(redis_client)
monitoring_system = MonitoringSystem(redis_client)
agents_creator = AgentsCreationAgent(redis_client)
app.include_router(notion_pm_router)
app.include_router(recommendation_router)


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
        },
        "onboard": {
            "ar": """أنا سيلينا، وكيل الإرشاد المتخصص لمنصة LUDUS. أنا متخصصة في:
- إرشاد المستخدمين الجدد خلال التسجيل
- مساعدة في إعداد الملف الشخصي
- شرح ميزات المنصة
- تقديم السياق الثقافي السعودي
- حل مشاكل التسجيل والدعم الفني

أهلاً وسهلاً! سأكون مرشدتك الشخصية خلال رحلة الانضمام لمجتمع لودوس. كن واثقاً ومفيداً ومراعياً للثقافة المحلية.""",
            "en": """I'm Selena, the specialized onboarding agent for LUDUS platform. I specialize in:
- Guiding new users through registration
- Assisting with profile setup
- Explaining platform features
- Providing Saudi cultural context
- Solving registration issues and technical support

Welcome! I'll be your personal guide through joining the LUDUS community. Be confident, helpful, and considerate of local culture."""
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

    # Use specialized agent processing if Ollama is not available
    if not reply_text or len(reply_text) < 3:
        # Try specialized agent processing
        try:
            if agent_type == "booking":
                reply_text = booking_agent.process_booking_inquiry(req.message, session_id, language)
            elif agent_type == "vendor":
                reply_text = vendor_agent.process_vendor_inquiry(req.message, session_id, language)
            elif agent_type == "search":
                reply_text = search_agent.process_search_inquiry(req.message, session_id, language)
            elif agent_type == "onboard":
                onboard_request = OnboardingRequest(
                    message=req.message,
                    session_id=session_id,
                    language=language,
                    user_context={"source": "chat_api"}
                )
                onboard_response = onboard_agent.process_onboarding_inquiry(onboard_request)
                reply_text = onboard_response.message
            else:
                # Customer service fallback
                fallback_responses = {
                    "ar": f"مرحباً! أنا وكيل خدمة العملاء في LUDUS. كيف يمكنني مساعدتك؟ (تلقيت رسالتك: {req.message})",
                    "en": f"Hello! I'm your LUDUS customer service agent. How can I help you? (Received: {req.message})"
                }
                reply_text = fallback_responses.get(language, fallback_responses["en"])
        except Exception as e:
            print(f"Specialized agent error: {e}")
            # Final fallback
            fallback_responses = {
                "ar": f"مرحباً! أنا مساعد LUDUS. كيف يمكنني مساعدتك اليوم؟ (تلقيت رسالتك: {req.message})",
                "en": f"Hello! I'm your LUDUS assistant. How can I help you today? (Received: {req.message})"
            }
            reply_text = fallback_responses.get(language, fallback_responses["en"])

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
        },
        "onboard": {
            "id": "onboard",
            "name": "Selena - Onboarding Agent",
            "name_ar": "سيلينا - وكيل الإرشاد",
            "description": "Guides new users through registration and platform orientation",
            "description_ar": "ترشد المستخدمين الجدد خلال التسجيل والتعرف على المنصة",
            "icon": "🌟",
            "color": "#8b5cf6"
        }
    }
    return {"agents": agents}


@app.post("/booking/create")
async def create_booking(booking_data: BookingRequest):
    """Create a new booking"""
    return booking_agent.create_booking(booking_data)


@app.get("/booking/{booking_id}")
async def get_booking(booking_id: str):
    """Get booking details"""
    booking = booking_agent.get_booking(booking_id)
    if booking:
        return {"success": True, "booking": booking}
    else:
        return {"success": False, "message": "Booking not found"}


@app.post("/booking/{booking_id}/cancel")
async def cancel_booking(booking_id: str, language: str = "ar"):
    """Cancel a booking"""
    return booking_agent.cancel_booking(booking_id, language)


@app.post("/booking/{booking_id}/confirm")
async def confirm_booking(booking_id: str, language: str = "ar"):
    """Confirm a booking"""
    return booking_agent.confirm_booking(booking_id, language)


@app.get("/booking/user/{user_id}")
async def get_user_bookings(user_id: str):
    """Get user's bookings"""
    booking_ids = booking_agent.get_user_bookings(user_id)
    bookings = []
    for booking_id in booking_ids:
        booking = booking_agent.get_booking(booking_id)
        if booking:
            bookings.append(booking)
    return {"bookings": bookings}


@app.post("/vendor/request")
async def create_vendor_request(request_data: VendorRequest):
    """Create a vendor coordination request"""
    return vendor_agent.create_vendor_request(request_data)


@app.get("/vendor/request/{request_id}")
async def get_vendor_request(request_id: str):
    """Get vendor request details"""
    request = vendor_agent.get_vendor_request(request_id)
    if request:
        return {"success": True, "request": request}
    else:
        return {"success": False, "message": "Request not found"}


@app.post("/vendor/request/{request_id}/confirm")
async def confirm_vendor_request(request_id: str, language: str = "ar"):
    """Confirm vendor availability"""
    return vendor_agent.confirm_vendor_availability(request_id, language)


@app.get("/vendor/requests/{vendor_id}")
async def get_vendor_requests(vendor_id: str):
    """Get vendor's requests"""
    request_ids = vendor_agent.get_vendor_requests(vendor_id)
    requests = []
    for request_id in request_ids:
        request = vendor_agent.get_vendor_request(request_id)
        if request:
            requests.append(request)
    return {"requests": requests}


@app.post("/search/activities")
async def search_activities(search_data: SearchRequest, user_id: str = "anonymous"):
    """Search for activities"""
    return search_agent.search_activities(search_data, user_id)


@app.get("/search/categories")
async def get_activity_categories(language: str = "ar"):
    """Get available activity categories"""
    return {"categories": search_agent.get_activity_categories(language)}


# ============================================================================
# AUTOMATED WORKFLOW AGENTS ENDPOINTS
# ============================================================================

# UI/UX Agent Endpoints
@app.post("/ui-ux/design")
async def create_design_request(design_data: dict):
    """Create a new UI/UX design request"""
    try:
        request = DesignRequest(
            request_id=str(uuid.uuid4()),
            design_type=DesignType(design_data.get("design_type", "component")),
            complexity=DesignComplexity(design_data.get("complexity", "simple")),
            requirements=design_data.get("requirements", ""),
            language=design_data.get("language", "ar"),
            target_platform=design_data.get("target_platform", "web"),
            user_context=design_data.get("user_context"),
            existing_components=design_data.get("existing_components"),
            design_constraints=design_data.get("design_constraints")
        )
        
        response = ui_ux_agent.create_design_request(request)
        return response.dict()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/ui-ux/design/{request_id}")
async def get_design_request(request_id: str):
    """Get design request details"""
    request = ui_ux_agent.get_design_request(request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Design request not found")
    return request


@app.get("/ui-ux/requests")
async def get_all_design_requests():
    """Get all design requests"""
    requests = ui_ux_agent.get_all_design_requests()
    return {"requests": requests}


# Fullstack Agent Endpoints
@app.post("/fullstack/develop")
async def create_development_request(development_data: dict):
    """Create a new fullstack development request"""
    try:
        tech_stack = [TechStack(tech) for tech in development_data.get("tech_stack", ["react", "nodejs"])]
        
        request = DevelopmentRequest(
            request_id=str(uuid.uuid4()),
            development_type=DevelopmentType(development_data.get("development_type", "api")),
            tech_stack=tech_stack,
            requirements=development_data.get("requirements", ""),
            language=development_data.get("language", "ar"),
            existing_code=development_data.get("existing_code"),
            database_schema=development_data.get("database_schema"),
            api_endpoints=development_data.get("api_endpoints"),
            frontend_components=development_data.get("frontend_components")
        )
        
        response = fullstack_agent.create_development_request(request)
        return response.dict()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/fullstack/development/{request_id}")
async def get_development_request(request_id: str):
    """Get development request details"""
    request = fullstack_agent.get_development_request(request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Development request not found")
    return request


# Debugging Agent Endpoints
@app.post("/debugging/analyze")
async def create_debugging_request(debugging_data: dict):
    """Create a new debugging request"""
    try:
        request = DebuggingRequest(
            request_id=str(uuid.uuid4()),
            issue_type=IssueType(debugging_data.get("issue_type", "error")),
            severity=Severity(debugging_data.get("severity", "medium")),
            error_message=debugging_data.get("error_message"),
            stack_trace=debugging_data.get("stack_trace"),
            code_snippet=debugging_data.get("code_snippet"),
            logs=debugging_data.get("logs"),
            environment=debugging_data.get("environment"),
            reproduction_steps=debugging_data.get("reproduction_steps"),
            expected_behavior=debugging_data.get("expected_behavior"),
            actual_behavior=debugging_data.get("actual_behavior")
        )
        
        response = debugging_agent.create_debugging_request(request)
        return response.dict()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/debugging/analysis/{request_id}")
async def get_debugging_request(request_id: str):
    """Get debugging request details"""
    request = debugging_agent.get_debugging_request(request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Debugging request not found")
    return request


# Workflow Engine Endpoints
@app.post("/workflows/create")
async def create_workflow(workflow_data: dict):
    """Create a new workflow from template"""
    try:
        workflow = workflow_engine.create_workflow(
            name=workflow_data.get("name", "New Workflow"),
            template=WorkflowTemplate(workflow_data.get("template", "feature_development")),
            input_data=workflow_data.get("input_data", {})
        )
        return workflow.dict()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/workflows/{workflow_id}/start")
async def start_workflow(workflow_id: str):
    """Start workflow execution"""
    success = workflow_engine.start_workflow(workflow_id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to start workflow")
    return {"message": "Workflow started successfully"}


@app.get("/workflows/{workflow_id}")
async def get_workflow(workflow_id: str):
    """Get workflow details"""
    workflow = workflow_engine.get_workflow(workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow.dict()


@app.get("/workflows/{workflow_id}/status")
async def get_workflow_status(workflow_id: str):
    """Get workflow status and progress"""
    status = workflow_engine.get_workflow_status(workflow_id)
    if not status:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return status


@app.post("/workflows/{workflow_id}/pause")
async def pause_workflow(workflow_id: str):
    """Pause workflow execution"""
    success = workflow_engine.pause_workflow(workflow_id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to pause workflow")
    return {"message": "Workflow paused successfully"}


@app.post("/workflows/{workflow_id}/resume")
async def resume_workflow(workflow_id: str):
    """Resume workflow execution"""
    success = workflow_engine.resume_workflow(workflow_id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to resume workflow")
    return {"message": "Workflow resumed successfully"}


@app.post("/workflows/{workflow_id}/cancel")
async def cancel_workflow(workflow_id: str):
    """Cancel workflow execution"""
    success = workflow_engine.cancel_workflow(workflow_id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to cancel workflow")
    return {"message": "Workflow cancelled successfully"}


@app.get("/workflows")
async def get_all_workflows():
    """Get all workflows"""
    workflows = workflow_engine.get_all_workflows()
    return {"workflows": [w.dict() for w in workflows]}


@app.get("/workflows/templates")
async def get_workflow_templates():
    """Get available workflow templates"""
    templates = workflow_engine.get_workflow_templates()
    return {"templates": templates}


# Enhanced Chat Endpoint with Automated Workflow Support
@app.post("/chat/workflow")
async def chat_with_workflow_support(request: ChatRequest):
    """Enhanced chat endpoint with automated workflow capabilities"""
    session_id = request.session_id or str(uuid.uuid4())
    history = load_history(session_id)
    
    # Check if message contains workflow-related keywords
    message_lower = request.message.lower()
    
    if any(keyword in message_lower for keyword in ["workflow", "automate", "pipeline", "process"]):
        # Handle workflow-related requests
        if "create workflow" in message_lower or "إنشاء سير عمل" in message_lower:
            # Extract workflow parameters from message
            template = "feature_development"  # Default
            if "bug" in message_lower or "خطأ" in message_lower:
                template = "bug_fix"
            elif "performance" in message_lower or "أداء" in message_lower:
                template = "performance_optimization"
            elif "security" in message_lower or "أمان" in message_lower:
                template = "security_audit"
            
            # Create workflow
            workflow = workflow_engine.create_workflow(
                name=f"Workflow from chat - {datetime.now().strftime('%Y-%m-%d %H:%M')}",
                template=WorkflowTemplate(template),
                input_data={"requirements": request.message, "language": request.language}
            )
            
            # Start workflow
            workflow_engine.start_workflow(workflow.id)
            
            response_message = f"تم إنشاء سير عمل جديد: {workflow.name}" if request.language == "ar" else f"Created new workflow: {workflow.name}"
            
            # Save to history
            history.append({"role": "user", "content": request.message})
            history.append({"role": "assistant", "content": response_message})
            save_history(session_id, history)
            
            return {
                "response": response_message,
                "session_id": session_id,
                "workflow_id": workflow.id,
                "workflow_status": "started"
            }
    
    # Handle specific agent requests
    if "design" in message_lower or "تصميم" in message_lower:
        response_message = ui_ux_agent.process_design_inquiry(request.message, request.language)
    elif "develop" in message_lower or "تطوير" in message_lower:
        response_message = fullstack_agent.process_development_inquiry(request.message, request.language)
    elif "debug" in message_lower or "خطأ" in message_lower:
        response_message = debugging_agent.process_debugging_inquiry(request.message, request.language)
    else:
        # Use existing chat logic
        response_message = await process_chat_message(request.message, request.language, history)
    
    # Save to history
    history.append({"role": "user", "content": request.message})
    history.append({"role": "assistant", "content": response_message})
    save_history(session_id, history)
    
    return {
        "response": response_message,
        "session_id": session_id
    }


# ============================================================================
# MONITORING AND ANALYTICS ENDPOINTS
# ============================================================================

@app.get("/monitoring/health")
async def get_health_status():
    """Get overall system health status"""
    return monitoring_system.get_health_status()


@app.get("/monitoring/agents/performance")
async def get_all_agents_performance():
    """Get performance summary for all agents"""
    performances = monitoring_system.get_all_agents_performance()
    return {"agents": [p.dict() for p in performances]}


@app.get("/monitoring/agents/{agent_type}/performance")
async def get_agent_performance(agent_type: str):
    """Get performance summary for a specific agent"""
    performance = monitoring_system.get_agent_performance(agent_type)
    if not performance:
        raise HTTPException(status_code=404, detail="Agent not found")
    return performance.dict()


@app.get("/monitoring/agents/{agent_type}/metrics")
async def get_agent_metrics(agent_type: str, metric_type: str = "performance", 
                           name: str = "response_time", hours: int = 24):
    """Get time series metrics for a specific agent"""
    from agents.api.monitoring import MetricType
    
    try:
        metric_type_enum = MetricType(metric_type)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid metric type")
    
    metrics = monitoring_system.get_metrics_timeseries(agent_type, metric_type_enum, name, hours)
    return {"metrics": metrics}


@app.get("/monitoring/workflows/analytics")
async def get_workflow_analytics():
    """Get workflow analytics summary"""
    analytics = monitoring_system.get_workflow_analytics()
    if not analytics:
        raise HTTPException(status_code=404, detail="Workflow analytics not found")
    return analytics.dict()


@app.get("/monitoring/report")
async def generate_monitoring_report(hours: int = 24):
    """Generate comprehensive monitoring report"""
    return monitoring_system.generate_report(hours)


@app.post("/monitoring/cleanup")
async def cleanup_old_metrics(days: int = 30):
    """Clean up old metrics data"""
    monitoring_system.cleanup_old_metrics(days)
    return {"message": f"Cleaned up metrics older than {days} days"}


@app.post("/monitoring/flush")
async def flush_metrics():
    """Manually flush metrics buffer"""
    monitoring_system.flush_metrics()
    return {"message": "Metrics buffer flushed successfully"}


# ============================================================================
# AGENTS CREATION (META-AGENT) ENDPOINTS
# ============================================================================

@app.get("/agents/templates")
def list_agent_templates():
    return {
        "blueprints": [t.value for t in AgentBlueprintType],
        "example": {
            "agent_name": "recommendation",
            "agent_title": "Recommendation Agent",
            "description": "Suggests activities/items to users",
            "blueprint": "custom",
            "io": {
                "request_model_name": "RecommendationRequest",
                "response_model_name": "RecommendationResponse",
                "endpoints": ["/recommendation/process"],
            },
            "write_to_fs": True,
            "register_routes": True,
        },
    }


@app.post("/agents/create", response_model=CreateAgentResponse)
def create_agent_endpoint(spec: CreateAgentSpec):
    return agents_creator.create_agent(spec)


# ============================================================================
# SELENA-ONBOARD AGENT ENDPOINTS
# ============================================================================

@app.post("/agents/onboard/start-session")
async def start_onboard_session(request_data: dict):
    """Start a new onboarding session with Selena"""
    try:
        user_id = request_data.get("user_id")
        language = request_data.get("language", "ar")
        
        session = onboard_agent.start_onboarding_session(user_id, language)
        
        return {
            "success": True,
            "session_id": session.session_id,
            "message": session.conversation_history[-1]["content"] if session.conversation_history else "",
            "progress": session.progress_percentage,
            "current_step": session.current_step.value if session.current_step else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/agents/onboard/registration-help")
async def get_registration_help(request_data: dict):
    """Get help with registration process"""
    try:
        onboard_request = OnboardingRequest(
            message=request_data.get("message", "I need help with registration"),
            session_id=request_data.get("session_id"),
            user_id=request_data.get("user_id"),
            language=request_data.get("language", "ar"),
            current_step=request_data.get("current_step"),
            user_context=request_data.get("user_context", {})
        )
        
        response = onboard_agent.process_onboarding_inquiry(onboard_request)
        return response.dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/agents/onboard/profile-setup")
async def get_profile_setup_help(request_data: dict):
    """Get help with profile setup"""
    try:
        onboard_request = OnboardingRequest(
            message=request_data.get("message", "I need help setting up my profile"),
            session_id=request_data.get("session_id"),
            user_id=request_data.get("user_id"),
            language=request_data.get("language", "ar"),
            current_step="profile",
            user_context=request_data.get("user_context", {})
        )
        
        response = onboard_agent.process_onboarding_inquiry(onboard_request)
        return response.dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/agents/onboard/feature-tour")
async def get_feature_tour(request_data: dict):
    """Get guided tour of platform features"""
    try:
        onboard_request = OnboardingRequest(
            message=request_data.get("message", "Show me platform features"),
            session_id=request_data.get("session_id"),
            user_id=request_data.get("user_id"),
            language=request_data.get("language", "ar"),
            user_context=request_data.get("user_context", {})
        )
        
        response = onboard_agent.process_onboarding_inquiry(onboard_request)
        return response.dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/agents/onboard/complete-onboarding")
async def complete_onboarding_session(request_data: dict):
    """Complete onboarding session"""
    try:
        session_id = request_data.get("session_id")
        final_data = request_data.get("final_data", {})
        
        if not session_id:
            raise HTTPException(status_code=400, detail="Session ID is required")
        
        success = onboard_agent.complete_onboarding_session(session_id, final_data)
        
        if success:
            return {
                "success": True,
                "message": "Onboarding completed successfully",
                "session_id": session_id
            }
        else:
            raise HTTPException(status_code=404, detail="Session not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/agents/onboard/progress/{session_id}")
async def get_onboard_progress(session_id: str):
    """Get onboarding progress for a session"""
    try:
        progress = onboard_agent.get_onboarding_progress(session_id)
        
        if progress:
            return {
                "success": True,
                "progress": progress
            }
        else:
            raise HTTPException(status_code=404, detail="Session not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/agents/onboard/update-step")
async def update_onboard_step(request_data: dict):
    """Update current onboarding step"""
    try:
        session_id = request_data.get("session_id")
        step = request_data.get("step")
        completed = request_data.get("completed", False)
        
        if not session_id or not step:
            raise HTTPException(status_code=400, detail="Session ID and step are required")
        
        # Validate step
        from .onboard_agent import OnboardingStep
        try:
            step_enum = OnboardingStep(step)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid step")
        
        success = onboard_agent.update_session_step(session_id, step_enum, completed)
        
        if success:
            return {
                "success": True,
                "message": "Step updated successfully",
                "session_id": session_id,
                "step": step,
                "completed": completed
            }
        else:
            raise HTTPException(status_code=404, detail="Session not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/agents/onboard/analytics/{session_id}")
async def get_onboard_analytics(session_id: str):
    """Get analytics for an onboarding session"""
    try:
        analytics = onboard_agent.get_session_analytics(session_id)
        
        if analytics:
            return {
                "success": True,
                "analytics": analytics
            }
        else:
            raise HTTPException(status_code=404, detail="Session not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
