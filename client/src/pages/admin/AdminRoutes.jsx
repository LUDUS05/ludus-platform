import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminDashboard from '../../components/admin/AdminDashboard';
import VendorManagement from '../../components/admin/VendorManagement';
import ActivityManagement from '../../components/admin/ActivityManagement';

const AdminRoutes = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/vendors" element={<VendorManagement />} />
        <Route path="/activities" element={<ActivityManagement />} />
        <Route path="/bookings" element={<div className="text-center py-12 text-gray-500">Booking Management - Coming Soon</div>} />
        <Route path="/payments" element={<div className="text-center py-12 text-gray-500">Payment Management - Coming Soon</div>} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminRoutes;