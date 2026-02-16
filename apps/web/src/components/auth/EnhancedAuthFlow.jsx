// frontend/src/components/auth/EnhancedAuthFlow.jsx
import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/apiService';
import { notificationService } from '../../services/notificationService';
import { gsap } from '../../utils/gsap-setup';

const EnhancedAuthFlow = ({ onAuthSuccess }) => {
  const [authState, setAuthState] = useState('login'); // login, signup, loading, success
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize entrance animation
    const tl = gsap.timeline();

    tl.from('.auth-container', {
      duration: 0.8,
      y: 50,
      opacity: 0,
      ease: 'power3.out'
    })
    .from('.auth-form', {
      duration: 0.6,
      scale: 0.9,
      opacity: 0,
      ease: 'back.out(1.7)'
    }, '-=0.4')
    .from('.auth-tabs', {
      duration: 0.5,
      y: -20,
      opacity: 0,
      stagger: 0.1,
      ease: 'power2.out'
    }, '-=0.3');
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (authState === 'signup') {
      if (!formData.firstName) {
        newErrors.firstName = 'First name is required';
      }
      if (!formData.lastName) {
        newErrors.lastName = 'Last name is required';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Animate error state
      animateFormErrors();
      return;
    }

    setIsLoading(true);
    animateLoadingState();

    try {
      let response;

      if (authState === 'login') {
        response = await apiService.authenticate({
          email: formData.email,
          password: formData.password
        });
      } else {
        response = await apiService.register({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone
        });
      }

      if (response.success) {
        // Store auth token
        if (response.token) {
          localStorage.setItem('authToken', response.token);
        }

        await animateAuthSuccess(response.user);
        onAuthSuccess?.(response.user);
      }

    } catch (error) {
      animateAuthError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const animateLoadingState = () => {
    const tl = gsap.timeline();

    tl.to('.auth-form', {
      duration: 0.3,
      scale: 0.98,
      opacity: 0.7
    })
    .to('.loading-overlay', {
      duration: 0.2,
      opacity: 1
    }, '-=0.1')
    .from('.loading-dots', {
      duration: 0.8,
      scale: 0,
      stagger: 0.1,
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut'
    });
  };

  const animateAuthSuccess = async (user) => {
    const tl = gsap.timeline();

    tl.to('.loading-overlay', { duration: 0.2, opacity: 0 })
    .to('.auth-form', { duration: 0.4, scale: 1, opacity: 1 })
    .from('.success-checkmark', {
      duration: 0.6,
      scale: 0,
      rotation: 180,
      ease: 'back.out(1.7)'
    }, '-=0.2')
    .to('.auth-container', {
      duration: 0.8,
      y: -20,
      opacity: 0,
      onComplete: () => {
        // No redirect after auth success
      }
    });
  };

  const animateAuthError = (message) => {
    const tl = gsap.timeline();

    tl.to('.loading-overlay', { duration: 0.2, opacity: 0 })
    .to('.auth-form', { duration: 0.4, scale: 1, opacity: 1 })
    .from('.error-message', {
      duration: 0.5,
      y: -20,
      opacity: 0,
      ease: 'back.out(1.7)'
    }, '-=0.2')
    .to('.auth-form', {
      duration: 0.1,
      x: 5,
      repeat: 5,
      yoyo: true,
      ease: 'power2.inOut'
    }, '-=0.1');

    notificationService.show('error', message);
  };

  const animateFormErrors = () => {
    const errorElements = document.querySelectorAll('.error-message');

    gsap.fromTo(errorElements,
      { opacity: 0, y: -10 },
      {
        duration: 0.3,
        opacity: 1,
        y: 0,
        stagger: 0.1,
        ease: 'power2.out'
      }
    );
  };

  const switchAuthMode = (mode) => {
    const isRTL = document.dir === 'rtl' || document.documentElement.dir === 'rtl';
    const slideDirection = isRTL ? (mode === 'login' ? 100 : -100) : (mode === 'login' ? -100 : 100);

    const tl = gsap.timeline({
      onComplete: () => setAuthState(mode)
    });

    tl.to('.auth-form', {
      duration: 0.3,
      x: slideDirection,
      opacity: 0,
      ease: 'power2.in'
    })
    .from('.auth-form', {
      duration: 0.4,
      x: -slideDirection,
      opacity: 0,
      ease: 'power2.out'
    }, '-=0.1');
  };

  return (
    <div className="auth-container min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="auth-form bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative overflow-hidden">

        {/* Loading Overlay */}
        <div className="loading-overlay absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10 opacity-0">
          <div className="text-center">
            <div className="loading-dots flex space-x-2 justify-center mb-4">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            </div>
            <p className="text-gray-600">Processing...</p>
          </div>
        </div>

        {/* Success State */}
        {authState === 'success' && (
          <div className="success-checkmark text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to LUDUS!</h2>
            <p className="text-gray-600">Redirecting to your dashboard...</p>
          </div>
        )}

        {/* Auth Form */}
        {authState !== 'success' && (
          <>
            {/* Tabs */}
            <div className="auth-tabs flex mb-8">
              <button
                onClick={() => switchAuthMode('login')}
                className={`flex-1 py-3 px-4 text-center font-medium rounded-lg transition-all duration-300 ${
                  authState === 'login'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-blue-500'
                }`}
              >
                تسجيل الدخول
              </button>
              <button
                onClick={() => switchAuthMode('signup')}
                className={`flex-1 py-3 px-4 text-center font-medium rounded-lg transition-all duration-300 ${
                  authState === 'signup'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-blue-500'
                }`}
              >
                إنشاء حساب
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-6">
              {authState === 'signup' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الاسم الأول
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="أدخل اسمك الأول"
                    />
                    {errors.firstName && (
                      <p className="error-message text-red-500 text-sm mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم العائلة
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="أدخل اسم العائلة"
                    />
                    {errors.lastName && (
                      <p className="error-message text-red-500 text-sm mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  placeholder="أدخل بريدك الإلكتروني"
                />
                {errors.email && (
                  <p className="error-message text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  كلمة المرور
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  placeholder="أدخل كلمة المرور"
                />
                {errors.password && (
                  <p className="error-message text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {authState === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تأكيد كلمة المرور
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="أعد إدخال كلمة المرور"
                  />
                  {errors.confirmPassword && (
                    <p className="error-message text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'جاري المعالجة...' : (authState === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب')}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default EnhancedAuthFlow;
