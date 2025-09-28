"""
Selena AI Agents Integration for LUDUS Platform
Implements the 4 specialized Selena agents within the existing FastAPI structure

Agents:
- Selena Onboard: User onboarding and registration guidance
- Selena Discover: Activity discovery and recommendations
- Selena Support: Customer support and assistance
- Selena Community: Community building and connections

Performance Targets:
- <200ms response time
- 1000+ concurrent requests capability

Created: 2025-09-28 GMT+3 (Riyadh)
Version: 1.0.0
"""

from pydantic import BaseModel, Field, validator
from typing import Dict, List, Optional, Any
import time
import logging
import asyncio
import hashlib
import uuid
from datetime import datetime


# ============================================================================
# SELENA AGENT REQUEST/RESPONSE MODELS
# ============================================================================

class SelenaRequest(BaseModel):
    """Base request model for Selena agents"""
    message: str = Field(..., min_length=1, max_length=1000)
    session_id: str | None = None
    language: str = Field(default="ar", regex="^(ar|en)$")
    agent_type: str = Field(..., regex="^(onboard|discover|support|community)$")
    user_context: Optional[Dict[str, Any]] = None
    
    @validator('message')
    def validate_message(cls, v):
        if not v.strip():
            raise ValueError('Message cannot be empty')
        return v.strip()


class SelenaResponse(BaseModel):
    """Enhanced response model for Selena agents"""
    reply: str
    session_id: str
    agent_type: str
    language: str
    processing_time_ms: float
    confidence_score: float = Field(ge=0.0, le=1.0)
    suggested_actions: Optional[List[str]] = None
    agent_specific_data: Optional[Dict[str, Any]] = None


# ============================================================================
# SELENA AGENT IMPLEMENTATIONS
# ============================================================================

class SelenaOnboardAgent:
    """Selena Onboard Agent - User onboarding specialist"""
    
    def __init__(self, redis_client=None):
        self.redis_client = redis_client
        self.agent_type = "onboard"
        self.logger = logging.getLogger(f"selena.{self.agent_type}")
        
        # Onboarding stages
        self.onboarding_stages = {
            "welcome": {"weight": 15, "name_ar": "الترحيب", "name_en": "Welcome"},
            "registration": {"weight": 25, "name_ar": "التسجيل", "name_en": "Registration"},
            "profile": {"weight": 30, "name_ar": "الملف الشخصي", "name_en": "Profile Setup"},
            "preferences": {"weight": 20, "name_ar": "التفضيلات", "name_en": "Preferences"},
            "tutorial": {"weight": 10, "name_ar": "الدليل", "name_en": "Tutorial"}
        }
    
    async def process_request(self, request: SelenaRequest) -> SelenaResponse:
        """Process onboarding request"""
        start_time = time.time()
        
        try:
            # Get onboarding stage from user context
            current_stage = "welcome"
            if request.user_context:
                current_stage = request.user_context.get("onboarding_stage", "welcome")
            
            # Generate response based on stage and message
            response_text = await self._generate_onboarding_response(request, current_stage)
            
            # Calculate processing time
            processing_time = (time.time() - start_time) * 1000
            
            # Generate next steps
            next_steps = self._get_next_steps(current_stage, request.language)
            
            return SelenaResponse(
                reply=response_text,
                session_id=request.session_id or str(uuid.uuid4()),
                agent_type=self.agent_type,
                language=request.language,
                processing_time_ms=processing_time,
                confidence_score=0.85,
                suggested_actions=next_steps,
                agent_specific_data={
                    "onboarding_stage": current_stage,
                    "completion_percentage": self._calculate_completion(current_stage),
                    "next_stage": self._get_next_stage(current_stage)
                }
            )
            
        except Exception as e:
            processing_time = (time.time() - start_time) * 1000
            return await self._handle_error(e, request, processing_time)
    
    async def _generate_onboarding_response(self, request: SelenaRequest, stage: str) -> str:
        """Generate response based on onboarding stage"""
        
        responses = {
            "ar": {
                "welcome": f"مرحباً بك في LUDUS! أنا سيلينا، مساعدتك في رحلة الإعداد. سأساعدك خطوة بخطوة لتحقيق أقصى استفادة من المنصة. {request.message}",
                "registration": f"ممتاز! دعني أساعدك في إكمال تسجيل حسابك. سنحتاج لبعض المعلومات الأساسية لضمان أمان حسابك. {request.message}",
                "profile": f"رائع! الآن لننشئ ملفك الشخصي المميز. هذا سيساعدنا في تقديم أفضل التوصيات المناسبة لك. {request.message}",
                "preferences": f"ممتاز! دعنا نحدد اهتماماتك وتفضيلاتك في الأنشطة لنقدم لك تجربة شخصية فريدة. {request.message}",
                "tutorial": f"أحسنت! الآن دعني أعرفك على جميع ميزات LUDUS الرائعة وكيفية استخدامها بفعالية. {request.message}"
            },
            "en": {
                "welcome": f"Welcome to LUDUS! I'm Selena, your setup assistant. I'll guide you step by step to make the most of the platform. {request.message}",
                "registration": f"Excellent! Let me help you complete your account registration. We'll need some basic information to ensure your account security. {request.message}",
                "profile": f"Great! Now let's create your unique profile. This will help us provide the best recommendations suited for you. {request.message}",
                "preferences": f"Perfect! Let's determine your interests and activity preferences to give you a personalized unique experience. {request.message}",
                "tutorial": f"Well done! Now let me introduce you to all the amazing LUDUS features and how to use them effectively. {request.message}"
            }
        }
        
        return responses.get(request.language, responses["en"]).get(stage, responses[request.language]["welcome"])
    
    def _get_next_steps(self, stage: str, language: str) -> List[str]:
        """Get next steps for onboarding stage"""
        
        steps = {
            "ar": {
                "welcome": ["إنشاء حساب جديد", "تسجيل الدخول إذا كان لديك حساب"],
                "registration": ["إكمال معلومات التسجيل", "تأكيد البريد الإلكتروني"],
                "profile": ["رفع الصورة الشخصية", "إضافة معلومات شخصية"],
                "preferences": ["اختيار الاهتمامات", "تحديد المناطق المفضلة"],
                "tutorial": ["جولة في المنصة", "بدء استكشاف الأنشطة"]
            },
            "en": {
                "welcome": ["Create new account", "Login if you have an account"],
                "registration": ["Complete registration info", "Verify email"],
                "profile": ["Upload profile picture", "Add personal information"],
                "preferences": ["Select interests", "Set preferred areas"],
                "tutorial": ["Platform tour", "Start exploring activities"]
            }
        }
        
        return steps.get(language, steps["en"]).get(stage, [])
    
    def _calculate_completion(self, stage: str) -> float:
        """Calculate onboarding completion percentage"""
        stage_order = ["welcome", "registration", "profile", "preferences", "tutorial"]
        if stage in stage_order:
            completed_stages = stage_order.index(stage) + 1
            return (completed_stages / len(stage_order)) * 100
        return 0.0
    
    def _get_next_stage(self, current_stage: str) -> str:
        """Get next onboarding stage"""
        stage_order = ["welcome", "registration", "profile", "preferences", "tutorial"]
        try:
            current_index = stage_order.index(current_stage)
            if current_index < len(stage_order) - 1:
                return stage_order[current_index + 1]
        except ValueError:
            pass
        return "tutorial"  # Default final stage
    
    async def _handle_error(self, error: Exception, request: SelenaRequest, processing_time: float) -> SelenaResponse:
        """Handle errors with fallback response"""
        
        fallback = {
            "ar": "أعتذر، واجهت صعوبة في معالجة طلبك. دعني أساعدك بطريقة أخرى أو يمكنك التواصل مع فريق الدعم.",
            "en": "I apologize, I had difficulty processing your request. Let me help you in another way or you can contact our support team."
        }
        
        return SelenaResponse(
            reply=fallback.get(request.language, fallback["en"]),
            session_id=request.session_id or str(uuid.uuid4()),
            agent_type=self.agent_type,
            language=request.language,
            processing_time_ms=processing_time,
            confidence_score=0.3,
            suggested_actions=["Contact support", "Try again later"],
            agent_specific_data={"error": True, "fallback": True}
        )


class SelenaDiscoverAgent:
    """Selena Discover Agent - Activity discovery specialist"""
    
    def __init__(self, redis_client=None):
        self.redis_client = redis_client
        self.agent_type = "discover"
        self.logger = logging.getLogger(f"selena.{self.agent_type}")
        
        # Activity categories
        self.categories = {
            "ar": ["ثقافي", "رياضي", "ترفيهي", "عائلي", "مغامرة", "تعليمي"],
            "en": ["Cultural", "Sports", "Entertainment", "Family", "Adventure", "Educational"]
        }
    
    async def process_request(self, request: SelenaRequest) -> SelenaResponse:
        """Process discovery request"""
        start_time = time.time()
        
        try:
            # Analyze request for discovery intent
            discovery_type = self._analyze_discovery_intent(request.message)
            
            # Generate discovery response
            response_text = await self._generate_discovery_response(request, discovery_type)
            
            # Get activity recommendations
            recommendations = self._get_activity_recommendations(request, discovery_type)
            
            processing_time = (time.time() - start_time) * 1000
            
            return SelenaResponse(
                reply=response_text,
                session_id=request.session_id or str(uuid.uuid4()),
                agent_type=self.agent_type,
                language=request.language,
                processing_time_ms=processing_time,
                confidence_score=0.82,
                suggested_actions=self._get_discovery_actions(discovery_type, request.language),
                agent_specific_data={
                    "discovery_type": discovery_type,
                    "recommendations": recommendations,
                    "categories": self.categories.get(request.language, self.categories["en"])
                }
            )
            
        except Exception as e:
            processing_time = (time.time() - start_time) * 1000
            return await self._handle_error(e, request, processing_time)
    
    def _analyze_discovery_intent(self, message: str) -> str:
        """Analyze message to determine discovery intent"""
        message_lower = message.lower()
        
        if any(word in message_lower for word in ["near", "nearby", "قريب", "بالقرب"]):
            return "nearby"
        elif any(word in message_lower for word in ["trending", "popular", "رائج", "شائع"]):
            return "trending"
        elif any(word in message_lower for word in ["recommend", "suggest", "أنصح", "اقترح"]):
            return "recommended"
        else:
            return "general"
    
    async def _generate_discovery_response(self, request: SelenaRequest, discovery_type: str) -> str:
        """Generate discovery response"""
        
        responses = {
            "ar": {
                "nearby": f"بحثت لك عن أفضل الأنشطة القريبة من موقعك! إليك مجموعة رائعة من الخيارات المناسبة. {request.message}",
                "trending": f"إليك أحدث الأنشطة الرائجة والأكثر شعبية الآن في السعودية! {request.message}",
                "recommended": f"بناءً على اهتماماتك، إليك توصياتي الشخصية لأنشطة ستحبها حقاً! {request.message}",
                "general": f"أهلاً بك! سأساعدك في اكتشاف أنشطة رائعة تناسب اهتماماتك. {request.message}"
            },
            "en": {
                "nearby": f"I found the best activities near your location! Here's a great selection of suitable options. {request.message}",
                "trending": f"Here are the latest trending and most popular activities now in Saudi Arabia! {request.message}",
                "recommended": f"Based on your interests, here are my personal recommendations for activities you'll truly love! {request.message}",
                "general": f"Welcome! I'll help you discover amazing activities that match your interests. {request.message}"
            }
        }
        
        return responses.get(request.language, responses["en"]).get(discovery_type, responses[request.language]["general"])
    
    def _get_activity_recommendations(self, request: SelenaRequest, discovery_type: str) -> List[Dict[str, Any]]:
        """Get activity recommendations"""
        
        # Mock recommendations (in production, this would query the database)
        recommendations = [
            {
                "id": "desert_camp",
                "title_ar": "التخييم الصحراوي",
                "title_en": "Desert Camping",
                "location": "Riyadh Desert",
                "price_sar": 250,
                "rating": 4.8
            },
            {
                "id": "heritage_tour",
                "title_ar": "جولة التراث",
                "title_en": "Heritage Tour", 
                "location": "Jeddah Old Town",
                "price_sar": 85,
                "rating": 4.6
            }
        ]
        
        return recommendations[:3]  # Return top 3
    
    def _get_discovery_actions(self, discovery_type: str, language: str) -> List[str]:
        """Get suggested actions for discovery"""
        
        actions = {
            "ar": {
                "nearby": ["توسيع نطاق البحث", "تغيير الموقع", "فلترة حسب النوع"],
                "trending": ["حجز النشاط المفضل", "مشاركة مع الأصدقاء", "إضافة للمفضلة"],
                "recommended": ["استكشاف المزيد", "تحديث التفضيلات", "تقييم التوصيات"],
                "general": ["تحديد الموقع", "اختيار الفئة", "تحديد الميزانية"]
            },
            "en": {
                "nearby": ["Expand search radius", "Change location", "Filter by type"],
                "trending": ["Book preferred activity", "Share with friends", "Add to favorites"],
                "recommended": ["Explore more", "Update preferences", "Rate recommendations"],
                "general": ["Set location", "Choose category", "Set budget"]
            }
        }
        
        return actions.get(language, actions["en"]).get(discovery_type, actions[language]["general"])
    
    async def _handle_error(self, error: Exception, request: SelenaRequest, processing_time: float) -> SelenaResponse:
        """Handle discovery errors"""
        
        fallback = {
            "ar": "أعتذر، واجهت صعوبة في البحث عن الأنشطة. دعني أحاول بطريقة أخرى أو يمكنك تصفح الأنشطة يدوياً.",
            "en": "I apologize, I had difficulty searching for activities. Let me try another way or you can browse activities manually."
        }
        
        return SelenaResponse(
            reply=fallback.get(request.language, fallback["en"]),
            session_id=request.session_id or str(uuid.uuid4()),
            agent_type=self.agent_type,
            language=request.language,
            processing_time_ms=processing_time,
            confidence_score=0.3,
            suggested_actions=["Browse categories", "Try different search terms"]
        )


class SelenaSupportAgent:
    """Selena Support Agent - Customer support specialist"""
    
    def __init__(self, redis_client=None):
        self.redis_client = redis_client
        self.agent_type = "support"
        self.logger = logging.getLogger(f"selena.{self.agent_type}")
        
        # Issue categories
        self.issue_categories = {
            "account": {"priority": "medium", "escalate": False},
            "booking": {"priority": "high", "escalate": False},
            "payment": {"priority": "high", "escalate": True},
            "technical": {"priority": "medium", "escalate": False},
            "general": {"priority": "low", "escalate": False}
        }
    
    async def process_request(self, request: SelenaRequest) -> SelenaResponse:
        """Process support request"""
        start_time = time.time()
        
        try:
            # Classify the issue
            issue_category = self._classify_issue(request.message)
            
            # Check if escalation is needed
            needs_escalation = self._needs_escalation(request, issue_category)
            
            # Generate support response
            response_text = await self._generate_support_response(request, issue_category, needs_escalation)
            
            processing_time = (time.time() - start_time) * 1000
            
            # Generate solutions
            solutions = self._get_solutions(issue_category, request.language)
            
            return SelenaResponse(
                reply=response_text,
                session_id=request.session_id or str(uuid.uuid4()),
                agent_type=self.agent_type,
                language=request.language,
                processing_time_ms=processing_time,
                confidence_score=0.88,
                suggested_actions=solutions,
                agent_specific_data={
                    "issue_category": issue_category,
                    "escalation_needed": needs_escalation,
                    "estimated_resolution_minutes": self.issue_categories[issue_category].get("avg_time", 15)
                }
            )
            
        except Exception as e:
            processing_time = (time.time() - start_time) * 1000
            return await self._handle_error(e, request, processing_time)
    
    def _classify_issue(self, message: str) -> str:
        """Classify support issue"""
        message_lower = message.lower()
        
        keywords = {
            "account": ["login", "password", "profile", "دخول", "كلمة مرور", "حساب"],
            "booking": ["booking", "reservation", "cancel", "حجز", "موعد", "إلغاء"],
            "payment": ["payment", "pay", "refund", "دفع", "بطاقة", "استرداد"],
            "technical": ["error", "bug", "not working", "خطأ", "عطل", "لا يعمل"]
        }
        
        for category, words in keywords.items():
            if any(word in message_lower for word in words):
                return category
        
        return "general"
    
    def _needs_escalation(self, request: SelenaRequest, issue_category: str) -> bool:
        """Determine if issue needs human escalation"""
        
        # Always escalate payment issues
        if issue_category == "payment":
            return True
        
        # Check for urgent keywords
        urgent_keywords = ["urgent", "emergency", "عاجل", "طارئ"]
        if any(keyword in request.message.lower() for keyword in urgent_keywords):
            return True
        
        return False
    
    async def _generate_support_response(self, request: SelenaRequest, issue_category: str, needs_escalation: bool) -> str:
        """Generate support response"""
        
        if needs_escalation:
            responses = {
                "ar": f"أفهم أن هذه مشكلة مهمة. سأقوم بتحويلك إلى أحد متخصصي الدعم البشري للحصول على مساعدة مباشرة. في الوقت نفسه، دعني أقدم لك بعض الخطوات التي قد تساعد. {request.message}",
                "en": f"I understand this is an important issue. I'll transfer you to one of our human support specialists for direct assistance. Meanwhile, let me provide some steps that might help. {request.message}"
            }
        else:
            responses = {
                "ar": f"أهلاً بك! أنا سيلينا من فريق دعم LUDUS. سأساعدك في حل مشكلتك بأسرع وقت ممكن. دعني أفهم المشكلة أولاً. {request.message}",
                "en": f"Welcome! I'm Selena from LUDUS support team. I'll help you resolve your issue as quickly as possible. Let me understand the problem first. {request.message}"
            }
        
        return responses.get(request.language, responses["en"])
    
    def _get_solutions(self, issue_category: str, language: str) -> List[str]:
        """Get solutions for issue category"""
        
        solutions = {
            "ar": {
                "account": ["إعادة تعيين كلمة المرور", "التحقق من البريد الإلكتروني", "مسح ذاكرة المتصفح"],
                "booking": ["مراجعة تفاصيل الحجز", "التواصل مع مقدم الخدمة", "إلغاء وإعادة الحجز"],
                "payment": ["التحقق من البطاقة", "التواصل مع البنك", "جرب طريقة دفع أخرى"],
                "technical": ["إعادة تحميل الصفحة", "تحديث المتصفح", "مسح الكاش"],
                "general": ["تصفح المساعدة", "مشاهدة الفيديوهات التعليمية", "التواصل مع الدعم"]
            },
            "en": {
                "account": ["Reset password", "Check email verification", "Clear browser cache"],
                "booking": ["Review booking details", "Contact service provider", "Cancel and rebook"],
                "payment": ["Check card details", "Contact bank", "Try different payment method"],
                "technical": ["Refresh page", "Update browser", "Clear cache"],
                "general": ["Browse help section", "Watch tutorial videos", "Contact support"]
            }
        }
        
        return solutions.get(language, solutions["en"]).get(issue_category, solutions[language]["general"])
    
    async def _handle_error(self, error: Exception, request: SelenaRequest, processing_time: float) -> SelenaResponse:
        """Handle support errors"""
        
        fallback = {
            "ar": "أعتذر، أواجه صعوبة في نظام الدعم حالياً. سأحولك إلى أحد زملائي من فريق الدعم البشري للمساعدة الفورية.",
            "en": "I apologize, I'm having difficulty with the support system currently. I'll transfer you to one of my colleagues from the human support team for immediate assistance."
        }
        
        return SelenaResponse(
            reply=fallback.get(request.language, fallback["en"]),
            session_id=request.session_id or str(uuid.uuid4()),
            agent_type=self.agent_type,
            language=request.language,
            processing_time_ms=processing_time,
            confidence_score=0.4,
            suggested_actions=["Contact human support", "Call support hotline"],
            agent_specific_data={"escalated": True, "error": True}
        )


class SelenaCommunityAgent:
    """Selena Community Agent - Community building specialist"""
    
    def __init__(self, redis_client=None):
        self.redis_client = redis_client
        self.agent_type = "community"
        self.logger = logging.getLogger(f"selena.{self.agent_type}")
    
    async def process_request(self, request: SelenaRequest) -> SelenaResponse:
        """Process community request"""
        start_time = time.time()
        
        try:
            # Analyze community intent
            community_intent = self._analyze_community_intent(request.message)
            
            # Generate community response
            response_text = await self._generate_community_response(request, community_intent)
            
            # Get community suggestions
            suggestions = self._get_community_suggestions(request, community_intent)
            
            processing_time = (time.time() - start_time) * 1000
            
            return SelenaResponse(
                reply=response_text,
                session_id=request.session_id or str(uuid.uuid4()),
                agent_type=self.agent_type,
                language=request.language,
                processing_time_ms=processing_time,
                confidence_score=0.80,
                suggested_actions=self._get_community_actions(community_intent, request.language),
                agent_specific_data={
                    "community_intent": community_intent,
                    "suggestions": suggestions
                }
            )
            
        except Exception as e:
            processing_time = (time.time() - start_time) * 1000
            return await self._handle_error(e, request, processing_time)
    
    def _analyze_community_intent(self, message: str) -> str:
        """Analyze message for community intent"""
        message_lower = message.lower()
        
        if any(word in message_lower for word in ["friend", "friends", "صديق", "أصدقاء"]):
            return "find_friends"
        elif any(word in message_lower for word in ["group", "groups", "مجموعة", "مجموعات"]):
            return "join_groups"
        elif any(word in message_lower for word in ["event", "events", "فعالية", "فعاليات"]):
            return "find_events"
        elif any(word in message_lower for word in ["organize", "create", "تنظيم", "إنشاء"]):
            return "organize_event"
        else:
            return "general_community"
    
    async def _generate_community_response(self, request: SelenaRequest, intent: str) -> str:
        """Generate community response"""
        
        responses = {
            "ar": {
                "find_friends": f"رائع! سأساعدك في العثور على أصدقاء جدد يشاركونك اهتماماتك في مجتمع LUDUS. {request.message}",
                "join_groups": f"ممتاز! إليك أفضل المجموعات التي تناسب اهتماماتك في مجتمع LUDUS. {request.message}",
                "find_events": f"أهلاً بك! سأجد لك أفضل الفعاليات والأحداث المجتمعية القادمة. {request.message}",
                "organize_event": f"فكرة رائعة! سأساعدك في تنظيم فعالية مجتمعية مميزة. {request.message}",
                "general_community": f"مرحباً بك في مجتمع LUDUS النشط! كيف يمكنني مساعدتك في التواصل والتفاعل؟ {request.message}"
            },
            "en": {
                "find_friends": f"Great! I'll help you find new friends who share your interests in the LUDUS community. {request.message}",
                "join_groups": f"Excellent! Here are the best groups that match your interests in the LUDUS community. {request.message}",
                "find_events": f"Welcome! I'll find you the best upcoming community events and activities. {request.message}",
                "organize_event": f"Great idea! I'll help you organize a distinctive community event. {request.message}",
                "general_community": f"Welcome to the active LUDUS community! How can I help you connect and interact? {request.message}"
            }
        }
        
        return responses.get(request.language, responses["en"]).get(intent, responses[request.language]["general_community"])
    
    def _get_community_suggestions(self, request: SelenaRequest, intent: str) -> List[Dict[str, Any]]:
        """Get community suggestions"""
        
        # Mock community suggestions
        suggestions = [
            {
                "type": "group",
                "name_ar": "مجموعة المشي في الرياض",
                "name_en": "Riyadh Hiking Group",
                "members": 156,
                "activity": "outdoor"
            },
            {
                "type": "event",
                "name_ar": "مهرجان التراث السعودي",
                "name_en": "Saudi Heritage Festival",
                "date": "2025-10-15",
                "location": "Jeddah"
            }
        ]
        
        return suggestions[:2]
    
    def _get_community_actions(self, intent: str, language: str) -> List[str]:
        """Get community actions"""
        
        actions = {
            "ar": {
                "find_friends": ["تصفح الملفات الشخصية", "الانضمام للمحادثات", "حضور الفعاليات"],
                "join_groups": ["طلب الانضمام", "مراسلة المنظم", "حضور اللقاءات"],
                "find_events": ["التسجيل في الفعالية", "دعوة الأصدقاء", "مشاركة الفعالية"],
                "organize_event": ["إنشاء صفحة الفعالية", "دعوة المشاركين", "تحديد التفاصيل"],
                "general_community": ["استكشاف المجتمعات", "الانضمام للنقاشات", "إنشاء مجموعة"]
            },
            "en": {
                "find_friends": ["Browse profiles", "Join conversations", "Attend events"],
                "join_groups": ["Request to join", "Message organizer", "Attend meetups"],
                "find_events": ["Register for event", "Invite friends", "Share event"],
                "organize_event": ["Create event page", "Invite participants", "Set details"],
                "general_community": ["Explore communities", "Join discussions", "Create group"]
            }
        }
        
        return actions.get(language, actions["en"]).get(intent, actions[language]["general_community"])
    
    async def _handle_error(self, error: Exception, request: SelenaRequest, processing_time: float) -> SelenaResponse:
        """Handle community errors"""
        
        fallback = {
            "ar": "أعتذر، أواجه صعوبة في الوصول لبيانات المجتمع حالياً. يمكنك تصفح المجموعات والفعاليات مباشرة من القائمة الرئيسية.",
            "en": "I apologize, I'm having difficulty accessing community data currently. You can browse groups and events directly from the main menu."
        }
        
        return SelenaResponse(
            reply=fallback.get(request.language, fallback["en"]),
            session_id=request.session_id or str(uuid.uuid4()),
            agent_type=self.agent_type,
            language=request.language,
            processing_time_ms=processing_time,
            confidence_score=0.3,
            suggested_actions=["Browse communities manually", "Try again later"]
        )


# ============================================================================
# SELENA AGENT ORCHESTRATOR
# ============================================================================

class SelenaAgentOrchestrator:
    """Orchestrates all 4 Selena AI agents"""
    
    def __init__(self, redis_client=None):
        self.redis_client = redis_client
        self.logger = logging.getLogger("selena.orchestrator")
        
        # Initialize all Selena agents
        self.agents = {
            "onboard": SelenaOnboardAgent(redis_client),
            "discover": SelenaDiscoverAgent(redis_client),
            "support": SelenaSupportAgent(redis_client),
            "community": SelenaCommunityAgent(redis_client)
        }
        
        self.logger.info("🌟 Selena Agent Orchestrator initialized with 4 agents")
    
    async def process_selena_request(self, request: SelenaRequest) -> SelenaResponse:
        """Route request to appropriate Selena agent"""
        
        if request.agent_type not in self.agents:
            raise ValueError(f"Unknown Selena agent type: {request.agent_type}")
        
        agent = self.agents[request.agent_type]
        
        try:
            response = await agent.process_request(request)
            self.logger.info(f"✅ Selena {request.agent_type} processed request successfully")
            return response
            
        except Exception as e:
            self.logger.error(f"❌ Selena {request.agent_type} failed: {e}")
            raise
    
    def get_agent_info(self) -> Dict[str, Dict[str, Any]]:
        """Get information about all Selena agents"""
        
        return {
            "onboard": {
                "id": "onboard",
                "name": "Selena Onboard",
                "name_ar": "سيلينا للإعداد",
                "description": "Guides new users through platform onboarding",
                "description_ar": "توجه المستخدمين الجدد خلال عملية الإعداد",
                "icon": "🌟",
                "color": "#667eea",
                "status": "active"
            },
            "discover": {
                "id": "discover", 
                "name": "Selena Discover",
                "name_ar": "سيلينا للاستكشاف",
                "description": "Helps users discover new activities and experiences",
                "description_ar": "تساعد المستخدمين في اكتشاف أنشطة وتجارب جديدة",
                "icon": "🔍",
                "color": "#4facfe",
                "status": "active"
            },
            "support": {
                "id": "support",
                "name": "Selena Support", 
                "name_ar": "سيلينا للدعم",
                "description": "Provides customer support and assistance",
                "description_ar": "تقدم دعم العملاء والمساعدة",
                "icon": "🎧",
                "color": "#764ba2",
                "status": "active"
            },
            "community": {
                "id": "community",
                "name": "Selena Community",
                "name_ar": "سيلينا للمجتمع", 
                "description": "Facilitates community interactions and connections",
                "description_ar": "تسهل التفاعلات والاتصالات المجتمعية",
                "icon": "👥",
                "color": "#f093fb",
                "status": "active"
            }
        }
    
    async def get_performance_summary(self) -> Dict[str, Any]:
        """Get performance summary for all Selena agents"""
        
        summary = {
            "total_agents": len(self.agents),
            "active_agents": len([a for a in self.agents.values()]),
            "performance_target": "< 200ms response time",
            "concurrency_target": "1000+ concurrent requests",
            "agents_status": {}
        }
        
        for agent_type, agent in self.agents.items():
            summary["agents_status"][agent_type] = {
                "status": "active",
                "requests_processed": getattr(agent, 'request_count', 0),
                "avg_response_time": "< 200ms",  # This would be calculated from actual metrics
                "success_rate": "95%+"  # This would be calculated from actual metrics
            }
        
        return summary