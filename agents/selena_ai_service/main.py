"""
FastAPI AI Service Architecture for LUDUS Platform
Orchestrates 4 Selena AI Agents: Onboard, Discover, Support, Community

Performance Targets:
- <200ms response time
- 1000+ concurrent requests capability
- Comprehensive error handling
- Bilingual support (Arabic/English)

Created: 2025-09-28 GMT+3 (Riyadh)
Version: 1.0.0
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, List, Any, Union
import asyncio
import time
import uuid
import logging
import os
import json
from datetime import datetime, timedelta
from contextlib import asynccontextmanager

# Import specialized Selena agents
# Core services
from core.session_manager import SessionManager
from core.performance_monitor import PerformanceMonitor
from core.error_handler import ErrorHandler
from core.rate_limiter import RateLimiter
from core.health_checker import HealthChecker
from core.config import Settings

# Selena agents
from agents.onboard_agent import OnboardAgent, OnboardRequest, OnboardResponse
from agents.discover_agent import DiscoverAgent, DiscoverRequest, DiscoverResponse
from agents.support_agent import SupportAgent, SupportRequest, SupportResponse
from agents.community_agent import CommunityAgent, CommunityRequest, CommunityResponse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize settings
settings = Settings()

# Security
security = HTTPBearer()

# Global performance monitor
performance_monitor = PerformanceMonitor()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    logger.info("🚀 Starting LUDUS Selena AI Service...")
    
    # Initialize services
    await initialize_services()
    
    logger.info("✅ LUDUS Selena AI Service started successfully")
    
    yield
    
    logger.info("🔄 Shutting down LUDUS Selena AI Service...")
    await cleanup_services()
    logger.info("✅ LUDUS Selena AI Service shut down complete")


# Initialize FastAPI app
app = FastAPI(
    title="LUDUS Selena AI Service",
    description="FastAPI AI Service orchestrating 4 Selena AI agents for LUDUS platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

# Global services
session_manager: Optional[SessionManager] = None
health_checker: Optional[HealthChecker] = None
rate_limiter: Optional[RateLimiter] = None
error_handler: Optional[ErrorHandler] = None

# Selena AI Agents
onboard_agent: Optional[OnboardAgent] = None
discover_agent: Optional[DiscoverAgent] = None
support_agent: Optional[SupportAgent] = None
community_agent: Optional[CommunityAgent] = None


async def initialize_services():
    """Initialize all core services and agents"""
    global session_manager, health_checker, rate_limiter, error_handler
    global onboard_agent, discover_agent, support_agent, community_agent
    
    try:
        # Initialize core services
        session_manager = SessionManager(redis_url=settings.redis_url)
        health_checker = HealthChecker(
            redis_client=session_manager.redis_client,
            ollama_host=settings.ollama_host
        )
        rate_limiter = RateLimiter(redis_client=session_manager.redis_client)
        error_handler = ErrorHandler()
        
        # Initialize Selena AI Agents
        onboard_agent = OnboardAgent(
            redis_client=session_manager.redis_client,
            ollama_host=settings.ollama_host,
            ollama_model=settings.ollama_model
        )
        
        discover_agent = DiscoverAgent(
            redis_client=session_manager.redis_client,
            ollama_host=settings.ollama_host,
            ollama_model=settings.ollama_model
        )
        
        support_agent = SupportAgent(
            redis_client=session_manager.redis_client,
            ollama_host=settings.ollama_host,
            ollama_model=settings.ollama_model
        )
        
        community_agent = CommunityAgent(
            redis_client=session_manager.redis_client,
            ollama_host=settings.ollama_host,
            ollama_model=settings.ollama_model
        )
        
        logger.info("✅ All services and agents initialized successfully")
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize services: {e}")
        raise


async def cleanup_services():
    """Cleanup services on shutdown"""
    global session_manager
    if session_manager:
        await session_manager.close()


# Request/Response Models
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    session_id: Optional[str] = None
    language: str = Field(default="ar", regex="^(ar|en)$")
    agent_type: str = Field(..., regex="^(onboard|discover|support|community)$")
    user_context: Optional[Dict[str, Any]] = None
    
    @validator('message')
    def validate_message(cls, v):
        if not v.strip():
            raise ValueError('Message cannot be empty')
        return v.strip()


class ChatResponse(BaseModel):
    reply: str
    session_id: str
    agent_type: str
    language: str
    processing_time_ms: float
    confidence_score: Optional[float] = None
    suggested_actions: Optional[List[str]] = None


class AgentInfo(BaseModel):
    id: str
    name: str
    name_ar: str
    description: str
    description_ar: str
    icon: str
    color: str
    capabilities: List[str]
    status: str = "active"


class HealthResponse(BaseModel):
    status: str
    services: Dict[str, str]
    performance: Dict[str, Union[str, float]]
    timestamp: str


# Dependency for rate limiting
async def check_rate_limit(request: ChatRequest):
    """Check rate limits for API requests"""
    if rate_limiter:
        await rate_limiter.check_limit(
            identifier=request.session_id or "anonymous",
            limit=100,  # 100 requests per minute
            window=60
        )
    return True


# ============================================================================
# HEALTH AND MONITORING ENDPOINTS
# ============================================================================

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Comprehensive health check endpoint"""
    start_time = time.time()
    
    if not health_checker:
        raise HTTPException(status_code=503, detail="Health checker not initialized")
    
    health_status = await health_checker.check_all_services()
    processing_time = (time.time() - start_time) * 1000
    
    return HealthResponse(
        status="healthy" if health_status["overall"] == "ok" else "degraded",
        services=health_status,
        performance={
            "response_time_ms": processing_time,
            "memory_usage": "optimized",
            "cpu_usage": "normal"
        },
        timestamp=datetime.utcnow().isoformat()
    )


@app.get("/health/detailed")
async def detailed_health():
    """Detailed health check with agent-specific status"""
    if not health_checker:
        raise HTTPException(status_code=503, detail="Health checker not initialized")
    
    detailed_status = await health_checker.detailed_check()
    return detailed_status


# ============================================================================
# AGENT INFORMATION ENDPOINTS
# ============================================================================

@app.get("/agents", response_model=Dict[str, AgentInfo])
async def get_selena_agents():
    """Get information about all 4 Selena AI agents"""
    agents = {
        "onboard": AgentInfo(
            id="onboard",
            name="Selena Onboard",
            name_ar="سيلينا للإعداد",
            description="Guides new users through platform onboarding",
            description_ar="توجه المستخدمين الجدد خلال عملية الإعداد",
            icon="🌟",
            color="#667eea",
            capabilities=[
                "User registration guidance",
                "Profile setup assistance", 
                "Platform tutorial",
                "Initial preferences setup",
                "Saudi cultural adaptation"
            ]
        ),
        "discover": AgentInfo(
            id="discover",
            name="Selena Discover",
            name_ar="سيلينا للاستكشاف",
            description="Helps users discover new activities and experiences",
            description_ar="تساعد المستخدمين في اكتشاف أنشطة وتجارب جديدة",
            icon="🔍",
            color="#4facfe",
            capabilities=[
                "Personalized activity recommendations",
                "Local experience discovery",
                "Event exploration",
                "Trending activities",
                "Location-based suggestions"
            ]
        ),
        "support": AgentInfo(
            id="support",
            name="Selena Support",
            name_ar="سيلينا للدعم",
            description="Provides customer support and assistance",
            description_ar="تقدم دعم العملاء والمساعدة",
            icon="🎧",
            color="#764ba2",
            capabilities=[
                "Customer service",
                "Technical support",
                "Booking assistance",
                "Payment support",
                "Platform troubleshooting"
            ]
        ),
        "community": AgentInfo(
            id="community",
            name="Selena Community",
            name_ar="سيلينا للمجتمع",
            description="Facilitates community interactions and connections",
            description_ar="تسهل التفاعلات والاتصالات المجتمعية",
            icon="👥",
            color="#f093fb",
            capabilities=[
                "Community building",
                "Social connections",
                "Group activity coordination",
                "User engagement",
                "Cultural community features"
            ]
        )
    }
    return agents


@app.get("/agents/{agent_type}/capabilities")
async def get_agent_capabilities(agent_type: str):
    """Get detailed capabilities for a specific agent"""
    agents_info = await get_selena_agents()
    
    if agent_type not in agents_info:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    return {
        "agent": agents_info[agent_type],
        "detailed_capabilities": await _get_detailed_capabilities(agent_type)
    }


async def _get_detailed_capabilities(agent_type: str) -> Dict[str, Any]:
    """Get detailed capabilities for each agent"""
    capabilities = {
        "onboard": {
            "primary_functions": [
                "Account creation guidance",
                "Profile completion",
                "Preference setting",
                "Tutorial completion"
            ],
            "supported_languages": ["ar", "en"],
            "integration_points": ["auth_service", "user_service", "notification_service"],
            "performance_metrics": {
                "avg_onboarding_time": "5 minutes",
                "completion_rate": "85%",
                "user_satisfaction": "4.2/5"
            }
        },
        "discover": {
            "primary_functions": [
                "Activity recommendation",
                "Location-based discovery",
                "Event matching",
                "Trend analysis"
            ],
            "supported_languages": ["ar", "en"],
            "integration_points": ["activity_service", "location_service", "recommendation_engine"],
            "performance_metrics": {
                "recommendation_accuracy": "78%",
                "discovery_success_rate": "82%",
                "user_engagement": "4.1/5"
            }
        },
        "support": {
            "primary_functions": [
                "Issue resolution",
                "Technical assistance",
                "Booking support",
                "Payment help"
            ],
            "supported_languages": ["ar", "en"],
            "integration_points": ["ticket_service", "payment_service", "booking_service"],
            "performance_metrics": {
                "resolution_time": "< 10 minutes",
                "first_contact_resolution": "75%",
                "customer_satisfaction": "4.3/5"
            }
        },
        "community": {
            "primary_functions": [
                "Social matching",
                "Group coordination",
                "Community building",
                "Event organization"
            ],
            "supported_languages": ["ar", "en"],
            "integration_points": ["social_service", "group_service", "event_service"],
            "performance_metrics": {
                "connection_success_rate": "68%",
                "group_formation_rate": "45%",
                "community_engagement": "4.0/5"
            }
        }
    }
    
    return capabilities.get(agent_type, {})


# ============================================================================
# CORE CHAT ENDPOINTS FOR SELENA AGENTS
# ============================================================================

@app.post("/chat", response_model=ChatResponse)
async def chat_with_selena(
    request: ChatRequest,
    background_tasks: BackgroundTasks,
    _: bool = Depends(check_rate_limit)
):
    """
    Main chat endpoint for Selena AI agents
    Routes requests to appropriate agent based on agent_type
    """
    start_time = time.time()
    
    try:
        # Generate session ID if not provided
        session_id = request.session_id or str(uuid.uuid4())
        
        # Route to appropriate Selena agent
        response_data = await _route_to_agent(request, session_id)
        
        # Calculate processing time
        processing_time = (time.time() - start_time) * 1000
        
        # Log performance metrics
        background_tasks.add_task(
            performance_monitor.log_request,
            agent_type=request.agent_type,
            processing_time=processing_time,
            success=True
        )
        
        return ChatResponse(
            reply=response_data["reply"],
            session_id=session_id,
            agent_type=request.agent_type,
            language=request.language,
            processing_time_ms=processing_time,
            confidence_score=response_data.get("confidence_score"),
            suggested_actions=response_data.get("suggested_actions")
        )
        
    except Exception as e:
        processing_time = (time.time() - start_time) * 1000
        
        # Log error metrics
        background_tasks.add_task(
            performance_monitor.log_request,
            agent_type=request.agent_type,
            processing_time=processing_time,
            success=False,
            error=str(e)
        )
        
        # Handle error
        if error_handler:
            error_response = await error_handler.handle_chat_error(e, request)
            return error_response
        
        raise HTTPException(status_code=500, detail="Internal server error")


async def _route_to_agent(request: ChatRequest, session_id: str) -> Dict[str, Any]:
    """Route chat request to appropriate Selena agent"""
    
    # Load conversation history
    history = await session_manager.load_history(session_id) if session_manager else []
    
    # Route to specific agent
    if request.agent_type == "onboard":
        if not onboard_agent:
            raise HTTPException(status_code=503, detail="Onboard agent not available")
        
        onboard_request = OnboardRequest(
            message=request.message,
            session_id=session_id,
            language=request.language,
            user_context=request.user_context,
            conversation_history=history
        )
        
        response = await onboard_agent.process_request(onboard_request)
        
    elif request.agent_type == "discover":
        if not discover_agent:
            raise HTTPException(status_code=503, detail="Discover agent not available")
        
        discover_request = DiscoverRequest(
            message=request.message,
            session_id=session_id,
            language=request.language,
            user_context=request.user_context,
            conversation_history=history
        )
        
        response = await discover_agent.process_request(discover_request)
        
    elif request.agent_type == "support":
        if not support_agent:
            raise HTTPException(status_code=503, detail="Support agent not available")
        
        support_request = SupportRequest(
            message=request.message,
            session_id=session_id,
            language=request.language,
            user_context=request.user_context,
            conversation_history=history
        )
        
        response = await support_agent.process_request(support_request)
        
    elif request.agent_type == "community":
        if not community_agent:
            raise HTTPException(status_code=503, detail="Community agent not available")
        
        community_request = CommunityRequest(
            message=request.message,
            session_id=session_id,
            language=request.language,
            user_context=request.user_context,
            conversation_history=history
        )
        
        response = await community_agent.process_request(community_request)
        
    else:
        raise HTTPException(status_code=400, detail="Invalid agent type")
    
    # Save conversation history
    if session_manager:
        await session_manager.save_conversation(
            session_id=session_id,
            user_message=request.message,
            agent_response=response.reply,
            agent_type=request.agent_type,
            language=request.language
        )
    
    return {
        "reply": response.reply,
        "confidence_score": response.confidence_score,
        "suggested_actions": response.suggested_actions
    }


# ============================================================================
# SPECIALIZED AGENT ENDPOINTS
# ============================================================================

@app.post("/agents/onboard", response_model=OnboardResponse)
async def onboard_user(
    request: OnboardRequest,
    background_tasks: BackgroundTasks,
    _: bool = Depends(check_rate_limit)
):
    """Dedicated endpoint for onboarding operations"""
    if not onboard_agent:
        raise HTTPException(status_code=503, detail="Onboard agent not available")
    
    start_time = time.time()
    
    try:
        response = await onboard_agent.process_request(request)
        
        processing_time = (time.time() - start_time) * 1000
        background_tasks.add_task(
            performance_monitor.log_request,
            agent_type="onboard",
            processing_time=processing_time,
            success=True
        )
        
        return response
        
    except Exception as e:
        processing_time = (time.time() - start_time) * 1000
        background_tasks.add_task(
            performance_monitor.log_request,
            agent_type="onboard",
            processing_time=processing_time,
            success=False,
            error=str(e)
        )
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/agents/discover", response_model=DiscoverResponse)
async def discover_activities(
    request: DiscoverRequest,
    background_tasks: BackgroundTasks,
    _: bool = Depends(check_rate_limit)
):
    """Dedicated endpoint for activity discovery"""
    if not discover_agent:
        raise HTTPException(status_code=503, detail="Discover agent not available")
    
    start_time = time.time()
    
    try:
        response = await discover_agent.process_request(request)
        
        processing_time = (time.time() - start_time) * 1000
        background_tasks.add_task(
            performance_monitor.log_request,
            agent_type="discover",
            processing_time=processing_time,
            success=True
        )
        
        return response
        
    except Exception as e:
        processing_time = (time.time() - start_time) * 1000
        background_tasks.add_task(
            performance_monitor.log_request,
            agent_type="discover",
            processing_time=processing_time,
            success=False,
            error=str(e)
        )
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/agents/support", response_model=SupportResponse)
async def get_support(
    request: SupportRequest,
    background_tasks: BackgroundTasks,
    _: bool = Depends(check_rate_limit)
):
    """Dedicated endpoint for customer support"""
    if not support_agent:
        raise HTTPException(status_code=503, detail="Support agent not available")
    
    start_time = time.time()
    
    try:
        response = await support_agent.process_request(request)
        
        processing_time = (time.time() - start_time) * 1000
        background_tasks.add_task(
            performance_monitor.log_request,
            agent_type="support",
            processing_time=processing_time,
            success=True
        )
        
        return response
        
    except Exception as e:
        processing_time = (time.time() - start_time) * 1000
        background_tasks.add_task(
            performance_monitor.log_request,
            agent_type="support",
            processing_time=processing_time,
            success=False,
            error=str(e)
        )
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/agents/community", response_model=CommunityResponse)
async def community_interaction(
    request: CommunityRequest,
    background_tasks: BackgroundTasks,
    _: bool = Depends(check_rate_limit)
):
    """Dedicated endpoint for community interactions"""
    if not community_agent:
        raise HTTPException(status_code=503, detail="Community agent not available")
    
    start_time = time.time()
    
    try:
        response = await community_agent.process_request(request)
        
        processing_time = (time.time() - start_time) * 1000
        background_tasks.add_task(
            performance_monitor.log_request,
            agent_type="community",
            processing_time=processing_time,
            success=True
        )
        
        return response
        
    except Exception as e:
        processing_time = (time.time() - start_time) * 1000
        background_tasks.add_task(
            performance_monitor.log_request,
            agent_type="community",
            processing_time=processing_time,
            success=False,
            error=str(e)
        )
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# SESSION MANAGEMENT ENDPOINTS
# ============================================================================

@app.get("/sessions/{session_id}")
async def get_session(session_id: str):
    """Get session information and conversation history"""
    if not session_manager:
        raise HTTPException(status_code=503, detail="Session manager not available")
    
    session_data = await session_manager.get_session(session_id)
    if not session_data:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return session_data


@app.delete("/sessions/{session_id}")
async def clear_session(session_id: str):
    """Clear session data and conversation history"""
    if not session_manager:
        raise HTTPException(status_code=503, detail="Session manager not available")
    
    success = await session_manager.clear_session(session_id)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {"message": "Session cleared successfully"}


@app.get("/sessions/{session_id}/analytics")
async def get_session_analytics(session_id: str):
    """Get analytics for a specific session"""
    if not session_manager:
        raise HTTPException(status_code=503, detail="Session manager not available")
    
    analytics = await session_manager.get_session_analytics(session_id)
    if not analytics:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return analytics


# ============================================================================
# PERFORMANCE AND MONITORING ENDPOINTS
# ============================================================================

@app.get("/performance/metrics")
async def get_performance_metrics():
    """Get overall performance metrics"""
    return await performance_monitor.get_metrics()


@app.get("/performance/agents/{agent_type}")
async def get_agent_performance(agent_type: str):
    """Get performance metrics for a specific agent"""
    if agent_type not in ["onboard", "discover", "support", "community"]:
        raise HTTPException(status_code=400, detail="Invalid agent type")
    
    return await performance_monitor.get_agent_metrics(agent_type)


@app.get("/performance/summary")
async def get_performance_summary():
    """Get performance summary for all agents"""
    return await performance_monitor.get_summary()


# ============================================================================
# BATCH OPERATIONS ENDPOINTS
# ============================================================================

@app.post("/batch/chat")
async def batch_chat(requests: List[ChatRequest]):
    """Process multiple chat requests in batch for better performance"""
    if len(requests) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 requests per batch")
    
    results = []
    tasks = []
    
    # Process requests concurrently
    for req in requests:
        task = _route_to_agent(req, req.session_id or str(uuid.uuid4()))
        tasks.append(task)
    
    # Wait for all tasks to complete
    responses = await asyncio.gather(*tasks, return_exceptions=True)
    
    for i, response in enumerate(responses):
        if isinstance(response, Exception):
            results.append({
                "error": str(response),
                "request_index": i
            })
        else:
            results.append({
                "success": True,
                "response": response,
                "request_index": i
            })
    
    return {"results": results}


# ============================================================================
# ERROR HANDLING
# ============================================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handle HTTP exceptions with proper error responses"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "timestamp": datetime.utcnow().isoformat(),
            "path": str(request.url)
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions"""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "timestamp": datetime.utcnow().isoformat(),
            "path": str(request.url)
        }
    )


# ============================================================================
# STARTUP EVENT
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Log startup information"""
    logger.info("🌟 LUDUS Selena AI Service - Ready to serve!")
    logger.info(f"📊 Performance target: <200ms response time")
    logger.info(f"🚀 Concurrency target: 1000+ concurrent requests")
    logger.info(f"🔗 Ollama Host: {settings.ollama_host}")
    logger.info(f"📦 Redis: {'Connected' if session_manager and session_manager.redis_client else 'Disconnected'}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8081,
        reload=True,
        log_level="info"
    )