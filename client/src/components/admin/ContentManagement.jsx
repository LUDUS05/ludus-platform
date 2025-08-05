import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';
import api from '../../services/api';

const ContentManagement = () => {
  const { t, i18n } = useTranslation();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [editingPage, setEditingPage] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [newPage, setNewPage] = useState({
    slug: '',
    title: { en: '', ar: '' },
    content: { en: '', ar: '' },
    metaDescription: { en: '', ar: '' },
    metaKeywords: { en: '', ar: '' },
    isPublished: true,
    publishDate: new Date().toISOString().split('T')[0],
    sections: []
  });

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ];

  const pageTemplates = [
    {
      name: 'Basic Page',
      sections: [
        { type: 'hero', title: 'Hero Section', content: { en: '', ar: '' } },
        { type: 'content', title: 'Main Content', content: { en: '', ar: '' } }
      ]
    },
    {
      name: 'Landing Page',
      sections: [
        { type: 'hero', title: 'Hero Section', content: { en: '', ar: '' } },
        { type: 'features', title: 'Features', content: { en: '', ar: '' } },
        { type: 'testimonials', title: 'Testimonials', content: { en: '', ar: '' } },
        { type: 'cta', title: 'Call to Action', content: { en: '', ar: '' } }
      ]
    },
    {
      name: 'About Page',
      sections: [
        { type: 'intro', title: 'Introduction', content: { en: '', ar: '' } },
        { type: 'mission', title: 'Mission & Vision', content: { en: '', ar: '' } },
        { type: 'team', title: 'Our Team', content: { en: '', ar: '' } },
        { type: 'history', title: 'Our Story', content: { en: '', ar: '' } }
      ]
    }
  ];

  const sectionTypes = [
    { value: 'hero', label: 'Hero Section', icon: '🎯' },
    { value: 'content', label: 'Text Content', icon: '📝' },
    { value: 'features', label: 'Features Grid', icon: '⭐' },
    { value: 'testimonials', label: 'Testimonials', icon: '💬' },
    { value: 'cta', label: 'Call to Action', icon: '🚀' },
    { value: 'gallery', label: 'Image Gallery', icon: '🖼️' },
    { value: 'faq', label: 'FAQ Section', icon: '❓' },
    { value: 'contact', label: 'Contact Form', icon: '📞' }
  ];

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/pages');
      setPages(response.data.data);
    } catch (error) {
      console.error('Failed to fetch pages:', error);
      setMessage({ type: 'error', text: 'Failed to load pages' });
    } finally {
      setLoading(false);
    }
  };

  const savePage = async (pageData) => {
    try {
      setSaving(true);
      if (editingPage) {
        await api.put(`/admin/pages/${editingPage._id}`, pageData);
        setMessage({ type: 'success', text: 'Page updated successfully' });
      } else {
        await api.post('/admin/pages', pageData);
        setMessage({ type: 'success', text: 'Page created successfully' });
      }
      
      await fetchPages();
      resetForm();
    } catch (error) {
      console.error('Failed to save page:', error);
      setMessage({ type: 'error', text: 'Failed to save page' });
    } finally {
      setSaving(false);
    }
  };

  const deletePage = async (pageId) => {
    if (!window.confirm('Are you sure you want to delete this page?')) return;
    
    try {
      await api.delete(`/admin/pages/${pageId}`);
      setMessage({ type: 'success', text: 'Page deleted successfully' });
      await fetchPages();
    } catch (error) {
      console.error('Failed to delete page:', error);
      setMessage({ type: 'error', text: 'Failed to delete page' });
    }
  };

  const resetForm = () => {
    setEditingPage(null);
    setNewPage({
      slug: '',
      title: { en: '', ar: '' },
      content: { en: '', ar: '' },
      metaDescription: { en: '', ar: '' },
      metaKeywords: { en: '', ar: '' },
      isPublished: true,
      publishDate: new Date().toISOString().split('T')[0],
      sections: []
    });
  };

  const startEditing = (page) => {
    setEditingPage(page);
    setNewPage({
      slug: page.slug || '',
      title: page.title || { en: '', ar: '' },
      content: page.content || { en: '', ar: '' },
      metaDescription: page.metaDescription || { en: '', ar: '' },
      metaKeywords: page.metaKeywords || { en: '', ar: '' },
      isPublished: page.isPublished !== false,
      publishDate: page.publishDate?.split('T')[0] || new Date().toISOString().split('T')[0],
      sections: page.sections || []
    });
  };

  const updatePageField = (field, value, language = null) => {
    if (language) {
      setNewPage(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          [language]: value
        }
      }));
    } else {
      setNewPage(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const addSection = (type = 'content') => {
    const newSection = {
      id: Date.now().toString(),
      type,
      title: '',
      content: { en: '', ar: '' },
      settings: {}
    };
    
    setNewPage(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  };

  const updateSection = (sectionId, field, value, language = null) => {
    setNewPage(prev => ({
      ...prev,
      sections: prev.sections.map(section => 
        section.id === sectionId 
          ? language 
            ? { ...section, [field]: { ...section[field], [language]: value } }
            : { ...section, [field]: value }
          : section
      )
    }));
  };

  const removeSection = (sectionId) => {
    setNewPage(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== sectionId)
    }));
  };

  const duplicatePage = async (page) => {
    try {
      const duplicatedPage = {
        ...page,
        slug: `${page.slug}-copy`,
        title: {
          en: `${page.title?.en || page.title} (Copy)`,
          ar: `${page.title?.ar || page.title} (نسخة)`
        },
        isPublished: false
      };
      delete duplicatedPage._id;
      
      await api.post('/admin/pages', duplicatedPage);
      setMessage({ type: 'success', text: 'Page duplicated successfully' });
      await fetchPages();
    } catch (error) {
      console.error('Failed to duplicate page:', error);
      setMessage({ type: 'error', text: 'Failed to duplicate page' });
    }
  };

  const applyTemplate = (template) => {
    setNewPage(prev => ({
      ...prev,
      sections: template.sections.map(section => ({
        ...section,
        id: Date.now().toString() + Math.random()
      }))
    }));
  };

  const generateSlug = (title) => {
    return title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    savePage(newPage);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-display-sm font-bold text-ludus-dark">
            Content Management
          </h1>
          <p className="text-body-sm text-ludus-gray-600">
            Manage website pages and multilingual content
          </p>
        </div>
        <Button
          onClick={resetForm}
          className="bg-ludus-orange text-white"
        >
          ➕ Add New Page
        </Button>
      </div>

      {message && (
        <Alert
          type={message.type}
          message={message.text}
          onClose={() => setMessage(null)}
        />
      )}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Page Form */}
        <div className="xl:col-span-3">
          <Card className="p-6">
            <h3 className="text-body-lg font-semibold text-ludus-dark mb-4">
              {editingPage ? 'Edit Page' : 'Create New Page'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                    Page Slug
                  </label>
                  <Input
                    value={newPage.slug}
                    onChange={(e) => updatePageField('slug', e.target.value)}
                    placeholder="about-us"
                    required
                  />
                  <p className="text-xs text-ludus-gray-500 mt-1">
                    URL: /pages/{newPage.slug}
                  </p>
                </div>

                <div>
                  <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                    Publishing
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="checkbox"
                      id="isPublished"
                      checked={newPage.isPublished}
                      onChange={(e) => updatePageField('isPublished', e.target.checked)}
                      className="mt-1"
                    />
                    <label htmlFor="isPublished" className="text-sm text-ludus-dark">
                      Published
                    </label>
                  </div>
                  <Input
                    type="date"
                    value={newPage.publishDate}
                    onChange={(e) => updatePageField('publishDate', e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Language Selection */}
              <div>
                <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                  Editing Language
                </label>
                <div className="flex gap-2">
                  {languages.map(lang => (
                    <Button
                      key={lang.code}
                      type="button"
                      variant={selectedLanguage === lang.code ? "default" : "outline"}
                      onClick={() => setSelectedLanguage(lang.code)}
                      className={selectedLanguage === lang.code 
                        ? "bg-ludus-orange text-white" 
                        : "text-ludus-dark border-ludus-gray-300"
                      }
                    >
                      {lang.flag} {lang.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Page Title */}
              <div>
                <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                  Page Title ({selectedLanguage.toUpperCase()})
                </label>
                <Input
                  value={newPage.title[selectedLanguage]}
                  onChange={(e) => {
                    updatePageField('title', e.target.value, selectedLanguage);
                    if (!newPage.slug && selectedLanguage === 'en') {
                      updatePageField('slug', generateSlug(e.target.value));
                    }
                  }}
                  placeholder="About LUDUS Platform"
                  dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}
                  required
                />
              </div>

              {/* Meta Description */}
              <div>
                <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                  Meta Description ({selectedLanguage.toUpperCase()})
                </label>
                <textarea
                  value={newPage.metaDescription[selectedLanguage]}
                  onChange={(e) => updatePageField('metaDescription', e.target.value, selectedLanguage)}
                  placeholder="SEO description for search engines"
                  className="w-full px-3 py-2 border border-ludus-gray-300 rounded-md resize-none h-20"
                  dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}
                />
              </div>

              {/* Page Sections */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-label-sm font-medium text-ludus-dark">
                    Page Sections
                  </label>
                  <div className="flex gap-2">
                    <select
                      onChange={(e) => {
                        const template = pageTemplates.find(t => t.name === e.target.value);
                        if (template) applyTemplate(template);
                        e.target.value = '';
                      }}
                      className="px-3 py-1 border border-ludus-gray-300 rounded text-sm"
                      defaultValue=""
                    >
                      <option value="">Apply Template</option>
                      {pageTemplates.map(template => (
                        <option key={template.name} value={template.name}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => addSection()}
                      className="bg-ludus-orange text-white"
                    >
                      ➕ Add Section
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {newPage.sections.map((section, index) => (
                    <Card key={section.id} className="p-4 bg-ludus-gray-50">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <select
                            value={section.type}
                            onChange={(e) => updateSection(section.id, 'type', e.target.value)}
                            className="px-2 py-1 border border-ludus-gray-300 rounded text-sm"
                          >
                            {sectionTypes.map(type => (
                              <option key={type.value} value={type.value}>
                                {type.icon} {type.label}
                              </option>
                            ))}
                          </select>
                          <span className="text-sm text-ludus-gray-600">Section {index + 1}</span>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => removeSection(section.id)}
                          className="text-red-600 border-red-300"
                        >
                          🗑️
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Input
                            placeholder="Section Title"
                            value={section.title}
                            onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                            className="mb-2"
                          />
                          <textarea
                            placeholder={`Section Content (${selectedLanguage.toUpperCase()})`}
                            value={section.content[selectedLanguage] || ''}
                            onChange={(e) => updateSection(section.id, 'content', e.target.value, selectedLanguage)}
                            className="w-full px-3 py-2 border border-ludus-gray-300 rounded-md resize-none h-24"
                            dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={saving}
                className="bg-ludus-orange text-white w-full"
              >
                {saving ? '💾 Saving...' : editingPage ? '📝 Update Page' : '➕ Create Page'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Pages List */}
        <div className="xl:col-span-1">
          <Card className="p-6">
            <h3 className="text-body-lg font-semibold text-ludus-dark mb-4">
              Pages ({pages.length})
            </h3>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-ludus-orange border-t-transparent mx-auto"></div>
                <p className="text-ludus-gray-600 mt-2 text-sm">Loading...</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {pages.map(page => (
                  <div
                    key={page._id}
                    className={`p-3 rounded-lg border ${
                      page.isPublished !== false 
                        ? 'bg-white border-ludus-gray-200' 
                        : 'bg-ludus-gray-50 border-ludus-gray-300 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-ludus-dark text-sm truncate">
                          {page.title?.en || page.title}
                        </h4>
                        <p className="text-xs text-ludus-gray-600 truncate">
                          /{page.slug}
                        </p>
                        <div className="text-xs text-ludus-gray-500 mt-1">
                          {page.isPublished !== false ? '🟢 Published' : '🔴 Draft'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-1 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEditing(page)}
                        className="text-xs px-2 py-1 text-ludus-orange border-ludus-orange/30"
                      >
                        ✏️
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => duplicatePage(page)}
                        className="text-xs px-2 py-1 text-green-600 border-green-300"
                      >
                        📋
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deletePage(page._id)}
                        className="text-xs px-2 py-1 text-red-600 border-red-300"
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContentManagement;