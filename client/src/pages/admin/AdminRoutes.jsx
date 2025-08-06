import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminDashboard from '../../components/admin/AdminDashboard';
import VendorManagement from '../../components/admin/VendorManagement';
import VendorForm from '../../components/admin/VendorForm';
import ActivityManagement from '../../components/admin/ActivityManagement';
import ActivityForm from '../../components/admin/ActivityForm';
import PageManagement from '../../components/admin/PageManagement';
import BookingManagement from '../../components/admin/BookingManagement';
import PaymentManagement from '../../components/admin/PaymentManagement';
import CategoryManagement from '../../components/admin/CategoryManagement';
import ContentManagement from '../../components/admin/ContentManagement';
import TranslationManagement from '../../components/admin/TranslationManagement';
import SystemSettings from '../../components/admin/SystemSettings';

const AdminRoutes = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/vendors" element={<VendorManagement />} />
        <Route path="/vendors/new" element={<VendorForm />} />
        <Route path="/vendors/edit/:id" element={<VendorForm />} />
        <Route path="/activities" element={<ActivityManagement />} />
        <Route path="/activities/new" element={<ActivityForm />} />
        <Route path="/activities/edit/:id" element={<ActivityForm />} />
        <Route path="/bookings" element={<BookingManagement />} />
        <Route path="/payments" element={<PaymentManagement />} />
        <Route path="/categories" element={<CategoryManagement />} />
        <Route path="/content" element={<PageManagement />} />
        <Route path="/translations" element={<TranslationManagement />} />
        <Route path="/settings" element={<SystemSettings />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminRoutes;