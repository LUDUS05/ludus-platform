import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import Logo from '../common/Logo';
import useTranslationWithFallback from '../../hooks/useTranslationWithFallback';

const RegisterForm = () => {
  const { t } = useTranslation();
  const { t: tFallback } = useTranslationWithFallback();
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Clear validation errors when user starts typing
  useEffect(() => {
    if (Object.keys(validationErrors).length > 0) {
      setValidationErrors({});
    }
  }, [formData]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.firstName.trim()) {
      errors.firstName = tFallback('auth.firstNameRequired', 'First name is required');
    } else if (formData.firstName.length < 2) {
      errors.firstName = tFallback('auth.firstNameMinLength', 'First name must be at least 2 characters');
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = tFallback('auth.lastNameRequired', 'Last name is required');
    } else if (formData.lastName.length < 2) {
      errors.lastName = tFallback('auth.lastNameMinLength', 'Last name must be at least 2 characters');
    }
    
    if (!formData.email) {
      errors.email = tFallback('auth.emailRequired', 'Email is required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = tFallback('auth.emailInvalid', 'Please enter a valid email address');
    }
    
    if (formData.phone && !/^(\+966|0)?[5-9][0-9]{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = tFallback('auth.phoneInvalid', 'Please enter a valid Saudi phone number');
    }
    
    if (!formData.password) {
      errors.password = tFallback('auth.passwordRequired', 'Password is required');
    } else if (formData.password.length < 8) {
      errors.password = tFallback('auth.passwordMinLength', 'Password must be at least 8 characters');
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = tFallback('auth.passwordComplexity', 'Password must contain uppercase, lowercase, and number');
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = tFallback('auth.confirmPasswordRequired', 'Please confirm your password');
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = tFallback('auth.passwordsDoNotMatch', 'Passwords do not match');
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || tFallback('auth.registrationFailed', 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8" dir={t('common.direction') || 'ltr'}>
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <Logo className="h-12 w-auto" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {tFallback('auth.register', 'Create your account')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {tFallback('common.or', 'Or')}{' '}
            <Link
              to="/login"
              className="font-medium text-ludus-orange hover:text-ludus-orange-dark transition-colors"
            >
              {tFallback('auth.login', 'sign in to existing account')}
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  {t('auth.firstName')}
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="input-field mt-1"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  {t('auth.lastName')}
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="input-field mt-1"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('auth.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input-field mt-1"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                {t('auth.phone')}
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="input-field mt-1"
                value={formData.phone}
                onChange={handleChange}
                placeholder={t('auth.phonePlaceholder')}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('auth.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input-field mt-1"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                {t('auth.confirmPassword')}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="input-field mt-1"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('common.loading') : t('auth.register')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;