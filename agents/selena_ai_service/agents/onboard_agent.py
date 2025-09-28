"""
Selena Onboard Agent for LUDUS Platform
Specializes in user onboarding, registration guidance, and platform introduction

Capabilities:
- New user registration assistance
- Profile setup guidance  
- Platform feature tutorials
- Initial preference configuration
- Saudi cultural context adaptation

Created: 2025-09-28 GMT+3 (Riyadh)
Version: 1.0.0
"""

import time
import hashlib
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
from .base_agent import BaseAgent, AgentRequest, AgentResponse


class OnboardRequest(AgentRequest):
    """Specialized request model for onboarding agent"""
    onboarding_stage: Optional[str] = Field(default="initial", description="Current onboarding stage")
    user_type: Optional[str] = Field(default="individual", description="Type of user (individual/business)")
    registration_data: Optional[Dict[str, Any]] = None
    completed_steps: Optional[List[str]] = Field(default_factory=list)
    
    
class OnboardResponse(AgentResponse):
    """Specialized response model for onboarding agent"""
    next_steps: List[str] = Field(default_factory=list)
    completion_percentage: float = Field(default=0.0, ge=0.0, le=100.0)
    onboarding_stage: str
    required_actions: Optional[List[Dict[str, Any]]] = None


class OnboardAgent(BaseAgent):
    """
    Selena Onboard Agent - Specialized in user onboarding and platform introduction
    """
    
    def __init__(self, redis_client=None, ollama_host="http://localhost:11434", ollama_model="llama3.2"):
        super().__init__(
            agent_type="onboard",
            redis_client=redis_client,
            ollama_host=ollama_host,
            ollama_model=ollama_model
        )
        
        # Onboarding stages and flow
        self.onboarding_stages = {
            "initial": {
                "name": "Welcome",
                "name_ar": "الترحيب",
                "description": "Initial welcome and platform introduction",
                "completion_weight": 10
            },
            "registration": {
                "name": "Account Setup", 
                "name_ar": "إعداد الحساب",
                "description": "Account creation and verification",
                "completion_weight": 25
            },
            "profile": {
                "name": "Profile Creation",
                "name_ar": "إنشاء الملف الشخصي", 
                "description": "Personal information and preferences",
                "completion_weight": 30
            },
            "preferences": {
                "name": "Preference Setup",
                "name_ar": "إعداد التفضيلات",
                "description": "Activity preferences and interests", 
                "completion_weight": 20
            },
            "tutorial": {
                "name": "Platform Tutorial",
                "name_ar": "دليل المنصة",
                "description": "Feature overview and navigation guide",
                "completion_weight": 10
            },
            "completion": {
                "name": "Onboarding Complete",
                "name_ar": "اكتمال الإعداد",
                "description": "Final setup completion",
                "completion_weight": 5
            }
        }
        
        # Saudi-specific cultural context
        self.cultural_context = {
            "social_norms": [
                "Respect for privacy and family values",
                "Gender-appropriate activity suggestions",
                "Islamic cultural considerations",
                "Saudi national identity appreciation"
            ],
            "popular_activities": [
                "Desert camping", "Historical site visits", "Cultural festivals",
                "Shopping experiences", "Family entertainment", "Sports events",
                "Educational workshops", "Art exhibitions"
            ],
            "local_languages": ["Arabic (primary)", "English (secondary)"]
        }
    
    async def process_request(self, request: OnboardRequest) -> OnboardResponse:
        """Process onboarding request with stage-aware assistance"""
        
        start_time = time.time()
        
        try:
            # Validate request
            if not await self.validate_request(request):
                raise ValueError("Invalid onboarding request")
            
            # Generate cache key
            context_hash = hashlib.md5(str(request.user_context).encode()).hexdigest()[:8]
            cache_key = self._generate_cache_key(request.message, request.language, context_hash)
            
            # Check cache first
            cached_response = await self._get_cached_response(cache_key)
            if cached_response:
                return await self._create_cached_response(cached_response, request, start_time)
            
            # Build onboarding-specific prompt
            prompt = self._build_onboarding_prompt(request)
            
            # Get AI response
            ai_response = await self._call_ollama(prompt, temperature=0.6, max_tokens=400)
            
            if not ai_response:
                # Fallback to template response
                ai_response = await self._get_template_response(request)
            
            # Format response for language
            formatted_response = self._format_response_for_language(ai_response, request.language)
            
            # Calculate completion and next steps
            completion_data = await self._calculate_onboarding_progress(request)
            
            # Cache successful response
            await self._cache_response(cache_key, formatted_response, ttl=600)  # 10 minutes
            
            processing_time = (time.time() - start_time) * 1000
            confidence = self._calculate_confidence(formatted_response, processing_time)
            
            # Update performance stats
            await self._update_performance_stats(processing_time, True)
            
            response = OnboardResponse(
                reply=formatted_response,
                confidence_score=confidence,
                processing_time_ms=processing_time,
                agent_type=self.agent_type,
                language=request.language,
                suggested_actions=completion_data["suggested_actions"],
                requires_followup=completion_data["requires_followup"],
                next_steps=completion_data["next_steps"],
                completion_percentage=completion_data["completion_percentage"],
                onboarding_stage=completion_data["current_stage"],
                required_actions=completion_data.get("required_actions")
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
        """Get onboarding agent-specific context"""
        
        if language == "ar":
            return """أنت سيلينا، وكيلة الإعداد المتخصصة في منصة LUDUS للأنشطة الاجتماعية في المملكة العربية السعودية.

مهمتك الأساسية:
🌟 ترحيب المستخدمين الجدد وتوجيههم خلال عملية التسجيل
📝 مساعدتهم في إكمال ملفهم الشخصي وتحديد تفضيلاتهم
🎯 تعريفهم بميزات المنصة والأنشطة المتاحة
🇸🇦 تقديم المساعدة مع مراعاة الثقافة السعودية والقيم الاجتماعية

أسلوب التفاعل:
- كوني ودودة ومرحبة
- استخدمي لهجة مهذبة ومحترمة
- قدمي خطوات واضحة ومبسطة
- راعي الخصوصية والقيم الثقافية السعودية
- ادعمي المستخدمين في كل خطوة من رحلة الإعداد

تخصصك في مساعدة المستخدمين الجدد ليصبحوا جزءاً نشطاً من مجتمع LUDUS."""

        else:  # English
            return """You are Selena, the specialized Onboarding Agent for LUDUS social activities platform in Saudi Arabia.

Your primary mission:
🌟 Welcome new users and guide them through the registration process
📝 Help them complete their profile and set their preferences  
🎯 Introduce them to platform features and available activities
🇸🇦 Provide assistance while respecting Saudi culture and social values

Interaction style:
- Be friendly and welcoming
- Use polite and respectful tone
- Provide clear and simple steps
- Respect privacy and Saudi cultural values
- Support users through every step of their setup journey

You specialize in helping new users become active members of the LUDUS community."""
    
    def _build_onboarding_prompt(self, request: OnboardRequest) -> str:
        """Build specialized prompt for onboarding scenarios"""
        
        # Base prompt with agent context
        base_prompt = self._build_prompt(
            request.message,
            request.language,
            request.conversation_history,
            request.user_context
        )
        
        # Add onboarding-specific context
        stage_info = self.onboarding_stages.get(request.onboarding_stage, self.onboarding_stages["initial"])
        
        if request.language == "ar":
            stage_context = f"""
مرحلة الإعداد الحالية: {stage_info['name_ar']}
الخطوات المكتملة: {', '.join(request.completed_steps) if request.completed_steps else 'لا توجد'}

إرشادات خاصة:
- ركزي على مساعدة المستخدم في المرحلة الحالية
- قدمي خطوات عملية وواضحة
- اشرحي فوائد كل خطوة
- تأكدي من فهم المستخدم قبل الانتقال للخطوة التالية
"""
        else:
            stage_context = f"""
Current onboarding stage: {stage_info['name']}
Completed steps: {', '.join(request.completed_steps) if request.completed_steps else 'None'}

Special guidelines:
- Focus on helping the user with the current stage
- Provide practical and clear steps
- Explain the benefits of each step
- Ensure user understanding before moving to next step
"""
        
        return f"{base_prompt}\n\n{stage_context}"
    
    async def _get_template_response(self, request: OnboardRequest) -> str:
        """Get template response based on onboarding stage"""
        
        stage = request.onboarding_stage or "initial"
        language = request.language
        
        templates = {
            "ar": {
                "initial": "مرحباً بك في LUDUS! أنا سيلينا، وكيلة الإعداد. سأساعدك في إعداد حسابك والبدء في استكشاف الأنشطة الرائعة في السعودية. ما الذي تود معرفته أولاً؟",
                "registration": "دعني أساعدك في إكمال تسجيل حسابك. سنحتاج إلى بعض المعلومات الأساسية لإنشاء ملفك الشخصي. هل أنت مستعد للبدء؟", 
                "profile": "الآن دعنا نكمل ملفك الشخصي! هذا سيساعدنا في تخصيص تجربتك وتقديم أفضل الأنشطة المناسبة لك.",
                "preferences": "ممتاز! الآن دعنا نحدد اهتماماتك وتفضيلاتك في الأنشطة. ما نوع الأنشطة التي تستمتع بها عادة؟",
                "tutorial": "رائع! دعني أعرفك على ميزات المنصة الرئيسية وكيفية استخدامها للحصول على أفضل تجربة.",
                "completion": "تهانينا! لقد أكملت إعداد حسابك بنجاح. أنت الآن جاهز لاستكشاف عالم الأنشطة المثير في LUDUS!"
            },
            "en": {
                "initial": "Welcome to LUDUS! I'm Selena, your onboarding agent. I'll help you set up your account and start exploring amazing activities in Saudi Arabia. What would you like to know first?",
                "registration": "Let me help you complete your account registration. We'll need some basic information to create your profile. Are you ready to get started?",
                "profile": "Now let's complete your profile! This will help us personalize your experience and recommend the best activities for you.",
                "preferences": "Excellent! Now let's set up your activity interests and preferences. What types of activities do you usually enjoy?",
                "tutorial": "Great! Let me introduce you to the main platform features and how to use them for the best experience.",
                "completion": "Congratulations! You've successfully completed your account setup. You're now ready to explore the exciting world of activities on LUDUS!"
            }
        }
        
        stage_templates = templates.get(language, templates["en"])
        return stage_templates.get(stage, stage_templates["initial"])
    
    async def _calculate_onboarding_progress(self, request: OnboardRequest) -> Dict[str, Any]:
        """Calculate onboarding progress and determine next steps"""
        
        completed_steps = request.completed_steps or []
        current_stage = request.onboarding_stage or "initial"
        
        # Calculate completion percentage
        total_weight = sum(stage["completion_weight"] for stage in self.onboarding_stages.values())
        completed_weight = 0
        
        for step in completed_steps:
            if step in self.onboarding_stages:
                completed_weight += self.onboarding_stages[step]["completion_weight"]
        
        completion_percentage = (completed_weight / total_weight) * 100 if total_weight > 0 else 0
        
        # Determine next steps based on current stage
        stage_order = ["initial", "registration", "profile", "preferences", "tutorial", "completion"]
        current_index = stage_order.index(current_stage) if current_stage in stage_order else 0
        
        next_steps = []
        required_actions = []
        
        if current_stage == "initial":
            next_steps = [
                "Create your account" if request.language == "en" else "إنشاء حسابك",
                "Verify your email" if request.language == "en" else "تأكيد بريدك الإلكتروني"
            ]
            required_actions = [
                {
                    "type": "navigate",
                    "target": "/register",
                    "label": "Start Registration" if request.language == "en" else "بدء التسجيل"
                }
            ]
            
        elif current_stage == "registration":
            next_steps = [
                "Complete profile information" if request.language == "en" else "إكمال معلومات الملف الشخصي",
                "Upload profile picture" if request.language == "en" else "رفع الصورة الشخصية"
            ]
            required_actions = [
                {
                    "type": "navigate", 
                    "target": "/profile/edit",
                    "label": "Complete Profile" if request.language == "en" else "إكمال الملف الشخصي"
                }
            ]
            
        elif current_stage == "profile":
            next_steps = [
                "Set activity preferences" if request.language == "en" else "تحديد تفضيلات الأنشطة",
                "Choose interests" if request.language == "en" else "اختيار الاهتمامات"
            ]
            required_actions = [
                {
                    "type": "navigate",
                    "target": "/preferences",
                    "label": "Set Preferences" if request.language == "en" else "تحديد التفضيلات"
                }
            ]
            
        elif current_stage == "preferences":
            next_steps = [
                "Take platform tutorial" if request.language == "en" else "جولة في المنصة",
                "Explore available features" if request.language == "en" else "استكشاف الميزات المتاحة"
            ]
            required_actions = [
                {
                    "type": "tutorial",
                    "target": "/tutorial/start",
                    "label": "Start Tutorial" if request.language == "en" else "بدء الدليل"
                }
            ]
            
        elif current_stage == "tutorial":
            next_steps = [
                "Browse activities" if request.language == "en" else "تصفح الأنشطة",
                "Start exploring" if request.language == "en" else "بدء الاستكشاف"
            ]
            required_actions = [
                {
                    "type": "navigate",
                    "target": "/activities",
                    "label": "Explore Activities" if request.language == "en" else "استكشاف الأنشطة"
                }
            ]
            
        elif current_stage == "completion":
            next_steps = [
                "Start discovering activities" if request.language == "en" else "بدء اكتشاف الأنشطة",
                "Join community groups" if request.language == "en" else "الانضمام لمجموعات المجتمع"
            ]
            required_actions = [
                {
                    "type": "navigate",
                    "target": "/dashboard",
                    "label": "Go to Dashboard" if request.language == "en" else "الذهاب للوحة التحكم"
                }
            ]
        
        # Determine if followup is needed
        requires_followup = current_stage != "completion" and completion_percentage < 90
        
        # Suggested actions based on stage
        suggested_actions = []
        if current_stage in ["initial", "registration"]:
            suggested_actions = [
                "Get help with registration",
                "Learn about platform benefits", 
                "Contact support if needed"
            ]
        elif current_stage in ["profile", "preferences"]:
            suggested_actions = [
                "Complete profile setup",
                "Set activity preferences",
                "Preview recommended activities"
            ]
        else:
            suggested_actions = [
                "Start exploring activities",
                "Connect with community",
                "Book your first activity"
            ]
        
        return {
            "current_stage": current_stage,
            "completion_percentage": completion_percentage,
            "next_steps": next_steps,
            "required_actions": required_actions,
            "suggested_actions": suggested_actions,
            "requires_followup": requires_followup
        }
    
    async def _create_cached_response(self, cached_response: str, request: OnboardRequest, start_time: float) -> OnboardResponse:
        """Create response from cached data"""
        
        processing_time = (time.time() - start_time) * 1000
        completion_data = await self._calculate_onboarding_progress(request)
        
        return OnboardResponse(
            reply=cached_response,
            confidence_score=0.9,  # High confidence for cached responses
            processing_time_ms=processing_time,
            agent_type=self.agent_type,
            language=request.language,
            suggested_actions=completion_data["suggested_actions"],
            requires_followup=completion_data["requires_followup"],
            next_steps=completion_data["next_steps"],
            completion_percentage=completion_data["completion_percentage"],
            onboarding_stage=completion_data["current_stage"],
            required_actions=completion_data.get("required_actions")
        )
    
    async def get_onboarding_flow(self, language: str = "ar") -> Dict[str, Any]:
        """Get complete onboarding flow information"""
        
        flow_info = {
            "stages": [],
            "total_stages": len(self.onboarding_stages),
            "estimated_time_minutes": 15,
            "cultural_context": self.cultural_context
        }
        
        for stage_id, stage_data in self.onboarding_stages.items():
            stage_info = {
                "id": stage_id,
                "name": stage_data["name_ar"] if language == "ar" else stage_data["name"],
                "description": stage_data["description"],
                "completion_weight": stage_data["completion_weight"],
                "estimated_time_minutes": stage_data["completion_weight"] / 10  # Rough estimate
            }
            flow_info["stages"].append(stage_info)
        
        return flow_info
    
    async def get_cultural_recommendations(self, user_type: str, language: str = "ar") -> List[str]:
        """Get Saudi culture-specific recommendations for onboarding"""
        
        recommendations = {
            "ar": {
                "individual": [
                    "استكشف الأنشطة التراثية السعودية",
                    "انضم للأنشطة العائلية المناسبة",
                    "جرب الأنشطة الرياضية والثقافية",
                    "شارك في الفعاليات المجتمعية المحلية"
                ],
                "business": [
                    "اكتشف فرص الشراكات التجارية",
                    "شارك في معارض الأعمال والمؤتمرات",
                    "انضم لشبكات رجال الأعمال",
                    "استكشف الأنشطة الترويجية للشركات"
                ]
            },
            "en": {
                "individual": [
                    "Explore Saudi heritage activities",
                    "Join family-appropriate activities",
                    "Try sports and cultural activities", 
                    "Participate in local community events"
                ],
                "business": [
                    "Discover business partnership opportunities",
                    "Participate in business exhibitions and conferences",
                    "Join business networking groups",
                    "Explore corporate promotional activities"
                ]
            }
        }
        
        return recommendations.get(language, {}).get(user_type, recommendations["en"]["individual"])
    
    async def _agent_specific_validation(self, request: AgentRequest) -> bool:
        """Validate onboarding-specific requirements"""
        
        # Check if onboarding request has required fields
        if isinstance(request, OnboardRequest):
            # Validate onboarding stage
            if request.onboarding_stage and request.onboarding_stage not in self.onboarding_stages:
                return False
            
            # Validate user type
            if request.user_type and request.user_type not in ["individual", "business", "family"]:
                return False
        
        return True