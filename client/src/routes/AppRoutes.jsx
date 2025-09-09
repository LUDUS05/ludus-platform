import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import SmartRoute from '../components/routing/SmartRoute';
import HomePage from '../pages/HomePage';
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
import OnboardTestPage from '../pages/OnboardTestPage';
import ComingSoonPage from '../pages/ComingSoonPage';
import MaintenancePage from '../pages/MaintenancePage';
// import MapPage from '../pages/MapPage'; // Temporarily disabled
import WalletPage from '../pages/WalletPage';
import ReferralDashboard from '../pages/ReferralDashboard';
import ReferralTestPage from '../pages/ReferralTestPage';
import ContactPage from '../pages/ContactPage';
import DynamicPage from '../components/pages/DynamicPage';
import UserProfilePage from '../components/user/UserProfilePage';
import OnboardingWrapper from '../components/onboarding/OnboardingWrapper';
import OnboardingTest from '../components/onboarding/OnboardingTest';
import NewOnboarding from '../pages/NewOnboarding';
import LoginPage from '../pages/LoginPage';
import SharePage from '../pages/SharePage';
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
      <Route path="/login" element={
        <SmartRoute path="/login">
          <LoginPage />
        </SmartRoute>
      } />
      <Route path="/register" element={
        <SmartRoute path="/register">
          <UserRegistrationPage />
        </SmartRoute>
      } />
      <Route path="/onboard-test" element={
        <SmartRoute path="/onboard-test">
          <OnboardTestPage />
        </SmartRoute>
      } />
      <Route path="/partner-registration" element={
        <SmartRoute path="/partner-registration">
          <PartnerRegistrationPage />
        </SmartRoute>
      } />
      <Route path="/coming-soon" element={<ComingSoonPage />} />
      <Route path="/maintenance" element={<MaintenancePage />} />
      <Route path="/onboarding" element={
        <SmartRoute path="/onboarding">
          <OnboardingWrapper />
        </SmartRoute>
      } />
      <Route path="/onboarding-test" element={
        <SmartRoute path="/onboarding-test">
          <OnboardingTest />
        </SmartRoute>
      } />
      <Route path="/hi" element={
        <SmartRoute path="/hi">
          <NewOnboarding />
        </SmartRoute>
      } />
      <Route path="/invite/:code" element={<NewOnboarding />} />
      <Route path="/share" element={
        <SmartRoute path="/share">
          <ProtectedRoute>
            <SharePage />
          </ProtectedRoute>
        </SmartRoute>
      } />
      
      {/* Routes with main layout */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={
          <SmartRoute path="/">
            <HomePage />
          </SmartRoute>
        } />
        <Route path="register-form" element={
          <SmartRoute path="/register-form">
            <RegisterForm />
          </SmartRoute>
        } />
        <Route path="activities" element={
          <SmartRoute path="/activities">
            <ActivitiesPageComponent />
          </SmartRoute>
        } />
        <Route path="activities/:id" element={
          <SmartRoute path="/activities/:id">
            <ActivityDetailPage />
          </SmartRoute>
        } />
        <Route path="vendors/:id" element={
          <SmartRoute path="/vendors/:id">
            <VendorProfilePage />
          </SmartRoute>
        } />
        <Route path="how-it-works" element={
          <SmartRoute path="/how-it-works">
            <HowItWorksPage />
          </SmartRoute>
        } />
        <Route path="forgot-password" element={
          <SmartRoute path="/forgot-password">
            <ForgotPasswordPage />
          </SmartRoute>
        } />
        <Route path="ui-showcase" element={
          <SmartRoute path="/ui-showcase">
            <UIShowcasePage />
          </SmartRoute>
        } />
        {/* Temporarily disabled map route - redirect to home */}
        <Route path="map" element={<Navigate to="/" replace />} />
        <Route path="contact" element={
          <SmartRoute path="/contact">
            <ContactPage />
          </SmartRoute>
        } />
        <Route path="forms/:slug" element={
          <SmartRoute path="/forms/:slug">
            <DynamicPage />
          </SmartRoute>
        } />
        
        {/* Protected routes */}
        <Route path="booking/:id" element={
          <SmartRoute path="/booking/:id">
            <ProtectedRoute>
              <BookingPage />
            </ProtectedRoute>
          </SmartRoute>
        } />
        <Route path="payment-success" element={
          <SmartRoute path="/payment-success">
            <ProtectedRoute>
              <PaymentSuccessPage />
            </ProtectedRoute>
          </SmartRoute>
        } />
        <Route path="dashboard" element={
          <SmartRoute path="/dashboard">
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          </SmartRoute>
        } />
        <Route path="profile" element={
          <SmartRoute path="/profile">
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          </SmartRoute>
        } />
        <Route path="user/:userId" element={
          <SmartRoute path="/user/:userId">
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          </SmartRoute>
        } />
        <Route path="wallet" element={
          <SmartRoute path="/wallet">
            <ProtectedRoute>
              <WalletPage />
            </ProtectedRoute>
          </SmartRoute>
        } />
        <Route path="referrals" element={
          <SmartRoute path="/referrals">
            <ProtectedRoute>
              <ReferralDashboard />
            </ProtectedRoute>
          </SmartRoute>
        } />
        <Route path="referral-test" element={
          <SmartRoute path="/referral-test">
            <ProtectedRoute>
              <ReferralTestPage />
            </ProtectedRoute>
          </SmartRoute>
        } />
        
        {/* Dynamic pages */}
        <Route path="pages/:url" element={
          <SmartRoute path="/pages/:url">
            <DynamicPage />
          </SmartRoute>
        } />
      </Route>

      {/* Neumorphic demo routes */}
      <Route path="/neo" element={
        <SmartRoute path="/neo">
          <NeoLayout />
        </SmartRoute>
      }>
        <Route path="test-page" element={
          <SmartRoute path="/neo/test-page">
            <TestHomePage />
          </SmartRoute>
        } />
        <Route path="home" element={
          <SmartRoute path="/neo/home">
            <NeoHome />
          </SmartRoute>
        } />
        <Route path="search" element={
          <SmartRoute path="/neo/search">
            <NeoSearch />
          </SmartRoute>
        } />
        <Route path="activity-details" element={
          <SmartRoute path="/neo/activity-details">
            <NeoActivityDetails />
          </SmartRoute>
        } />
        <Route path="profile" element={
          <SmartRoute path="/neo/profile">
            <NeoProfile />
          </SmartRoute>
        } />
        <Route path="dashboard" element={
          <SmartRoute path="/neo/dashboard">
            <NeoDashboard />
          </SmartRoute>
        } />
        <Route path="wallet" element={
          <SmartRoute path="/neo/wallet">
            <NeoWallet />
          </SmartRoute>
        } />
        <Route index element={<Navigate to="home" replace />} />
      </Route>
      
      {/* Admin routes (separate layout) */}
      <Route path="/admin/*" element={
        <SmartRoute path="/admin/*">
          <ProtectedRoute>
            <AdminRoutes />
          </ProtectedRoute>
        </SmartRoute>
      } />
      
      {/* Remove catch-all route to allow SPA routing to work */}
      {/* SPA routing will handle unknown routes by serving index.html */}
    </Routes>
  );
};

export default AppRoutes;