Pages
 Welcome
 import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, Users, MapPin, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  {
    icon: Heart,
    title: "CHOOSE INTERESTS",
    titleAr: "اختر اهتماماتك", 
    description: "Select activities you love",
    descriptionAr: "اختر الأنشطة التي تحبها"
  },
  {
    icon: MapPin,
    title: "FIND & DISCOVER",
    titleAr: "ابحث واكتشف",
    description: "Explore activities near you",
    descriptionAr: "استكشف الأنشطة بالقرب منك"
  },
  {
    icon: Users,
    title: "CONNECT & PARTICIPATE",
    titleAr: "تواصل وشارك",
    description: "Join others with shared interests",
    descriptionAr: "انضم إلى آخرين يشاركونك الاهتمامات"
  }
];

export default function Welcome() {
  const [currentStep, setCurrentStep] = useState(0);
  const [language, setLanguage] = useState('ar');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const isRTL = language === 'ar';

  return (
    <div className={`min-h-screen bg-gradient-to-br from-yellow-400 via-pink-400 to-blue-400 neo-brutalist-bg relative overflow-hidden ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Decorative Elements */}
      <div className="absolute top-20 left-8 w-16 h-16 bg-green-400 brutalist-border brutalist-shadow rotate-12"></div>
      <div className="absolute top-40 right-12 w-12 h-12 bg-red-400 brutalist-border brutalist-shadow -rotate-12"></div>
      <div className="absolute bottom-32 left-16 w-20 h-8 bg-blue-500 brutalist-border brutalist-shadow rotate-6"></div>
      
      <div className="relative z-10 px-6 py-12 flex flex-col min-h-screen">
        {/* Language Toggle */}
        <div className="flex justify-end mb-8">
          <div className="brutalist-border bg-white brutalist-shadow">
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="px-4 py-2 brutalist-text text-sm hover:bg-gray-100 transition-colors"
            >
              {language === 'en' ? 'العربية' : 'ENGLISH'}
            </button>
          </div>
        </div>

        {/* Logo */}
        <motion.div 
          className="text-center mb-16"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl brutalist-text mb-4 text-black">
            LUDUS
          </h1>
          <div className="w-24 h-1 bg-black mx-auto"></div>
        </motion.div>

        {/* Animated Steps */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: isRTL ? -100 : 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRTL ? 100 : -100 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <div className="w-32 h-32 mx-auto mb-8 bg-white brutalist-border brutalist-shadow flex items-center justify-center transform rotate-3">
                  {React.createElement(steps[currentStep].icon, { className: "w-16 h-16 text-black" })}
                </div>
                
                <h2 className="text-2xl brutalist-text mb-4 text-black">
                  {isRTL ? steps[currentStep].titleAr : steps[currentStep].title}
                </h2>
                
                <p className="text-lg text-black font-bold max-w-xs mx-auto">
                  {isRTL ? steps[currentStep].descriptionAr : steps[currentStep].description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Step Indicators */}
            <div className="flex justify-center space-x-2 mb-12">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 brutalist-border transition-colors duration-300 ${
                    index === currentStep ? 'bg-black' : 'bg-white'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <Link to={createPageUrl("Registration")} className="block">
              <Button className="w-full bg-green-400 hover:bg-green-500 brutalist-border brutalist-shadow brutalist-shadow-hover brutalist-text text-lg h-14 text-black transition-all duration-200">
                {isRTL ? 'ابدأ رحلتك' : 'START YOUR JOURNEY'}
                <ArrowRight className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'} ${isRTL ? 'rotate-180' : ''}`} />
              </Button>
            </Link>
          </motion.div>

          <div className="text-center">
            <p className="text-black font-bold">
              {isRTL ? 'بياناتك آمنة معنا' : 'YOUR DATA IS SAFE WITH US'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
Registration
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Registration() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('ar');
  
  const isRTL = language === 'ar';

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await User.loginWithRedirect(window.location.origin + createPageUrl("Profile"));
    } catch (error) {
      console.error("Google sign in error:", error);
    }
    setLoading(false);
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // For demo purposes, we'll simulate email signup
      // In real app, this would integrate with authentication system
      const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      await User.updateMyUserData({
        referral_code: referralCode,
        preferred_language: language
      });
      
      navigate(createPageUrl("Profile"));
    } catch (error) {
      console.error("Email signup error:", error);
    }
    
    setLoading(false);
  };

  const texts = {
    en: {
      title: "JOIN LUDUS",
      subtitle: "Connect & Discover Activities",
      googleBtn: "CONTINUE WITH GOOGLE",
      or: "OR",
      email: "Email Address",
      password: "Password",
      signupBtn: "CREATE ACCOUNT",
      privacy: "Your data is safe with us",
      lang: "العربية"
    },
    ar: {
      title: "انضم إلى LUDUS",
      subtitle: "تواصل واكتشف الأنشطة",
      googleBtn: "متابعة بحساب جوجل",
      or: "أو",
      email: "عنوان البريد الإلكتروني",
      password: "كلمة المرور",
      signupBtn: "إنشاء حساب",
      privacy: "بياناتك آمنة معنا",
      lang: "ENGLISH"
    }
  };

  const t = texts[language];

  return (
    <div className={`min-h-screen bg-pink-50 p-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Language Toggle */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          className="brutalist-border bg-white brutalist-shadow px-4 py-2 brutalist-text text-sm hover:bg-gray-100 transition-colors"
        >
          {t.lang}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-sm mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl brutalist-text mb-3 text-black">
            {t.title}
          </h1>
          <p className="text-lg font-bold text-gray-800">
            {t.subtitle}
          </p>
          <div className="w-16 h-1 bg-pink-400 mx-auto mt-4"></div>
        </div>

        <div className="space-y-6">
          {/* Google Sign In */}
          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-blue-400 hover:bg-blue-500 brutalist-border brutalist-shadow brutalist-shadow-hover brutalist-text h-14 text-black transition-all duration-200"
          >
            <svg className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'}`} viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t.googleBtn}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-3 border-black"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-pink-50 brutalist-text text-black">
                {t.or}
              </span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailSignUp} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="brutalist-text text-black mb-2 block">
                  {t.email}
                </Label>
                <div className="relative">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="brutalist-border h-12 bg-white pl-12 pr-4 brutalist-text"
                    required
                  />
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-600" />
                </div>
              </div>

              <div>
                <Label className="brutalist-text text-black mb-2 block">
                  {t.password}
                </Label>
                <div className="relative">
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="brutalist-border h-12 bg-white pl-12 pr-4 brutalist-text"
                    required
                  />
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-600" />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-green-400 hover:bg-green-500 brutalist-border brutalist-shadow brutalist-shadow-hover brutalist-text h-14 text-black transition-all duration-200"
            >
              {t.signupBtn}
              <ArrowRight className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'} ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
          </form>

          {/* Privacy Notice */}
          <div className="text-center">
            <p className="text-sm font-bold text-gray-700 bg-white brutalist-border px-4 py-2 inline-block brutalist-shadow">
              {t.privacy}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
profile
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/entities/User";
import { UploadFile } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Camera, User as UserIcon, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { FaInstagram, FaFacebook, FaSnapchatGhost } from "react-icons/fa";

const SocialInput = ({ icon, ...props }) => (
  <div className="relative">
    <Input {...props} className="brutalist-border h-12 bg-white pl-12 pr-4 brutalist-text" />
    <div className="absolute left-3 top-3.5 w-5 h-5 text-gray-600">
      {icon}
    </div>
  </div>
);

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    display_name: "",
    bio: "",
    profile_photo_url: "",
    instagram: "",
    facebook: "",
    snapchat: ""
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [language, setLanguage] = useState('ar');
  
  const isRTL = language === 'ar';

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await User.me();
      if (userData) {
        setFormData({
          display_name: userData.display_name || "",
          bio: userData.bio || "",
          profile_photo_url: userData.profile_photo_url || "",
          instagram: userData.instagram || "",
          facebook: userData.facebook || "",
          snapchat: userData.snapchat || ""
        });
        setLanguage(userData.preferred_language || "ar");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handlePhotoUpload = async (file) => {
    setUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setFormData(prev => ({ ...prev, profile_photo_url: file_url }));
    } catch (error) {
      console.error("Error uploading photo:", error);
    }
    setUploading(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handlePhotoUpload(file);
    }
  };
  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await User.updateMyUserData({
        ...formData,
        profile_completed: true,
        preferred_language: language
      });
      navigate(createPageUrl("Interests"));
    } catch (error) {
      console.error("Error saving profile:", error);
    }
    setSaving(false);
  };

  const handleSkip = () => {
    navigate(createPageUrl("Interests"));
  };

  const texts = {
    en: {
      title: "SETUP PROFILE",
      subtitle: "Help others discover you",
      photoLabel: "Profile Photo",
      nameLabel: "Display Name",
      namePlaceholder: "How should others call you?",
      bioLabel: "Bio (Optional)",
      bioPlaceholder: "Tell us about yourself...",
      socialLabel: "Social Networks (Optional)",
      instagramPlaceholder: "Instagram username",
      facebookPlaceholder: "Facebook profile URL",
      snapchatPlaceholder: "Snapchat username",
      langLabel: "Preferred Language",
      saveBtn: "CONTINUE",
      skipBtn: "COMPLETE LATER",
      uploadingText: "UPLOADING...",
      lang: "العربية"
    },
    ar: {
      title: "إعداد الملف الشخصي",
      subtitle: "ساعد الآخرين على اكتشافك",
      photoLabel: "الصورة الشخصية",
      nameLabel: "اسم العرض",
      namePlaceholder: "كيف يجب أن يناديك الآخرون؟",
      bioLabel: "النبذة الشخصية (اختيارية)",
      bioPlaceholder: "أخبرنا عن نفسك...",
      socialLabel: "الشبكات الاجتماعية (اختياري)",
      instagramPlaceholder: "اسم مستخدم انستغرام",
      facebookPlaceholder: "رابط ملف فيسبوك",
      snapchatPlaceholder: "اسم مستخدم سناب شات",
      langLabel: "اللغة المفضلة",
      saveBtn: "متابعة",
      skipBtn: "إكمال لاحقاً",
      uploadingText: "جاري الرفع...",
      lang: "ENGLISH"
    }
  };

  const t = texts[language];

  return (
    <div className={`min-h-screen bg-blue-50 p-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          className="brutalist-border bg-white brutalist-shadow px-4 py-2 brutalist-text text-sm hover:bg-gray-100 transition-colors"
        >
          {t.lang}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-sm mx-auto"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl brutalist-text mb-2 text-black">{t.title}</h1>
          <p className="text-lg font-bold text-gray-800">{t.subtitle}</p>
          <div className="w-16 h-1 bg-blue-400 mx-auto mt-4"></div>
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <Label className="brutalist-text text-black mb-4 block">{t.photoLabel}</Label>
            <div className="relative inline-block">
              <div className="w-32 h-32 brutalist-border brutalist-shadow bg-white flex items-center justify-center overflow-hidden">
                {formData.profile_photo_url ? (
                  <img src={formData.profile_photo_url} alt="Profile" className="w-full h-full object-cover"/>
                ) : (
                  <UserIcon className="w-16 h-16 text-gray-400" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-400 hover:bg-green-500 brutalist-border brutalist-shadow brutalist-shadow-hover rounded-full flex items-center justify-center transition-all duration-200"
              >
                {uploading ? <div className="w-4 h-4 border-2 border-black border-t-transparent animate-spin rounded-full"></div> : <Camera className="w-5 h-5 text-black" />}
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
            {uploading && <p className="text-sm font-bold text-gray-700 mt-2">{t.uploadingText}</p>}
          </div>

          <div>
            <Label className="brutalist-text text-black mb-2 block">{t.nameLabel}</Label>
            <Input value={formData.display_name} onChange={(e) => handleInputChange('display_name', e.target.value)} placeholder={t.namePlaceholder} className="brutalist-border h-12 bg-white brutalist-text" />
          </div>

          <div>
            <Label className="brutalist-text text-black mb-2 block">{t.bioLabel}</Label>
            <Textarea value={formData.bio} onChange={(e) => handleInputChange('bio', e.target.value.slice(0, 160))} placeholder={t.bioPlaceholder} maxLength={160} className="brutalist-border bg-white brutalist-text h-20 resize-none" />
            <div className="text-right text-xs text-gray-600 mt-1">{formData.bio.length}/160</div>
          </div>
          
          <div className="space-y-4">
            <Label className="brutalist-text text-black block">{t.socialLabel}</Label>
            <SocialInput icon={<FaInstagram/>} value={formData.instagram} onChange={(e) => handleInputChange('instagram', e.target.value)} placeholder={t.instagramPlaceholder} />
            <SocialInput icon={<FaFacebook/>} value={formData.facebook} onChange={(e) => handleInputChange('facebook', e.target.value)} placeholder={t.facebookPlaceholder} />
            <SocialInput icon={<FaSnapchatGhost/>} value={formData.snapchat} onChange={(e) => handleInputChange('snapchat', e.target.value)} placeholder={t.snapchatPlaceholder} />
          </div>

          <div>
            <Label className="brutalist-text text-black mb-2 block">{t.langLabel}</Label>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setLanguage('en')} className={`p-3 brutalist-border brutalist-shadow transition-all duration-200 ${language === 'en' ? 'bg-blue-400 text-black' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
                <div className="brutalist-text text-sm">ENGLISH</div>
              </button>
              <button onClick={() => setLanguage('ar')} className={`p-3 brutalist-border brutalist-shadow transition-all duration-200 ${language === 'ar' ? 'bg-blue-400 text-black' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
                <div className="brutalist-text text-sm">العربية</div>
              </button>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <Button onClick={handleSave} disabled={saving} className="w-full bg-green-400 hover:bg-green-500 brutalist-border brutalist-shadow brutalist-shadow-hover brutalist-text h-14 text-black transition-all duration-200">
              {t.saveBtn}
              <ArrowRight className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'} ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
            <Button onClick={handleSkip} variant="outline" className="w-full brutalist-border brutalist-shadow bg-white hover:bg-gray-50 brutalist-text h-12 text-black transition-all duration-200">{t.skipBtn}</Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
Interests

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import InterestCard from "../components/interests/InterestCard";

const interests = [
  {
    id: "sports_fitness",
    icon: "💪",
    titleEn: "SPORTS & FITNESS",
    titleAr: "الرياضة واللياقة",
    color: "bg-red-400"
  },
  {
    id: "food_dining", 
    icon: "🍽️",
    titleEn: "FOOD & DINING",
    titleAr: "الطعام والمطاعم",
    color: "bg-orange-400"
  },
  {
    id: "arts_culture",
    icon: "🎨",
    titleEn: "ARTS & CULTURE",
    titleAr: "الفنون والثقافة",
    color: "bg-purple-400"
  },
  {
    id: "entertainment",
    icon: "🎬",
    titleEn: "ENTERTAINMENT", 
    titleAr: "الترفيه",
    color: "bg-pink-400"
  },
  {
    id: "learning_workshops",
    icon: "📚",
    titleEn: "LEARNING & WORKSHOPS",
    titleAr: "التعلم وورش العمل",
    color: "bg-blue-400"
  },
  {
    id: "outdoor_adventures",
    icon: "🏕️",
    titleEn: "OUTDOOR ADVENTURES",
    titleAr: "المغامرات الخارجية",
    color: "bg-green-400"
  },
  {
    id: "social_events",
    icon: "🎉",
    titleEn: "SOCIAL EVENTS",
    titleAr: "الفعاليات الاجتماعية",
    color: "bg-yellow-400"
  }
];

export default function Interests() {
  const navigate = useNavigate();
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [saving, setSaving] = useState(false);
  const [language, setLanguage] = useState('ar'); // Changed default language to 'ar'
  
  const isRTL = language === 'ar';

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await User.me();
      if (userData) {
        setSelectedInterests(userData.interests || []);
        setLanguage(userData.preferred_language || "ar"); // Changed fallback language to 'ar'
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const toggleInterest = (interestId) => {
    setSelectedInterests(prev => {
      if (prev.includes(interestId)) {
        return prev.filter(id => id !== interestId);
      } else if (prev.length < 12) {
        return [...prev, interestId];
      }
      return prev;
    });
  };

  const handleSave = async () => {
    if (selectedInterests.length < 3) return;
    
    setSaving(true);
    try {
      await User.updateMyUserData({
        interests: selectedInterests,
        interests_selected: true
      });
      navigate(createPageUrl("Referral"));
    } catch (error) {
      console.error("Error saving interests:", error);
    }
    setSaving(false);
  };

  const handleSkip = () => {
    navigate(createPageUrl("Referral"));
  };

  const texts = {
    en: {
      title: "CHOOSE INTERESTS",
      subtitle: "Select 3-12 activities you love",
      continueBtn: "CONTINUE",
      skipBtn: "SKIP FOR NOW",
      minError: "Select at least 3 interests",
      selected: "SELECTED",
      lang: "العربية"
    },
    ar: {
      title: "اختر اهتماماتك",
      subtitle: "اختر من 3-12 نشاط تحبه",
      continueBtn: "متابعة",
      skipBtn: "تخطي الآن",
      minError: "اختر على الأقل 3 اهتمامات",
      selected: "مختار",
      lang: "ENGLISH"
    }
  };

  const t = texts[language];

  return (
    <div className={`min-h-screen bg-green-50 p-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Language Toggle */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          className="brutalist-border bg-white brutalist-shadow px-4 py-2 brutalist-text text-sm hover:bg-gray-100 transition-colors"
        >
          {t.lang}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-lg mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          {/* Logo */}
          <img src="/logo.svg" alt="LUDUS Logo" className="mx-auto h-16 w-auto mb-4" />
          <h1 className="text-3xl brutalist-text mb-2 text-black">
            {t.title}
          </h1>
          <p className="text-lg font-bold text-gray-800">
            {t.subtitle}
          </p>
          <div className="w-16 h-1 bg-green-400 mx-auto mt-4"></div>
        </div>

        {/* Selection Counter */}
        <div className="text-center mb-6">
          <div className="inline-block bg-white brutalist-border brutalist-shadow px-4 py-2">
            <span className="brutalist-text text-black">
              {selectedInterests.length}/12 {t.selected}
            </span>
          </div>
        </div>

        {/* Interest Grid */}
        <div className={`grid grid-cols-2 gap-4 mb-8 ${isRTL ? 'grid-flow-col-dense' : ''}`}>
          {interests.map((interest, index) => (
            <motion.div
              key={interest.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <InterestCard
                interest={interest}
                isSelected={selectedInterests.includes(interest.id)}
                onClick={() => toggleInterest(interest.id)}
                language={language}
              />
            </motion.div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {selectedInterests.length < 3 && (
            <div className="text-center">
              <p className="text-red-600 font-bold bg-red-100 brutalist-border border-red-300 px-4 py-2 inline-block brutalist-shadow">
                {t.minError}
              </p>
            </div>
          )}

          <Button
            onClick={handleSave}
            disabled={saving || selectedInterests.length < 3}
            className={`w-full brutalist-border brutalist-shadow brutalist-shadow-hover brutalist-text h-14 text-black transition-all duration-200 ${
              selectedInterests.length >= 3 
                ? 'bg-green-400 hover:bg-green-500' 
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {t.continueBtn}
            <ArrowRight className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'} ${isRTL ? 'rotate-180' : ''}`} />
          </Button>
          
          <Button
            onClick={handleSkip}
            variant="outline"
            className="w-full brutalist-border brutalist-shadow bg-white hover:bg-gray-50 brutalist-text h-12 text-black transition-all duration-200"
          >
            {t.skipBtn}
          </Button>
        </div>

        {/* Social Profiles */}
        <div className="text-center mt-8">
          <p className="text-gray-600 mb-2 brutalist-text">تابعنا على:</p>
          <div className="flex justify-center space-x-4">
            <a href="https://www.facebook.com/yourluduspage" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 brutalist-text">فيسبوك</a>
            <a href="https://www.instagram.com/yourluduspage" target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-800 brutalist-text">انستغرام</a>
            <a href="https://www.twitter.com/yourluduspage" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600 brutalist-text">تويتر</a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
Referral

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Gift, Share, Copy, Users, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import QRCodeGenerator from "../components/referral/QRCodeGenerator";
import ShareButtons from "../components/referral/ShareButtons";

export default function Referral() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [language, setLanguage] = useState('ar'); // Changed default language to 'ar'
  const [copied, setCopied] = useState(false);
  
  const isRTL = language === 'ar';

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await User.me();
      setUserData(user);
      setLanguage(user.preferred_language || 'ar'); // Changed fallback language to 'ar'
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const referralUrl = userData ? `${window.location.origin}/invite/${userData.referral_code}` : "";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFinish = async () => {
    try {
      await User.updateMyUserData({
        onboarding_completed: true
      });
      navigate(createPageUrl("Dashboard"));
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };

  const texts = {
    en: {
      title: "SHARE LUDUS",
      subtitle: "Invite friends & earn rewards",
      reward: "Get 5 SAR for each friend who joins",
      qrTitle: "QR CODE",
      linkTitle: "INVITATION LINK", 
      copyBtn: "COPY LINK",
      copiedText: "COPIED!",
      finishBtn: "START EXPLORING",
      skipBtn: "SKIP FOR NOW",
      shareText: "Join me on LUDUS - discover amazing activities near you!",
      lang: "العربية"
    },
    ar: {
      title: "شارك LUDUS",
      subtitle: "ادع الأصدقاء واحصل على مكافآت",
      reward: "احصل على 5 ريال لكل صديق ينضم",
      qrTitle: "رمز الاستجابة السريعة",
      linkTitle: "رابط الدعوة",
      copyBtn: "نسخ الرابط", 
      copiedText: "تم النسخ!",
      finishBtn: "ابدأ الاستكشاف",
      skipBtn: "تخطي الآن",
      shareText: "انضم إلي على LUDUS - اكتشف أنشطة رائعة بالقرب منك!",
      lang: "ENGLISH"
    }
  };

  const t = texts[language];

  if (!userData) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-black border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-yellow-50 p-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Language Toggle */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          className="brutalist-border bg-white brutalist-shadow px-4 py-2 brutalist-text text-sm hover:bg-gray-100 transition-colors"
        >
          {t.lang}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-sm mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-yellow-400 brutalist-border brutalist-shadow flex items-center justify-center transform rotate-3">
            <Gift className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-3xl brutalist-text mb-2 text-black">
            {t.title}
          </h1>
          <p className="text-lg font-bold text-gray-800">
            {t.subtitle}
          </p>
          <div className="w-16 h-1 bg-yellow-400 mx-auto mt-4"></div>
        </div>

        {/* Reward Banner */}
        <div className="bg-green-400 brutalist-border brutalist-shadow p-4 mb-8 transform -rotate-1">
          <div className="text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-black" />
            <p className="brutalist-text text-black text-sm">
              {t.reward}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* QR Code */}
          <div className="text-center">
            <h3 className="brutalist-text text-black mb-4">
              {t.qrTitle}
            </h3>
            <QRCodeGenerator url={referralUrl} />
          </div>

          {/* Invitation Link */}
          <div>
            <h3 className="brutalist-text text-black mb-3">
              {t.linkTitle}
            </h3>
            <div className="flex gap-2">
              <div className="flex-1 bg-white brutalist-border p-3 text-sm font-mono break-all">
                {referralUrl}
              </div>
              <Button
                onClick={copyToClipboard}
                className={`brutalist-border brutalist-shadow brutalist-shadow-hover transition-all duration-200 ${
                  copied ? 'bg-green-400' : 'bg-blue-400 hover:bg-blue-500'
                }`}
              >
                {copied ? (
                  <span className="brutalist-text text-xs text-black">
                    {t.copiedText}
                  </span>
                ) : (
                  <Copy className="w-4 h-4 text-black" />
                )}
              </Button>
            </div>
          </div>

          {/* Share Buttons */}
          <ShareButtons 
            url={referralUrl}
            text={t.shareText}
            language={language}
          />

          {/* Action Buttons */}
          <div className="space-y-3 pt-6">
            <Button
              onClick={handleFinish}
              className="w-full bg-green-400 hover:bg-green-500 brutalist-border brutalist-shadow brutalist-shadow-hover brutalist-text h-14 text-black transition-all duration-200"
            >
              {t.finishBtn}
              <ArrowRight className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'} ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
            
            <Button
              onClick={handleFinish}
              variant="outline"
              className="w-full brutalist-border brutalist-shadow bg-white hover:bg-gray-50 brutalist-text h-12 text-black transition-all duration-200"
            >
              {t.skipBtn}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
Profile

import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, Users, MapPin, Settings } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [language, setLanguage] = useState('ar'); // Changed default language to 'ar'
  const [loading, setLoading] = useState(true);
  
  const isRTL = language === 'ar';

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await User.me();
      setUserData(user);
      setLanguage(user.preferred_language || 'ar'); // Changed fallback language to 'ar'
    } catch (error) {
      console.error("Error loading user data:", error);
    }
    setLoading(false);
  };

  const texts = {
    en: {
      welcome: "WELCOME TO LUDUS",
      subtitle: "Your social marketplace for activities",
      walletTitle: "Wallet Balance",
      activitiesTitle: "Activities Near You",
      comingSoon: "COMING SOON!",
      comingSoonDesc: "We're working hard to bring you amazing activities",
      profileBtn: "VIEW PROFILE",
      socialTitle: "Connect With Us", // Added social title
      lang: "العربية"
    },
    ar: {
      welcome: "مرحباً بك في LUDUS",
      subtitle: "سوقك الاجتماعي للأنشطة",
      walletTitle: "رصيد المحفظة",
      activitiesTitle: "الأنشطة بالقرب منك",
      comingSoon: "قريباً!",
      comingSoonDesc: "نعمل بجد لنقدم لك أنشطة رائعة",
      profileBtn: "عرض الملف الشخصي",
      socialTitle: "تواصل معنا", // Added social title
      lang: "ENGLISH"
    }
  };

  const t = texts[language];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-black border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-blue-50 p-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Language Toggle */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          className="brutalist-border bg-white brutalist-shadow px-4 py-2 brutalist-text text-sm hover:bg-gray-100 transition-colors"
        >
          {t.lang}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          {/* Ludus Logo */}
          <img src="/ludus_logo.svg" alt="Ludus Logo" className="w-24 h-24 mx-auto mb-4 object-contain" /> 
          <h1 className="text-3xl brutalist-text mb-2 text-black">
            {t.welcome}
          </h1>
          <p className="text-lg font-bold text-gray-800">
            {t.subtitle}
          </p>
          <div className="w-16 h-1 bg-yellow-400 mx-auto mt-4"></div>
        </div>

        {/* User Info */}
        {userData && (
          <Card className="brutalist-border brutalist-shadow mb-6 bg-white">
            <CardHeader className="text-center">
              {userData.profile_photo_url && (
                <div className="w-20 h-20 mx-auto mb-4 brutalist-border brutalist-shadow overflow-hidden">
                  <img 
                    src={userData.profile_photo_url} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardTitle className="brutalist-text text-black">
                {userData.display_name || userData.full_name || "USER"}
              </CardTitle>
            </CardHeader>
          </Card>
        )}

        {/* Wallet */}
        <Card className="brutalist-border brutalist-shadow mb-6 bg-green-400">
          <CardHeader>
            <CardTitle className="brutalist-text text-black flex items-center">
              <Gift className="w-6 h-6 mr-2" />
              {t.walletTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl brutalist-text text-black">
              {userData?.wallet_balance || 0} SAR
            </div>
          </CardContent>
        </Card>

        {/* Coming Soon */}
        <Card className="brutalist-border brutalist-shadow mb-6 bg-yellow-400">
          <CardHeader>
            <CardTitle className="brutalist-text text-black flex items-center">
              <MapPin className="w-6 h-6 mr-2" />
              {t.activitiesTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="brutalist-text text-2xl mb-2 text-black">
                {t.comingSoon}
              </h3>
              <p className="font-bold text-black">
                {t.comingSoonDesc}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Social Profiles */}
        <Card className="brutalist-border brutalist-shadow mb-6 bg-blue-400">
          <CardHeader>
            <CardTitle className="brutalist-text text-black flex items-center">
              <Users className="w-6 h-6 mr-2" />
              {t.socialTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <a href="https://twitter.com/ludus" target="_blank" rel="noopener noreferrer" className="brutalist-text text-black hover:underline">
              Twitter
            </a>
            <a href="https://instagram.com/ludus" target="_blank" rel="noopener noreferrer" className="brutalist-text text-black hover:underline">
              Instagram
            </a>
            <a href="https://facebook.com/ludus" target="_blank" rel="noopener noreferrer" className="brutalist-text text-black hover:underline">
              Facebook
            </a>
          </CardContent>
        </Card>

        {/* Profile Button */}
        <Button
          onClick={() => window.open('/dashboard', '_blank')}
          className="w-full bg-blue-400 hover:bg-blue-500 brutalist-border brutalist-shadow brutalist-shadow-hover brutalist-text h-14 text-black transition-all duration-200"
        >
          <Settings className="w-5 h-5 mr-2" />
          {t.profileBtn}
        </Button>
      </motion.div>
    </div>
  );
}
Components
 Interests
  InterestCard
  import React from "react";
import { Check } from "lucide-react";

export default function InterestCard({ interest, isSelected, onClick, language }) {
  const title = language === 'ar' ? interest.titleAr : interest.titleEn;
  
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 brutalist-border brutalist-shadow brutalist-shadow-hover transition-all duration-200 transform hover:scale-105 ${
        isSelected 
          ? `${interest.color} text-black brutalist-shadow-hover` 
          : 'bg-white text-gray-700 hover:bg-gray-50'
      }`}
    >
      <div className="text-center space-y-2">
        <div className="text-2xl mb-2">
          {interest.icon}
        </div>
        <div className="brutalist-text text-xs leading-tight">
          {title}
        </div>
        {isSelected && (
          <div className="absolute top-2 right-2">
            <Check className="w-5 h-5 text-black" />
          </div>
        )}
      </div>
    </button>
  );
}
Referral
 QrCodeGenerator
 import React, { useEffect, useRef, useCallback } from "react";

export default function QRCodeGenerator({ url }) {
  const canvasRef = useRef(null);

  const generateQR = useCallback(() => {
    if (!url || !canvasRef.current) return;

    // Simple QR-like pattern generator for demo
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const size = 200;
    const cellSize = size / 20;
    
    canvas.width = size;
    canvas.height = size;
    
    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    
    // Generate pattern based on URL
    ctx.fillStyle = '#000000';
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 20; j++) {
        const hash = url.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0);
        
        if ((hash + i * j) % 3 === 0) {
          ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
      }
    }
    
    // Corner markers
    const corners = [[0, 0], [0, 13], [13, 0]];
    corners.forEach(([x, y]) => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(x * cellSize, y * cellSize, cellSize * 7, cellSize * 7);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect((x + 1) * cellSize, (y + 1) * cellSize, cellSize * 5, cellSize * 5);
      ctx.fillStyle = '#000000';
      ctx.fillRect((x + 2) * cellSize, (y + 2) * cellSize, cellSize * 3, cellSize * 3);
    });
  }, [url]);

  useEffect(() => {
    generateQR();
  }, [generateQR]);

  return (
    <div className="inline-block bg-white brutalist-border brutalist-shadow p-4">
      <canvas
        ref={canvasRef}
        className="w-48 h-48 brutalist-border"
      />
    </div>
  );
}
 ShareButton
 import React from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Share } from "lucide-react";

export default function ShareButtons({ url, text, language }) {
  const shareViaWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareViaWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'LUDUS',
          text: text,
          url: url
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(`${text} ${url}`);
    }
  };

  const texts = {
    en: {
      whatsapp: "SHARE ON WHATSAPP",
      share: "SHARE LINK"
    },
    ar: {
      whatsapp: "مشاركة عبر الواتساب",
      share: "مشاركة الرابط"
    }
  };

  const t = texts[language];

  return (
    <div className="space-y-3">
      <Button
        onClick={shareViaWhatsApp}
        className="w-full bg-green-500 hover:bg-green-600 brutalist-border brutalist-shadow brutalist-shadow-hover brutalist-text h-12 text-white transition-all duration-200"
      >
        <MessageCircle className="w-5 h-5 mr-2" />
        {t.whatsapp}
      </Button>
      
      <Button
        onClick={shareViaWebShare}
        className="w-full bg-blue-500 hover:bg-blue-600 brutalist-border brutalist-shadow brutalist-shadow-hover brutalist-text h-12 text-white transition-all duration-200"
      >
        <Share className="w-5 h-5 mr-2" />
        {t.share}
      </Button>
    </div>
  );
}
Referral
{
  "name": "Referral",
  "type": "object",
  "properties": {
    "referrer_id": {
      "type": "string",
      "description": "ID of user who made the referral"
    },
    "referred_user_email": {
      "type": "string",
      "description": "Email of referred user"
    },
    "referred_user_id": {
      "type": "string",
      "description": "ID of referred user when they register"
    },
    "reward_amount": {
      "type": "number",
      "default": 5,
      "description": "Reward amount in SAR"
    },
    "status": {
      "type": "string",
      "enum": [
        "pending",
        "completed",
        "expired"
      ],
      "default": "pending",
      "description": "Referral status"
    }
  },
  "required": [
    "referrer_id",
    "referred_user_email"
  ]
}
Layout.js
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const isWelcome = currentPageName === "Welcome";
  
  return (
    <div className="min-h-screen bg-yellow-50" dir="ltr">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;700;900&display=swap');
        
        body {
          font-family: 'IBM Plex Sans Arabic', sans-serif !important;
        }

        :root {
          --brutalist-yellow: #FFE600;
          --brutalist-pink: #FF6B9D;
          --brutalist-blue: #4DABF7;
          --brutalist-green: #51CF66;
          --brutalist-red: #FF6B6B;
          --brutalist-black: #000000;
          --brutalist-white: #FFFFFF;
        }
        
        .brutalist-shadow {
          box-shadow: 4px 4px 0px var(--brutalist-black);
        }
        
        .brutalist-shadow-hover:hover {
          box-shadow: 6px 6px 0px var(--brutalist-black);
          transform: translate(-2px, -2px);
        }
        
        .brutalist-border {
          border: 3px solid var(--brutalist-black);
        }
        
        .brutalist-text {
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -0.02em;
        }

        [dir="rtl"] {
          text-align: right;
        }
        
        [dir="rtl"] .brutalist-shadow {
          box-shadow: -4px 4px 0px var(--brutalist-black);
        }
        
        [dir="rtl"] .brutalist-shadow-hover:hover {
          box-shadow: -6px 6px 0px var(--brutalist-black);
          transform: translate(2px, -2px);
        }

        .neo-brutalist-bg {
          background: linear-gradient(45deg, #FFE600 25%, transparent 25%), 
                      linear-gradient(-45deg, #FFE600 25%, transparent 25%), 
                      linear-gradient(45deg, transparent 75%, #FFE600 75%), 
                      linear-gradient(-45deg, transparent 75%, #FFE600 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        }
      `}</style>

      {!isWelcome && (
        <header className="bg-white brutalist-border border-b-3 border-t-0 border-x-0 relative">
          <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
            {location.pathname !== createPageUrl("Welcome") ? (
              <button 
                onClick={() => window.history.back()}
                className="p-2 brutalist-border brutalist-shadow bg-red-400 hover:bg-red-500 transition-all duration-200 brutalist-shadow-hover"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : <div className="w-9 h-9"></div>}
            <div className="flex items-center gap-2 brutalist-text text-black">
              <div className="w-8 h-8 bg-yellow-400 brutalist-border flex items-center justify-center rotate-[-6deg] brutalist-shadow">
                  L
              </div>
              <span className="text-2xl tracking-wider">LUDUS</span>
            </div>
            <div className="w-9"></div>
          </div>
        </header>
      )}

      <main className="max-w-md mx-auto min-h-screen">
        {children}
      </main>
    </div>
  );
}