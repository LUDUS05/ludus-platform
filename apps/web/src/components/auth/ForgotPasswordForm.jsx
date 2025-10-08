import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTranslationWithFallback } from '../../hooks/useTranslationWithFallback';
import { authService } from '../../services/authService';
import Logo from '../common/Logo';

const ForgotPasswordForm = () => {
  const { t } = useTranslation();
  const { t: tFallback } = useTranslationWithFallback();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');

  // Clear validation error when user starts typing
  useEffect(() => {
    if (validationError) {
      setValidationError('');
    }
  }, [email]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationError('');

    if (!email.trim()) {
      setValidationError(tFallback('auth.emailRequired', 'Email is required'));
      return;
    }

    if (!validateEmail(email)) {
      setValidationError(tFallback('auth.emailInvalid', 'Please enter a valid email address'));
      return;
    }

    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      setIsSubmitted(true);
    } catch (error) {
      setError(error.response?.data?.message || tFallback('auth.forgotPasswordError', 'Failed to send reset email'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8" dir={t('common.direction') || 'ltr'}>
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <Logo className="h-12 w-auto" />
            </div>
            <div className="mt-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {tFallback('auth.resetEmailSent', 'Reset Email Sent')}
              </h2>
              <p className="text-gray-600 mb-6">
                {tFallback('auth.resetEmailInstructions', 'We\'ve sent password reset instructions to your email address. Please check your inbox and follow the link to reset your password.')}
              </p>
              <div className="space-y-4">
                <Link
                  to="/login"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-ludus-orange hover:bg-ludus-orange-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ludus-orange/20 transition-colors"
                >
                  {tFallback('auth.backToLogin', 'Back to Login')}
                </Link>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ludus-orange/20 transition-colors"
                >
                  {tFallback('auth.tryAgain', 'Try Again')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8" dir={t('common.direction') || 'ltr'}>
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <Logo className="h-12 w-auto" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            {tFallback('auth.forgotPassword', 'Forgot Password?')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {tFallback('auth.forgotPasswordInstructions', 'Enter your email address and we\'ll send you instructions to reset your password.')}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {(error || validationError) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error || validationError}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              {tFallback('auth.email', 'Email Address')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-ludus-orange/20 focus:border-ludus-orange transition-colors ${
                validationError ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300'
              }`}
              placeholder={tFallback('auth.enterEmail', 'Enter your email address')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            {validationError && (
              <p className="mt-1 text-sm text-red-600">{validationError}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-ludus-orange hover:bg-ludus-orange-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ludus-orange/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {tFallback('common.loading', 'Loading...')}
                </div>
              ) : (
                tFallback('auth.sendResetEmail', 'Send Reset Instructions')
              )}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="font-medium text-ludus-orange hover:text-ludus-orange-dark transition-colors"
            >
              {tFallback('auth.backToLogin', 'Back to Login')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
