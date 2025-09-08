import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { FaInstagram, FaFacebook, FaSnapchatGhost } from "react-icons/fa";
import { 
  ArrowRight, 
  Users, 
  MapPin, 
  Heart, 
  Camera, 
  User as UserIcon, 
  Gift, 
  Share, 
  Copy, 
  Mail, 
  Lock,
  Check
} from "lucide-react";

import { createPageUrl } from "../utils/createPageUrl";
import { User } from "../neoui/entities/User";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { Label } from "../components/ui/Label";
import InterestCard from "../components/onboarding/InterestCard";
import QRCodeGenerator from "../components/onboarding/QRCodeGenerator";
import ShareButtons from "../components/onboarding/ShareButtons";

// Mock UploadFile function for demo purposes
const UploadFile = async ({ file }) => {
  // Simulate file upload
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockUrl = URL.createObjectURL(file);
      resolve({ file_url: mockUrl });
    }, 1000);
  });
};

// Step configurations with hardcoded Arabic text
const steps = [
  {
    icon: Heart,
    title: "اختر اهتماماتك",
    description: "اختر الأنشطة التي تحبها"
  },
  {
    icon: MapPin,
    title: "ابحث واكتشف",
    description: "استكشف الأنشطة القريبة منك"
  },
  {
    icon: Users,
    title: "تواصل وشارك",
    description: "انضم إلى الآخرين الذين يشاركونك نفس الاهتمامات"
  }
];

const interests = [
  {
    id: "sports_fitness",
    icon: "💪",
    title: "الرياضة واللياقة",
    color: "bg-red-400"
  },
  {
    id: "food_dining", 
    icon: "🍽️",
    title: "الطعام والمطاعم",
    color: "bg-orange-400"
  },
  {
    id: "arts_culture",
    icon: "🎨",
    title: "الفنون والثقافة",
    color: "bg-purple-400"
  },
  {
    id: "entertainment",
    icon: "🎬",
    title: "الترفيه",
    color: "bg-pink-400"
  },
  {
    id: "learning_workshops",
    icon: "📚",
    title: "التعلم وورش العمل",
    color: "bg-blue-400"
  },
  {
    id: "outdoor_adventures",
    icon: "🏕️",
    title: "المغامرات الخارجية",
    color: "bg-green-400"
  },
  {
    id: "social_events",
    icon: "🎉",
    title: "الفعاليات الاجتماعية",
    color: "bg-yellow-400"
  }
];

// Welcome Step Component
const WelcomeStep = ({ onNext }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const isRTL = true; // Always Arabic for now

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // No need to wait for i18n initialization since we're using hardcoded text

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
              className="px-4 py-2 brutalist-text text-sm hover:bg-gray-100 transition-colors"
            >
              العربية
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
                  {steps[currentStep].title}
                </h2>
                
                <p className="text-lg text-black font-bold max-w-xs mx-auto">
                  {steps[currentStep].description}
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
            <Button 
              onClick={onNext}
              className="w-full bg-green-400 hover:bg-green-500 brutalist-border brutalist-shadow brutalist-shadow-hover brutalist-text text-lg h-14 text-black transition-all duration-200"
            >
              ابدأ رحلتك
              <ArrowRight className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'} ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
          </motion.div>

          <div className="text-center">
            <p className="text-black font-bold">
              بياناتك آمنة معنا
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Registration Step Component
const RegistrationStep = ({ onNext, onBack }) => {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const isRTL = i18n.language === 'ar';

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      if (window.google) {
        window.google.accounts.id.prompt();
      } else {
        console.error('Google Identity Services not loaded');
      }
    } catch (error) {
      console.error("Google sign in error:", error);
    }
    setLoading(false);
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      await User.updateMyUserData({
        referral_code: referralCode,
        preferred_language: i18n.language
      });
      
      onNext();
    } catch (error) {
      console.error("Email signup error:", error);
    }
    
    setLoading(false);
  };

  return (
    <div className={`min-h-screen bg-pink-50 p-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Language Toggle */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ar' : 'en')}
          className="brutalist-border bg-white brutalist-shadow px-4 py-2 brutalist-text text-sm hover:bg-gray-100 transition-colors"
        >
          {i18n.language === 'en' ? 'العربية' : 'ENGLISH'}
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
            {t('onboarding.registration.title')}
          </h1>
          <p className="text-lg font-bold text-gray-800">
            {t('onboarding.registration.subtitle')}
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
            متابعة مع جوجل
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-3 border-black"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-pink-50 brutalist-text text-black">
                {t('common.or')}
              </span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailSignUp} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="brutalist-text text-black mb-2 block">
                  {t('onboarding.registration.email')}
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
                  {t('onboarding.registration.password')}
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
              {t('onboarding.registration.signupBtn')}
              <ArrowRight className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'} ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
          </form>

          {/* Privacy Notice */}
          <div className="text-center">
            <p className="text-sm font-bold text-gray-700 bg-white brutalist-border px-4 py-2 inline-block brutalist-shadow">
              {t('onboarding.registration.privacy')}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Profile Step Component
const ProfileStep = ({ onNext, onBack }) => {
  const { t, i18n } = useTranslation();
  const fileInputRef = React.useRef(null);
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
  const isRTL = i18n.language === 'ar';

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
        preferred_language: i18n.language
      });
      onNext();
    } catch (error) {
      console.error("Error saving profile:", error);
    }
    setSaving(false);
  };

  const SocialInput = ({ icon, ...props }) => (
    <div className="relative">
      <Input {...props} className="brutalist-border h-12 bg-white pl-12 pr-4 brutalist-text" />
      <div className="absolute left-3 top-3.5 w-5 h-5 text-gray-600">
        {icon}
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-blue-50 p-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex justify-end mb-6">
        <button
          onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ar' : 'en')}
          className="brutalist-border bg-white brutalist-shadow px-4 py-2 brutalist-text text-sm hover:bg-gray-100 transition-colors"
        >
          {i18n.language === 'en' ? 'العربية' : 'ENGLISH'}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-sm mx-auto"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl brutalist-text mb-2 text-black">{t('onboarding.profile.title')}</h1>
          <p className="text-lg font-bold text-gray-800">{t('onboarding.profile.subtitle')}</p>
          <div className="w-16 h-1 bg-blue-400 mx-auto mt-4"></div>
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <Label className="brutalist-text text-black mb-4 block">{t('onboarding.profile.photoLabel')}</Label>
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
            {uploading && <p className="text-sm font-bold text-gray-700 mt-2">{t('onboarding.profile.uploadingText')}</p>}
          </div>

          <div>
            <Label className="brutalist-text text-black mb-2 block">{t('onboarding.profile.nameLabel')}</Label>
            <Input value={formData.display_name} onChange={(e) => handleInputChange('display_name', e.target.value)} placeholder={t('onboarding.profile.namePlaceholder')} className="brutalist-border h-12 bg-white brutalist-text" />
          </div>

          <div>
            <Label className="brutalist-text text-black mb-2 block">{t('onboarding.profile.bioLabel')}</Label>
            <Textarea value={formData.bio} onChange={(e) => handleInputChange('bio', e.target.value.slice(0, 160))} placeholder={t('onboarding.profile.bioPlaceholder')} maxLength={160} className="brutalist-border bg-white brutalist-text h-20 resize-none" />
            <div className="text-right text-xs text-gray-600 mt-1">{formData.bio.length}/160</div>
          </div>
          
          <div className="space-y-4">
            <Label className="brutalist-text text-black block">{t('onboarding.profile.socialLabel')}</Label>
            <SocialInput icon={<FaInstagram/>} value={formData.instagram} onChange={(e) => handleInputChange('instagram', e.target.value)} placeholder={t('onboarding.profile.instagramPlaceholder')} />
            <SocialInput icon={<FaFacebook/>} value={formData.facebook} onChange={(e) => handleInputChange('facebook', e.target.value)} placeholder={t('onboarding.profile.facebookPlaceholder')} />
            <SocialInput icon={<FaSnapchatGhost/>} value={formData.snapchat} onChange={(e) => handleInputChange('snapchat', e.target.value)} placeholder={t('onboarding.profile.snapchatPlaceholder')} />
          </div>

          <div className="space-y-3 pt-4">
            <Button onClick={handleSave} disabled={saving} className="w-full bg-green-400 hover:bg-green-500 brutalist-border brutalist-shadow brutalist-shadow-hover brutalist-text h-14 text-black transition-all duration-200">
              {t('onboarding.profile.saveBtn')}
              <ArrowRight className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'} ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
            <Button onClick={onNext} variant="outline" className="w-full brutalist-border brutalist-shadow bg-white hover:bg-gray-50 brutalist-text h-12 text-black transition-all duration-200">{t('onboarding.profile.skipBtn')}</Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Interests Step Component
const InterestsStep = ({ onNext, onBack }) => {
  const { t, i18n } = useTranslation();
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [saving, setSaving] = useState(false);
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await User.me();
      if (userData) {
        setSelectedInterests(userData.interests || []);
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
      onNext();
    } catch (error) {
      console.error("Error saving interests:", error);
    }
    setSaving(false);
  };

  return (
    <div className={`min-h-screen bg-green-50 p-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Language Toggle */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ar' : 'en')}
          className="brutalist-border bg-white brutalist-shadow px-4 py-2 brutalist-text text-sm hover:bg-gray-100 transition-colors"
        >
          {i18n.language === 'en' ? 'العربية' : 'ENGLISH'}
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
          <h1 className="text-3xl brutalist-text mb-2 text-black">
            اختر اهتماماتك
          </h1>
          <p className="text-lg font-bold text-gray-800">
            اختر الأنشطة التي تحبها
          </p>
          <div className="w-16 h-1 bg-green-400 mx-auto mt-4"></div>
        </div>

        {/* Selection Counter */}
        <div className="text-center mb-6">
          <div className="inline-block bg-white brutalist-border brutalist-shadow px-4 py-2">
            <span className="brutalist-text text-black">
              {selectedInterests.length}/12 مختار
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
              />
            </motion.div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {selectedInterests.length < 3 && (
            <div className="text-center">
              <p className="text-red-600 font-bold bg-red-100 brutalist-border border-red-300 px-4 py-2 inline-block brutalist-shadow">
                {t('onboarding.interests.minError')}
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
            {t('onboarding.interests.continueBtn')}
            <ArrowRight className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'} ${isRTL ? 'rotate-180' : ''}`} />
          </Button>
          
          <Button
            onClick={onNext}
            variant="outline"
            className="w-full brutalist-border brutalist-shadow bg-white hover:bg-gray-50 brutalist-text h-12 text-black transition-all duration-200"
          >
            {t('onboarding.interests.skipBtn')}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

// Referral Step Component
const ReferralStep = ({ onNext, onBack }) => {
  const { t, i18n } = useTranslation();
  const [userData, setUserData] = useState(null);
  const [copied, setCopied] = useState(false);
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await User.me();
      setUserData(user);
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
      onNext();
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };

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
          onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ar' : 'en')}
          className="brutalist-border bg-white brutalist-shadow px-4 py-2 brutalist-text text-sm hover:bg-gray-100 transition-colors"
        >
          {i18n.language === 'en' ? 'العربية' : 'ENGLISH'}
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
            {t('onboarding.referral.title')}
          </h1>
          <p className="text-lg font-bold text-gray-800">
            {t('onboarding.referral.subtitle')}
          </p>
          <div className="w-16 h-1 bg-yellow-400 mx-auto mt-4"></div>
        </div>

        {/* Reward Banner */}
        <div className="bg-green-400 brutalist-border brutalist-shadow p-4 mb-8 transform -rotate-1">
          <div className="text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-black" />
            <p className="brutalist-text text-black text-sm">
              {t('onboarding.referral.reward')}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* QR Code */}
          <div className="text-center">
            <h3 className="brutalist-text text-black mb-4">
              {t('onboarding.referral.qrTitle')}
            </h3>
            <QRCodeGenerator url={referralUrl} />
          </div>

          {/* Invitation Link */}
          <div>
            <h3 className="brutalist-text text-black mb-3">
              {t('onboarding.referral.linkTitle')}
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
                    {t('onboarding.referral.copiedText')}
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
            text={t('onboarding.referral.shareText')}
            language={i18n.language}
            t={t}
          />

          {/* Action Buttons */}
          <div className="space-y-3 pt-6">
            <Button
              onClick={handleFinish}
              className="w-full bg-green-400 hover:bg-green-500 brutalist-border brutalist-shadow brutalist-shadow-hover brutalist-text h-14 text-black transition-all duration-200"
            >
              {t('onboarding.referral.finishBtn')}
              <ArrowRight className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'} ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
            
            <Button
              onClick={handleFinish}
              variant="outline"
              className="w-full brutalist-border brutalist-shadow bg-white hover:bg-gray-50 brutalist-text h-12 text-black transition-all duration-200"
            >
              {t('onboarding.referral.skipBtn')}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Main Onboarding Component
export default function NewOnboarding() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { code } = useParams(); // Get referral code from URL
  const { loginWithSocial } = useAuth(); // Get Google login function
  const [currentStep, setCurrentStep] = useState(0);
  const [referralCode, setReferralCode] = useState(code || null); // Store incoming referral code

  // Set Arabic as default language
  useEffect(() => {
    if (i18n.language !== 'ar') {
      i18n.changeLanguage('ar');
    }
  }, [i18n]);

  // Store referral code when available
  useEffect(() => {
    if (code) {
      setReferralCode(code);
      localStorage.setItem('referral_code', code);
      console.log('Referral code captured:', code);
    }
  }, [code]);

  // Load Google Identity Services script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        });
      }
    };

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Handle Google login response
  const handleGoogleResponse = async (response) => {
    try {
      const result = await loginWithSocial('google', response.credential);
      console.log('Google login successful:', result);
      // Navigate to share page after successful login
      navigate('/share');
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  const steps = [
    { component: WelcomeStep, name: 'welcome' },
    { component: RegistrationStep, name: 'registration' },
    { component: ProfileStep, name: 'profile' },
    { component: InterestsStep, name: 'interests' },
    { component: ReferralStep, name: 'referral' }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Onboarding completed, navigate to share page
      navigate('/share');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
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

      <CurrentStepComponent 
        onNext={handleNext}
        onBack={handleBack}
      />
    </div>
  );
}
