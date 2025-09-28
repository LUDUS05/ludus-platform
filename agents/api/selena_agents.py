"""
LUDUS Selena AI Agents - High-Performance Agent Implementation
Created: 2025-09-28 GMT+3 (Riyadh)
Purpose: Core implementation of the four specialized Selena AI agents

Agents:
1. OnboardAgent - User onboarding and initial guidance
2. DiscoverAgent - Activity discovery and recommendations  
3. SupportAgent - Customer support and issue resolution
4. CommunityAgent - Community management and social interactions
"""

from abc import ABC, abstractmethod
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum
import json
import uuid
import requests
import asyncio
import time


class AgentType(str, Enum):
    """Selena AI Agent Types"""
    ONBOARD = "onboard"
    DISCOVER = "discover" 
    SUPPORT = "support"
    COMMUNITY = "community"


class AgentRequest(BaseModel):
    """Base request model for all Selena agents"""
    message: str = Field(..., description="User message or query")
    session_id: Optional[str] = Field(default=None, description="Session identifier")
    language: str = Field(default="ar", description="Language preference (ar/en)")
    user_id: Optional[str] = Field(default=None, description="User identifier")
    context: Optional[Dict[str, Any]] = Field(default=None, description="Additional context")


class AgentResponse(BaseModel):
    """Base response model for all Selena agents"""
    agent_type: AgentType = Field(..., description="Agent that processed the request")
    response: str = Field(..., description="Agent response message")
    session_id: str = Field(..., description="Session identifier")
    language: str = Field(..., description="Response language")
    confidence: float = Field(default=0.95, description="Response confidence score")
    response_time_ms: float = Field(..., description="Processing time in milliseconds")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Additional response metadata")
    suggestions: Optional[List[str]] = Field(default=None, description="Follow-up suggestions")


class BaseSelenaAgent(ABC):
    """Base class for all Selena AI agents with performance optimization"""
    
    def __init__(self, redis_client=None, ollama_host: str = "http://localhost:11434", ollama_model: str = "llama3.1"):
        self.redis_client = redis_client
        self.ollama_host = ollama_host
        self.ollama_model = ollama_model
        self.agent_type = self.get_agent_type()
        
    @abstractmethod
    def get_agent_type(self) -> AgentType:
        """Return the agent type"""
        pass
    
    @abstractmethod
    def get_system_prompt(self, language: str) -> str:
        """Get agent-specific system prompt"""
        pass
    
    @abstractmethod
    def process_specialized_request(self, request: AgentRequest) -> Dict[str, Any]:
        """Process agent-specific business logic"""
        pass
    
    def _get_session_key(self, session_id: str) -> str:
        """Generate Redis session key"""
        return f"selena:session:{self.agent_type.value}:{session_id}"
    
    def _load_session_history(self, session_id: str) -> List[Dict[str, Any]]:
        """Load conversation history from Redis"""
        if not self.redis_client or not session_id:
            return []
        
        try:
            data = self.redis_client.get(self._get_session_key(session_id))
            return json.loads(data) if data else []
        except Exception:
            return []
    
    def _save_session_history(self, session_id: str, history: List[Dict[str, Any]]) -> None:
        """Save conversation history to Redis with 6-hour expiry"""
        if not self.redis_client or not session_id:
            return
        
        try:
            # Keep only last 20 messages for performance
            trimmed_history = history[-20:] if len(history) > 20 else history
            self.redis_client.setex(
                self._get_session_key(session_id), 
                21600,  # 6 hours
                json.dumps(trimmed_history)
            )
        except Exception:
            pass
    
    async def _call_ollama(self, prompt: str, max_tokens: int = 200) -> Optional[str]:
        """High-performance Ollama API call with timeout optimization"""
        try:
            response = await asyncio.wait_for(
                asyncio.to_thread(
                    requests.post,
                    f"{self.ollama_host}/api/generate",
                    json={
                        "model": self.ollama_model,
                        "prompt": prompt,
                        "stream": False,
                        "options": {
                            "temperature": 0.7,
                            "top_p": 0.9,
                            "max_tokens": max_tokens,
                            "stop": ["Human:", "User:", "Assistant:"]
                        }
                    },
                    timeout=5  # 5 second timeout for <200ms target
                ),
                timeout=6  # Total timeout including network
            )
            
            if response.ok:
                data = response.json()
                reply = data.get("response", "").strip()
                
                # Clean up response
                if "Assistant:" in reply:
                    reply = reply.split("Assistant:")[-1].strip()
                    
                return reply if len(reply) > 3 else None
                
        except Exception:
            return None
    
    def _build_agent_prompt(self, request: AgentRequest, history: List[Dict[str, Any]]) -> str:
        """Build optimized prompt with conversation context"""
        system_prompt = self.get_system_prompt(request.language)
        
        # Build conversation context (last 6 exchanges)
        context_lines = [system_prompt]
        recent_history = history[-12:] if len(history) > 12 else history
        
        for entry in recent_history:
            role = entry.get("role", "user")
            content = entry.get("content", "")
            if role == "user":
                context_lines.append(f"User: {content}")
            else:
                context_lines.append(f"Assistant: {content}")
        
        # Add current message
        context_lines.append(f"User: {request.message}")
        context_lines.append("Assistant:")
        
        return "\n".join(context_lines)
    
    async def process_request(self, request: AgentRequest) -> AgentResponse:
        """Main request processing method with performance tracking"""
        start_time = time.time()
        
        # Generate session ID if not provided
        session_id = request.session_id or str(uuid.uuid4())
        
        # Load conversation history
        history = self._load_session_history(session_id)
        
        # Try specialized processing first
        try:
            specialized_result = self.process_specialized_request(request)
            if specialized_result and specialized_result.get("response"):
                response_text = specialized_result["response"]
                metadata = specialized_result.get("metadata", {})
            else:
                # Fall back to Ollama AI
                prompt = self._build_agent_prompt(request, history)
                response_text = await self._call_ollama(prompt)
                metadata = {}
                
                if not response_text:
                    # Final fallback
                    fallback_responses = {
                        "ar": f"مرحباً! أنا {self._get_agent_name_ar()}. كيف يمكنني مساعدتك؟",
                        "en": f"Hello! I'm your {self._get_agent_name_en()}. How can I help you?"
                    }
                    response_text = fallback_responses.get(request.language, fallback_responses["en"])
                    
        except Exception:
            # Error fallback
            fallback_responses = {
                "ar": f"أعتذر، واجهت مشكلة تقنية. سأعمل على حلها وأعود إليك قريباً.",
                "en": f"I apologize, I encountered a technical issue. I'll work on resolving it and get back to you soon."
            }
            response_text = fallback_responses.get(request.language, fallback_responses["en"])
            metadata = {"error": "technical_issue"}
        
        # Calculate response time
        response_time_ms = (time.time() - start_time) * 1000
        
        # Update conversation history
        history.append({
            "role": "user",
            "content": request.message,
            "timestamp": datetime.now().isoformat(),
            "agent_type": self.agent_type.value
        })
        history.append({
            "role": "assistant", 
            "content": response_text,
            "timestamp": datetime.now().isoformat(),
            "agent_type": self.agent_type.value,
            "response_time_ms": response_time_ms
        })
        
        self._save_session_history(session_id, history)
        
        return AgentResponse(
            agent_type=self.agent_type,
            response=response_text,
            session_id=session_id,
            language=request.language,
            response_time_ms=response_time_ms,
            metadata=metadata,
            suggestions=self._generate_suggestions(request, response_text)
        )
    
    @abstractmethod
    def _get_agent_name_ar(self) -> str:
        """Get agent name in Arabic"""
        pass
    
    @abstractmethod
    def _get_agent_name_en(self) -> str:
        """Get agent name in English"""
        pass
    
    def _generate_suggestions(self, request: AgentRequest, response: str) -> List[str]:
        """Generate follow-up suggestions based on agent type"""
        return []


class OnboardAgent(BaseSelenaAgent):
    """Selena Onboard Agent - Specialized in user onboarding and guidance"""
    
    def get_agent_type(self) -> AgentType:
        return AgentType.ONBOARD
    
    def _get_agent_name_ar(self) -> str:
        return "سلينا - وكيل الترحيب"
    
    def _get_agent_name_en(self) -> str:
        return "Selena Onboard Agent"
    
    def get_system_prompt(self, language: str) -> str:
        if language == "ar":
            return """أنت سلينا، وكيل الترحيب المتخصص في منصة LUDUS. أنت خبيرة في:
- ترحيب المستخدمين الجدد وتوجيههم
- شرح ميزات المنصة والخدمات المتاحة
- مساعدة المستخدمين في إكمال ملفاتهم الشخصية
- تقديم النصائح لتحسين تجربة المستخدم
- الإجابة على أسئلة البداية والإعدادات

كوني ودودة ومرحبة، واستخدمي لغة بسيطة وواضحة. ركزي على مساعدة المستخدمين للبدء بثقة في استخدام LUDUS."""
        else:
            return """You are Selena, the specialized Onboard Agent for LUDUS platform. You are an expert in:
- Welcoming new users and guiding them through the platform
- Explaining platform features and available services
- Helping users complete their profiles
- Providing tips to improve user experience
- Answering beginner questions and setup queries

Be friendly and welcoming, use simple and clear language. Focus on helping users start confidently with LUDUS."""
    
    def process_specialized_request(self, request: AgentRequest) -> Dict[str, Any]:
        """Process onboarding-specific requests"""
        message_lower = request.message.lower()
        
        # Detect onboarding-related keywords
        onboarding_keywords = {
            "ar": ["ترحيب", "بداية", "تسجيل", "ملف", "إعدادات", "كيف", "ماذا"],
            "en": ["welcome", "start", "begin", "profile", "setup", "how", "what", "guide"]
        }
        
        keywords = onboarding_keywords.get(request.language, onboarding_keywords["en"])
        
        if any(keyword in message_lower for keyword in keywords):
            # Generate specialized onboarding response
            if request.language == "ar":
                response = f"مرحباً بك في LUDUS! أنا سلينا، مرشدتك الشخصية. سأساعدك في البدء بتجربة رائعة على منصتنا."
            else:
                response = f"Welcome to LUDUS! I'm Selena, your personal guide. I'll help you get started with an amazing experience on our platform."
            
            return {
                "response": response,
                "metadata": {
                    "agent_specialization": "onboarding",
                    "detected_intent": "welcome_new_user"
                }
            }
        
        return {}
    
    def _generate_suggestions(self, request: AgentRequest, response: str) -> List[str]:
        """Generate onboarding-specific suggestions"""
        if request.language == "ar":
            return [
                "إكمال الملف الشخصي",
                "استكشاف الأنشطة المتاحة", 
                "فهم نظام النقاط والمكافآت",
                "الانضمام للمجتمع"
            ]
        else:
            return [
                "Complete your profile",
                "Explore available activities",
                "Learn about points and rewards",
                "Join the community"
            ]


class DiscoverAgent(BaseSelenaAgent):
    """Selena Discover Agent - Specialized in activity discovery and recommendations"""
    
    def get_agent_type(self) -> AgentType:
        return AgentType.DISCOVER
    
    def _get_agent_name_ar(self) -> str:
        return "سلينا - وكيل الاستكشاف"
    
    def _get_agent_name_en(self) -> str:
        return "Selena Discover Agent"
    
    def get_system_prompt(self, language: str) -> str:
        if language == "ar":
            return """أنت سلينا، وكيل الاستكشاف المتخصص في منصة LUDUS. أنت خبيرة في:
- اكتشاف الأنشطة المناسبة للمستخدمين
- تقديم توصيات شخصية بناءً على التفضيلات
- تحليل أنماط النشاط واقتراح تجارب جديدة
- مساعدة المستخدمين في العثور على الأنشطة بناءً على الموقع والوقت
- تقديم معلومات مفصلة عن الأنشطة والأحداث

كوني مبدعة ومفيدة في التوصيات، واستخدمي البيانات المتاحة لتقديم اقتراحات دقيقة ومتنوعة."""
        else:
            return """You are Selena, the specialized Discover Agent for LUDUS platform. You are an expert in:
- Discovering suitable activities for users
- Providing personalized recommendations based on preferences
- Analyzing activity patterns and suggesting new experiences
- Helping users find activities based on location and timing
- Providing detailed information about activities and events

Be creative and helpful in recommendations, use available data to provide accurate and diverse suggestions."""
    
    def process_specialized_request(self, request: AgentRequest) -> Dict[str, Any]:
        """Process discovery-specific requests"""
        message_lower = request.message.lower()
        
        # Detect discovery-related keywords
        discovery_keywords = {
            "ar": ["نشاط", "استكشاف", "توصية", "اقتراح", "أين", "متى", "ماذا أفعل"],
            "en": ["activity", "discover", "recommend", "suggest", "where", "when", "what to do"]
        }
        
        keywords = discovery_keywords.get(request.language, discovery_keywords["en"])
        
        if any(keyword in message_lower for keyword in keywords):
            # Generate specialized discovery response
            if request.language == "ar":
                response = f"رائع! دعني أساعدك في اكتشاف أنشطة مثيرة. ما نوع التجربة التي تبحث عنها؟"
            else:
                response = f"Great! Let me help you discover exciting activities. What kind of experience are you looking for?"
            
            return {
                "response": response,
                "metadata": {
                    "agent_specialization": "discovery",
                    "detected_intent": "activity_discovery"
                }
            }
        
        return {}
    
    def _generate_suggestions(self, request: AgentRequest, response: str) -> List[str]:
        """Generate discovery-specific suggestions"""
        if request.language == "ar":
            return [
                "أنشطة خارجية",
                "أنشطة داخلية",
                "أنشطة جماعية",
                "ورش عمل تعليمية"
            ]
        else:
            return [
                "Outdoor activities",
                "Indoor activities", 
                "Group activities",
                "Educational workshops"
            ]


class SupportAgent(BaseSelenaAgent):
    """Selena Support Agent - Specialized in customer support and issue resolution"""
    
    def get_agent_type(self) -> AgentType:
        return AgentType.SUPPORT
    
    def _get_agent_name_ar(self) -> str:
        return "سلينا - وكيل الدعم"
    
    def _get_agent_name_en(self) -> str:
        return "Selena Support Agent"
    
    def get_system_prompt(self, language: str) -> str:
        if language == "ar":
            return """أنت سلينا، وكيل الدعم المتخصص في منصة LUDUS. أنت خبيرة في:
- حل المشاكل التقنية والاستفسارات
- مساعدة المستخدمين في مشاكل الحجوزات والدفع
- تقديم الدعم الفني للمنصة
- حل مشاكل الحساب والملف الشخصي
- الإجابة على استفسارات السياسات والخدمات

كوني صبورة ومفيدة، واسعي لحل المشاكل بطريقة واضحة وفعالة. استخدمي أسلوباً مهنياً ومتعاطفاً."""
        else:
            return """You are Selena, the specialized Support Agent for LUDUS platform. You are an expert in:
- Solving technical issues and inquiries
- Helping users with booking and payment problems
- Providing technical platform support
- Resolving account and profile issues
- Answering policy and service questions

Be patient and helpful, aim to solve problems clearly and effectively. Use a professional and empathetic approach."""
    
    def process_specialized_request(self, request: AgentRequest) -> Dict[str, Any]:
        """Process support-specific requests"""
        message_lower = request.message.lower()
        
        # Detect support-related keywords
        support_keywords = {
            "ar": ["مشكلة", "خطأ", "دعم", "مساعدة", "لا يعمل", "تعطل", "حجز", "دفع"],
            "en": ["problem", "issue", "error", "support", "help", "broken", "not working", "booking", "payment"]
        }
        
        keywords = support_keywords.get(request.language, support_keywords["en"])
        
        if any(keyword in message_lower for keyword in keywords):
            # Generate specialized support response
            if request.language == "ar":
                response = f"أفهم أنك تواجه مشكلة. دعني أساعدك في حلها بأسرع وقت ممكن. ما هو تفصيل المشكلة؟"
            else:
                response = f"I understand you're facing an issue. Let me help you resolve it as quickly as possible. What are the details of the problem?"
            
            return {
                "response": response,
                "metadata": {
                    "agent_specialization": "support",
                    "detected_intent": "issue_resolution"
                }
            }
        
        return {}
    
    def _generate_suggestions(self, request: AgentRequest, response: str) -> List[str]:
        """Generate support-specific suggestions"""
        if request.language == "ar":
            return [
                "مشاكل تقنية",
                "مشاكل الحجوزات",
                "مشاكل الدفع",
                "إعدادات الحساب"
            ]
        else:
            return [
                "Technical issues",
                "Booking problems",
                "Payment issues", 
                "Account settings"
            ]


class CommunityAgent(BaseSelenaAgent):
    """Selena Community Agent - Specialized in community management and social interactions"""
    
    def get_agent_type(self) -> AgentType:
        return AgentType.COMMUNITY
    
    def _get_agent_name_ar(self) -> str:
        return "سلينا - وكيل المجتمع"
    
    def _get_agent_name_en(self) -> str:
        return "Selena Community Agent"
    
    def get_system_prompt(self, language: str) -> str:
        if language == "ar":
            return """أنت سلينا، وكيل المجتمع المتخصص في منصة LUDUS. أنت خبيرة في:
- إدارة المجتمع وتعزيز التفاعل الاجتماعي
- مساعدة المستخدمين في التواصل والتعارف
- تنظيم الأحداث الاجتماعية والأنشطة الجماعية
- حل النزاعات وإدارة المحتوى المجتمعي
- تعزيز روح المشاركة والتعاون

كوني اجتماعية ومحفزة، واعملي على خلق بيئة إيجابية ومرحبة للجميع."""
        else:
            return """You are Selena, the specialized Community Agent for LUDUS platform. You are an expert in:
- Managing community and enhancing social interactions
- Helping users connect and socialize
- Organizing social events and group activities
- Resolving conflicts and managing community content
- Promoting sharing and collaboration spirit

Be social and motivating, work to create a positive and welcoming environment for everyone."""
    
    def process_specialized_request(self, request: AgentRequest) -> Dict[str, Any]:
        """Process community-specific requests"""
        message_lower = request.message.lower()
        
        # Detect community-related keywords
        community_keywords = {
            "ar": ["مجتمع", "أصدقاء", "تعارف", "مجموعة", "فعالية", "تواصل", "انضمام"],
            "en": ["community", "friends", "meet", "group", "event", "social", "join", "connect"]
        }
        
        keywords = community_keywords.get(request.language, community_keywords["en"])
        
        if any(keyword in message_lower for keyword in keywords):
            # Generate specialized community response
            if request.language == "ar":
                response = f"أهلاً وسهلاً! مجتمع LUDUS يرحب بك. دعني أساعدك في التواصل مع أشخاص يشاركونك الاهتمامات."
            else:
                response = f"Welcome! The LUDUS community welcomes you. Let me help you connect with people who share your interests."
            
            return {
                "response": response,
                "metadata": {
                    "agent_specialization": "community",
                    "detected_intent": "social_connection"
                }
            }
        
        return {}
    
    def _generate_suggestions(self, request: AgentRequest, response: str) -> List[str]:
        """Generate community-specific suggestions"""
        if request.language == "ar":
            return [
                "البحث عن أصدقاء",
                "الانضمام لمجموعات",
                "إنشاء فعالية",
                "استكشاف المجتمع"
            ]
        else:
            return [
                "Find friends",
                "Join groups",
                "Create event",
                "Explore community"
            ]


# Agent Performance Manager
class SelenaAgentManager:
    """High-performance manager for all Selena agents"""
    
    def __init__(self, redis_client=None):
        self.redis_client = redis_client
        self.agents = {
            AgentType.ONBOARD: OnboardAgent(redis_client),
            AgentType.DISCOVER: DiscoverAgent(redis_client),
            AgentType.SUPPORT: SupportAgent(redis_client),
            AgentType.COMMUNITY: CommunityAgent(redis_client)
        }
        self.performance_cache = {}
    
    async def route_request(self, agent_type: AgentType, request: AgentRequest) -> AgentResponse:
        """Route request to appropriate agent with performance tracking"""
        start_time = time.time()
        
        agent = self.agents.get(agent_type)
        if not agent:
            raise HTTPException(status_code=404, detail=f"Agent {agent_type} not found")
        
        try:
            response = await agent.process_request(request)
            
            # Track performance metrics
            processing_time = (time.time() - start_time) * 1000
            self._track_performance(agent_type, processing_time, True)
            
            return response
            
        except Exception as e:
            # Track failure metrics
            processing_time = (time.time() - start_time) * 1000
            self._track_performance(agent_type, processing_time, False)
            raise HTTPException(status_code=500, detail=f"Agent processing failed: {str(e)}")
    
    def _track_performance(self, agent_type: AgentType, response_time_ms: float, success: bool):
        """Track agent performance metrics"""
        if not self.redis_client:
            return
        
        try:
            # Update performance cache
            key = f"selena:performance:{agent_type.value}"
            current_time = datetime.now().isoformat()
            
            performance_data = {
                "timestamp": current_time,
                "response_time_ms": response_time_ms,
                "success": success
            }
            
            # Store last 100 performance records per agent
            self.redis_client.lpush(key, json.dumps(performance_data))
            self.redis_client.ltrim(key, 0, 99)  # Keep only last 100 records
            self.redis_client.expire(key, 86400)  # 24 hour expiry
            
        except Exception:
            pass
    
    def get_agent_info(self, language: str = "ar") -> Dict[str, Any]:
        """Get information about all available Selena agents"""
        agents_info = {}
        
        for agent_type, agent in self.agents.items():
            if language == "ar":
                agents_info[agent_type.value] = {
                    "id": agent_type.value,
                    "name": agent._get_agent_name_ar(),
                    "description": self._get_agent_description_ar(agent_type),
                    "icon": self._get_agent_icon(agent_type),
                    "color": self._get_agent_color(agent_type)
                }
            else:
                agents_info[agent_type.value] = {
                    "id": agent_type.value,
                    "name": agent._get_agent_name_en(),
                    "description": self._get_agent_description_en(agent_type),
                    "icon": self._get_agent_icon(agent_type),
                    "color": self._get_agent_color(agent_type)
                }
        
        return agents_info
    
    def _get_agent_description_ar(self, agent_type: AgentType) -> str:
        descriptions = {
            AgentType.ONBOARD: "متخصص في ترحيب المستخدمين الجدد وتوجيههم",
            AgentType.DISCOVER: "متخصص في اكتشاف الأنشطة وتقديم التوصيات",
            AgentType.SUPPORT: "متخصص في الدعم الفني وحل المشاكل",
            AgentType.COMMUNITY: "متخصص في إدارة المجتمع والتفاعل الاجتماعي"
        }
        return descriptions.get(agent_type, "وكيل ذكي متخصص")
    
    def _get_agent_description_en(self, agent_type: AgentType) -> str:
        descriptions = {
            AgentType.ONBOARD: "Specialized in welcoming new users and guidance",
            AgentType.DISCOVER: "Specialized in activity discovery and recommendations", 
            AgentType.SUPPORT: "Specialized in technical support and issue resolution",
            AgentType.COMMUNITY: "Specialized in community management and social interaction"
        }
        return descriptions.get(agent_type, "Specialized AI agent")
    
    def _get_agent_icon(self, agent_type: AgentType) -> str:
        icons = {
            AgentType.ONBOARD: "👋",
            AgentType.DISCOVER: "🔍", 
            AgentType.SUPPORT: "🛠️",
            AgentType.COMMUNITY: "👥"
        }
        return icons.get(agent_type, "🤖")
    
    def _get_agent_color(self, agent_type: AgentType) -> str:
        colors = {
            AgentType.ONBOARD: "#10B981",   # Green - welcoming
            AgentType.DISCOVER: "#3B82F6",  # Blue - discovery
            AgentType.SUPPORT: "#F59E0B",   # Orange - support
            AgentType.COMMUNITY: "#8B5CF6"  # Purple - community
        }
        return colors.get(agent_type, "#6B7280")