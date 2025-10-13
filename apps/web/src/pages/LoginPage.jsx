import { motion } from "framer-motion";
import {
    ArrowRight,
    Eye,
    EyeOff,
    Lock,
    Mail,
    User as UserIcon
} from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";

const LoginPage = () => {
  const { t, i18n } = useTranslation();
  const { login, loginWithSocial, isLoading } = useAuth();
  const navigate = useNavigate();

  console.log('🔐 LoginPage component mounted!');

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isRTL = i18n.language === 'ar';

  // DISABLED: Redirect logic removed - users can stay on login page
  // useEffect(() => {
  //   if (isAuthenticated && user) {
  //     console.log('🔐 User already authenticated, redirecting...', {
  //       role: user.role,
  //       email: user.email
  //     });

  //     if (user.role === 'admin' || user.email === 'admin@ludusapp.com') {
  //       navigate('/admin', { replace: true });
  //     } else {
  //       navigate('/share', { replace: true });
  //     }
  //   }
  // }, [isAuthenticated, user, navigate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(""); // Clear error when user types
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await login(formData);

      if (result.success) {
        console.log('✅ Login successful - no redirects', {
          role: result.user.role,
          email: result.user.email
        });

        // DISABLED: Redirect logic removed - users stay on login page
        // if (result.user.role === 'admin' || result.user.email === 'admin@ludusapp.com') {
        //   navigate('/admin', { replace: true });
        // } else {
        //   navigate('/share', { replace: true });
        // }
      } else {
        setError(result.message || t('auth.login.error'));
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setError(t('auth.login.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      // Initialize Google Identity Services
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: async (response) => {
            try {
              const result = await loginWithSocial('google', response.credential);

              if (result.success) {
                console.log('✅ Google login successful - no redirects', {
                  role: result.user.role,
                  email: result.user.email
                });

                // DISABLED: Redirect logic removed - users stay on login page
                // if (result.user.role === 'admin' || result.user.email === 'admin@ludusapp.com') {
                //   navigate('/admin', { replace: true });
                // } else {
                //   navigate('/share', { replace: true });
                // }
              } else {
                setError(result.message || t('auth.login.error'));
              }
            } catch (error) {
              console.error('❌ Google login error:', error);
              setError(t('auth.login.error'));
            } finally {
              setLoading(false);
            }
          }
        });

        window.google.accounts.id.prompt();
      }
    } catch (error) {
      console.error('❌ Google login initialization error:', error);
      setError(t('auth.login.error'));
      setLoading(false);
    }
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-ludus-orange border-t-transparent"></div>
      </div>
    );
  }

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
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-ludus-orange brutalist-border brutalist-shadow mx-auto mb-4 flex items-center justify-center">
            <UserIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl brutalist-text mb-2 text-black">
            {t('auth.login.title', 'تسجيل الدخول')}
          </h1>
          <p className="text-lg font-bold text-gray-800">
            {t('auth.login.subtitle', 'مرحباً بك مرة أخرى')}
          </p>
          <div className="w-16 h-1 bg-ludus-orange mx-auto mt-4"></div>
        </div>

        {/* Login Form */}
        <div className="bg-white brutalist-border brutalist-shadow p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border-2 border-red-400 text-red-800 px-4 py-3 brutalist-text text-sm">
              {error}
            </div>
          )}

          {/* Google Login Button */}
          <Button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white hover:bg-gray-50 brutalist-border brutalist-shadow brutalist-shadow-hover brutalist-text h-14 text-black transition-all duration-200 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t('auth.login.google', 'تسجيل الدخول بـ Google')}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-3 border-black"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-pink-50 brutalist-text text-black">
                {t('common.or', 'أو')}
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label className="brutalist-text text-black mb-2 block">
                {t('auth.login.email', 'البريد الإلكتروني')}
              </Label>
              <div className="relative">
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="brutalist-border h-12 bg-white pl-12 pr-4 brutalist-text"
                  placeholder={t('auth.login.emailPlaceholder', 'أدخل بريدك الإلكتروني')}
                  required
                />
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-600" />
              </div>
            </div>

            <div>
              <Label className="brutalist-text text-black mb-2 block">
                {t('auth.login.password', 'كلمة المرور')}
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="brutalist-border h-12 bg-white pl-12 pr-12 brutalist-text"
                  placeholder={t('auth.login.passwordPlaceholder', 'أدخل كلمة المرور')}
                  required
                />
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-600" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 w-5 h-5 text-gray-600 hover:text-gray-800"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-ludus-orange hover:bg-orange-600 brutalist-border brutalist-shadow brutalist-shadow-hover brutalist-text h-14 text-white transition-all duration-200"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
              ) : (
                <>
                  {t('auth.login.submit', 'تسجيل الدخول')}
                  <ArrowRight className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'} ${isRTL ? 'rotate-180' : ''}`} />
                </>
              )}
            </Button>
          </form>

          {/* Links */}
          <div className="text-center space-y-2">
            <button
              onClick={() => navigate('/hi')}
              className="text-sm font-bold text-gray-700 hover:text-black transition-colors"
            >
              {t('auth.login.noAccount', 'ليس لديك حساب؟ سجل الآن')}
            </button>
            <br />
            <button
              onClick={() => navigate('/forgot-password')}
              className="text-sm font-bold text-gray-700 hover:text-black transition-colors"
            >
              {t('auth.login.forgotPassword', 'نسيت كلمة المرور؟')}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm font-bold text-gray-700 bg-white brutalist-border px-4 py-2 inline-block brutalist-shadow">
            {t('auth.login.privacy', 'باستخدامك لهذه الخدمة، فإنك توافق على شروط الاستخدام وسياسة الخصوصية')}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
