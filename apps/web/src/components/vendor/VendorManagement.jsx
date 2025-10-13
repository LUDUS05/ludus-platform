/**
 * @fileoverview Vendor Management Component with RTL Support
 * @module components/vendor/VendorManagement
 * 
 * This component provides comprehensive vendor management functionality including:
 * - View all vendors with filtering and search
 * - Vendor status management
 * - Analytics and reporting
 * - Document management
 * - RTL support for Arabic users
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useTranslationWithFallback from '../../hooks/useTranslationWithFallback';
import { vendorService } from '../../services/vendorService';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Alert } from '../ui';
import { 
  Search, 
  Filter, 
  Eye, 
  BarChart, 
  FileText, 
  MoreVertical,
  MapPin,
  Star,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Users,
  Activity,
  CheckCircle,
  XCircle,
  PauseCircle,
  PlayCircle
} from 'lucide-react';

const VendorManagement = () => {
  const { t } = useTranslationWithFallback();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    city: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [statusData, setStatusData] = useState({
    status: '',
    reason: '',
    adminNotes: ''
  });

  useEffect(() => {
    loadVendors();
  }, [filters, pagination.page]);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      
      const response = await vendorService.getVendors(params);
      setVendors(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.totalVendors,
        totalPages: response.pagination.totalPages
      }));
    } catch (err) {
      setError(err.message || t('vendor.loadError', 'Failed to load vendors'));
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleStatusUpdate = async (vendorId, newStatus, reason = '', adminNotes = '') => {
    try {
      await vendorService.updateVendorStatus(vendorId, newStatus, reason, adminNotes);
      setMessage(t('vendor.statusUpdated', 'Vendor status updated successfully'));
      loadVendors();
      setShowStatusModal(false);
      setSelectedVendor(null);
      setStatusData({ status: '', reason: '', adminNotes: '' });
    } catch (err) {
      setError(err.message || t('vendor.statusUpdateError', 'Failed to update vendor status'));
    }
  };

  const openStatusModal = (vendor, action) => {
    setSelectedVendor(vendor);
    setStatusData({
      status: action === 'approve' ? 'active' : 
              action === 'reject' ? 'rejected' : 
              action === 'suspend' ? 'suspended' : 
              action === 'activate' ? 'active' : '',
      reason: '',
      adminNotes: ''
    });
    setShowStatusModal(true);
  };

  const getStatusInfo = (status) => {
    return vendorService.getVendorStatusInfo(status, t('common.language', 'ar'));
  };

  const formatCurrency = (amount) => {
    return vendorService.formatCurrency(amount, 'SAR', t('common.language', 'ar'));
  };

  const getVendorActions = (vendor) => {
    return vendorService.getVendorActions(vendor, t('common.language', 'ar'));
  };

  if (loading && vendors.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir={t('common.direction') || 'ltr'}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ludus-orange"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir={t('common.direction') || 'ltr'}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t('vendor.vendorManagement', 'Vendor Management')}
              </h1>
              <p className="text-gray-600">
                {t('vendor.manageVendors', 'Manage vendor registrations and approvals')}
              </p>
            </div>
          </div>
        </div>

        {error && <Alert type="error" message={error} className="mb-6" />}
        {message && <Alert type="success" message={message} className="mb-6" />}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('vendor.filterByStatus', 'Filter by Status')}
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ludus-orange focus:border-transparent"
                >
                  <option value="">{t('vendor.allStatuses', 'All Statuses')}</option>
                  {vendorService.getStatuses().map(status => (
                    <option key={status.id} value={status.id}>
                      {t('common.language', 'ar') === 'ar' ? status.nameAr : status.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('vendor.filterByCategory', 'Filter by Category')}
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ludus-orange focus:border-transparent"
                >
                  <option value="">{t('vendor.allCategories', 'All Categories')}</option>
                  {vendorService.getCategories().map(category => (
                    <option key={category.id} value={category.id}>
                      {t('common.language', 'ar') === 'ar' ? category.nameAr : category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('vendor.filterByCity', 'Filter by City')}
                </label>
                <Input
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  placeholder={t('vendor.cityPlaceholder', 'Enter city name')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('vendor.search', 'Search')}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder={t('vendor.searchPlaceholder', 'Search vendors...')}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => setFilters({ status: '', category: '', city: '', search: '' })}
                  className="w-full"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {t('common.clear', 'Clear')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vendors List */}
        {vendors.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('vendor.noVendors', 'No vendors found')}
              </h3>
              <p className="text-gray-500">
                {t('vendor.noVendorsDesc', 'No vendors match your current filters')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map((vendor) => {
              const statusInfo = getStatusInfo(vendor.statusHistory?.[vendor.statusHistory.length - 1]?.status || 'inactive');
              const actions = getVendorActions(vendor);

              return (
                <Card key={vendor._id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {vendor.businessName}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {vendor.description}
                        </p>
                        <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-gray-500">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {vendor.location?.city || t('vendor.noCity', 'No city')}
                          </div>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 mr-1" />
                            {vendor.rating?.average?.toFixed(1) || '0.0'} ({vendor.rating?.count || 0})
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                          {statusInfo.text}
                        </span>
                      </div>
                    </div>

                    {/* Categories */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {vendor.categories?.slice(0, 3).map((category, index) => (
                        <span
                          key={index}
                          className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full"
                        >
                          {t('common.language', 'ar') === 'ar' 
                            ? vendorService.getCategories().find(c => c.id === category)?.nameAr || category
                            : vendorService.getCategories().find(c => c.id === category)?.name || category
                          }
                        </span>
                      ))}
                      {vendor.categories?.length > 3 && (
                        <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                          +{vendor.categories.length - 3} {t('vendor.more', 'more')}
                        </span>
                      )}
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-1 mb-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <span className="font-medium mr-2 rtl:mr-0 rtl:ml-2">
                          {t('vendor.email', 'Email')}:
                        </span>
                        <span>{vendor.contactInfo?.email || t('vendor.noEmail', 'No email')}</span>
                      </div>
                      {vendor.contactInfo?.phone && (
                        <div className="flex items-center">
                          <span className="font-medium mr-2 rtl:mr-0 rtl:ml-2">
                            {t('vendor.phone', 'Phone')}:
                          </span>
                          <span>{vendor.contactInfo.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      {actions.map((action) => (
                        <Button
                          key={action.id}
                          onClick={() => {
                            switch (action.id) {
                              case 'approve':
                              case 'reject':
                              case 'suspend':
                              case 'activate':
                                openStatusModal(vendor, action.id);
                                break;
                              case 'view':
                                // Navigate to vendor details
                                console.log('View vendor:', vendor._id);
                                break;
                              case 'analytics':
                                // Navigate to analytics
                                console.log('View analytics:', vendor._id);
                                break;
                              case 'documents':
                                // Navigate to documents
                                console.log('View documents:', vendor._id);
                                break;
                              default:
                                break;
                            }
                          }}
                          variant={action.id === 'view' || action.id === 'analytics' || action.id === 'documents' ? 'outline' : 'default'}
                          size="sm"
                          className={
                            action.id === 'approve' || action.id === 'activate' ? 'bg-green-600 hover:bg-green-700' :
                            action.id === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                            action.id === 'suspend' ? 'bg-yellow-600 hover:bg-yellow-700' :
                            ''
                          }
                        >
                          {React.createElement(
                            action.id === 'approve' || action.id === 'activate' ? CheckCircle :
                            action.id === 'reject' ? XCircle :
                            action.id === 'suspend' ? PauseCircle :
                            action.id === 'view' ? Eye :
                            action.id === 'analytics' ? BarChart :
                            action.id === 'documents' ? FileText : MoreVertical,
                            { className: "w-4 h-4 mr-1" }
                          )}
                          {action.name}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 rtl:space-x-reverse mt-8">
            <Button
              variant="outline"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
            >
              {t('common.previous', 'Previous')}
            </Button>
            
            <span className="text-sm text-gray-600">
              {t('common.page', 'Page')} {pagination.page} {t('common.of', 'of')} {pagination.totalPages}
            </span>
            
            <Button
              variant="outline"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
            >
              {t('common.next', 'Next')}
            </Button>
          </div>
        )}

        {/* Status Update Modal */}
        {showStatusModal && selectedVendor && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('vendor.updateStatus', 'Update Vendor Status')}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('vendor.vendor', 'Vendor')}
                  </label>
                  <p className="text-sm text-gray-600">{selectedVendor.businessName}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('vendor.newStatus', 'New Status')}
                  </label>
                  <select
                    value={statusData.status}
                    onChange={(e) => setStatusData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ludus-orange focus:border-transparent"
                  >
                    <option value="">{t('vendor.selectStatus', 'Select Status')}</option>
                    {vendorService.getStatuses().map(status => (
                      <option key={status.id} value={status.id}>
                        {t('common.language', 'ar') === 'ar' ? status.nameAr : status.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('vendor.reason', 'Reason')}
                  </label>
                  <textarea
                    value={statusData.reason}
                    onChange={(e) => setStatusData(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder={t('vendor.reasonPlaceholder', 'Enter reason for status change')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ludus-orange focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('vendor.adminNotes', 'Admin Notes')}
                  </label>
                  <textarea
                    value={statusData.adminNotes}
                    onChange={(e) => setStatusData(prev => ({ ...prev, adminNotes: e.target.value }))}
                    placeholder={t('vendor.adminNotesPlaceholder', 'Enter admin notes (optional)')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ludus-orange focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 rtl:space-x-reverse mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedVendor(null);
                    setStatusData({ status: '', reason: '', adminNotes: '' });
                  }}
                >
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button
                  onClick={() => handleStatusUpdate(selectedVendor._id, statusData.status, statusData.reason, statusData.adminNotes)}
                  disabled={!statusData.status}
                  className="bg-ludus-orange hover:bg-ludus-orange-dark"
                >
                  {t('common.update', 'Update')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorManagement;
