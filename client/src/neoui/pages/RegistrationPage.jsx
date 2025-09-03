import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Phone, 
  Calendar, 
  MapPin, 
  ChevronLeft, 
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function RegistrationPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    city: '',
    interests: []
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const interests = [
    { id: 'sports', label: 'Sports', icon: '🏀', color: 'bg-red-500' },
    { id: 'music', label: 'Music', icon: '🎵', color: 'bg-purple-500' },
    { id: 'food', label: 'Food', icon: '🍽️', color: 'bg-green-500' },
    { id: 'art', label: 'Art', icon: '🎨', color: 'bg-blue-500' },
    { id: 'adventure', label: 'Adventure', icon: '🏔️', color: 'bg-orange-500' },
    { id: 'technology', label: 'Technology', icon: '💻', color: 'bg-indigo-500' },
    { id: 'travel', label: 'Travel', icon: '✈️', color: 'bg-pink-500' },
    { id: 'fitness', label: 'Fitness', icon: '💪', color: 'bg-teal-500' }
  ];

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

  const handleInterestToggle = (interestId) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(id => id !== interestId)
        : [...prev.interests, interestId]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (formData.interests.length === 0) newErrors.interests = 'Please select at least one interest';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success - redirect to home or dashboard
      navigate('/neo/home');
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: 'Registration failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const InputField = ({ 
    name, 
    label, 
    type = 'text', 
    icon: Icon, 
    placeholder, 
    error,
    ...props 
  }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Icon className="w-5 h-5" />
        </div>
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 ${
            error ? 'border-red-300 focus:ring-red-100 focus:border-red-500' : ''
          }`}
          {...props}
        />
        {name === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
        {name === 'confirmPassword' && (
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {error && (
        <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Create Account</h1>
          </div>
        </div>

        {/* Form */}
        <div className="p-6">
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Welcome Message */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Join Ludus Today
              </h2>
              <p className="text-gray-600">
                Discover amazing activities and connect with like-minded people
              </p>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  name="firstName"
                  label="First Name"
                  icon={User}
                  placeholder="John"
                  error={errors.firstName}
                  required
                />
                <InputField
                  name="lastName"
                  label="Last Name"
                  icon={User}
                  placeholder="Doe"
                  error={errors.lastName}
                  required
                />
              </div>

              <InputField
                name="email"
                label="Email Address"
                type="email"
                icon={Mail}
                placeholder="john@example.com"
                error={errors.email}
                required
              />

              <InputField
                name="phone"
                label="Phone Number"
                type="tel"
                icon={Phone}
                placeholder="+966 50 123 4567"
                error={errors.phone}
                required
              />

              <InputField
                name="dateOfBirth"
                label="Date of Birth"
                type="date"
                icon={Calendar}
                error={errors.dateOfBirth}
                required
              />

              <InputField
                name="city"
                label="City"
                icon={MapPin}
                placeholder="Riyadh"
                error={errors.city}
                required
              />
            </div>

            {/* Security */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Security</h3>
              
              <InputField
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                icon={Lock}
                placeholder="Create a strong password"
                error={errors.password}
                required
              />

              <InputField
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                icon={Lock}
                placeholder="Confirm your password"
                error={errors.confirmPassword}
                required
              />
            </div>

            {/* Interests */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">What interests you?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Select your interests to get personalized activity recommendations
              </p>
              
              <div className="grid grid-cols-4 gap-3">
                {interests.map((interest) => (
                  <button
                    key={interest.id}
                    type="button"
                    onClick={() => handleInterestToggle(interest.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-200 ${
                      formData.interests.includes(interest.id)
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="text-2xl">{interest.icon}</span>
                    <span className="text-xs font-medium text-center">{interest.label}</span>
                  </button>
                ))}
              </div>
              
              {errors.interests && (
                <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.interests}
                </div>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
                <AlertCircle className="w-5 h-5" />
                {errors.submit}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-2xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/neo/login')}
                  className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                >
                  Sign In
                </button>
              </p>
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  );
}
