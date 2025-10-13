import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
// DISABLED: Lockdown system
// import ComingSoonPage from '../ComingSoonPage';
import ActivityForm from '../../components/admin/ActivityForm';
import ActivityManagement from '../../components/admin/ActivityManagement';
import AdminDashboard from '../../components/admin/AdminDashboard';
import AdminLayout from '../../components/admin/AdminLayout';
import BookingManagement from '../../components/admin/BookingManagement';
import CategoryManagement from '../../components/admin/CategoryManagement';
import EnhancedPageManagement from '../../components/admin/EnhancedPageManagement';
import EnhancedVendorForm from '../../components/admin/EnhancedVendorForm';
import FormManagement from '../../components/admin/FormManagement';
import FormResponses from '../../components/admin/FormResponses';
import OnboardingManagement from '../../components/admin/OnboardingManagement';
import PageForm from '../../components/admin/PageForm';
import PaymentManagement from '../../components/admin/PaymentManagement';
import ReferralManagement from '../../components/admin/ReferralManagement';
import SystemSettings from '../../components/admin/SystemSettings';
import TranslationManagement from '../../components/admin/TranslationManagement';
import UserManagement from '../../components/admin/UserManagement';
import VendorManagement from '../../components/admin/VendorManagement';

const AdminRoutes = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft-white dark:dark-bg-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-ludus-orange dark:border-dark-ludus-orange border-t-transparent"></div>
      </div>
    );
  }

  // Check if user is admin
  const isAdmin = user && (user.role === 'admin' || user.email === 'admin@ludusapp.com');

  // DISABLED: All redirects removed - admin access is now open
  // if (!isAuthenticated) {
  //   console.log('❌ Not authenticated, redirecting to /hi');
  //   return <Navigate to="/hi" replace />;
  // }

  // if (!isAdmin) {
  //   console.log('❌ Not admin user, redirecting to home');
  //   return <Navigate to="/" replace />;
  // }

  console.log('✅ Admin access granted');
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/vendors" element={<VendorManagement />} />
        <Route path="/vendors/new" element={<EnhancedVendorForm />} />
        <Route path="/vendors/edit/:id" element={<EnhancedVendorForm />} />
        <Route path="/vendors/view/:id" element={<EnhancedVendorForm />} />
        <Route path="/activities" element={<ActivityManagement />} />
        <Route path="/activities/new" element={<ActivityForm />} />
        <Route path="/activities/edit/:id" element={<ActivityForm />} />
        <Route path="/bookings" element={<BookingManagement />} />
        <Route path="/payments" element={<PaymentManagement />} />
        <Route path="/referrals" element={<ReferralManagement />} />
        <Route path="/categories" element={<CategoryManagement />} />
        <Route path="/content" element={<EnhancedPageManagement />} />
        <Route path="/content/new" element={<PageForm />} />
        <Route path="/content/edit/:id" element={<PageForm />} />
        <Route path="/translations" element={<TranslationManagement />} />
        <Route path="/forms" element={<FormManagement />} />
        <Route path="/forms/:formId/responses" element={<FormResponses />} />
        <Route path="/onboarding" element={<OnboardingManagement />} />
        <Route path="/settings" element={<SystemSettings />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminRoutes;
