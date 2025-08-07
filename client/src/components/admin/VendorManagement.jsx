import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const VendorManagement = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalVendors: 0
  });

  useEffect(() => {
    fetchVendors();
  }, [filters, pagination.page]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });

      const response = await api.get(`/admin/vendors?${params}`);
      setVendors(response.data.data.vendors);
      setPagination(prev => ({
        ...prev,
        ...response.data.data.pagination
      }));
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
      setError('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleDelete = async (vendorId) => {
    if (!window.confirm('Are you sure you want to delete this vendor? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/admin/vendors/${vendorId}`);
      fetchVendors();
      alert('Vendor deleted successfully');
    } catch (error) {
      console.error('Failed to delete vendor:', error);
      alert(error.response?.data?.message || 'Failed to delete vendor');
    }
  };

  const toggleVendorStatus = async (vendorId, currentStatus) => {
    const note = prompt('Add a note for this status change (optional):');
    if (note === null) return; // User cancelled
    
    try {
      const statusEntry = {
        status: !currentStatus ? 'active' : 'inactive',
        note: note || 'Status changed from vendor management',
        timestamp: new Date().toISOString(),
        admin: 'Current Admin'
      };

      await api.put(`/admin/vendors/${vendorId}`, {
        isActive: !currentStatus,
        $push: { statusHistory: statusEntry }
      });
      fetchVendors();
    } catch (error) {
      console.error('Failed to update vendor status:', error);
      alert('Failed to update vendor status');
    }
  };

  const categories = ['fitness', 'arts', 'food', 'outdoor', 'unique', 'wellness'];

  if (loading && vendors.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ludus-orange"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vendor Management</h2>
          <p className="text-gray-600">Manage and monitor all business partners</p>
        </div>
        <Link
          to="/admin/vendors/new"
          className="bg-ludus-orange text-white px-4 py-2 rounded-md hover:bg-ludus-orange-dark transition-colors flex items-center"
        >
          <span className="mr-2">+</span>
          Add New Vendor
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search vendors..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilters({ search: '', category: '', status: '' });
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="text-red-400 text-xl mr-3">⚠️</div>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Vendors Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categories
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vendors.map((vendor) => (
                <tr key={vendor._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {vendor.businessName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {vendor.location?.city}, {vendor.location?.state}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{vendor.contactInfo?.email}</div>
                    <div className="text-sm text-gray-500">{vendor.contactInfo?.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {vendor.categories?.map((category) => (
                        <span
                          key={category}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-ludus-orange/10 text-ludus-orange-dark"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleVendorStatus(vendor._id, vendor.isActive)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        vendor.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      } transition-colors`}
                    >
                      {vendor.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/admin/vendors/edit/${vendor._id}`}
                        className="text-ludus-orange hover:text-ludus-orange-dark"
                      >
                        Edit
                      </Link>
                      <Link
                        to={`/admin/vendors/view/${vendor._id}`}
                        className="text-green-600 hover:text-green-900"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDelete(vendor._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {vendors.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏢</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
            <p className="text-gray-500 mb-6">
              {filters.search || filters.category || filters.status
                ? 'Try adjusting your search filters'
                : 'Get started by adding your first vendor'
              }
            </p>
            <Link
              to="/admin/vendors/new"
              className="bg-ludus-orange text-white px-4 py-2 rounded-md hover:bg-ludus-orange-dark transition-colors"
            >
              Add New Vendor
            </Link>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.totalVendors)} of{' '}
            {pagination.totalVendors} vendors
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-gray-700">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorManagement;