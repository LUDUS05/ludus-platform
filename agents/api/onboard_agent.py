"""
LUDUS Selena-Onboard Agent - Specialized agent for user onboarding and platform orientation

This agent assists new users with:
- Registration process guidance
- Profile setup assistance  
- Platform feature orientation
- Cultural adaptation for Saudi market
- Arabic/English bilingual support
"""

import json
import uuid
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from pydantic import BaseModel
import os
import pymongo
from pymongo import MongoClient


class OnboardingSessionRequest(BaseModel):
    """Model for starting onboarding session"""
    user_id: Optional[str] = None
    language: str = "ar"
    registration_step: Optional[str] = None
    cultural_context: str = "saudi"


class OnboardingResponse(BaseModel):
    """Model for onboarding agent responses"""
    session_id: str
    message: str
    suggestions: List[str]
    next_steps: List[str]
    current_step: str
    progress_percentage: int
    helpful_tips: List[str]


class OnboardingProgressRequest(BaseModel):
    """Model for tracking onboarding progress"""
    session_id: str
    step_completed: str
    step_data: Optional[Dict[str, Any]] = None
    language: str = "ar"


class SelenaOnboardAgent:
    """Specialized AI agent for user onboarding and platform orientation"""
    
    def __init__(self, redis_client=None):
        self.redis_client = redis_client
        self.mongodb_url = os.environ.get("MONGODB_URI")
        self.agent_type = "onboard"
        
        # Initialize MongoDB connection
        self.mongodb_client = None
        self.mongodb_db = None
        if self.mongodb_url:
            try:
                self.mongodb_client = MongoClient(self.mongodb_url)
                # Extract database name from URI or use default
                self.mongodb_db = self.mongodb_client.get_database()
            except Exception as e:
                print(f"Failed to connect to MongoDB: {e}")
                self.mongodb_client = None
                self.mongodb_db = None
        
        # Onboarding steps in order
        self.onboarding_steps = [
            "welcome",
            "registration", 
            "email_verification",
            "profile_setup",
            "interests_selection",
            "preferences_setup",
            "cultural_orientation",
            "feature_tour",
            "completion"
        ]
        
        # Cultural gaming terminology for Saudi Arabia
        self.cultural_terms = {
            "ar": {
                "gaming": "الألعاب",
                "esports": "الرياضات الإلكترونية", 
                "board_games": "ألعاب الطاولة",
                "card_games": "ألعاب الورق",
                "outdoor_activities": "الأنشطة الخارجية",
                "indoor_activities": "الأنشطة الداخلية",
                "social_gathering": "التجمع الاجتماعي",
                "family_time": "وقت العائلة",
                "friends_hangout": "لقاء الأصدقاء"
            },
            "en": {
                "gaming": "Gaming",
                "esports": "Esports",
                "board_games": "Board Games", 
                "card_games": "Card Games",
                "outdoor_activities": "Outdoor Activities",
                "indoor_activities": "Indoor Activities",
                "social_gathering": "Social Gathering",
                "family_time": "Family Time",
                "friends_hangout": "Friends Hangout"
            }
        }
    
    def _get_session_key(self, session_id: str) -> str:
        """Get Redis key for onboarding session data"""
        return f"agents:onboard:session:{session_id}"
    
    def _get_user_session_key(self, user_id: str) -> str:
        """Get Redis key for user's onboarding sessions"""
        return f"agents:onboard:user:{user_id}"
    
    def _save_session_data(self, session_id: str, data: Dict[str, Any]) -> None:
        """Save onboarding session data to Redis"""
        if not self.redis_client:
            return
        self.redis_client.setex(
            self._get_session_key(session_id),
            60 * 60 * 24 * 7,  # 7 days
            json.dumps(data)
        )
    
    def _load_session_data(self, session_id: str) -> Dict[str, Any]:
        """Load onboarding session data from Redis"""
        if not self.redis_client:
            return {}
        
        data = self.redis_client.get(self._get_session_key(session_id))
        if not data:
            return {}
        
        try:
            return json.loads(data)
        except:
            return {}
    
    def _update_progress_in_mongodb(self, user_id: str, session_data: Dict[str, Any]) -> bool:
        """Update user onboarding progress in MongoDB"""
        if not self.mongodb_db:
            return False
            
        try:
            # Update or create onboarding session record
            onboarding_sessions = self.mongodb_db.onboardingsessions
            
            session_record = {
                "sessionId": session_data["session_id"],
                "userId": pymongo.ObjectId(user_id) if user_id else None,
                "language": session_data.get("language", "ar"),
                "culturalContext": session_data.get("cultural_context", "saudi"),
                "currentStep": session_data.get("current_step", "welcome"),
                "completedSteps": session_data.get("completed_steps", []),
                "stepData": session_data.get("step_data", {}),
                "totalInteractions": session_data.get("total_interactions", 1),
                "lastInteractionAt": datetime.now(),
                "isCompleted": session_data.get("completed", False),
                "completedAt": datetime.fromisoformat(session_data["completed_at"]) if session_data.get("completed_at") else None,
                "finalData": session_data.get("final_data", {}),
                "mongodbSyncStatus": "synced",
                "mongodbSyncAt": datetime.now()
            }
            
            # Calculate completion duration if completed
            if session_data.get("completed") and session_data.get("started_at"):
                start_time = datetime.fromisoformat(session_data["started_at"])
                end_time = datetime.fromisoformat(session_data["completed_at"])
                duration_minutes = (end_time - start_time).total_seconds() / 60
                session_record["completionDuration"] = round(duration_minutes)
            
            # Upsert the session record
            onboarding_sessions.update_one(
                {"sessionId": session_data["session_id"]},
                {"$set": session_record},
                upsert=True
            )
            
            # Also update user's onboarding status if user_id exists
            if user_id:
                users = self.mongodb_db.users
                user_updates = {
                    "onboardingProgress." + step: {
                        "completed": True,
                        "completedAt": datetime.now(),
                        "agentAssisted": True
                    } for step in session_data.get("completed_steps", [])
                }
                
                if session_data.get("completed"):
                    user_updates["onboardingCompleted"] = True
                    user_updates["onboardingCompletedAt"] = datetime.now()
                
                if user_updates:
                    users.update_one(
                        {"_id": pymongo.ObjectId(user_id)},
                        {"$set": user_updates}
                    )
            
            return True
        except Exception as e:
            print(f"Error updating MongoDB progress: {e}")
            return False
    
    def start_onboarding_session(self, request: OnboardingSessionRequest) -> OnboardingResponse:
        """Start a new onboarding session"""
        session_id = str(uuid.uuid4())
        
        # Initialize session data
        session_data = {
            "session_id": session_id,
            "user_id": request.user_id,
            "language": request.language,
            "cultural_context": request.cultural_context,
            "current_step": "welcome",
            "completed_steps": [],
            "step_data": {},
            "started_at": datetime.now().isoformat(),
            "last_interaction": datetime.now().isoformat()
        }
        
        # Save to Redis
        self._save_session_data(session_id, session_data)
        
        # Save to MongoDB if available
        if request.user_id:
            self._update_progress_in_mongodb(request.user_id, session_data)
        
        # Generate welcome message
        if request.language == "ar":
            welcome_message = """مرحباً بك في لودوس! أنا سيلينا، مساعدتك الشخصية لإعداد حسابك 🌟

سأكون معك خطوة بخطوة لإنشاء حسابك وتخصيص تجربتك على منصة لودوس. 

سنبدأ بإنشاء حسابك، ثم نقوم بتخصيص تفضيلاتك لنجد لك أفضل الأنشطة التي تناسب اهتماماتك في السعودية."""
            
            suggestions = [
                "بدء إنشاء الحساب",
                "معرفة المزيد عن المنصة", 
                "التحدث بالإنجليزية",
                "الحصول على مساعدة فورية"
            ]
            
            next_steps = [
                "إنشاء حساب جديد",
                "اختيار كلمة مرور قوية",
                "تأكيد البريد الإلكتروني"
            ]
            
            helpful_tips = [
                "تأكد من استخدام بريد إلكتروني صحيح",
                "اختر كلمة مرور تحتوي على أرقام وحروف",
                "احتفظ ببياناتك آمنة"
            ]
        else:
            welcome_message = """Welcome to LUDUS! I'm Selena, your personal onboarding assistant 🌟

I'll guide you step by step through setting up your account and customizing your experience on the LUDUS platform.

We'll start by creating your account, then customize your preferences to find the best activities that match your interests in Saudi Arabia."""
            
            suggestions = [
                "Start account creation",
                "Learn more about the platform",
                "Switch to Arabic",
                "Get immediate help"
            ]
            
            next_steps = [
                "Create new account",
                "Choose a strong password", 
                "Verify email address"
            ]
            
            helpful_tips = [
                "Make sure to use a valid email address",
                "Choose a password with numbers and letters",
                "Keep your data secure"
            ]
        
        return OnboardingResponse(
            session_id=session_id,
            message=welcome_message,
            suggestions=suggestions,
            next_steps=next_steps,
            current_step="welcome",
            progress_percentage=10,
            helpful_tips=helpful_tips
        )
    
    def process_registration_help(self, message: str, session_id: str, language: str = "ar") -> OnboardingResponse:
        """Process registration assistance requests"""
        session_data = self._load_session_data(session_id)
        
        if not session_data:
            # Session not found, restart
            return self.start_onboarding_session(OnboardingSessionRequest(language=language))
        
        # Update last interaction
        session_data["last_interaction"] = datetime.now().isoformat()
        
        # Analyze message for registration context
        message_lower = message.lower()
        
        # Determine what help user needs
        if any(word in message_lower for word in ["password", "كلمة مرور", "كلمة السر"]):
            return self._provide_password_help(session_data, language)
        elif any(word in message_lower for word in ["email", "بريد", "إيميل"]):
            return self._provide_email_help(session_data, language)
        elif any(word in message_lower for word in ["verification", "تأكيد", "تفعيل"]):
            return self._provide_verification_help(session_data, language)
        elif any(word in message_lower for word in ["error", "خطأ", "مشكلة"]):
            return self._provide_error_help(session_data, language)
        else:
            return self._provide_general_registration_help(session_data, language)
    
    def _provide_password_help(self, session_data: Dict[str, Any], language: str) -> OnboardingResponse:
        """Provide password creation help"""
        if language == "ar":
            message = """إرشادات إنشاء كلمة مرور قوية وآمنة:

🔐 **متطلبات كلمة المرور:**
• الحد الأدنى 8 أحرف
• يجب أن تحتوي على حروف كبيرة وصغيرة
• رقم واحد على الأقل
• رمز خاص واحد على الأقل (@#$%&*)

💡 **نصائح لكلمة مرور قوية:**
• استخدم جملة تتذكرها بسهولة
• تجنب المعلومات الشخصية (تاريخ الميلاد، الاسم)
• لا تستخدم نفس كلمة المرور لمواقع أخرى"""
            
            suggestions = [
                "اختبار قوة كلمة المرور",
                "نصائح أمان إضافية",
                "متابعة التسجيل",
                "تغيير اللغة للإنجليزية"
            ]
            
            next_steps = [
                "إنشاء كلمة مرور قوية",
                "حفظ كلمة المرور بأمان",
                "متابعة إنشاء الحساب"
            ]
            
            helpful_tips = [
                "استخدم مدير كلمات المرور لحفظها بأمان",
                "لا تشارك كلمة مرورك مع أي شخص",
                "قم بتحديث كلمة المرور دورياً"
            ]
        else:
            message = """Password Security Guidelines:

🔐 **Password Requirements:**
• Minimum 8 characters
• Must contain uppercase and lowercase letters  
• At least one number
• At least one special character (@#$%&*)

💡 **Strong Password Tips:**
• Use a memorable phrase
• Avoid personal information (birthdate, name)
• Don't reuse passwords from other sites"""
            
            suggestions = [
                "Test password strength",
                "Additional security tips",
                "Continue registration",
                "Switch to Arabic"
            ]
            
            next_steps = [
                "Create strong password",
                "Save password securely", 
                "Continue account creation"
            ]
            
            helpful_tips = [
                "Use a password manager to store securely",
                "Never share your password with anyone",
                "Update your password regularly"
            ]
        
        # Update session
        session_data["current_step"] = "registration_password"
        session_data["step_data"]["password_help_provided"] = True
        self._save_session_data(session_data["session_id"], session_data)
        
        return OnboardingResponse(
            session_id=session_data["session_id"],
            message=message,
            suggestions=suggestions,
            next_steps=next_steps,
            current_step="registration_password",
            progress_percentage=20,
            helpful_tips=helpful_tips
        )
    
    def _provide_email_help(self, session_data: Dict[str, Any], language: str) -> OnboardingResponse:
        """Provide email setup help"""
        if language == "ar":
            message = """إرشادات إعداد البريد الإلكتروني:

📧 **متطلبات البريد الإلكتروني:**
• يجب أن يكون بريد إلكتروني صحيح وفعال
• ستحتاجه لتسجيل الدخول وتلقي التنبيهات
• تأكد من كتابته بشكل صحيح

✅ **نصائح مهمة:**
• استخدم بريد إلكتروني تتحقق منه يومياً
• تأكد من عدم وجود أخطاء إملائية
• احتفظ بحق الوصول لهذا البريد

🔐 **الخصوصية والأمان:**
• لن نشارك بريدك مع أي جهة خارجية
• ستتلقى رسائل من LUDUS فقط
• يمكنك إلغاء الاشتراك في أي وقت"""
            
            suggestions = [
                "التحقق من صحة البريد الإلكتروني",
                "نصائح الخصوصية والأمان",
                "متابعة التسجيل",
                "المساعدة في مشكلة أخرى"
            ]
            
            next_steps = [
                "إدخال بريد إلكتروني صحيح",
                "التحقق من صندوق الواردات",
                "تأكيد البريد الإلكتروني"
            ]
            
            helpful_tips = [
                "تحقق من مجلد البريد المهمل (Spam)",
                "أضف noreply@letsludus.com لقائمة الثقة",
                "احتفظ بحق الوصول لبريدك الإلكتروني"
            ]
        else:
            message = """Email Setup Guidelines:

📧 **Email Requirements:**
• Must be a valid and active email address
• You'll need it for login and notifications
• Make sure it's spelled correctly

✅ **Important Tips:**
• Use an email you check daily
• Double-check for spelling errors
• Keep access to this email account

🔐 **Privacy & Security:**
• We'll never share your email with third parties
• You'll only receive messages from LUDUS
• You can unsubscribe at any time"""
            
            suggestions = [
                "Verify email validity",
                "Privacy and security tips", 
                "Continue registration",
                "Help with another issue"
            ]
            
            next_steps = [
                "Enter valid email address",
                "Check your inbox",
                "Verify email address"
            ]
            
            helpful_tips = [
                "Check your spam folder",
                "Add noreply@letsludus.com to trusted senders",
                "Keep access to your email account"
            ]
        
        # Update session
        session_data["current_step"] = "registration_email"
        session_data["step_data"]["email_help_provided"] = True
        self._save_session_data(session_data["session_id"], session_data)
        
        return OnboardingResponse(
            session_id=session_data["session_id"],
            message=message,
            suggestions=suggestions,
            next_steps=next_steps,
            current_step="registration_email",
            progress_percentage=25,
            helpful_tips=helpful_tips
        )
    
    def _provide_verification_help(self, session_data: Dict[str, Any], language: str) -> OnboardingResponse:
        """Provide email verification help"""
        if language == "ar":
            message = """مساعدة في تأكيد البريد الإلكتروني:

📨 **خطوات التأكيد:**
1. تحقق من صندوق الواردات في بريدك الإلكتروني
2. ابحث عن رسالة من LUDUS أو noreply@letsludus.com
3. انقر على رابط التأكيد في الرسالة
4. ارجع إلى LUDUS لإكمال التسجيل

❗ **لم تجد الرسالة؟**
• تحقق من مجلد البريد المهمل (Spam)
• انتظر بضع دقائق إضافية
• تأكد من كتابة بريدك الإلكتروني بشكل صحيح

🔄 **إعادة الإرسال:**
يمكنك طلب إعادة إرسال رسالة التأكيد إذا لم تصلك خلال 10 دقائق."""
            
            suggestions = [
                "إعادة إرسال رسالة التأكيد",
                "تحقق من مجلد البريد المهمل",
                "تغيير البريد الإلكتروني",
                "التواصل مع الدعم"
            ]
        else:
            message = """Email Verification Help:

📨 **Verification Steps:**
1. Check your email inbox
2. Look for an email from LUDUS or noreply@letsludus.com  
3. Click the verification link in the email
4. Return to LUDUS to complete registration

❗ **Can't find the email?**
• Check your spam folder
• Wait a few more minutes
• Make sure your email address is correct

🔄 **Resend Option:**
You can request a new verification email if you haven't received one within 10 minutes."""
            
            suggestions = [
                "Resend verification email",
                "Check spam folder",
                "Change email address",
                "Contact support"
            ]
        
        # Update session
        session_data["current_step"] = "email_verification"
        session_data["step_data"]["verification_help_provided"] = True
        self._save_session_data(session_data["session_id"], session_data)
        
        return OnboardingResponse(
            session_id=session_data["session_id"],
            message=message,
            suggestions=suggestions,
            next_steps=["Complete email verification", "Return to LUDUS"],
            current_step="email_verification",
            progress_percentage=30,
            helpful_tips=["Check spam folder regularly", "Keep email account accessible"]
        )
    
    def _provide_error_help(self, session_data: Dict[str, Any], language: str) -> OnboardingResponse:
        """Provide help with registration errors"""
        if language == "ar":
            message = """مساعدة في حل مشاكل التسجيل:

🔧 **المشاكل الشائعة وحلولها:**

**"البريد الإلكتروني مستخدم بالفعل"**
• هذا البريد مسجل مسبقاً
• جرب تسجيل الدخول بدلاً من إنشاء حساب جديد
• استخدم خيار "نسيت كلمة المرور" إذا لزم الأمر

**"كلمة المرور ضعيفة"**
• تأكد من 8 أحرف على الأقل
• أضف أرقام ورموز خاصة
• استخدم مزيج من الحروف الكبيرة والصغيرة

**"خطأ في الاتصال"**
• تحقق من اتصال الإنترنت
• أعد تحديث الصفحة
• جرب مرة أخرى بعد قليل

**مشاكل أخرى؟**
أخبرني بالضبط ما هو نص الخطأ الذي تراه وسأساعدك في حله."""
            
            suggestions = [
                "تجربة تسجيل الدخول بدلاً من التسجيل",
                "إعادة ضبط كلمة المرور",
                "استخدام بريد إلكتروني مختلف",
                "التواصل مع الدعم المباشر"
            ]
        else:
            message = """Registration Error Help:

🔧 **Common Issues & Solutions:**

**"Email already exists"**
• This email is already registered
• Try logging in instead of creating new account
• Use "Forgot Password" option if needed

**"Password too weak"**
• Ensure at least 8 characters
• Add numbers and special characters
• Use mix of uppercase and lowercase letters

**"Connection error"**
• Check your internet connection
• Refresh the page
• Try again in a few moments

**Other issues?**
Tell me exactly what error message you're seeing and I'll help you solve it."""
            
            suggestions = [
                "Try logging in instead",
                "Reset password",
                "Use different email",
                "Contact direct support"
            ]
        
        # Update session
        session_data["current_step"] = "error_resolution"
        session_data["step_data"]["error_help_provided"] = True
        self._save_session_data(session_data["session_id"], session_data)
        
        return OnboardingResponse(
            session_id=session_data["session_id"],
            message=message,
            suggestions=suggestions,
            next_steps=["Resolve the error", "Try registration again"],
            current_step="error_resolution",
            progress_percentage=session_data.get("progress_percentage", 15),
            helpful_tips=["Take screenshots of errors for support", "Try different browser if issues persist"]
        )
    
    def _provide_general_registration_help(self, session_data: Dict[str, Any], language: str) -> OnboardingResponse:
        """Provide general registration guidance"""
        if language == "ar":
            message = """دليل التسجيل الشامل في لودوس:

📝 **خطوات التسجيل:**
1. **الاسم الأول والأخير** - أدخل اسمك الحقيقي
2. **البريد الإلكتروني** - بريد صحيح ومفعل
3. **كلمة المرور** - 8 أحرف على الأقل مع أرقام ورموز
4. **تأكيد كلمة المرور** - تطابق مع كلمة المرور الأولى
5. **تأكيد البريد** - تحقق من الرسالة في بريدك

🎮 **لماذا نحتاج هذه المعلومات؟**
• الاسم: لتخصيص تجربتك وبناء الثقة مع المجتمع
• البريد: للتواصل معك حول الأنشطة والحجوزات
• كلمة المرور: لحماية حسابك والحفاظ على خصوصيتك

🇸🇦 **معلومات مخصصة للسعودية:**
• جميع الأنشطة متوافقة مع الثقافة السعودية
• أوقات الأنشطة تراعي أوقات الصلاة
• خيارات منفصلة للعائلات والأفراد"""
            
            suggestions = [
                "بدء عملية التسجيل",
                "مساعدة في ملء النموذج",
                "التحقق من متطلبات كلمة المرور",
                "معرفة المزيد عن الخصوصية"
            ]
            
            next_steps = [
                "ملء نموذج التسجيل",
                "تأكيد البريد الإلكتروني",
                "إكمال الملف الشخصي"
            ]
        else:
            message = """Complete LUDUS Registration Guide:

📝 **Registration Steps:**
1. **First & Last Name** - Enter your real name
2. **Email Address** - Valid and active email
3. **Password** - 8+ characters with numbers and symbols
4. **Confirm Password** - Must match first password
5. **Email Verification** - Check email for confirmation

🎮 **Why We Need This Information:**
• Name: To personalize your experience and build community trust
• Email: To communicate about activities and bookings  
• Password: To protect your account and maintain privacy

🇸🇦 **Saudi Arabia Specific:**
• All activities are culturally appropriate
• Activity timing respects prayer times
• Separate options for families and individuals"""
            
            suggestions = [
                "Start registration process",
                "Help filling the form",
                "Check password requirements", 
                "Learn about privacy"
            ]
            
            next_steps = [
                "Fill registration form",
                "Verify email address",
                "Complete profile setup"
            ]
        
        # Update session
        session_data["current_step"] = "registration_general"
        session_data["step_data"]["general_help_provided"] = True
        self._save_session_data(session_data["session_id"], session_data)
        
        return OnboardingResponse(
            session_id=session_data["session_id"],
            message=message,
            suggestions=suggestions,
            next_steps=next_steps,
            current_step="registration_general",
            progress_percentage=25,
            helpful_tips=["Take your time filling the form", "All information can be updated later"]
        )
    
    def process_profile_setup(self, message: str, session_id: str, language: str = "ar") -> OnboardingResponse:
        """Process profile setup assistance requests"""
        session_data = self._load_session_data(session_id)
        
        if not session_data:
            return self.start_onboarding_session(OnboardingSessionRequest(language=language))
        
        # Update session
        session_data["last_interaction"] = datetime.now().isoformat()
        session_data["current_step"] = "profile_setup"
        
        if language == "ar":
            message = """إعداد الملف الشخصي - دعنا نخصص تجربتك! 👤

📸 **صورة الملف الشخصي:**
• اختيارية ولكن مفضلة لبناء الثقة
• يمكنك رفع صورة من جهازك
• تأكد من أن الصورة واضحة ومناسبة

📝 **معلومات شخصية:**
• **الاسم:** سيظهر للمستخدمين الآخرين
• **العمر:** لتوصيات أنشطة مناسبة (اختياري)
• **المدينة:** لإيجاد أنشطة قريبة منك
• **نبذة شخصية:** اكتب عن اهتماماتك (اختياري)

🎮 **التفضيلات الأولية:**
• أنواع الأنشطة المفضلة
• الأوقات المناسبة لك
• مستوى النشاط البدني المرغوب
• تفضيلات المجموعة (فردي/جماعي)

🔒 **إعدادات الخصوصية:**
• تحكم في من يرى ملفك الشخصي
• إدارة رؤية معلومات الاتصال
• تخصيص التنبيهات"""
            
            suggestions = [
                "مساعدة في رفع صورة الملف الشخصي",
                "نصائح كتابة نبذة جذابة",
                "إعداد تفضيلات الخصوصية",
                "اختيار الأنشطة المفضلة"
            ]
            
            next_steps = [
                "إضافة صورة شخصية",
                "ملء المعلومات الأساسية",
                "اختيار التفضيلات",
                "إعداد الخصوصية"
            ]
            
            helpful_tips = [
                "الصورة الشخصية تزيد من التفاعل 3 أضعاف",
                "النبذة الشخصية الجيدة تجذب أصدقاء جدد",
                "يمكن تحديث جميع المعلومات لاحقاً"
            ]
        else:
            message = """Profile Setup - Let's customize your experience! 👤

📸 **Profile Picture:**
• Optional but recommended for building trust
• Upload from your device
• Make sure the image is clear and appropriate

📝 **Personal Information:**
• **Name:** Will be visible to other users
• **Age:** For age-appropriate activity recommendations (optional)
• **City:** To find activities near you
• **Bio:** Write about your interests (optional)

🎮 **Initial Preferences:**
• Preferred activity types
• Suitable times for you
• Desired physical activity level
• Group preferences (solo/group)

🔒 **Privacy Settings:**
• Control who sees your profile
• Manage contact information visibility  
• Customize notifications"""
            
            suggestions = [
                "Help uploading profile picture",
                "Tips for writing engaging bio",
                "Setup privacy preferences",
                "Choose favorite activities"
            ]
            
            next_steps = [
                "Add profile picture",
                "Fill basic information",
                "Select preferences",
                "Setup privacy"
            ]
            
            helpful_tips = [
                "Profile pictures increase engagement 3x",
                "Good bio attracts like-minded friends",
                "All information can be updated later"
            ]
        
        # Update session data
        if "profile_setup" not in session_data["completed_steps"]:
            session_data["completed_steps"].append("profile_setup")
        session_data["step_data"]["profile_setup_started"] = True
        self._save_session_data(session_data["session_id"], session_data)
        
        return OnboardingResponse(
            session_id=session_data["session_id"],
            message=message,
            suggestions=suggestions,
            next_steps=next_steps,
            current_step="profile_setup",
            progress_percentage=50,
            helpful_tips=helpful_tips
        )
    
    def process_feature_tour(self, message: str, session_id: str, language: str = "ar") -> OnboardingResponse:
        """Process platform feature tour requests"""
        session_data = self._load_session_data(session_id)
        
        if not session_data:
            return self.start_onboarding_session(OnboardingSessionRequest(language=language))
        
        # Update session
        session_data["last_interaction"] = datetime.now().isoformat()
        session_data["current_step"] = "feature_tour"
        
        if language == "ar":
            message = """جولة في ميزات منصة لودوس! 🎯

🏠 **الصفحة الرئيسية:**
• اكتشف الأنشطة المميزة والموصى بها
• ابحث عن أنشطة بحسب الفئة أو الموقع
• شاهد الأنشطة الشائعة في منطقتك

🔍 **البحث والاستكشاف:**
• ابحث بالكلمات المفتاحية
• فلتر النتائج بحسب السعر والوقت والموقع
• احفظ الأنشطة المفضلة لديك

📅 **إدارة الحجوزات:**
• احجز أنشطتك بنقرات قليلة
• ادفع بأمان عبر منصة آمنة
• اكسب نقاط مكافآت مع كل حجز

👥 **المجتمع والأصدقاء:**
• تواصل مع أشخاص لديهم نفس اهتماماتك
• انضم لمجموعات الأنشطة
• شارك تجاربك وآرائك

🎁 **نظام المكافآت:**
• اكسب نقاط مع كل نشاط
• ادع أصدقاءك واكسب مكافآت إضافية
• استبدل النقاط بخصومات وهدايا"""
            
            suggestions = [
                "تعلم كيفية البحث عن الأنشطة",
                "شرح نظام الحجوزات",
                "فهم نظام المكافآت",
                "ميزات المجتمع والأصدقاء"
            ]
            
            next_steps = [
                "استكشاف الأنشطة المتاحة",
                "إعداد التفضيلات",
                "حجز أول نشاط"
            ]
            
            helpful_tips = [
                "ابدأ بالأنشطة المجانية لتجربة المنصة",
                "اقرأ آراء المستخدمين قبل الحجز",
                "استخدم خاصية الخريطة لإيجاد أنشطة قريبة"
            ]
        else:
            message = """LUDUS Platform Feature Tour! 🎯

🏠 **Home Page:**
• Discover featured and recommended activities
• Search for activities by category or location
• View popular activities in your area

🔍 **Search & Discovery:**
• Search with keywords
• Filter results by price, time, and location
• Save your favorite activities

📅 **Booking Management:**
• Book activities with just a few clicks
• Pay securely through trusted platform
• Earn reward points with every booking

👥 **Community & Friends:**
• Connect with like-minded people
• Join activity groups
• Share your experiences and reviews

🎁 **Rewards System:**
• Earn points with every activity
• Invite friends and earn bonus rewards
• Redeem points for discounts and gifts"""
            
            suggestions = [
                "Learn how to search for activities",
                "Understand booking system",
                "Explore rewards program",
                "Community and friends features"
            ]
            
            next_steps = [
                "Explore available activities",
                "Setup preferences",
                "Book first activity"
            ]
            
            helpful_tips = [
                "Start with free activities to try the platform",
                "Read user reviews before booking",
                "Use map feature to find nearby activities"
            ]
        
        # Update session data
        if "feature_tour" not in session_data["completed_steps"]:
            session_data["completed_steps"].append("feature_tour")
        session_data["step_data"]["feature_tour_completed"] = True
        self._save_session_data(session_data["session_id"], session_data)
        
        return OnboardingResponse(
            session_id=session_data["session_id"],
            message=message,
            suggestions=suggestions,
            next_steps=next_steps,
            current_step="feature_tour",
            progress_percentage=80,
            helpful_tips=helpful_tips
        )
    
    def complete_onboarding(self, session_id: str, final_data: Optional[Dict[str, Any]] = None, language: str = "ar") -> OnboardingResponse:
        """Complete the onboarding process"""
        session_data = self._load_session_data(session_id)
        
        if not session_data:
            return self.start_onboarding_session(OnboardingSessionRequest(language=language))
        
        # Mark onboarding as completed
        session_data["completed"] = True
        session_data["completed_at"] = datetime.now().isoformat()
        session_data["current_step"] = "completed"
        
        if final_data:
            session_data["final_data"] = final_data
        
        # Update MongoDB if user_id exists
        if session_data.get("user_id"):
            self._update_progress_in_mongodb(session_data["user_id"], session_data)
        
        if language == "ar":
            message = """🎉 تهانينا! لقد أكملت عملية الإعداد بنجاح!

🌟 **مرحباً بك في مجتمع لودوس!**
أنت الآن جاهز لاستكشاف عالم مليء بالأنشطة المثيرة والتجارب الرائعة في السعودية.

🎁 **مكافأة الترحيب:**
• تم إضافة 100 نقطة ترحيب لحسابك
• خصم 15% على أول حجز
• شارة "عضو جديد" في ملفك الشخصي

🚀 **الخطوات التالية:**
• استكشف الأنشطة في منطقتك
• احجز نشاطك الأول
• ادع أصدقاءك لينضموا إليك

📱 **نصائح للبداية:**
• حمل التطبيق للحصول على تنبيهات فورية
• تابعنا على وسائل التواصل الاجتماعي
• انضم لمجموعات الواتساب الخاصة بمنطقتك

سعداء جداً بانضمامك لعائلة لودوس! 🎊"""
            
            suggestions = [
                "استكشاف الأنشطة الآن",
                "حجز النشاط الأول",
                "دعوة الأصدقاء",
                "تحميل التطبيق"
            ]
            
            next_steps = [
                "Browse activities",
                "Make first booking", 
                "Invite friends"
            ]
        else:
            message = """🎉 Congratulations! You've successfully completed the setup!

🌟 **Welcome to the LUDUS Community!**
You're now ready to explore a world full of exciting activities and amazing experiences in Saudi Arabia.

🎁 **Welcome Bonus:**
• 100 welcome points added to your account
• 15% discount on your first booking
• "New Member" badge on your profile

🚀 **Next Steps:**
• Explore activities in your area
• Book your first activity
• Invite friends to join you

📱 **Getting Started Tips:**
• Download the app for instant notifications
• Follow us on social media
• Join WhatsApp groups for your area

We're thrilled to have you as part of the LUDUS family! 🎊"""
            
            suggestions = [
                "Explore activities now",
                "Book first activity",
                "Invite friends",
                "Download app"
            ]
            
            next_steps = [
                "Browse activities",
                "Make first booking",
                "Invite friends"
            ]
        
        # Update session data
        session_data["completed_steps"] = self.onboarding_steps[:-1]  # All except completion
        self._save_session_data(session_data["session_id"], session_data)
        
        return OnboardingResponse(
            session_id=session_data["session_id"],
            message=message,
            suggestions=suggestions,
            next_steps=next_steps,
            current_step="completed",
            progress_percentage=100,
            helpful_tips=["Explore freely, everything can be customized later", "Don't hesitate to reach out for help"]
        )
    
    def get_onboarding_progress(self, user_id: str) -> Dict[str, Any]:
        """Get user's onboarding progress"""
        if not self.redis_client:
            return {"error": "Session storage not available"}
        
        user_session_key = self._get_user_session_key(user_id)
        session_ids = self.redis_client.get(user_session_key)
        
        if not session_ids:
            return {"progress": 0, "completed_steps": [], "current_step": "welcome"}
        
        try:
            session_id_list = json.loads(session_ids)
            if not session_id_list:
                return {"progress": 0, "completed_steps": [], "current_step": "welcome"}
            
            # Get latest session
            latest_session_id = session_id_list[-1]
            session_data = self._load_session_data(latest_session_id)
            
            if not session_data:
                return {"progress": 0, "completed_steps": [], "current_step": "welcome"}
            
            completed_count = len(session_data.get("completed_steps", []))
            total_steps = len(self.onboarding_steps)
            progress_percentage = (completed_count / total_steps) * 100
            
            return {
                "progress": progress_percentage,
                "completed_steps": session_data.get("completed_steps", []),
                "current_step": session_data.get("current_step", "welcome"),
                "session_id": session_id,
                "completed": session_data.get("completed", False)
            }
        except:
            return {"progress": 0, "completed_steps": [], "current_step": "welcome"}
    
    def process_cultural_guidance(self, message: str, session_id: str, language: str = "ar") -> OnboardingResponse:
        """Provide cultural guidance for Saudi Arabian gaming and social activities"""
        session_data = self._load_session_data(session_id)
        
        if not session_data:
            return self.start_onboarding_session(OnboardingSessionRequest(language=language))
        
        session_data["last_interaction"] = datetime.now().isoformat()
        session_data["current_step"] = "cultural_guidance"
        
        if language == "ar":
            message = """الدليل الثقافي للأنشطة الاجتماعية في السعودية 🇸🇦

🎮 **الألعاب والأنشطة المحلية:**
• **ألعاب الطاولة التراثية:** الطاولة، الدمينو، الشدة
• **الألعاب الحديثة:** PlayStation، بطاقات التجميع، ألعاب الذكاء
• **الأنشطة الخارجية:** التخييم، الرحلات الصحراوية، الرياضات المائية
• **الأنشطة العائلية:** المنتزهات، المراكز التجارية، أماكن الترفيه

⏰ **أوقات الأنشطة:**
• جميع الأنشطة تراعي أوقات الصلاة
• أوقات خاصة للعائلات في عطلة الأسبوع
• فعاليات مسائية بعد صلاة المغرب
• أنشطة صباحية مبكرة في الصيف

👥 **الاختلاط الاجتماعي:**
• فعاليات مختلطة للعائلات
• أنشطة منفصلة للرجال والنساء
• فعاليات خاصة للشباب
• أنشطة مناسبة لجميع الأعمار

🍽️ **الطعام والشراب:**
• جميع الوجبات حلال 100%
• خيارات متنوعة للنباتيين
• مراعاة التقاليد السعودية في تقديم الطعام

🎪 **المناسبات والمواسم:**
• فعاليات خاصة في رمضان
• احتفالات اليوم الوطني
• أنشطة موسم الرياض
• فعاليات الصيف والشتاء"""
            
            suggestions = [
                "أنشطة تراثية سعودية",
                "أوقات الأنشطة والصلاة",
                "آداب التعامل في الأنشطة",
                "الفعاليات الموسمية"
            ]
            
            helpful_tips = [
                "احترم التقاليد المحلية دائماً",
                "تحقق من أوقات الصلاة قبل الحجز",
                "اسأل عن الأنشطة المناسبة لعائلتك"
            ]
        else:
            message = """Cultural Guide for Social Activities in Saudi Arabia 🇸🇦

🎮 **Local Games & Activities:**
• **Traditional Board Games:** Backgammon, Dominos, Card games
• **Modern Gaming:** PlayStation, Trading cards, Strategy games  
• **Outdoor Activities:** Camping, Desert trips, Water sports
• **Family Activities:** Parks, Malls, Entertainment centers

⏰ **Activity Timing:**
• All activities respect prayer times
• Special family hours on weekends
• Evening events after Maghrib prayer
• Early morning activities in summer

👥 **Social Interaction:**
• Mixed events for families
• Separate activities for men and women
• Youth-specific events
• All-ages appropriate activities

🍽️ **Food & Beverages:**
• All meals are 100% Halal
• Diverse vegetarian options
• Respects Saudi serving traditions

🎪 **Special Occasions & Seasons:**
• Special Ramadan events
• National Day celebrations
• Riyadh Season activities
• Summer and winter festivals"""
            
            suggestions = [
                "Traditional Saudi activities",
                "Activity timing and prayer",
                "Social etiquette in activities", 
                "Seasonal events"
            ]
            
            helpful_tips = [
                "Always respect local traditions",
                "Check prayer times before booking",
                "Ask about family-appropriate activities"
            ]
        
        # Update session data
        if "cultural_guidance" not in session_data["completed_steps"]:
            session_data["completed_steps"].append("cultural_guidance")
        session_data["step_data"]["cultural_guidance_provided"] = True
        self._save_session_data(session_data["session_id"], session_data)
        
        return OnboardingResponse(
            session_id=session_data["session_id"],
            message=message,
            suggestions=suggestions,
            next_steps=["Explore culturally appropriate activities", "Setup location preferences"],
            current_step="cultural_guidance",
            progress_percentage=70,
            helpful_tips=helpful_tips
        )
    
    def process_onboarding_inquiry(self, message: str, session_id: str, language: str = "ar") -> str:
        """Process general onboarding inquiry with intelligent routing"""
        
        # Analyze message content for intent
        message_lower = message.lower()
        
        # Registration related keywords
        registration_keywords = [
            "register", "تسجيل", "حساب", "account", "signup", "sign up",
            "password", "كلمة مرور", "email", "بريد", "verification", "تأكيد"
        ]
        
        # Profile setup keywords  
        profile_keywords = [
            "profile", "ملف", "شخصي", "photo", "صورة", "bio", "نبذة",
            "preferences", "تفضيلات", "interests", "اهتمامات"
        ]
        
        # Feature tour keywords
        feature_keywords = [
            "features", "ميزات", "tour", "جولة", "how", "كيف", "what", "ماذا",
            "platform", "منصة", "help", "مساعدة"
        ]
        
        # Cultural guidance keywords
        cultural_keywords = [
            "saudi", "سعودي", "culture", "ثقافة", "tradition", "تقاليد",
            "prayer", "صلاة", "halal", "حلال", "family", "عائلة"
        ]
        
        # Route to appropriate handler
        try:
            if any(keyword in message_lower for keyword in registration_keywords):
                response = self.process_registration_help(message, session_id, language)
            elif any(keyword in message_lower for keyword in profile_keywords):
                response = self.process_profile_setup(message, session_id, language)
            elif any(keyword in message_lower for keyword in feature_keywords):
                response = self.process_feature_tour(message, session_id, language)
            elif any(keyword in message_lower for keyword in cultural_keywords):
                response = self.process_cultural_guidance(message, session_id, language)
            else:
                # General onboarding help
                response = self._provide_general_onboarding_help(message, session_id, language)
            
            return response.message
            
        except Exception as e:
            print(f"Error in onboarding inquiry: {e}")
            
            # Fallback response
            if language == "ar":
                return f"مرحباً! أنا سيلينا، مساعدتك في لودوس. أواجه صعوبة في فهم طلبك حالياً، ولكن يمكنني مساعدتك في إعداد حسابك. ما الذي تحتاج مساعدة فيه؟ (تلقيت: {message})"
            else:
                return f"Hello! I'm Selena, your LUDUS assistant. I'm having trouble understanding your request right now, but I can help you set up your account. What do you need help with? (Received: {message})"
    
    def _provide_general_onboarding_help(self, message: str, session_id: str, language: str) -> OnboardingResponse:
        """Provide general onboarding assistance"""
        session_data = self._load_session_data(session_id)
        
        if not session_data:
            # Start new session
            return self.start_onboarding_session(OnboardingSessionRequest(language=language))
        
        if language == "ar":
            message = """أهلاً وسهلاً! أنا سيلينا، مساعدتك الشخصية في لودوس 🌟

يسعدني مساعدتك في إعداد حسابك والتعرف على منصة لودوس. أستطيع مساعدتك في:

🔧 **إعداد الحساب:**
• إنشاء حساب جديد
• تأكيد البريد الإلكتروني  
• إعداد الملف الشخصي
• اختيار التفضيلات

🎯 **التعرف على المنصة:**
• جولة في الميزات المختلفة
• شرح كيفية البحث والحجز
• فهم نظام المكافآت
• التعرف على المجتمع

🇸🇦 **التوجيه الثقافي:**
• الأنشطة المناسبة للثقافة السعودية
• أوقات الأنشطة وعلاقتها بالصلاة
• الآداب الاجتماعية في الأنشطة

قل لي بماذا تريد أن أساعدك اليوم؟"""
            
            suggestions = [
                "إنشاء حساب جديد",
                "جولة في ميزات المنصة",
                "التوجيه الثقافي",
                "مساعدة فورية"
            ]
        else:
            message = """Hello! I'm Selena, your personal LUDUS assistant 🌟

I'm happy to help you set up your account and get familiar with the LUDUS platform. I can assist you with:

🔧 **Account Setup:**
• Creating a new account
• Email verification
• Profile setup
• Choosing preferences  

🎯 **Platform Orientation:**
• Tour of different features
• How to search and book activities
• Understanding the rewards system
• Getting to know the community

🇸🇦 **Cultural Guidance:**
• Activities suitable for Saudi culture
• Activity timing related to prayer times
• Social etiquette in activities

What would you like help with today?"""
            
            suggestions = [
                "Create new account",
                "Platform features tour",
                "Cultural guidance",
                "Immediate help"
            ]
        
        return OnboardingResponse(
            session_id=session_data["session_id"],
            message=message,
            suggestions=suggestions,
            next_steps=["Choose what you need help with", "Start your LUDUS journey"],
            current_step=session_data.get("current_step", "welcome"),
            progress_percentage=session_data.get("progress_percentage", 10),
            helpful_tips=["I'm here to help every step of the way", "You can switch languages anytime"]
        )