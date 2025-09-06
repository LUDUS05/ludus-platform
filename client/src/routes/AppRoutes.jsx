import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import HomePage from '../pages/HomePage';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import AdminRoutes from '../pages/admin/AdminRoutes';
import ActivitiesPageComponent from '../pages/ActivitiesPage';
import ActivityDetailPage from '../pages/ActivityDetailPage';
import DashboardPage from '../pages/DashboardPage';
import VendorProfilePage from '../pages/VendorProfilePage';
import BookingPage from '../pages/BookingPage';
import PaymentSuccessPage from '../pages/PaymentSuccessPage';
import ProfilePage from '../pages/ProfilePage';
import HowItWorksPage from '../pages/HowItWorksPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import UIShowcasePage from '../pages/UIShowcasePage';
import PartnerRegistrationPage from '../pages/PartnerRegistrationPage';
import UserRegistrationPage from '../pages/UserRegistrationPage';
import ComingSoonPage from '../pages/ComingSoonPage';
import MaintenancePage from '../pages/MaintenancePage';
import MapPage from '../pages/MapPage';
import WalletPage from '../pages/WalletPage';
import ReferralDashboard from '../pages/ReferralDashboard';
import ReferralTestPage from '../pages/ReferralTestPage';
import ContactPage from '../pages/ContactPage';
import DynamicPage from '../components/pages/DynamicPage';
import UserProfilePage from '../components/user/UserProfilePage';
import OnboardingWrapper from '../components/onboarding/OnboardingWrapper';
import OnboardingTest from '../components/onboarding/OnboardingTest';
import NeoLayout from '../neoui/Layout';
import NeoHome from '../neoui/pages/Home';
import NeoSearch from '../neoui/pages/Search';
import NeoActivityDetails from '../neoui/pages/ActivityDetails';
import NeoProfile from '../neoui/pages/Profile';
import NeoDashboard from '../neoui/pages/Dashboard';
import NeoWallet from '../neoui/pages/Wallet';
import TestHomePage from '../neoui/pages/TestHomePage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Routes without layout (standalone pages) */}
      <Route path="/register" element={<UserRegistrationPage />} />
      <Route path="/partner-registration" element={<PartnerRegistrationPage />} />
      <Route path="/coming-soon" element={<ComingSoonPage />} />
      <Route path="/maintenance" element={<MaintenancePage />} />
      <Route path="/onboarding" element={<OnboardingWrapper />} />
      <Route path="/onboarding-test" element={<OnboardingTest />} />
      
      {/* Routes with main layout */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginForm />} />
        <Route path="register-form" element={<RegisterForm />} />
        <Route path="activities" element={<ActivitiesPageComponent />} />
        <Route path="activities/:id" element={<ActivityDetailPage />} />
        <Route path="vendors/:id" element={<VendorProfilePage />} />
        <Route path="how-it-works" element={<HowItWorksPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="ui-showcase" element={<UIShowcasePage />} />
        {/* Temporarily disabled map route - redirect to home */}
        <Route path="map" element={<Navigate to="/" replace />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="forms/:slug" element={<DynamicPage />} />
        
        {/* Protected routes */}
        <Route path="booking/:id" element={
          <ProtectedRoute>
            <BookingPage />
          </ProtectedRoute>
        } />
        <Route path="payment-success" element={
          <ProtectedRoute>
            <PaymentSuccessPage />
          </ProtectedRoute>
        } />
        <Route path="dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="user/:userId" element={
          <ProtectedRoute>
            <UserProfilePage />
          </ProtectedRoute>
        } />
        <Route path="wallet" element={
          <ProtectedRoute>
            <WalletPage />
          </ProtectedRoute>
        } />
        <Route path="referrals" element={
          <ProtectedRoute>
            <ReferralDashboard />
          </ProtectedRoute>
        } />
        <Route path="referral-test" element={
          <ProtectedRoute>
            <ReferralTestPage />
          </ProtectedRoute>
        } />
        
        {/* Dynamic pages */}
        <Route path="pages/:url" element={<DynamicPage />} />
      </Route>

      {/* Neumorphic demo routes */}
      <Route path="/neo" element={<NeoLayout />}>
        <Route path="test-page" element={<TestHomePage />} />
        <Route path="home" element={<NeoHome />} />
        <Route path="search" element={<NeoSearch />} />
        <Route path="activity-details" element={<NeoActivityDetails />} />
        <Route path="profile" element={<NeoProfile />} />
        <Route path="dashboard" element={<NeoDashboard />} />
        <Route path="wallet" element={<NeoWallet />} />
        <Route index element={<Navigate to="home" replace />} />
      </Route>
      
      {/* Admin routes (separate layout) */}
      <Route path="/admin/*" element={
        <ProtectedRoute>
          <AdminRoutes />
        </ProtectedRoute>
      } />
      
      {/* Remove catch-all route to allow SPA routing to work */}
      {/* SPA routing will handle unknown routes by serving index.html */}
    </Routes>
  );
};

export default AppRoutes;