"""
LUDUS Selena-Onboard Agent - Specialized AI agent for user onboarding assistance

This agent provides comprehensive onboarding support including:
- Registration guidance
- Profile setup assistance
- Platform orientation
- Cultural adaptation for Saudi users
- Arabic/English bilingual support
"""

import json
import uuid
import re
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union
from pydantic import BaseModel, Field
from enum import Enum


class OnboardingStep(str, Enum):
    """Enum for onboarding steps"""
    WELCOME = "welcome"
    SOCIAL_PROOF = "socialProof"
    AUTH = "auth"
    PROFILE = "profile"
    REFERRAL = "referral"
    INTERESTS = "interests"
    PREFERENCES = "preferences"


class OnboardingSessionStatus(str, Enum):
    """Enum for onboarding session status"""
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    ABANDONED = "abandoned"


class OnboardingRequest(BaseModel):
    """Model for onboarding assistance requests"""
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    message: str
    current_step: Optional[OnboardingStep] = None
    language: str = "ar"
    user_context: Optional[Dict[str, Any]] = None


class OnboardingResponse(BaseModel):
    """Model for onboarding agent responses"""
    message: str
    suggestions: List[str] = Field(default_factory=list)
    next_actions: List[str] = Field(default_factory=list)
    step_guidance: Optional[Dict[str, Any]] = None
    cultural_tips: Optional[str] = None
    session_id: str
    requires_action: bool = False


class OnboardingSession(BaseModel):
    """Model for onboarding session data"""
    session_id: str
    user_id: Optional[str] = None
    status: OnboardingSessionStatus = OnboardingSessionStatus.ACTIVE
    current_step: Optional[OnboardingStep] = None
    completed_steps: List[OnboardingStep] = Field(default_factory=list)
    preferences: Dict[str, Any] = Field(default_factory=dict)
    cultural_context: str = "saudi_arabia"
    language_preference: str = "ar"
    conversation_history: List[Dict[str, str]] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    progress_percentage: float = 0.0


class SelenaOnboardAgent:
    """Selena - LUDUS Onboarding AI Agent
    
    Specialized agent for guiding new users through the onboarding process
    with cultural sensitivity and bilingual support.
    """
    
    def __init__(self, redis_client=None):
        self.redis_client = redis_client
        self.agent_name = "Selena"
        self.session_timeout = 60 * 60 * 24  # 24 hours
        
        # Saudi cultural context and gaming preferences
        self.cultural_contexts = {
            "gaming_preferences": {
                "ar": [
                    "ألعاب الفيديو شائعة جداً في السعودية",
                    "أنشطة جماعية مفضلة في الثقافة السعودية",
                    "الرياضات الإلكترونية تنمو بسرعة",
                    "أنشطة عائلية مهمة في المجتمع السعودي"
                ],
                "en": [
                    "Video gaming is very popular in Saudi Arabia",
                    "Group activities are preferred in Saudi culture",
                    "Esports is growing rapidly",
                    "Family activities are important in Saudi society"
                ]
            },
            "social_norms": {
                "ar": [
                    "احترام خصوصية الآخرين أمر مهم",
                    "التفاعل الاجتماعي المحترم مرحب به",
                    "المشاركة العائلية تُشجع",
                    "التوازن بين العمل والترفيه مهم"
                ],
                "en": [
                    "Respecting others' privacy is important",
                    "Respectful social interaction is welcome",
                    "Family participation is encouraged",
                    "Work-life balance is important"
                ]
            }
        }
        
        # Registration guidance templates
        self.registration_guidance = {
            "ar": {
                "field_validation": {
                    "email": "تأكد من إدخال بريد إلكتروني صحيح مثل example@gmail.com",
                    "password": "كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل",
                    "phone": "أدخل رقم هاتف سعودي صحيح يبدأ بـ +966",
                    "name": "الاسم الأول واسم العائلة مطلوبان"
                },
                "security_tips": [
                    "استخدم كلمة مرور قوية وفريدة",
                    "تأكد من صحة بريدك الإلكتروني للحصول على التحديثات",
                    "احتفظ بمعلومات حسابك آمنة",
                    "فعّل المصادقة الثنائية إذا كانت متاحة"
                ],
                "step_explanations": {
                    "welcome": "مرحباً! سأكون مرشدك في رحلة الانضمام إلى لودوس",
                    "auth": "دعني أساعدك في إنشاء حساب آمن",
                    "profile": "الآن لنقوم بإعداد ملفك الشخصي ليتمكن الآخرون من التعرف عليك",
                    "interests": "اختر اهتماماتك حتى نتمكن من اقتراح أنشطة مناسبة لك",
                    "preferences": "دعنا نخصص تجربتك حسب تفضيلاتك"
                }
            },
            "en": {
                "field_validation": {
                    "email": "Make sure to enter a valid email like example@gmail.com",
                    "password": "Password should be at least 8 characters long",
                    "phone": "Enter a valid Saudi phone number starting with +966",
                    "name": "First name and last name are required"
                },
                "security_tips": [
                    "Use a strong and unique password",
                    "Verify your email address to receive updates",
                    "Keep your account information secure",
                    "Enable two-factor authentication if available"
                ],
                "step_explanations": {
                    "welcome": "Welcome! I'll be your guide through joining LUDUS",
                    "auth": "Let me help you create a secure account",
                    "profile": "Now let's set up your profile so others can get to know you",
                    "interests": "Choose your interests so we can suggest suitable activities",
                    "preferences": "Let's customize your experience based on your preferences"
                }
            }
        }
        
        # Platform features explanation
        self.platform_features = {
            "ar": {
                "discovery": "اكتشف أنشطة متنوعة في مدينتك",
                "booking": "احجز بسهولة وأمان",
                "community": "تواصل مع أشخاص متشابهين في التفكير",
                "safety": "أنشطة آمنة ومتحققة",
                "payment": "دفع آمن مع ضمان استرداد الأموال",
                "support": "دعم فني متاح 24/7"
            },
            "en": {
                "discovery": "Discover diverse activities in your city",
                "booking": "Book easily and securely",
                "community": "Connect with like-minded people",
                "safety": "Safe and verified activities",
                "payment": "Secure payment with money-back guarantee",
                "support": "24/7 technical support available"
            }
        }

    def _get_session_key(self, session_id: str) -> str:
        """Get Redis key for onboarding session data"""
        return f"agents:onboard_session:{session_id}"

    def _save_session(self, session: OnboardingSession) -> None:
        """Save onboarding session to Redis"""
        if self.redis_client:
            try:
                session.updated_at = datetime.now()
                self.redis_client.setex(
                    self._get_session_key(session.session_id),
                    self.session_timeout,
                    session.json()
                )
            except Exception as e:
                print(f"Error saving onboarding session: {e}")

    def _load_session(self, session_id: str) -> Optional[OnboardingSession]:
        """Load onboarding session from Redis"""
        if not self.redis_client:
            return None
        
        try:
            data = self.redis_client.get(self._get_session_key(session_id))
            if data:
                return OnboardingSession.parse_raw(data)
        except Exception as e:
            print(f"Error loading onboarding session: {e}")
        return None

    def start_onboarding_session(self, user_id: Optional[str] = None, language: str = "ar") -> OnboardingSession:
        """Start a new onboarding session"""
        session_id = str(uuid.uuid4())
        session = OnboardingSession(
            session_id=session_id,
            user_id=user_id,
            language_preference=language,
            current_step=OnboardingStep.WELCOME
        )
        
        # Initial welcome message
        welcome_message = self._get_welcome_message(language)
        session.conversation_history.append({
            "role": "assistant",
            "content": welcome_message,
            "timestamp": datetime.now().isoformat(),
            "step": OnboardingStep.WELCOME.value
        })
        
        self._save_session(session)
        return session

    def _get_welcome_message(self, language: str = "ar") -> str:
        """Get personalized welcome message"""
        if language == "ar":
            return """مرحباً! أنا سيلينا، مساعدتك الشخصية في لودوس 🌟

أهلاً وسهلاً بك في رحلة اكتشاف أنشطة رائعة ومجتمعات متشابهة في التفكير!

سأكون معك خطوة بخطوة لمساعدتك في:
✨ إنشاء حساب آمن
👤 إعداد ملف شخصي مميز
🎯 اختيار اهتماماتك
🎮 اكتشاف الأنشطة المناسبة لك
🤝 التواصل مع مجتمع لودوس

هل أنت مستعد للبدء؟ أو لديك أي أسئلة عن المنصة؟"""
        else:
            return """Hello! I'm Selena, your personal assistant on LUDUS 🌟

Welcome to your journey of discovering amazing activities and like-minded communities!

I'll be with you step by step to help you with:
✨ Creating a secure account
👤 Setting up an awesome profile  
🎯 Choosing your interests
🎮 Discovering activities perfect for you
🤝 Connecting with the LUDUS community

Are you ready to get started? Or do you have any questions about the platform?"""

    def _analyze_user_intent(self, message: str, language: str = "ar") -> Dict[str, Any]:
        """Analyze user intent from their message"""
        message_lower = message.lower()
        
        # Define keyword patterns for different intents
        intents = {
            "registration_help": {
                "ar": ["تسجيل", "حساب", "انضمام", "سجل", "أنشئ"],
                "en": ["register", "account", "sign up", "create", "join"]
            },
            "profile_setup": {
                "ar": ["ملف", "شخصي", "صورة", "بيانات", "معلومات"],
                "en": ["profile", "picture", "photo", "info", "details"]
            },
            "feature_explanation": {
                "ar": ["كيف", "ماذا", "شرح", "فهم", "تعلم", "ميزة"],
                "en": ["how", "what", "explain", "understand", "learn", "feature"]
            },
            "technical_support": {
                "ar": ["مشكلة", "خطأ", "لا يعمل", "مساعدة", "دعم"],
                "en": ["problem", "error", "not working", "help", "support"]
            },
            "cultural_guidance": {
                "ar": ["ثقافة", "محلي", "سعودي", "عادات", "تقاليد"],
                "en": ["culture", "local", "saudi", "customs", "traditions"]
            },
            "next_step": {
                "ar": ["التالي", "استمر", "أكمل", "بعدها", "أين"],
                "en": ["next", "continue", "proceed", "then", "where"]
            }
        }
        
        detected_intents = []
        confidence_scores = {}
        
        for intent, keywords in intents.items():
            lang_keywords = keywords.get(language, keywords.get("en", []))
            matches = sum(1 for keyword in lang_keywords if keyword in message_lower)
            if matches > 0:
                detected_intents.append(intent)
                confidence_scores[intent] = matches / len(lang_keywords)
        
        # Get primary intent (highest confidence)
        primary_intent = max(confidence_scores.keys(), key=lambda k: confidence_scores[k]) if confidence_scores else "general_inquiry"
        
        return {
            "primary_intent": primary_intent,
            "all_intents": detected_intents,
            "confidence_scores": confidence_scores,
            "message_language": language
        }

    def _get_step_guidance(self, step: OnboardingStep, language: str = "ar") -> Dict[str, Any]:
        """Get detailed guidance for a specific onboarding step"""
        guidance = {
            OnboardingStep.WELCOME: {
                "ar": {
                    "title": "مرحباً بك في لودوس!",
                    "description": "دعني أرشدك خلال الخطوات البسيطة للانضمام",
                    "key_points": [
                        "عملية بسيطة تستغرق أقل من 5 دقائق",
                        "معلوماتك آمنة ومحمية",
                        "يمكنك التخطي والعودة لاحقاً"
                    ],
                    "next_action": "ابدأ بإنشاء حساب آمن"
                },
                "en": {
                    "title": "Welcome to LUDUS!",
                    "description": "Let me guide you through the simple steps to join",
                    "key_points": [
                        "Simple process takes less than 5 minutes",
                        "Your information is safe and protected",
                        "You can skip and come back later"
                    ],
                    "next_action": "Start by creating a secure account"
                }
            },
            OnboardingStep.AUTH: {
                "ar": {
                    "title": "إنشاء حساب آمن",
                    "description": "اختر طريقة التسجيل المناسبة لك",
                    "key_points": [
                        "يمكنك استخدام حساب جوجل للسرعة",
                        "أو إنشاء حساب جديد بالبريد الإلكتروني",
                        "كلمة المرور يجب أن تكون قوية",
                        "سنرسل رمز تحقق لتأكيد هويتك"
                    ],
                    "next_action": "اختر طريقة التسجيل وأكمل البيانات"
                },
                "en": {
                    "title": "Create Secure Account",
                    "description": "Choose the registration method that suits you",
                    "key_points": [
                        "You can use Google account for speed",
                        "Or create a new account with email",
                        "Password should be strong",
                        "We'll send verification code to confirm identity"
                    ],
                    "next_action": "Choose registration method and complete details"
                }
            },
            OnboardingStep.PROFILE: {
                "ar": {
                    "title": "إعداد الملف الشخصي",
                    "description": "ساعد المجتمع على التعرف عليك",
                    "key_points": [
                        "أضف صورة شخصية مناسبة",
                        "اكتب نبذة قصيرة عن اهتماماتك",
                        "شارك معلومات الاتصال إذا أردت",
                        "يمكنك التحكم في خصوصية ملفك"
                    ],
                    "next_action": "أكمل معلومات ملفك الشخصي"
                },
                "en": {
                    "title": "Profile Setup",
                    "description": "Help the community get to know you",
                    "key_points": [
                        "Add an appropriate profile picture",
                        "Write a brief bio about your interests",
                        "Share contact info if you want",
                        "You can control your profile privacy"
                    ],
                    "next_action": "Complete your profile information"
                }
            },
            OnboardingStep.INTERESTS: {
                "ar": {
                    "title": "اختيار الاهتمامات",
                    "description": "حدد ما تحب لنعرض لك الأنشطة المناسبة",
                    "key_points": [
                        "اختر 3-8 فئات تهمك",
                        "يمكنك تغيير اختياراتك لاحقاً",
                        "هذا يساعدنا في اقتراح أنشطة مناسبة",
                        "ستجد أنشطة متنوعة في كل فئة"
                    ],
                    "next_action": "اختر الفئات التي تثير اهتمامك"
                },
                "en": {
                    "title": "Interest Selection",
                    "description": "Choose what you love so we can show you suitable activities",
                    "key_points": [
                        "Select 3-8 categories that interest you",
                        "You can change your choices later",
                        "This helps us suggest suitable activities",
                        "You'll find diverse activities in each category"
                    ],
                    "next_action": "Choose the categories that interest you"
                }
            },
            OnboardingStep.PREFERENCES: {
                "ar": {
                    "title": "تخصيص التجربة",
                    "description": "عدّل إعدادات المنصة حسب تفضيلاتك",
                    "key_points": [
                        "اختر اللغة المفضلة",
                        "حدد إعدادات الخصوصية",
                        "عدّل تفضيلات الإشعارات",
                        "اختر المظهر المناسب لك"
                    ],
                    "next_action": "اضبط الإعدادات حسب تفضيلاتك"
                },
                "en": {
                    "title": "Experience Customization",
                    "description": "Adjust platform settings according to your preferences",
                    "key_points": [
                        "Choose your preferred language",
                        "Set privacy preferences",
                        "Adjust notification settings",
                        "Choose the theme that suits you"
                    ],
                    "next_action": "Adjust settings according to your preferences"
                }
            }
        }

    def _generate_contextual_response(self, request: OnboardingRequest, session: OnboardingSession) -> str:
        """Generate contextual response based on user message and current step"""
        intent_analysis = self._analyze_user_intent(request.message, request.language)
        primary_intent = intent_analysis["primary_intent"]
        current_step = session.current_step or OnboardingStep.WELCOME
        
        language = request.language
        guidance = self.registration_guidance.get(language, self.registration_guidance["ar"])
        
        # Handle different intents
        if primary_intent == "registration_help":
            return self._get_registration_help(current_step, language)
        elif primary_intent == "profile_setup":
            return self._get_profile_help(language)
        elif primary_intent == "feature_explanation":
            return self._get_feature_explanation(request.message, language)
        elif primary_intent == "technical_support":
            return self._get_technical_support(request.message, language)
        elif primary_intent == "cultural_guidance":
            return self._get_cultural_guidance(language)
        elif primary_intent == "next_step":
            return self._get_next_step_guidance(current_step, language)
        else:
            return self._get_general_guidance(current_step, request.message, language)

    def _get_registration_help(self, current_step: OnboardingStep, language: str = "ar") -> str:
        """Provide registration assistance"""
        if language == "ar":
            if current_step == OnboardingStep.WELCOME:
                return """بدايةً رائعة! دعني أرشدك خلال إنشاء حساب في لودوس:

🔐 **الطرق المتاحة:**
• حساب جوجل (الأسرع والأكثر أماناً)
• بريد إلكتروني جديد

📝 **المعلومات المطلوبة:**
• اسمك الأول واسم العائلة
• بريد إلكتروني صحيح
• كلمة مرور قوية (8 أحرف على الأقل)
• رقم هاتف سعودي (اختياري)

💡 **نصيحة:** استخدم حساب جوجل إذا كان لديك واحد - سيوفر عليك الوقت!

هل تريد المتابعة مع جوجل أم البريد الإلكتروني؟"""
            else:
                return """أرى أنك في مرحلة أخرى من التسجيل. كيف يمكنني مساعدتك؟

يمكنني المساعدة في:
• شرح أي حقل في النموذج
• إعطاء نصائح للأمان
• حل مشاكل التحقق
• الإجابة على أي استفسار"""
        else:
            if current_step == OnboardingStep.WELCOME:
                return """Great start! Let me guide you through creating your LUDUS account:

🔐 **Available Methods:**
• Google account (fastest and most secure)
• New email account

📝 **Required Information:**
• Your first and last name
• Valid email address
• Strong password (at least 8 characters)
• Saudi phone number (optional)

💡 **Tip:** Use Google account if you have one - it'll save you time!

Would you like to continue with Google or email?"""
            else:
                return """I see you're in another registration stage. How can I help?

I can assist with:
• Explaining any form field
• Providing security tips
• Solving verification issues
• Answering any questions"""

    def _get_profile_help(self, language: str = "ar") -> str:
        """Provide profile setup assistance"""
        if language == "ar":
            return """ممتاز! دعني أساعدك في إعداد ملف شخصي رائع:

👤 **الصورة الشخصية:**
• اختر صورة واضحة ومناسبة
• الصور الحقيقية تزيد الثقة بنسبة 90%
• يمكنك تغييرها لاحقاً

✍️ **النبذة الشخصية:**
• اكتب 2-3 جمل عن اهتماماتك
• مثال: "أحب الرياضة والطبخ والرحلات"
• شارك ما يجعلك متميزاً

📱 **معلومات الاتصال:**
• رقم الهاتف للتواصل السريع
• حسابات التواصل الاجتماعي (اختياري)
• يمكنك التحكم في من يراها

🔒 **الخصوصية في الثقافة السعودية:**
• احترم خصوصية الآخرين
• شارك ما تشعر بالراحة معه فقط
• يمكنك تعديل إعدادات الخصوصية في أي وقت

هل تحتاج مساعدة في أي جزء محدد؟"""
        else:
            return """Excellent! Let me help you set up an amazing profile:

👤 **Profile Picture:**
• Choose a clear and appropriate photo
• Real photos increase trust by 90%
• You can change it later

✍️ **Bio:**
• Write 2-3 sentences about your interests
• Example: "I love sports, cooking, and travel"
• Share what makes you unique

📱 **Contact Information:**
• Phone number for quick communication
• Social media accounts (optional)
• You can control who sees them

🔒 **Privacy in Saudi Culture:**
• Respect others' privacy
• Share only what you're comfortable with
• You can adjust privacy settings anytime

Do you need help with any specific part?"""

    def _get_feature_explanation(self, message: str, language: str = "ar") -> str:
        """Explain platform features based on user question"""
        message_lower = message.lower()
        
        # Detect what feature they're asking about
        if any(word in message_lower for word in ["بحث", "search", "اكتشف", "discover"]):
            return self._explain_discovery_features(language)
        elif any(word in message_lower for word in ["حجز", "book", "دفع", "payment"]):
            return self._explain_booking_features(language)
        elif any(word in message_lower for word in ["مجتمع", "community", "تواصل", "connect"]):
            return self._explain_community_features(language)
        else:
            return self._explain_general_features(language)

    def _explain_discovery_features(self, language: str = "ar") -> str:
        """Explain activity discovery features"""
        if language == "ar":
            return """🔍 **ميزات الاكتشاف في لودوس:**

🎯 **بحث ذكي:**
• البحث بالاهتمامات أو الموقع
• مرشحات متقدمة (السعر، التاريخ، النوع)
• اقتراحات شخصية بناءً على ملفك

🗺️ **الخريطة التفاعلية:**
• عرض الأنشطة القريبة منك
• تفاصيل المسافة ووقت الوصول
• معلومات المرور المباشرة

📊 **التوصيات الذكية:**
• خوارزمية تتعلم من تفضيلاتك
• أنشطة مقترحة بناءً على تقييماتك
• اكتشاف أنشطة جديدة كل أسبوع

🏷️ **الفئات المتنوعة:**
• الرياضة واللياقة البدنية
• الطعام والمطاعم
• الفنون والثقافة
• التعلم وورش العمل
• المغامرات الخارجية

هل تريد معرفة المزيد عن أي ميزة؟"""
        else:
            return """🔍 **LUDUS Discovery Features:**

🎯 **Smart Search:**
• Search by interests or location
• Advanced filters (price, date, type)
• Personalized suggestions based on your profile

🗺️ **Interactive Map:**
• View nearby activities
• Distance and travel time details
• Live traffic information

📊 **Smart Recommendations:**
• Algorithm learns from your preferences
• Suggested activities based on your ratings
• Discover new activities weekly

🏷️ **Diverse Categories:**
• Sports and Fitness
• Food and Dining
• Arts and Culture
• Learning and Workshops
• Outdoor Adventures

Would you like to know more about any specific feature?"""

    def _explain_booking_features(self, language: str = "ar") -> str:
        """Explain booking and payment features"""
        if language == "ar":
            return """💳 **نظام الحجز والدفع في لودوس:**

⚡ **حجز فوري:**
• تأكيد الحجز خلال ثواني
• اختيار التاريخ والوقت المناسب
• معاينة التفاصيل قبل التأكيد

💰 **دفع آمن:**
• مدعوم من منصات دفع موثوقة
• قبول جميع البطاقات السعودية
• حماية معلوماتك المالية

🔄 **مرونة الإلغاء:**
• إلغاء مجاني حتى 24 ساعة قبل النشاط
• استرداد فوري للمبلغ
• سياسة استرداد واضحة

📱 **إدارة الحجوزات:**
• عرض جميع حجوزاتك في مكان واحد
• تذكيرات تلقائية
• تفاصيل الموقع ومعلومات التواصل

🛡️ **ضمان الجودة:**
• ضمان استرداد الأموال
• تقييمات حقيقية من المستخدمين
• دعم فني متاح 24/7

أي جزء تريد معرفة المزيد عنه؟"""
        else:
            return """💳 **LUDUS Booking & Payment System:**

⚡ **Instant Booking:**
• Booking confirmation within seconds
• Choose suitable date and time
• Preview details before confirmation

💰 **Secure Payment:**
• Supported by trusted payment platforms
• Accept all Saudi cards
• Protect your financial information

🔄 **Flexible Cancellation:**
• Free cancellation up to 24 hours before activity
• Instant refund
• Clear refund policy

📱 **Booking Management:**
• View all your bookings in one place
• Automatic reminders
• Location details and contact information

🛡️ **Quality Guarantee:**
• Money-back guarantee
• Real user reviews
• 24/7 technical support

Which part would you like to know more about?"""

    def _get_cultural_guidance(self, language: str = "ar") -> str:
        """Provide cultural context and guidance for Saudi users"""
        if language == "ar":
            return """🇸🇦 **السياق الثقافي السعودي في لودوس:**

🎮 **ثقافة الألعاب:**
• الألعاب جزء مهم من الترفيه السعودي
• الرياضات الإلكترونية تنمو بسرعة
• الأنشطة الجماعية مفضلة ثقافياً
• التوازن بين الترفيه والمسؤوليات

👥 **التفاعل الاجتماعي:**
• احترام الخصوصية الشخصية
• التواصل المحترم والإيجابي
• بناء صداقات حقيقية
• المشاركة العائلية مُشجعة

🏙️ **الأنشطة المحلية:**
• أنشطة تناسب الطقس السعودي
• مراعاة الأوقات والمواسم
• خيارات داخلية وخارجية
• أنشطة تتماشى مع القيم المحلية

⏰ **إدارة الوقت:**
• مراعاة أوقات الصلاة
• مرونة في التوقيتات
• التخطيط المسبق للأنشطة
• احترام التزامات العمل والعائلة

🎯 **نصائح للنجاح:**
• كن منفتحاً لتجربة أنشطة جديدة
• تفاعل بإيجابية مع المجتمع
• شارك تجاربك وآرائك
• استفد من التنوع الثقافي

هل لديك أسئلة محددة عن الثقافة المحلية؟"""
        else:
            return """🇸🇦 **Saudi Cultural Context in LUDUS:**

🎮 **Gaming Culture:**
• Gaming is an important part of Saudi entertainment
• Esports is growing rapidly
• Group activities are culturally preferred
• Balance between entertainment and responsibilities

👥 **Social Interaction:**
• Respect personal privacy
• Respectful and positive communication
• Building genuine friendships
• Family participation is encouraged

🏙️ **Local Activities:**
• Activities suitable for Saudi weather
• Consideration of times and seasons
• Indoor and outdoor options
• Activities aligned with local values

⏰ **Time Management:**
• Consideration of prayer times
• Flexibility in scheduling
• Advance planning for activities
• Respect for work and family commitments

🎯 **Tips for Success:**
• Be open to trying new activities
• Interact positively with the community
• Share your experiences and opinions
• Benefit from cultural diversity

Do you have specific questions about local culture?"""

    def process_onboarding_inquiry(self, request: OnboardingRequest) -> OnboardingResponse:
        """Main method to process onboarding inquiries"""
        
        # Load or create session
        session = None
        if request.session_id:
            session = self._load_session(request.session_id)
        
        if not session:
            session = self.start_onboarding_session(request.user_id, request.language)
        
        # Add user message to conversation history
        session.conversation_history.append({
            "role": "user",
            "content": request.message,
            "timestamp": datetime.now().isoformat(),
            "step": session.current_step.value if session.current_step else None
        })
        
        # Generate response
        response_message = self._generate_contextual_response(request, session)
        
        # Get step guidance if applicable
        step_guidance = None
        if session.current_step:
            step_guidance = self._get_step_guidance(session.current_step, request.language)
        
        # Generate suggestions and next actions
        suggestions = self._generate_suggestions(session, request.language)
        next_actions = self._generate_next_actions(session, request.language)
        
        # Get cultural tips if relevant
        cultural_tips = self._get_cultural_tips(request.message, request.language)
        
        # Add assistant message to conversation history
        session.conversation_history.append({
            "role": "assistant",
            "content": response_message,
            "timestamp": datetime.now().isoformat(),
            "step": session.current_step.value if session.current_step else None
        })
        
        # Update progress
        session.progress_percentage = self._calculate_progress(session)
        
        # Save updated session
        self._save_session(session)
        
        return OnboardingResponse(
            message=response_message,
            suggestions=suggestions,
            next_actions=next_actions,
            step_guidance=step_guidance.get(request.language, step_guidance.get("ar")) if step_guidance else None,
            cultural_tips=cultural_tips,
            session_id=session.session_id,
            requires_action=self._requires_user_action(session)
        )

    def _generate_suggestions(self, session: OnboardingSession, language: str = "ar") -> List[str]:
        """Generate helpful suggestions for the user"""
        if language == "ar":
            suggestions = [
                "أخبرني إذا كنت تواجه أي صعوبة",
                "يمكنك دائماً تخطي الخطوات الاختيارية",
                "اسأل عن أي ميزة لا تفهمها"
            ]
            
            if session.current_step == OnboardingStep.AUTH:
                suggestions.extend([
                    "استخدم حساب جوجل للتسجيل السريع",
                    "اختر كلمة مرور قوية ولا تنساها"
                ])
            elif session.current_step == OnboardingStep.PROFILE:
                suggestions.extend([
                    "أضف صورة شخصية لزيادة الثقة",
                    "اكتب نبذة مختصرة عن اهتماماتك"
                ])
        else:
            suggestions = [
                "Let me know if you're facing any difficulty",
                "You can always skip optional steps",
                "Ask about any feature you don't understand"
            ]
            
            if session.current_step == OnboardingStep.AUTH:
                suggestions.extend([
                    "Use Google account for quick registration",
                    "Choose a strong password and don't forget it"
                ])
            elif session.current_step == OnboardingStep.PROFILE:
                suggestions.extend([
                    "Add a profile picture to increase trust",
                    "Write a brief bio about your interests"
                ])
        
        return suggestions

    def _generate_next_actions(self, session: OnboardingSession, language: str = "ar") -> List[str]:
        """Generate recommended next actions"""
        actions = []
        
        if not session.current_step:
            action = "ابدأ عملية التسجيل" if language == "ar" else "Start the registration process"
            actions.append(action)
        elif session.current_step == OnboardingStep.WELCOME:
            action = "انتقل لإنشاء حساب" if language == "ar" else "Move to account creation"
            actions.append(action)
        elif session.current_step == OnboardingStep.AUTH:
            action = "أكمل معلومات التسجيل" if language == "ar" else "Complete registration information"
            actions.append(action)
        elif session.current_step == OnboardingStep.PROFILE:
            action = "أعد إعداد ملفك الشخصي" if language == "ar" else "Set up your profile"
            actions.append(action)
        
        return actions

    def _get_cultural_tips(self, message: str, language: str = "ar") -> Optional[str]:
        """Get relevant cultural tips based on user message"""
        message_lower = message.lower()
        
        # Check if message relates to cultural topics
        cultural_keywords = {
            "ar": ["ثقافة", "عادات", "تقاليد", "محلي", "سعودي"],
            "en": ["culture", "customs", "traditions", "local", "saudi"]
        }
        
        keywords = cultural_keywords.get(language, cultural_keywords["en"])
        if any(keyword in message_lower for keyword in keywords):
            gaming_tips = self.cultural_contexts["gaming_preferences"].get(language, 
                          self.cultural_contexts["gaming_preferences"]["ar"])
            return gaming_tips[0] if gaming_tips else None
        
        return None

    def _calculate_progress(self, session: OnboardingSession) -> float:
        """Calculate onboarding progress percentage"""
        total_steps = 7  # welcome, socialProof, auth, profile, referral, interests, preferences
        completed_steps = len(session.completed_steps)
        return min((completed_steps / total_steps) * 100, 100.0)

    def _requires_user_action(self, session: OnboardingSession) -> bool:
        """Determine if user action is required to proceed"""
        return session.current_step in [
            OnboardingStep.AUTH,
            OnboardingStep.PROFILE,
            OnboardingStep.INTERESTS,
            OnboardingStep.PREFERENCES
        ]

    def _get_general_guidance(self, current_step: OnboardingStep, message: str, language: str = "ar") -> str:
        """Provide general guidance based on current step and message"""
        step_explanations = self.registration_guidance[language]["step_explanations"]
        explanation = step_explanations.get(current_step.value, "")
        
        if language == "ar":
            return f"""{explanation}

بناءً على سؤالك: "{message}"

💡 **يمكنني مساعدتك في:**
• شرح أي خطوة في التسجيل
• حل المشاكل التقنية
• فهم ميزات المنصة
• التكيف مع الثقافة المحلية
• التنقل في المنصة

🤝 **في أي مرحلة تحتاج المساعدة؟**
• إنشاء الحساب
• إعداد الملف الشخصي
• اختيار الاهتمامات
• ضبط الإعدادات

أخبرني كيف يمكنني مساعدتك أكثر!"""
        else:
            return f"""{explanation}

Based on your question: "{message}"

💡 **I can help you with:**
• Explaining any registration step
• Solving technical problems
• Understanding platform features
• Adapting to local culture
• Navigating the platform

🤝 **Which stage do you need help with?**
• Account creation
• Profile setup
• Interest selection
• Settings configuration

Tell me how I can help you more!"""

    def _get_next_step_guidance(self, current_step: OnboardingStep, language: str = "ar") -> str:
        """Provide guidance for the next step"""
        step_order = [
            OnboardingStep.WELCOME,
            OnboardingStep.SOCIAL_PROOF,
            OnboardingStep.AUTH,
            OnboardingStep.PROFILE,
            OnboardingStep.REFERRAL,
            OnboardingStep.INTERESTS,
            OnboardingStep.PREFERENCES
        ]
        
        try:
            current_index = step_order.index(current_step)
            if current_index < len(step_order) - 1:
                next_step = step_order[current_index + 1]
                return self._get_step_guidance(next_step, language)[language]
        except (ValueError, IndexError):
            pass
        
        # Default completion message
        if language == "ar":
            return """🎉 رائع! لقد أكملت جميع الخطوات الأساسية!

الآن يمكنك:
• استكشاف الأنشطة المتاحة
• البحث عن أنشطة قريبة منك
• الانضمام إلى المجتمع
• حجز تجربتك الأولى

مرحباً بك في عائلة لودوس! 🌟"""
        else:
            return """🎉 Great! You've completed all the basic steps!

Now you can:
• Explore available activities
• Search for activities near you
• Join the community
• Book your first experience

Welcome to the LUDUS family! 🌟"""

    def get_onboarding_progress(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get onboarding progress for a session"""
        session = self._load_session(session_id)
        if not session:
            return None
        
        return {
            "session_id": session.session_id,
            "user_id": session.user_id,
            "status": session.status.value,
            "current_step": session.current_step.value if session.current_step else None,
            "completed_steps": [step.value for step in session.completed_steps],
            "progress_percentage": session.progress_percentage,
            "language_preference": session.language_preference,
            "created_at": session.created_at.isoformat(),
            "updated_at": session.updated_at.isoformat()
        }

    def update_session_step(self, session_id: str, step: OnboardingStep, completed: bool = False) -> bool:
        """Update the current step in onboarding session"""
        session = self._load_session(session_id)
        if not session:
            return False
        
        session.current_step = step
        if completed and step not in session.completed_steps:
            session.completed_steps.append(step)
        
        session.progress_percentage = self._calculate_progress(session)
        self._save_session(session)
        return True

    def complete_onboarding_session(self, session_id: str, final_data: Optional[Dict[str, Any]] = None) -> bool:
        """Mark onboarding session as completed"""
        session = self._load_session(session_id)
        if not session:
            return False
        
        session.status = OnboardingSessionStatus.COMPLETED
        session.progress_percentage = 100.0
        
        if final_data:
            session.preferences.update(final_data)
        
        self._save_session(session)
        return True

    def _explain_community_features(self, language: str = "ar") -> str:
        """Explain community and social features"""
        if language == "ar":
            return """👥 **مجتمع لودوس:**

🤝 **التواصل:**
• اعثر على أشخاص يشاركونك الاهتمامات
• انضم لمجموعات حسب النشاط
• تواصل محترم وآمن

💬 **التفاعل:**
• تقييم الأنشطة والمشاركة
• مشاركة التجارب والصور
• إعطاء نصائح ومراجعات

🎯 **المجموعات:**
• مجموعات حسب الاهتمام
• أنشطة جماعية منتظمة
• فعاليات خاصة للأعضاء

🏆 **التحفيز:**
• نظام نقاط للمشاركة
• شارات للإنجازات
• مسابقات ومكافآت

هل تريد معرفة كيفية الانضمام للمجتمع؟"""
        else:
            return """👥 **LUDUS Community:**

🤝 **Connecting:**
• Find people who share your interests
• Join groups by activity
• Safe and respectful communication

💬 **Interaction:**
• Rate activities and share
• Share experiences and photos
• Give tips and reviews

🎯 **Groups:**
• Interest-based groups
• Regular group activities
• Exclusive member events

🏆 **Motivation:**
• Points system for participation
• Achievement badges
• Competitions and rewards

Would you like to know how to join the community?"""

    def _explain_general_features(self, language: str = "ar") -> str:
        """Explain general platform features"""
        features = self.platform_features.get(language, self.platform_features["ar"])
        
        if language == "ar":
            return f"""🌟 **ميزات منصة لودوس:**

🔍 **الاكتشاف:** {features['discovery']}
📅 **الحجز:** {features['booking']}
👥 **المجتمع:** {features['community']}
🛡️ **الأمان:** {features['safety']}
💳 **الدفع:** {features['payment']}
📞 **الدعم:** {features['support']}

💡 **ميزات إضافية:**
• واجهة عربية بالكامل مع دعم RTL
• توصيات ذكية مخصصة
• نظام تقييمات شفاف
• إشعارات مخصصة
• دعم للمناسبات الخاصة

أي ميزة تريد معرفة المزيد عنها؟"""
        else:
            return f"""🌟 **LUDUS Platform Features:**

🔍 **Discovery:** {features['discovery']}
📅 **Booking:** {features['booking']}
👥 **Community:** {features['community']}
🛡️ **Safety:** {features['safety']}
💳 **Payment:** {features['payment']}
📞 **Support:** {features['support']}

💡 **Additional Features:**
• Full Arabic interface with RTL support
• Smart personalized recommendations
• Transparent rating system
• Customized notifications
• Special events support

Which feature would you like to know more about?"""

    def _get_technical_support(self, message: str, language: str = "ar") -> str:
        """Provide technical support for onboarding issues"""
        message_lower = message.lower()
        
        # Common technical issues and solutions
        if any(word in message_lower for word in ["تحميل", "بطيء", "loading", "slow"]):
            if language == "ar":
                return """🔧 **حل مشاكل التحميل:**

⚡ **خطوات سريعة:**
1. تأكد من قوة الإنترنت
2. حدث المتصفح إذا أمكن
3. امسح ذاكرة التخزين المؤقت
4. جرب إعادة تحميل الصفحة

📱 **للجوال:**
• أغلق التطبيقات الأخرى
• تأكد من وجود مساحة كافية
• جرب إعادة تشغيل التطبيق

هل تحتاج مساعدة إضافية؟"""
            else:
                return """🔧 **Loading Issues Solutions:**

⚡ **Quick Steps:**
1. Check your internet connection
2. Update your browser if possible
3. Clear browser cache
4. Try reloading the page

📱 **For Mobile:**
• Close other apps
• Make sure you have enough storage
• Try restarting the app

Do you need additional help?"""
        
        elif any(word in message_lower for word in ["دخول", "مرور", "login", "password"]):
            if language == "ar":
                return """🔐 **مساعدة تسجيل الدخول:**

🚨 **مشاكل شائعة:**
• **كلمة مرور خاطئة:** جرب إعادة تعيينها
• **بريد غير موجود:** تأكد من صحة الإيميل
• **حساب محظور:** اتصل بالدعم الفني

🔑 **نصائح الأمان:**
• لا تشارك كلمة المرور مع أحد
• استخدم رمز تحقق إذا كان متاحاً
• سجل الخروج من الأجهزة المشتركة

💡 **بدائل:**
• استخدم تسجيل الدخول بجوجل
• اطلب رمز تحقق عبر الرسائل

هل يمكنني مساعدتك في مشكلة محددة؟"""
            else:
                return """🔐 **Login Help:**

🚨 **Common Issues:**
• **Wrong password:** Try resetting it
• **Email not found:** Check email spelling
• **Blocked account:** Contact technical support

🔑 **Security Tips:**
• Don't share your password with anyone
• Use verification code if available
• Log out from shared devices

💡 **Alternatives:**
• Use Google login
• Request verification code via SMS

Can I help you with a specific issue?"""
        
        else:
            # General technical support
            if language == "ar":
                return """🛠️ **الدعم الفني لسيلينا:**

أنا هنا لمساعدتك في حل أي مشكلة تقنية!

🔍 **مشاكل شائعة:**
• صعوبات التسجيل
• مشاكل تحميل الصفحات
• أخطاء في النماذج
• مشاكل في الدفع

📞 **كيفية الحصول على المساعدة:**
1. اشرح المشكلة بالتفصيل
2. أخبرني بأي رسائل خطأ
3. ذكر متى حدثت المشكلة
4. حدد الجهاز والمتصفح المستخدم

🚀 **استجابة سريعة:**
• رد فوري لمعظم المشاكل
• إحالة للدعم الفني المتقدم عند الحاجة
• متابعة حتى حل المشكلة

اشرح لي مشكلتك وسأساعدك فوراً!"""
            else:
                return """🛠️ **Selena Technical Support:**

I'm here to help you solve any technical issue!

🔍 **Common Issues:**
• Registration difficulties
• Page loading problems
• Form errors
• Payment issues

📞 **How to Get Help:**
1. Explain the problem in detail
2. Tell me any error messages
3. Mention when the problem occurred
4. Specify device and browser used

🚀 **Quick Response:**
• Immediate response for most issues
• Escalation to advanced support when needed
• Follow-up until problem is resolved

Explain your issue and I'll help you immediately!"""

    def get_session_analytics(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get analytics data for an onboarding session"""
        session = self._load_session(session_id)
        if not session:
            return None
        
        total_messages = len(session.conversation_history)
        user_messages = [msg for msg in session.conversation_history if msg["role"] == "user"]
        assistant_messages = [msg for msg in session.conversation_history if msg["role"] == "assistant"]
        
        duration = (session.updated_at - session.created_at).total_seconds() / 60  # minutes
        
        return {
            "session_id": session.session_id,
            "duration_minutes": duration,
            "total_messages": total_messages,
            "user_messages": len(user_messages),
            "assistant_messages": len(assistant_messages),
            "progress_percentage": session.progress_percentage,
            "completed_steps": len(session.completed_steps),
            "language_preference": session.language_preference,
            "status": session.status.value
        }