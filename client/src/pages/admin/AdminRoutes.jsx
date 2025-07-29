import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminDashboard from '../../components/admin/AdminDashboard';
import VendorManagement from '../../components/admin/VendorManagement';
import ActivityManagement from '../../components/admin/ActivityManagement';
import BookingManagement from '../../components/admin/BookingManagement';
import PaymentManagement from '../../components/admin/PaymentManagement';

const AdminRoutes = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/vendors" element={<VendorManagement />} />
        <Route path="/activities" element={<ActivityManagement />} />
        <Route path="/bookings" element={<BookingManagement />} />
        <Route path="/payments" element={<PaymentManagement />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminRoutes;