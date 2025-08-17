import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const PageManagement = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [formData, setFormData] = useState({
    title: {
      en: '',
      ar: ''
    },
    content: [{
      id: Date.now().toString(),
      type: 'paragraph',
      content: { en: '', ar: '' },
      order: 0
    }],
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


  useEffect(() => {
    fetchPages();
  }, [filters, pagination.currentPage]);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: 10,
        ...filters
      });
      
      const response = await api.get(`/admin/pages?${params}`);
      
      setPages(response.data.data);
      setPagination(prev => ({
        ...prev,
        totalPages: response.data.pagination.totalPages,
        totalCount: response.data.pagination.totalCount
      }));
    } catch (error) {
      console.error('Error fetching pages:', error);
      console.error('Fetch error details:', error.response?.data || error);
      console.error('Fetch error status:', error.response?.status);
      
      let errorMessage = 'Unknown error occurred';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert('Error fetching pages: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const pageData = {
        ...formData
      };
      
      if (editingPage) {
        await api.put(`/admin/pages/${editingPage._id}`, pageData);
        alert('Page updated successfully!');
      } else {
        await api.post('/admin/pages', pageData);
        alert('Page created successfully!');
      }
      
      resetForm();
      fetchPages();
    } catch (error) {
      console.error('Error saving page:', error);
      console.error('Error details:', error.response?.data || error);
      console.error('Error status:', error.response?.status);
      console.error('Error config:', error.config);
      
      let errorMessage = 'Unknown error occurred';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMessage = `Validation error: ${JSON.stringify(error.response.data.errors)}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert('Error saving page: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (page) => {
    setEditingPage(page);
    setFormData({
      title: page.title || { en: '', ar: '' },
      content: Array.isArray(page.content) && page.content.length > 0 
        ? page.content 
        : [{
            id: Date.now().toString(),
            type: 'paragraph',
            content: { en: '', ar: '' },
            order: 0
          }],
      slug: page.slug || '',
      placement: page.placement || 'none',
      status: page.status || 'draft',
      seo: {
        description: page.seo?.description || { en: '', ar: '' },
        keywords: page.seo?.keywords || { en: '', ar: '' }
      },
      navigationOrder: page.navigationOrder || 0
    });
    setShowForm(true);
  };

  const handleDelete = async (pageId, isSystem) => {
    if (isSystem) {
      alert('System pages cannot be deleted');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this page?')) return;
    
    try {
      await api.delete(`/admin/pages/${pageId}`);
      alert('Page deleted successfully!');
      fetchPages();
    } catch (error) {
      console.error('Error deleting page:', error);
      console.error('Delete error details:', error.response?.data || error);
      console.error('Delete error status:', error.response?.status);
      
      let errorMessage = 'Unknown error occurred';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert('Error deleting page: ' + errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      title: {
        en: '',
        ar: ''
      },
      content: [{
        id: Date.now().toString(),
        type: 'paragraph',
        content: { en: '', ar: '' },
        order: 0
      }],
      slug: '',
      placement: 'none',
      status: 'draft',
      seo: {
        description: { en: '', ar: '' },
        keywords: { en: '', ar: '' }
      },
      navigationOrder: 0
    });
    setEditingPage(null);
    setShowForm(false);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const generateSlugFromTitle = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (lang, title) => {
    setFormData(prev => ({
      ...prev,
      title: {
        ...prev.title,
        [lang]: title
      },
      // Auto-generate slug from English title if it's empty or if we're creating a new page
      slug: !editingPage && !prev.slug && lang === 'en' && title ? generateSlugFromTitle(title) : prev.slug
    }));
  };

  const addContentBlock = () => {
    const newBlock = {
      id: Date.now().toString(),
      type: 'paragraph',
      content: { en: '', ar: '' },
      order: formData.content.length
    };
    setFormData(prev => ({
      ...prev,
      content: [...prev.content, newBlock]
    }));
  };

  const updateContentBlock = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content.map((block, i) => 
        i === index ? { ...block, [field]: value } : block
      )
    }));
  };

  const removeContentBlock = (index) => {
    if (formData.content.length <= 1) return; // Keep at least one block
    setFormData(prev => ({
      ...prev,
      content: prev.content.filter((_, i) => i !== index).map((block, i) => ({
        ...block,
        order: i
      }))
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Page Management</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create and manage website pages with custom URLs and menu placement
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Create New Page
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search pages..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Menu Placement
            </label>
            <select
              value={filters.placement}
              onChange={(e) => handleFilterChange('placement', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Placements</option>
              <option value="header">Header Menu</option>
              <option value="footer">Footer Menu</option>
              <option value="none">No Menu</option>
            </select>
          </div>
        </div>
      </div>

      {/* Page List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Page
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Menu Placement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {pages && pages.length > 0 ? pages.map((page) => (
                <tr key={page._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {page.title?.en || page.title?.ar || 'Untitled Page'}
                        {page.isSystem && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            System
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {page.slug}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 dark:text-white font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {page.url}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      page.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : page.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {page.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {page.placement === 'none' ? 'No Menu' : `${page.placement.charAt(0).toUpperCase() + page.placement.slice(1)} Menu`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(page)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    {!page.isSystem && (
                      <button
                        onClick={() => handleDelete(page._id, page.isSystem)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500 dark:text-gray-300">
                    {loading ? 'Loading pages...' : 'No pages found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {(pagination.currentPage - 1) * 10 + 1} to {Math.min(pagination.currentPage * 10, pagination.totalCount)} of {pagination.totalCount} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                disabled={pagination.currentPage === 1}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 dark:text-white"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 dark:text-white"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{zIndex: 9999}}>
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {editingPage ? 'Edit Page' : 'Create New Page'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Create pages accessible at any URL path (e.g., /about, /contact, /custom-page)
                </p>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Page Titles */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Page Titles</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        English Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title.en}
                        onChange={(e) => handleTitleChange('en', e.target.value)}
                        placeholder="e.g., About Us, Contact, Privacy Policy"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Arabic Title *
                      </label>
                      <input
                        type="text"
                        required
                        dir="rtl"
                        value={formData.title.ar}
                        onChange={(e) => handleTitleChange('ar', e.target.value)}
                        placeholder="مثلا: حول الشركة، اتصل بنا، سياسة الخصوصية"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    URL Slug *
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 text-sm">
                      app.letsludus.com/pages/
                    </span>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="e.g., about-us, contact, privacy-policy"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-r-md dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Only lowercase letters, numbers, and dashes allowed. Auto-generated from English title.
                  </p>
                </div>

                {/* Settings */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Menu Placement
                    </label>
                    <select
                      value={formData.placement}
                      onChange={(e) => setFormData({ ...formData, placement: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    >
                      <option value="none">No Menu</option>
                      <option value="header">Header Menu</option>
                      <option value="footer">Footer Menu</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Menu Order
                    </label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Lower numbers appear first
                    </p>
                  </div>
                </div>

                {/* Content Editor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Page Content *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Write your page content here... (HTML and Markdown supported)"
                    required
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white font-mono text-sm resize-vertical"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    You can use HTML tags and basic formatting in this field.
                  </p>
                </div>

                {/* SEO Settings */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">SEO Settings</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Meta Description
                    </label>
                    <textarea
                      value={formData.metaDescription}
                      onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                      placeholder="Brief description for search engines (recommended: 120-160 characters)"
                      maxLength="160"
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formData.metaDescription.length}/160 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Meta Keywords
                    </label>
                    <input
                      type="text"
                      value={formData.metaKeywords}
                      onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                      placeholder="keyword1, keyword2, keyword3"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                  {loading ? 'Saving...' : (editingPage ? 'Update Page' : 'Create Page')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageManagement;