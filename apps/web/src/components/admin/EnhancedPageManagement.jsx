import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import Alert from '../ui/Alert';
import ContentFormsManagement from './ContentFormsManagement';
import api from '../../services/api';

const EnhancedPageManagement = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('pages');
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [formData, setFormData] = useState({
    title: {
      en: '',
      ar: ''
    },
    content: '',
    slug: '',
    placement: 'none',
    status: 'draft',
    seo: {
      description: { en: '', ar: '' },
      keywords: { en: '', ar: '' }
    },
    navigationOrder: 0
  });
  const [filters, setFilters] = useState({
    status: 'all',
    placement: 'all',
    search: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  });

  const tabs = [
    { id: 'pages', label: 'Pages', icon: '📄' },
    { id: 'forms', label: 'Forms', icon: '📝' }
  ];

  useEffect(() => {
    if (activeTab === 'pages') {
      fetchPages();
    }
  }, [filters, pagination.currentPage, activeTab]);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: 10,
        ...filters
      });
      
      const response = await api.get(`/admin/pages?${params}`);
      const respData = response.data;
      // Support current backend shape: { success, data: [...], pagination: { totalPages, totalCount, ... } }
      // and fallback to older nested shapes if present
      const pagesArray = Array.isArray(respData?.data)
        ? respData.data
        : (respData?.data?.pages || []);

      setPages(pagesArray);

      const totalPages = respData?.pagination?.totalPages
        ?? respData?.data?.pagination?.pages
        ?? 1;
      const totalCount = respData?.pagination?.totalCount
        ?? respData?.data?.pagination?.total
        ?? pagesArray.length;

      setPagination(prev => ({
        ...prev,
        totalPages,
        totalCount
      }));
    } catch (err) {
      setError('Failed to fetch pages');
      console.error('Fetch pages error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePage = async (pageId) => {
    if (!window.confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/admin/pages/${pageId}`);
      setSuccess('Page deleted successfully');
      fetchPages();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete page');
    }
  };

  const handleStatusChange = async (pageId, newStatus) => {
    try {
      await api.patch(`/admin/pages/${pageId}`, { status: newStatus });
      setSuccess('Page status updated successfully');
      fetchPages();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update page status');
    }
  };

  const handleFormSave = (savedPage) => {
    setSuccess('Page saved successfully');
    setShowForm(false);
    setEditingPage(null);
    fetchPages();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingPage(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || statusClasses.draft}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPlacementBadge = (placement) => {
    const placementClasses = {
      none: 'bg-gray-100 text-gray-800',
      header: 'bg-blue-100 text-blue-800',
      footer: 'bg-purple-100 text-purple-800',
      sidebar: 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${placementClasses[placement] || placementClasses.none}`}>
        {placement.charAt(0).toUpperCase() + placement.slice(1)}
      </span>
    );
  };

  if (showForm || editingPage) {
    // This would be the PageForm component
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingPage ? 'Edit Page' : 'Create New Page'}
          </h2>
          <Button
            variant="outline"
            onClick={handleFormCancel}
          >
            Cancel
          </Button>
        </div>
        
        <Card className="p-6">
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Page Editor</h3>
            <p className="text-gray-600 mb-6">
              Page editor functionality is coming soon. This feature will allow you to create and edit content pages.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={handleFormSave}
                className="bg-ludus-orange hover:bg-ludus-orange-dark"
              >
                Save Page
              </Button>
              <Button
                variant="outline"
                onClick={handleFormCancel}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600 mt-1">Manage pages and forms for your content</p>
        </div>
        {activeTab === 'pages' && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-ludus-orange hover:bg-ludus-orange-dark"
          >
            Create New Page
          </Button>
        )}
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-ludus-orange text-ludus-orange'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'forms' ? (
        <ContentFormsManagement />
      ) : (
        <>
          {/* Filters and Search */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search pages..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full"
                />
              </div>
              <div className="sm:w-48">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ludus-orange focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="sm:w-48">
                <select
                  value={filters.placement}
                  onChange={(e) => setFilters(prev => ({ ...prev, placement: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ludus-orange focus:border-transparent"
                >
                  <option value="all">All Placements</option>
                  <option value="none">None</option>
                  <option value="header">Header</option>
                  <option value="footer">Footer</option>
                  <option value="sidebar">Sidebar</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Pages List */}
          <Card className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ludus-orange mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading pages...</p>
              </div>
            ) : pages.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📄</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pages found</h3>
                <p className="text-gray-600 mb-4">
                  {filters.search || filters.status !== 'all' || filters.placement !== 'all'
                    ? 'Try adjusting your search criteria' 
                    : 'Get started by creating your first page'
                  }
                </p>
                {!filters.search && filters.status === 'all' && filters.placement === 'all' && (
                  <Button
                    onClick={() => setShowForm(true)}
                    className="bg-ludus-orange hover:bg-ludus-orange-dark"
                  >
                    Create Your First Page
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Page
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Placement
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pages.map((page) => (
                      <tr key={page._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {page.title?.en || page.title?.ar || 'Untitled'}
                            </div>
                            <div className="text-sm text-gray-500">
                              /{page.slug}
                            </div>
                            {page.content && (
                              <div className="text-xs text-gray-400 mt-1">
                                {page.content.substring(0, 100)}
                                {page.content.length > 100 && '...'}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(page.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getPlacementBadge(page.placement)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(page.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingPage(page)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`/pages/${page.slug}`, '_blank')}
                            >
                              View
                            </Button>
                            <select
                              value={page.status}
                              onChange={(e) => handleStatusChange(page._id, e.target.value)}
                              className="text-xs border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="draft">Draft</option>
                              <option value="published">Published</option>
                              <option value="archived">Archived</option>
                            </select>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeletePage(page._id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-700">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
                    disabled={pagination.currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.min(prev.totalPages, prev.currentPage + 1) }))}
                    disabled={pagination.currentPage === pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default EnhancedPageManagement;
