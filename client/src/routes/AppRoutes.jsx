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
import DynamicPage from '../components/pages/DynamicPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Routes without layout (standalone pages) */}
      <Route path="/register" element={<UserRegistrationPage />} />
      <Route path="/partner-registration" element={<PartnerRegistrationPage />} />
      <Route path="/coming-soon" element={<ComingSoonPage />} />
      <Route path="/maintenance" element={<MaintenancePage />} />
      
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
        <Route path="map" element={<MapPage />} />
        
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
        <Route path="wallet" element={
          <ProtectedRoute>
            <WalletPage />
          </ProtectedRoute>
        } />
        
        {/* Dynamic pages */}
        <Route path="pages/:url" element={<DynamicPage />} />
      </Route>
      
      {/* Admin routes (separate layout) */}
      <Route path="/admin/*" element={
        <ProtectedRoute>
          <AdminRoutes />
        </ProtectedRoute>
      } />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;