"""
Selena Support Agent for LUDUS Platform
Specializes in customer support, technical assistance, and problem resolution

Capabilities:
- Customer service and general inquiries
- Technical support and troubleshooting
- Booking assistance and management
- Payment support and issue resolution
- Platform feature guidance and help

Created: 2025-09-28 GMT+3 (Riyadh)
Version: 1.0.0
"""

import time
import hashlib
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime
from .base_agent import BaseAgent, AgentRequest, AgentResponse


class SupportIssue(BaseModel):
    """Support issue classification"""
    category: str = Field(..., description="Issue category")
    priority: str = Field(default="medium", description="Issue priority")
    description: str = Field(..., description="Issue description")
    affected_feature: Optional[str] = None
    error_details: Optional[Dict[str, Any]] = None


class SupportRequest(AgentRequest):
    """Specialized request model for support agent"""
    issue_type: str = Field(default="general", description="Type of support issue")
    issue_details: Optional[SupportIssue] = None
    user_id: Optional[str] = None
    booking_id: Optional[str] = None
    payment_id: Optional[str] = None
    device_info: Optional[Dict[str, str]] = None
    urgency_level: str = Field(default="normal", regex="^(low|normal|high|urgent)$")


class SupportSolution(BaseModel):
    """Support solution recommendation"""
    solution_id: str
    title: str
    title_ar: str
    steps: List[str]
    estimated_time_minutes: int
    success_probability: float = Field(ge=0.0, le=1.0)
    requires_human_agent: bool = False


class SupportResponse(AgentResponse):
    """Specialized response model for support agent"""
    issue_classification: Optional[str] = None
    solutions: List[SupportSolution] = Field(default_factory=list)
    escalation_needed: bool = False
    followup_required: bool = False
    estimated_resolution_time: Optional[int] = None  # minutes
    support_ticket_id: Optional[str] = None


class SupportAgent(BaseAgent):
    """
    Selena Support Agent - Specialized in customer support and issue resolution
    """
    
    def __init__(self, redis_client=None, ollama_host="http://localhost:11434", ollama_model="llama3.2"):
        super().__init__(
            agent_type="support",
            redis_client=redis_client,
            ollama_host=ollama_host,
            ollama_model=ollama_model
        )
        
        # Support issue categories
        self.issue_categories = {
            "account": {
                "name_ar": "مشاكل الحساب",
                "name_en": "Account Issues",
                "priority": "medium",
                "avg_resolution_time": 15
            },
            "booking": {
                "name_ar": "مشاكل الحجز",
                "name_en": "Booking Issues", 
                "priority": "high",
                "avg_resolution_time": 10
            },
            "payment": {
                "name_ar": "مشاكل الدفع",
                "name_en": "Payment Issues",
                "priority": "high",
                "avg_resolution_time": 20
            },
            "technical": {
                "name_ar": "مشاكل تقنية",
                "name_en": "Technical Issues",
                "priority": "medium",
                "avg_resolution_time": 25
            },
            "activity": {
                "name_ar": "مشاكل الأنشطة",
                "name_en": "Activity Issues",
                "priority": "medium", 
                "avg_resolution_time": 12
            },
            "general": {
                "name_ar": "استفسارات عامة",
                "name_en": "General Inquiries",
                "priority": "low",
                "avg_resolution_time": 8
            }
        }
        
        # Common solutions database
        self.solution_database = self._load_solution_database()
        
        # Escalation criteria
        self.escalation_keywords = {
            "ar": ["عاجل", "مهم جداً", "طوارئ", "فقدت", "مشكلة كبيرة", "غاضب", "مستاء"],
            "en": ["urgent", "emergency", "critical", "lost", "angry", "frustrated", "serious issue"]
        }
    
    async def process_request(self, request: SupportRequest) -> SupportResponse:
        """Process support request with intelligent issue classification and solution"""
        
        start_time = time.time()
        
        try:
            # Validate request
            if not await self.validate_request(request):
                raise ValueError("Invalid support request")
            
            # Classify the issue
            issue_classification = await self._classify_issue(request)
            
            # Check for escalation needs
            escalation_needed = self._check_escalation_criteria(request)
            
            # Generate cache key
            context_hash = hashlib.md5(str({
                "issue_type": request.issue_type,
                "urgency": request.urgency_level,
                "classification": issue_classification
            }).encode()).hexdigest()[:8]
            cache_key = self._generate_cache_key(request.message, request.language, context_hash)
            
            # For urgent issues, skip cache
            if request.urgency_level not in ["urgent", "high"]:
                cached_response = await self._get_cached_response(cache_key)
                if cached_response:
                    return await self._create_cached_support_response(cached_response, request, start_time)
            
            # Build support-specific prompt
            prompt = self._build_support_prompt(request, issue_classification)
            
            # Get AI response
            ai_response = await self._call_ollama(prompt, temperature=0.5, max_tokens=500)
            
            if not ai_response:
                ai_response = await self._get_template_support_response(request, issue_classification)
            
            # Generate solutions
            solutions = await self._generate_solutions(request, issue_classification)
            
            # Format response
            formatted_response = self._format_response_for_language(ai_response, request.language)
            
            # Cache response (shorter TTL for support responses)
            if request.urgency_level in ["low", "normal"]:
                await self._cache_response(cache_key, formatted_response, ttl=180)  # 3 minutes
            
            processing_time = (time.time() - start_time) * 1000
            confidence = self._calculate_confidence(formatted_response, processing_time)
            
            # Create support ticket if needed
            support_ticket_id = None
            if escalation_needed or request.urgency_level in ["high", "urgent"]:
                support_ticket_id = await self._create_support_ticket(request, issue_classification)
            
            # Update performance stats
            await self._update_performance_stats(processing_time, True)
            
            response = SupportResponse(
                reply=formatted_response,
                confidence_score=confidence,
                processing_time_ms=processing_time,
                agent_type=self.agent_type,
                language=request.language,
                suggested_actions=self._get_support_actions(issue_classification, request.language),
                requires_followup=escalation_needed or len(solutions) == 0,
                issue_classification=issue_classification,
                solutions=solutions,
                escalation_needed=escalation_needed,
                followup_required=request.urgency_level in ["high", "urgent"],
                estimated_resolution_time=self.issue_categories.get(issue_classification, {}).get("avg_resolution_time", 15),
                support_ticket_id=support_ticket_id
            )
            
            # Log successful request
            self._log_request(request, response)
            
            return response
            
        except Exception as e:
            processing_time = (time.time() - start_time) * 1000
            await self._update_performance_stats(processing_time, False)
            
            # Log error
            self._log_request(request, None, str(e))
            
            # Return error response
            return await self._handle_agent_error(e, request)
    
    def get_agent_context(self, language: str) -> str:
        """Get support agent-specific context"""
        
        if language == "ar":
            return """أنت سيلينا، وكيلة الدعم المتخصصة في منصة LUDUS للأنشطة الاجتماعية في المملكة العربية السعودية.

مهمتك الأساسية:
🎧 تقديم دعم فني واستشاري متميز للمستخدمين
🔧 حل المشاكل التقنية والتشغيلية بكفاءة
📞 التعامل مع استفسارات العملاء بطريقة مهنية ومفيدة
💳 مساعدة في قضايا الدفع والحجوزات
🚀 توجيه المستخدمين لاستخدام المنصة بشكل أمثل

خبرتك تشمل:
- حل مشاكل تسجيل الدخول والحسابات
- مساعدة في عمليات الحجز والإلغاء
- دعم قضايا الدفع والاسترداد
- إرشاد في استخدام ميزات المنصة
- حل المشاكل التقنية والأخطاء

أسلوب التفاعل:
- كوني صبورة ومتفهمة
- استمعي بعناية لمشكلة المستخدم
- قدمي حلول عملية وخطوات واضحة
- تأكدي من حل المشكلة قبل إنهاء المحادثة
- وجهي للدعم البشري عند الحاجة"""

        else:  # English
            return """You are Selena, the specialized Support Agent for LUDUS social activities platform in Saudi Arabia.

Your primary mission:
🎧 Provide excellent technical and advisory support to users
🔧 Efficiently resolve technical and operational issues
📞 Handle customer inquiries professionally and helpfully
💳 Assist with payment and booking issues
🚀 Guide users to use the platform optimally

Your expertise includes:
- Resolving login and account issues
- Assisting with booking and cancellation processes
- Supporting payment and refund issues
- Guiding platform feature usage
- Solving technical problems and errors

Interaction style:
- Be patient and understanding
- Listen carefully to user problems
- Provide practical solutions and clear steps
- Ensure problem resolution before ending conversation
- Escalate to human support when needed"""
    
    def _build_support_prompt(self, request: SupportRequest, issue_classification: str) -> str:
        """Build specialized prompt for support scenarios"""
        
        # Base prompt
        base_prompt = self._build_prompt(
            request.message,
            request.language,
            request.conversation_history,
            request.user_context
        )
        
        # Add support-specific context
        category_info = self.issue_categories.get(issue_classification, {})
        
        if request.language == "ar":
            support_context = f"""
تصنيف المشكلة: {category_info.get('name_ar', issue_classification)}
مستوى الأولوية: {request.urgency_level}
الوقت المقدر للحل: {category_info.get('avg_resolution_time', 15)} دقيقة

إرشادات للحل:
- قدمي خطوات واضحة ومفصلة
- تأكدي من فهم المستخدم لكل خطوة
- اطلبي معلومات إضافية إذا احتجت
- قدمي بدائل متعددة عند الإمكان
- وجهي للدعم البشري إذا كانت المشكلة معقدة"""
        else:
            support_context = f"""
Issue classification: {category_info.get('name_en', issue_classification)}
Priority level: {request.urgency_level}
Estimated resolution time: {category_info.get('avg_resolution_time', 15)} minutes

Resolution guidelines:
- Provide clear and detailed steps
- Ensure user understands each step
- Ask for additional information if needed
- Offer multiple alternatives when possible
- Escalate to human support if issue is complex"""
        
        return f"{base_prompt}\n\n{support_context}"
    
    async def _classify_issue(self, request: SupportRequest) -> str:
        """Classify support issue based on message content"""
        
        message_lower = request.message.lower()
        
        # Keyword-based classification
        classification_keywords = {
            "account": ["login", "password", "profile", "register", "sign", "دخول", "كلمة مرور", "حساب", "تسجيل"],
            "booking": ["booking", "reservation", "cancel", "confirm", "حجز", "موعد", "إلغاء", "تأكيد"],
            "payment": ["payment", "pay", "refund", "charge", "card", "دفع", "بطاقة", "استرداد", "رسوم"],
            "technical": ["error", "bug", "crash", "slow", "not working", "خطأ", "عطل", "لا يعمل", "بطيء"],
            "activity": ["activity", "event", "vendor", "نشاط", "فعالية", "مقدم خدمة"]
        }
        
        # Score each category
        category_scores = {}
        for category, keywords in classification_keywords.items():
            score = sum(1 for keyword in keywords if keyword in message_lower)
            if score > 0:
                category_scores[category] = score
        
        # Return highest scoring category or default
        if category_scores:
            return max(category_scores, key=category_scores.get)
        
        return "general"
    
    def _check_escalation_criteria(self, request: SupportRequest) -> bool:
        """Check if issue needs escalation to human agent"""
        
        message_lower = request.message.lower()
        
        # Check for escalation keywords
        escalation_keywords = self.escalation_keywords.get(request.language, self.escalation_keywords["en"])
        if any(keyword in message_lower for keyword in escalation_keywords):
            return True
        
        # Check urgency level
        if request.urgency_level in ["urgent", "high"]:
            return True
        
        # Check for payment-related issues (always escalate)
        if request.issue_type == "payment" or "payment" in message_lower:
            return True
        
        # Check for repeated issues (if conversation history shows multiple attempts)
        if request.conversation_history:
            recent_messages = request.conversation_history[-4:]  # Last 2 exchanges
            support_attempts = len([msg for msg in recent_messages if msg.get("role") == "assistant"])
            if support_attempts >= 2:
                return True
        
        return False
    
    async def _generate_solutions(self, request: SupportRequest, issue_classification: str) -> List[SupportSolution]:
        """Generate solutions based on issue classification"""
        
        solutions = []
        
        # Get relevant solutions from database
        category_solutions = self.solution_database.get(issue_classification, [])
        
        for solution_data in category_solutions:
            # Filter solutions based on request specifics
            if self._is_solution_relevant(solution_data, request):
                solution = SupportSolution(
                    solution_id=solution_data["id"],
                    title=solution_data["title_en"],
                    title_ar=solution_data["title_ar"],
                    steps=solution_data["steps_ar"] if request.language == "ar" else solution_data["steps_en"],
                    estimated_time_minutes=solution_data["time_minutes"],
                    success_probability=solution_data["success_rate"],
                    requires_human_agent=solution_data.get("requires_human", False)
                )
                solutions.append(solution)
        
        # Sort by success probability
        solutions.sort(key=lambda x: x.success_probability, reverse=True)
        
        return solutions[:3]  # Return top 3 solutions
    
    def _is_solution_relevant(self, solution_data: Dict[str, Any], request: SupportRequest) -> bool:
        """Check if solution is relevant to the request"""
        
        # Check solution keywords against request message
        solution_keywords = solution_data.get("keywords", [])
        message_lower = request.message.lower()
        
        return any(keyword in message_lower for keyword in solution_keywords)
    
    async def _create_support_ticket(self, request: SupportRequest, issue_classification: str) -> str:
        """Create support ticket for escalation"""
        
        import uuid
        import json
        
        ticket_id = f"LUDUS-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
        
        ticket_data = {
            "ticket_id": ticket_id,
            "created_at": datetime.utcnow().isoformat(),
            "issue_classification": issue_classification,
            "urgency_level": request.urgency_level,
            "user_message": request.message,
            "language": request.language,
            "user_id": request.user_id,
            "session_id": request.session_id,
            "device_info": request.device_info,
            "status": "open"
        }
        
        # Store ticket in Redis if available
        if self.redis_client:
            try:
                self.redis_client.setex(
                    f"selena:support_ticket:{ticket_id}",
                    86400,  # 24 hours
                    json.dumps(ticket_data)
                )
                self.logger.info(f"🎫 Support ticket created: {ticket_id}")
            except Exception as e:
                self.logger.error(f"❌ Failed to create support ticket: {e}")
        
        return ticket_id
    
    def _get_support_actions(self, issue_classification: str, language: str) -> List[str]:
        """Get suggested actions based on issue type"""
        
        actions_map = {
            "ar": {
                "account": [
                    "إعادة تعيين كلمة المرور",
                    "التحقق من البريد الإلكتروني",
                    "التواصل مع الدعم"
                ],
                "booking": [
                    "مراجعة تفاصيل الحجز",
                    "التواصل مع مقدم الخدمة",
                    "طلب الإلغاء أو التعديل"
                ],
                "payment": [
                    "التحقق من طريقة الدفع",
                    "مراجعة كشف الحساب",
                    "التواصل مع البنك"
                ],
                "technical": [
                    "إعادة تحميل الصفحة",
                    "تحديث التطبيق",
                    "مسح ذاكرة التخزين المؤقت"
                ],
                "general": [
                    "تصفح قسم المساعدة",
                    "مشاهدة الفيديوهات التعليمية",
                    "التواصل مع الدعم"
                ]
            },
            "en": {
                "account": [
                    "Reset password",
                    "Check email verification",
                    "Contact support"
                ],
                "booking": [
                    "Review booking details",
                    "Contact service provider",
                    "Request cancellation or modification"
                ],
                "payment": [
                    "Check payment method",
                    "Review account statement",
                    "Contact bank"
                ],
                "technical": [
                    "Refresh the page",
                    "Update the app",
                    "Clear browser cache"
                ],
                "general": [
                    "Browse help section",
                    "Watch tutorial videos",
                    "Contact support"
                ]
            }
        }
        
        return actions_map.get(language, actions_map["en"]).get(issue_classification, actions_map[language]["general"])
    
    async def _get_template_support_response(self, request: SupportRequest, issue_classification: str) -> str:
        """Get template response for support requests"""
        
        category_info = self.issue_categories.get(issue_classification, {})
        
        templates = {
            "ar": {
                "account": "أفهم أنك تواجه مشكلة في حسابك. دعني أساعدك في حل هذه المشكلة خطوة بخطوة.",
                "booking": "أرى أن لديك استفسار حول الحجز. سأساعدك في مراجعة تفاصيل حجزك وحل أي مشكلة.",
                "payment": "أعلم أن مشاكل الدفع مقلقة. دعني أساعدك في فهم ما حدث وإيجاد الحل المناسب.",
                "technical": "أعتذر عن المشكلة التقنية التي تواجهها. دعني أرشدك خلال خطوات حل هذه المشكلة.",
                "activity": "سأساعدك في حل مشكلة النشاط. دعني أراجع تفاصيل الموقف وأقدم لك الحلول المناسبة.",
                "general": "مرحباً! أنا هنا لمساعدتك. دعني أفهم استفسارك جيداً وأقدم لك أفضل مساعدة ممكنة."
            },
            "en": {
                "account": "I understand you're having an account issue. Let me help you resolve this step by step.",
                "booking": "I see you have a booking inquiry. I'll help you review your booking details and resolve any issues.",
                "payment": "I know payment issues are concerning. Let me help you understand what happened and find the right solution.",
                "technical": "I apologize for the technical issue you're experiencing. Let me guide you through steps to resolve this.",
                "activity": "I'll help you resolve the activity issue. Let me review the situation details and provide appropriate solutions.",
                "general": "Hello! I'm here to help you. Let me understand your inquiry well and provide you with the best possible assistance."
            }
        }
        
        language_templates = templates.get(request.language, templates["en"])
        return language_templates.get(issue_classification, language_templates["general"])
    
    async def _create_cached_support_response(self, cached_response: str, request: SupportRequest, start_time: float) -> SupportResponse:
        """Create support response from cached data"""
        
        processing_time = (time.time() - start_time) * 1000
        issue_classification = await self._classify_issue(request)
        solutions = await self._generate_solutions(request, issue_classification)
        escalation_needed = self._check_escalation_criteria(request)
        
        return SupportResponse(
            reply=cached_response,
            confidence_score=0.8,  # Good confidence for cached responses
            processing_time_ms=processing_time,
            agent_type=self.agent_type,
            language=request.language,
            suggested_actions=self._get_support_actions(issue_classification, request.language),
            requires_followup=escalation_needed,
            issue_classification=issue_classification,
            solutions=solutions,
            escalation_needed=escalation_needed,
            followup_required=request.urgency_level in ["high", "urgent"],
            estimated_resolution_time=self.issue_categories.get(issue_classification, {}).get("avg_resolution_time", 15)
        )
    
    def _load_solution_database(self) -> Dict[str, List[Dict[str, Any]]]:
        """Load database of common solutions"""
        
        return {
            "account": [
                {
                    "id": "password_reset",
                    "title_en": "Reset Password",
                    "title_ar": "إعادة تعيين كلمة المرور",
                    "steps_en": [
                        "Go to login page",
                        "Click 'Forgot Password'",
                        "Enter your email address",
                        "Check your email for reset link",
                        "Click the link and create new password"
                    ],
                    "steps_ar": [
                        "اذهب إلى صفحة تسجيل الدخول",
                        "انقر على 'نسيت كلمة المرور'",
                        "أدخل عنوان بريدك الإلكتروني",
                        "تحقق من بريدك الإلكتروني للحصول على رابط إعادة التعيين",
                        "انقر على الرابط وأنشئ كلمة مرور جديدة"
                    ],
                    "time_minutes": 5,
                    "success_rate": 0.9,
                    "keywords": ["password", "login", "كلمة مرور", "دخول"]
                },
                {
                    "id": "email_verification",
                    "title_en": "Verify Email Address",
                    "title_ar": "تأكيد البريد الإلكتروني",
                    "steps_en": [
                        "Check your email inbox",
                        "Look for verification email from LUDUS",
                        "Click the verification link",
                        "Return to LUDUS and try logging in"
                    ],
                    "steps_ar": [
                        "تحقق من صندوق البريد الإلكتروني",
                        "ابحث عن بريد التأكيد من LUDUS",
                        "انقر على رابط التأكيد",
                        "عد إلى LUDUS وحاول تسجيل الدخول"
                    ],
                    "time_minutes": 3,
                    "success_rate": 0.95,
                    "keywords": ["email", "verification", "verify", "بريد", "تأكيد"]
                }
            ],
            "booking": [
                {
                    "id": "booking_cancellation",
                    "title_en": "Cancel Booking",
                    "title_ar": "إلغاء الحجز",
                    "steps_en": [
                        "Go to 'My Bookings' section",
                        "Find your booking",
                        "Click 'Cancel Booking'",
                        "Confirm cancellation",
                        "Check refund policy"
                    ],
                    "steps_ar": [
                        "اذهب إلى قسم 'حجوزاتي'",
                        "ابحث عن حجزك",
                        "انقر على 'إلغاء الحجز'",
                        "أكد الإلغاء",
                        "تحقق من سياسة الاسترداد"
                    ],
                    "time_minutes": 5,
                    "success_rate": 0.85,
                    "keywords": ["cancel", "cancellation", "إلغاء", "إلغي"]
                },
                {
                    "id": "booking_modification",
                    "title_en": "Modify Booking",
                    "title_ar": "تعديل الحجز",
                    "steps_en": [
                        "Contact the service provider",
                        "Explain your modification request",
                        "Check availability for new time/date",
                        "Confirm changes",
                        "Get updated booking confirmation"
                    ],
                    "steps_ar": [
                        "تواصل مع مقدم الخدمة",
                        "اشرح طلب التعديل",
                        "تحقق من الإتاحة للوقت/التاريخ الجديد",
                        "أكد التغييرات",
                        "احصل على تأكيد حجز محدث"
                    ],
                    "time_minutes": 10,
                    "success_rate": 0.7,
                    "keywords": ["modify", "change", "reschedule", "تعديل", "تغيير"]
                }
            ],
            "payment": [
                {
                    "id": "payment_failed",
                    "title_en": "Payment Failed Resolution",
                    "title_ar": "حل مشكلة فشل الدفع",
                    "steps_en": [
                        "Check your card balance",
                        "Verify card details are correct",
                        "Try a different payment method",
                        "Contact your bank if issues persist",
                        "Contact LUDUS support for assistance"
                    ],
                    "steps_ar": [
                        "تحقق من رصيد بطاقتك",
                        "تأكد من صحة بيانات البطاقة",
                        "جرب طريقة دفع مختلفة",
                        "تواصل مع البنك إذا استمرت المشكلة",
                        "تواصل مع دعم LUDUS للمساعدة"
                    ],
                    "time_minutes": 15,
                    "success_rate": 0.8,
                    "requires_human": True,
                    "keywords": ["payment failed", "declined", "فشل الدفع", "مرفوض"]
                }
            ],
            "technical": [
                {
                    "id": "app_not_loading",
                    "title_en": "App Not Loading",
                    "title_ar": "التطبيق لا يحمل",
                    "steps_en": [
                        "Check your internet connection",
                        "Close and reopen the app",
                        "Clear app cache",
                        "Update to latest version",
                        "Restart your device"
                    ],
                    "steps_ar": [
                        "تحقق من اتصالك بالإنترنت",
                        "أغلق وأعد فتح التطبيق",
                        "امسح ذاكرة التخزين المؤقت",
                        "حدث إلى أحدث إصدار",
                        "أعد تشغيل جهازك"
                    ],
                    "time_minutes": 10,
                    "success_rate": 0.85,
                    "keywords": ["not loading", "loading", "slow", "لا يحمل", "بطيء"]
                }
            ],
            "general": [
                {
                    "id": "how_to_use",
                    "title_en": "Platform Usage Guide",
                    "title_ar": "دليل استخدام المنصة",
                    "steps_en": [
                        "Visit the Help section",
                        "Watch tutorial videos",
                        "Read the user guide",
                        "Try the practice mode",
                        "Contact support if needed"
                    ],
                    "steps_ar": [
                        "زر قسم المساعدة",
                        "شاهد الفيديوهات التعليمية",
                        "اقرأ دليل المستخدم",
                        "جرب وضع التدريب",
                        "تواصل مع الدعم عند الحاجة"
                    ],
                    "time_minutes": 15,
                    "success_rate": 0.9,
                    "keywords": ["how to", "guide", "help", "كيف", "مساعدة", "دليل"]
                }
            ]
        }
        
        return solutions_db