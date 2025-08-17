import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';
import RichTextEditor from '../ui/RichTextEditor';
import api from '../../services/api';

const ContentManagement = () => {
  const { t, i18n } = useTranslation();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [editingPage, setEditingPage] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [filters, setFilters] = useState({
    status: 'all',
    template: 'all',
    search: '',
    sortBy: 'updatedAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  });

  const [pageForm, setPageForm] = useState({
    title: { en: '', ar: '' },
    slug: '',
    content: [],
    template: 'basic',
    status: 'draft',
    publishDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    placement: 'none',
    showInNavigation: false,
    navigationOrder: 0,
    seo: {
      title: { en: '', ar: '' },
      description: { en: '', ar: '' },
      keywords: { en: '', ar: '' },
      ogImage: ''
    },
    settings: {
      allowComments: false,
      requireAuth: false,
      featuredImage: '',
      backgroundColor: '#ffffff',
      textColor: '#000000'
    },
    categories: [],
    tags: [],
    isFeatured: false
  });

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ];

  const pageTemplates = [
    { value: 'basic', label: 'Basic Page', description: 'Simple content page' },
    { value: 'landing', label: 'Landing Page', description: 'Marketing landing page' },
    { value: 'about', label: 'About Page', description: 'About us page' },
    { value: 'contact', label: 'Contact Page', description: 'Contact information' },
    { value: 'custom', label: 'Custom', description: 'Custom layout' }
  ];

  const statusOptions = [
    { value: 'draft', label: 'Draft', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'published', label: 'Published', color: 'bg-green-100 text-green-800' },
    { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
    { value: 'archived', label: 'Archived', color: 'bg-gray-100 text-gray-800' }
  ];

  const placementOptions = [
    { value: 'none', label: 'None' },
    { value: 'header', label: 'Header Menu' },
    { value: 'footer', label: 'Footer Menu' },
    { value: 'sidebar', label: 'Sidebar' }
  ];

  useEffect(() => {
    fetchPages();
  }, [filters, pagination.currentPage]);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: pagination.currentPage,
        limit: 10,
        includeContent: false
      };

      const response = await api.get('/admin/pages', { params });
      
      if (response.data.success) {
        setPages(response.data.data || []);
        setPagination(response.data.pagination || {});
      }
    } catch (error) {
      console.error('Failed to fetch pages:', error);
      setMessage({ type: 'error', text: 'Failed to load pages' });
    } finally {
      setLoading(false);
    }
  };

  const savePage = async () => {
    try {
      setSaving(true);
      
      // Validate required fields
      if (!pageForm.title.en || !pageForm.title.ar) {
        setMessage({ type: 'error', text: 'Both English and Arabic titles are required' });
        return;
      }

      const pageData = {
        ...pageForm,
        categories: Array.isArray(pageForm.categories) ? pageForm.categories : [],
        tags: Array.isArray(pageForm.tags) ? pageForm.tags : []
      };

      let response;
      if (editingPage) {
        response = await api.put(`/admin/pages/${editingPage._id}`, pageData);
      } else {
        response = await api.post('/admin/pages', pageData);
      }

      if (response.data.success) {
        setMessage({ 
          type: 'success', 
          text: editingPage ? 'Page updated successfully' : 'Page created successfully' 
        });
        await fetchPages();
        resetForm();
      }
    } catch (error) {
      console.error('Failed to save page:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save page';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSaving(false);
    }
  };

  const deletePage = async (pageId) => {
    if (!window.confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await api.delete(`/admin/pages/${pageId}`);
      
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Page deleted successfully' });
        await fetchPages();
      }
    } catch (error) {
      console.error('Failed to delete page:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete page';
      setMessage({ type: 'error', text: errorMessage });
    }
  };

  const duplicatePage = async (pageId) => {
    try {
      const response = await api.post(`/admin/pages/${pageId}/duplicate`);
      
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Page duplicated successfully' });
        await fetchPages();
      }
    } catch (error) {
      console.error('Failed to duplicate page:', error);
      const errorMessage = error.response?.data?.message || 'Failed to duplicate page';
      setMessage({ type: 'error', text: errorMessage });
    }
  };

  const loadPageForEditing = async (page) => {
    try {
      setLoading(true);
      
      // Fetch full page details including content
      const response = await api.get(`/admin/pages/${page._id}?includeVersions=false`);
      
      if (response.data.success) {
        const fullPage = response.data.data;
        setEditingPage(fullPage);
        setPageForm({
          title: fullPage.title || { en: '', ar: '' },
          slug: fullPage.slug || '',
          content: fullPage.content || [],
          template: fullPage.template || 'basic',
          status: fullPage.status || 'draft',
          publishDate: fullPage.publishDate ? fullPage.publishDate.split('T')[0] : new Date().toISOString().split('T')[0],
          expiryDate: fullPage.expiryDate ? fullPage.expiryDate.split('T')[0] : '',
          placement: fullPage.placement || 'none',
          showInNavigation: fullPage.showInNavigation || false,
          navigationOrder: fullPage.navigationOrder || 0,
          seo: fullPage.seo || { title: { en: '', ar: '' }, description: { en: '', ar: '' }, keywords: { en: '', ar: '' }, ogImage: '' },
          settings: fullPage.settings || { allowComments: false, requireAuth: false, featuredImage: '', backgroundColor: '#ffffff', textColor: '#000000' },
          categories: fullPage.categories || [],
          tags: fullPage.tags || [],
          isFeatured: fullPage.isFeatured || false
        });
      }
    } catch (error) {
      console.error('Failed to load page for editing:', error);
      setMessage({ type: 'error', text: 'Failed to load page details' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingPage(null);
    setPageForm({
      title: { en: '', ar: '' },
      slug: '',
      content: [],
      template: 'basic',
      status: 'draft',
      publishDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      placement: 'none',
      showInNavigation: false,
      navigationOrder: 0,
      seo: { title: { en: '', ar: '' }, description: { en: '', ar: '' }, keywords: { en: '', ar: '' }, ogImage: '' },
      settings: { allowComments: false, requireAuth: false, featuredImage: '', backgroundColor: '#ffffff', textColor: '#000000' },
      categories: [],
      tags: [],
      isFeatured: false
    });
    setShowPreview(false);
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const updatePageField = useCallback((field, value, subField = null) => {
    setPageForm(prev => {
      if (subField) {
        return {
          ...prev,
          [field]: {
            ...prev[field],
            [subField]: value
          }
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });
  }, []);

  const handleTitleChange = (language, value) => {
    updatePageField('title', { ...pageForm.title, [language]: value });
    
    // Auto-generate slug from English title if not editing and slug is empty
    if (!editingPage && language === 'en' && !pageForm.slug) {
      const newSlug = generateSlug(value);
      updatePageField('slug', newSlug);
    }
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
    const statusConfig = statusOptions.find(s => s.value === status);
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig?.color || 'bg-gray-100 text-gray-800'}`}>
        {statusConfig?.label || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-display-sm font-bold text-ludus-dark">
            Content Management System
          </h1>
          <p className="text-body-sm text-ludus-gray-600">
            Create, edit, and manage multilingual pages with rich content
          </p>
        </div>
        <div className="flex gap-2">
          {editingPage && (
            <>
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                className="border-ludus-blue text-ludus-blue"
              >
                {showPreview ? '✏️ Edit' : '👁️ Preview'}
              </Button>
              <Button
                variant="outline"
                onClick={resetForm}
                className="text-ludus-gray-600 border-ludus-gray-300"
              >
                Cancel
              </Button>
            </>
          )}
          <Button
            onClick={resetForm}
            className="bg-ludus-orange text-white"
          >
            ➕ New Page
          </Button>
        </div>
      </div>

      {message && (
        <Alert
          type={message.type}
          message={message.text}
          onClose={() => setMessage(null)}
        />
      )}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Content Area */}
        <div className="xl:col-span-3 space-y-6">
          {editingPage || showPreview ? (
            /* Page Editor */
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-body-lg font-semibold text-ludus-dark">
                  {editingPage ? 'Edit Page' : 'Create New Page'}
                </h2>
                
                {/* Language Selector */}
                <div className="flex gap-1">
                  {languages.map(lang => (
                    <Button
                      key={lang.code}
                      size="sm"
                      variant={currentLanguage === lang.code ? "default" : "outline"}
                      onClick={() => setCurrentLanguage(lang.code)}
                      className={currentLanguage === lang.code 
                        ? "bg-ludus-orange text-white" 
                        : "text-ludus-dark border-ludus-gray-300"
                      }
                    >
                      {lang.flag} {lang.name}
                    </Button>
                  ))}
                </div>
              </div>

              {showPreview ? (
                /* Preview Mode */
                <div className="prose max-w-none">
                  <div className="mb-6 p-4 bg-ludus-blue/10 rounded-lg">
                    <h3 className="text-sm font-medium text-ludus-blue mb-2">Preview Mode</h3>
                    <p className="text-sm text-ludus-gray-600">
                      This is how your page will appear to visitors. Switch languages to see different versions.
                    </p>
                  </div>
                  
                  <div className={`${currentLanguage === 'ar' ? 'dir-rtl' : 'dir-ltr'}`}>
                    <h1 className="text-3xl font-bold mb-4">
                      {pageForm.title[currentLanguage] || pageForm.title.en}
                    </h1>
                    
                    <div className="mb-6 text-sm text-ludus-gray-600">
                      <span className="mr-4">Status: {getStatusBadge(pageForm.status)}</span>
                      <span className="mr-4">Template: {pageForm.template}</span>
                      <span>URL: /pages/{pageForm.slug}</span>
                    </div>
                    
                    <RichTextEditor
                      content={pageForm.content}
                      language={currentLanguage}
                      readOnly={true}
                    />
                  </div>
                </div>
              ) : (
                /* Edit Mode */
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                        Page Title ({currentLanguage.toUpperCase()}) *
                      </label>
                      <Input
                        value={pageForm.title[currentLanguage]}
                        onChange={(e) => handleTitleChange(currentLanguage, e.target.value)}
                        placeholder="Enter page title"
                        required
                        dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                        URL Slug *
                      </label>
                      <Input
                        value={pageForm.slug}
                        onChange={(e) => updatePageField('slug', e.target.value)}
                        placeholder="url-slug"
                        required
                      />
                      <p className="text-xs text-ludus-gray-500 mt-1">
                        URL: /pages/{pageForm.slug || 'your-slug'}
                      </p>
                    </div>
                  </div>

                  {/* Page Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                        Template
                      </label>
                      <select
                        value={pageForm.template}
                        onChange={(e) => updatePageField('template', e.target.value)}
                        className="w-full px-3 py-2 border border-ludus-gray-300 rounded-md focus:ring-ludus-orange focus:border-ludus-orange"
                      >
                        {pageTemplates.map(template => (
                          <option key={template.value} value={template.value}>
                            {template.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                        Status
                      </label>
                      <select
                        value={pageForm.status}
                        onChange={(e) => updatePageField('status', e.target.value)}
                        className="w-full px-3 py-2 border border-ludus-gray-300 rounded-md focus:ring-ludus-orange focus:border-ludus-orange"
                      >
                        {statusOptions.map(status => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                        Placement
                      </label>
                      <select
                        value={pageForm.placement}
                        onChange={(e) => updatePageField('placement', e.target.value)}
                        className="w-full px-3 py-2 border border-ludus-gray-300 rounded-md focus:ring-ludus-orange focus:border-ludus-orange"
                      >
                        {placementOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Publishing Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                        Publish Date
                      </label>
                      <Input
                        type="date"
                        value={pageForm.publishDate}
                        onChange={(e) => updatePageField('publishDate', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                        Expiry Date (Optional)
                      </label>
                      <Input
                        type="date"
                        value={pageForm.expiryDate}
                        onChange={(e) => updatePageField('expiryDate', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* SEO Settings */}
                  <div className="space-y-4">
                    <h3 className="text-body-md font-semibold text-ludus-dark">SEO Settings</h3>
                    
                    <div>
                      <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                        SEO Title ({currentLanguage.toUpperCase()})
                      </label>
                      <Input
                        value={pageForm.seo.title[currentLanguage]}
                        onChange={(e) => updatePageField('seo', { ...pageForm.seo, title: { ...pageForm.seo.title, [currentLanguage]: e.target.value } })}
                        placeholder="SEO optimized title (max 60 characters)"
                        maxLength={60}
                        dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
                      />
                      <p className="text-xs text-ludus-gray-500 mt-1">
                        {pageForm.seo.title[currentLanguage]?.length || 0}/60 characters
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                        Meta Description ({currentLanguage.toUpperCase()})
                      </label>
                      <textarea
                        value={pageForm.seo.description[currentLanguage]}
                        onChange={(e) => updatePageField('seo', { ...pageForm.seo, description: { ...pageForm.seo.description, [currentLanguage]: e.target.value } })}
                        placeholder="Brief description for search engines (max 160 characters)"
                        maxLength={160}
                        rows={3}
                        className="w-full px-3 py-2 border border-ludus-gray-300 rounded-md resize-none focus:ring-ludus-orange focus:border-ludus-orange"
                        dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
                      />
                      <p className="text-xs text-ludus-gray-500 mt-1">
                        {pageForm.seo.description[currentLanguage]?.length || 0}/160 characters
                      </p>
                    </div>
                  </div>

                  {/* Rich Content Editor */}
                  <div className="space-y-4">
                    <h3 className="text-body-md font-semibold text-ludus-dark">Page Content</h3>
                    <RichTextEditor
                      content={pageForm.content}
                      onChange={(newContent) => updatePageField('content', newContent)}
                      language={currentLanguage}
                      placeholder={`Start writing your content in ${currentLanguage === 'ar' ? 'Arabic' : 'English'}...`}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setShowPreview(true)}
                      variant="outline"
                      className="border-ludus-blue text-ludus-blue"
                      disabled={saving}
                    >
                      👁️ Preview
                    </Button>
                    <Button
                      type="button"
                      onClick={savePage}
                      disabled={saving || !pageForm.title.en || !pageForm.title.ar}
                      className="bg-ludus-orange text-white"
                    >
                      {saving ? '💾 Saving...' : editingPage ? '📝 Update Page' : '➕ Create Page'}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ) : (
            /* Pages List */
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-body-lg font-semibold text-ludus-dark">
                  All Pages ({pagination.totalCount})
                </h2>
                
                {/* Filters */}
                <div className="flex gap-2">
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="px-3 py-2 border border-ludus-gray-300 rounded-md text-sm"
                  >
                    <option value="all">All Status</option>
                    {statusOptions.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                  
                  <Input
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    placeholder="Search pages..."
                    className="w-64"
                  />
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-ludus-orange border-t-transparent mx-auto mb-4"></div>
                  <p className="text-ludus-gray-600">Loading pages...</p>
                </div>
              ) : pages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📄</div>
                  <h3 className="text-lg font-medium text-ludus-dark mb-2">No pages found</h3>
                  <p className="text-ludus-gray-600 mb-4">
                    {filters.search || filters.status !== 'all' 
                      ? 'Try adjusting your filters or search terms'
                      : 'Create your first page to get started'
                    }
                  </p>
                  <Button
                    onClick={resetForm}
                    className="bg-ludus-orange text-white"
                  >
                    Create First Page
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {pages.map(page => (
                    <div
                      key={page._id}
                      className="border border-ludus-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-ludus-dark truncate">
                              {page.title?.en || 'Untitled Page'}
                            </h3>
                            {getStatusBadge(page.status)}
                            {page.isFeatured && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                ⭐ Featured
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-ludus-gray-600 mb-2">
                            <span>📄 {page.template}</span>
                            <span>🔗 /pages/{page.slug}</span>
                            <span>👀 {page.views || 0} views</span>
                            <span>📝 {formatDate(page.updatedAt)}</span>
                          </div>
                          
                          {page.title?.ar && (
                            <p className="text-sm text-ludus-gray-500 dir-rtl" dir="rtl">
                              {page.title.ar}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => loadPageForEditing(page)}
                            className="text-ludus-orange hover:bg-ludus-orange/10"
                            title="Edit page"
                          >
                            ✏️
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => duplicatePage(page._id)}
                            className="text-green-600 hover:bg-green-50"
                            title="Duplicate page"
                          >
                            📋
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(`/pages/${page.slug}?preview=true`, '_blank')}
                            className="text-ludus-blue hover:bg-ludus-blue/10"
                            title="Preview page"
                          >
                            👁️
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deletePage(page._id)}
                            className="text-red-600 hover:bg-red-50"
                            title="Delete page"
                          >
                            🗑️
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!pagination.hasPrev}
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                      >
                        Previous
                      </Button>
                      
                      <span className="flex items-center px-3 text-sm text-ludus-gray-600">
                        Page {pagination.currentPage} of {pagination.totalPages}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!pagination.hasNext}
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-1 space-y-6">
          {/* Quick Actions */}
          <Card className="p-4">
            <h3 className="text-body-md font-semibold text-ludus-dark mb-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Button
                onClick={resetForm}
                className="w-full bg-ludus-orange text-white justify-start"
                size="sm"
              >
                ➕ New Page
              </Button>
              <Button
                onClick={() => setFilters(prev => ({ ...prev, status: 'draft' }))}
                variant="outline"
                className="w-full justify-start"
                size="sm"
              >
                📝 View Drafts
              </Button>
              <Button
                onClick={() => setFilters(prev => ({ ...prev, status: 'published' }))}
                variant="outline"
                className="w-full justify-start"
                size="sm"
              >
                🌐 Published Pages
              </Button>
            </div>
          </Card>

          {/* Page Statistics */}
          <Card className="p-4">
            <h3 className="text-body-md font-semibold text-ludus-dark mb-3">
              Statistics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-ludus-gray-600">Total Pages</span>
                <span className="font-medium">{pagination.totalCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-ludus-gray-600">Published</span>
                <span className="font-medium text-green-600">
                  {pages.filter(p => p.status === 'published').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-ludus-gray-600">Drafts</span>
                <span className="font-medium text-yellow-600">
                  {pages.filter(p => p.status === 'draft').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-ludus-gray-600">Featured</span>
                <span className="font-medium text-purple-600">
                  {pages.filter(p => p.isFeatured).length}
                </span>
              </div>
            </div>
          </Card>

          {/* Tips */}
          <Card className="p-4 bg-ludus-blue/5">
            <h3 className="text-body-md font-semibold text-ludus-blue mb-3">
              💡 Tips
            </h3>
            <div className="space-y-2 text-sm text-ludus-gray-700">
              <p>• Use meaningful slugs for better SEO</p>
              <p>• Keep meta descriptions under 160 characters</p>
              <p>• Preview pages before publishing</p>
              <p>• Use featured images for better engagement</p>
              <p>• Regular content updates improve rankings</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContentManagement;