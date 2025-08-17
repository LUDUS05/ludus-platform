import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';
import api from '../../services/api';

const PageForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    title: {
      en: '',
      ar: ''
    },
    content: '',
    slug: '',
    placement: 'none',
    status: 'draft',
    metaDescription: '',
    metaKeywords: '',
    navigationOrder: 0
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (isEditing) {
      fetchPage();
    }
  }, [id, isEditing]);

  const fetchPage = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/pages/${id}`);
      const page = response.data.data;
      
      setFormData({
        title: page.title || { en: '', ar: '' },
        content: page.content || '',
        slug: page.slug || '',
        placement: page.placement || 'none',
        status: page.status || 'draft',
        metaDescription: page.metaDescription || '',
        metaKeywords: page.metaKeywords || '',
        navigationOrder: page.navigationOrder || 0
      });
    } catch (error) {
      console.error('Failed to fetch page:', error);
      setMessage({ type: 'error', text: 'Failed to load page' });
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (lang, title) => {
    setFormData(prev => ({
      ...prev,
      title: {
        ...prev.title,
        [lang]: title
      },
      // Auto-generate slug from English title if it's empty or if we're creating a new page
      slug: !isEditing && !prev.slug && lang === 'en' && title ? generateSlugFromTitle(title) : prev.slug
    }));
  };

  const generateSlugFromTitle = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      if (isEditing) {
        await api.put(`/admin/pages/${id}`, formData);
        setMessage({ type: 'success', text: 'Page updated successfully' });
      } else {
        await api.post('/admin/pages', formData);
        setMessage({ type: 'success', text: 'Page created successfully' });
      }
      
      // Redirect after short delay
      setTimeout(() => {
        navigate('/admin/content');
      }, 1500);
      
    } catch (error) {
      console.error('Failed to save page:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to save page' 
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-ludus-orange border-t-transparent mx-auto"></div>
        <p className="text-ludus-gray-600 mt-4">Loading page...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-display-sm font-bold text-ludus-dark">
            {isEditing ? 'Edit Page' : 'Create New Page'}
          </h1>
          <p className="text-body-sm text-ludus-gray-600">
            {isEditing ? 'Update page content and settings' : 'Create a new page for the platform'}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/admin/content')}
          className="text-ludus-dark border-ludus-gray-300"
        >
          ← Back to Pages
        </Button>
      </div>

      {message && (
        <Alert
          type={message.type}
          message={message.text}
          onClose={() => setMessage(null)}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h3 className="text-body-lg font-semibold text-ludus-dark mb-4">Basic Information</h3>
          
          {/* Page Titles */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                  English Title *
                </label>
                <Input
                  value={formData.title.en}
                  onChange={(e) => handleTitleChange('en', e.target.value)}
                  placeholder="e.g., About Us, Contact, Privacy Policy"
                  required
                />
              </div>
              
              <div>
                <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                  Arabic Title *
                </label>
                <Input
                  value={formData.title.ar}
                  onChange={(e) => handleTitleChange('ar', e.target.value)}
                  placeholder="مثلا: حول الشركة، اتصل بنا، سياسة الخصوصية"
                  className="text-right"
                  dir="rtl"
                  required
                />
              </div>
            </div>
          </div>

          {/* Slug */}
          <div className="mb-6">
            <label className="block text-label-sm font-medium text-ludus-dark mb-2">
              URL Slug *
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-ludus-gray-300 bg-ludus-gray-50 text-ludus-gray-500 text-sm">
                app.letsludus.com/pages/
              </span>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g., about-us, contact, privacy-policy"
                className="rounded-l-none border-l-0"
                required
              />
            </div>
            <p className="text-xs text-ludus-gray-500 mt-1">
              Only lowercase letters, numbers, and dashes allowed. Auto-generated from English title.
            </p>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-ludus-gray-300 rounded-md"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            
            <div>
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                Menu Placement
              </label>
              <select
                value={formData.placement}
                onChange={(e) => setFormData({ ...formData, placement: e.target.value })}
                className="w-full px-3 py-2 border border-ludus-gray-300 rounded-md"
              >
                <option value="none">No Menu</option>
                <option value="header">Header Menu</option>
                <option value="footer">Footer Menu</option>
              </select>
            </div>
            
            <div>
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                Menu Order
              </label>
              <Input
                type="number"
                value={formData.navigationOrder}
                onChange={(e) => setFormData({ ...formData, navigationOrder: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
              <p className="text-xs text-ludus-gray-500 mt-1">
                Lower numbers appear first
              </p>
            </div>
          </div>
        </Card>

        {/* Content */}
        <Card className="p-6">
          <h3 className="text-body-lg font-semibold text-ludus-dark mb-4">Page Content</h3>
          
          <div>
            <label className="block text-label-sm font-medium text-ludus-dark mb-2">
              Page Content *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your page content here... (HTML and Markdown supported)"
              required
              rows={12}
              className="w-full px-3 py-2 border border-ludus-gray-300 rounded-md font-mono text-sm resize-vertical"
            />
            <p className="text-xs text-ludus-gray-500 mt-1">
              You can use HTML tags and basic formatting in this field.
            </p>
          </div>
        </Card>

        {/* SEO Settings */}
        <Card className="p-6">
          <h3 className="text-body-lg font-semibold text-ludus-dark mb-4">SEO Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                Meta Description
              </label>
              <textarea
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                placeholder="Brief description for search engines (recommended: 120-160 characters)"
                maxLength="160"
                rows="3"
                className="w-full px-3 py-2 border border-ludus-gray-300 rounded-md"
              />
              <p className="text-xs text-ludus-gray-500 mt-1">
                {formData.metaDescription.length}/160 characters
              </p>
            </div>

            <div>
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                Meta Keywords
              </label>
              <Input
                value={formData.metaKeywords}
                onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                placeholder="keyword1, keyword2, keyword3"
              />
            </div>
          </div>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={saving}
            className="bg-ludus-orange text-white px-8"
          >
            {saving ? '💾 Saving...' : isEditing ? '📝 Update Page' : '➕ Create Page'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/content')}
            className="text-ludus-dark border-ludus-gray-300"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PageForm;