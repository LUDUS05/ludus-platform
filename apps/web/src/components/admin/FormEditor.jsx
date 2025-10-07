import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import Alert from '../ui/Alert';
import api from '../../services/api';

const FormEditor = ({ form, onSave, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    slug: '',
    fields: [],
    settings: {
      allowMultipleSubmissions: true,
      requireAuthentication: false,
      showProgressBar: true,
      submitButtonText: 'Submit',
      successMessage: 'Thank you for your submission!',
      redirectUrl: '',
      emailNotifications: {
        enabled: false,
        recipients: [],
        subject: '',
        template: ''
      }
    },
    menuPlacement: {
      enabled: false,
      location: 'none',
      label: '',
      order: 0
    },
    status: 'draft'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (form) {
      setFormData(form);
    }
  }, [form]);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleNestedInputChange = (parent, child, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: value
      }
    }));
  };

  const addField = () => {
    const newField = {
      id: `field_${Date.now()}`,
      type: 'text',
      label: '',
      placeholder: '',
      description: '',
      required: false,
      options: [],
      validation: {},
      order: formData.fields.length
    };
    
    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
  };

  const updateField = (index, fieldData) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map((field, i) => 
        i === index ? { ...field, ...fieldData } : field
      )
    }));
  };

  const removeField = (index) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }));
  };

  const moveField = (index, direction) => {
    const newFields = [...formData.fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newFields.length) {
      [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
      
      // Update order
      newFields.forEach((field, i) => {
        field.order = i;
      });
      
      setFormData(prev => ({
        ...prev,
        fields: newFields
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (form) {
        await api.put(`/admin/forms/${form._id}`, formData);
        setSuccess('Form updated successfully');
      } else {
        await api.post('/admin/forms', formData);
        setSuccess('Form created successfully');
      }
      
      setTimeout(() => {
        onSave();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save form');
    } finally {
      setLoading(false);
    }
  };

  const fieldTypes = [
    { value: 'text', label: 'Text Input' },
    { value: 'email', label: 'Email' },
    { value: 'number', label: 'Number' },
    { value: 'textarea', label: 'Textarea' },
    { value: 'select', label: 'Select Dropdown' },
    { value: 'radio', label: 'Radio Buttons' },
    { value: 'checkbox', label: 'Checkboxes' },
    { value: 'date', label: 'Date' },
    { value: 'file', label: 'File Upload' },
    { value: 'url', label: 'URL' },
    { value: 'phone', label: 'Phone Number' }
  ];

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: '📝' },
    { id: 'fields', label: 'Fields', icon: '📋' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'menu', label: 'Menu Placement', icon: '🔗' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {form ? 'Edit Form' : 'Create New Form'}
          </h1>
          <p className="text-gray-600">
            {form ? 'Update form settings and fields' : 'Design a custom form for your website'}
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? 'Saving...' : 'Save Form'}
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError('')}
        />
      )}
      {success && (
        <Alert
          type="success"
          message={success}
          onClose={() => setSuccess('')}
        />
      )}

      <form onSubmit={handleSubmit}>
        <Card className="p-0">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  {tab.icon} {tab.label}
                </span>
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Form Title *
                    </label>
                    <Input
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder={t('common.contactForm')}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Form Slug *
                    </label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder="contact-form"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      URL: /forms/{formData.slug || 'your-slug'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Brief description of this form..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            )}

            {/* Fields Tab */}
            {activeTab === 'fields' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Form Fields</h3>
                  <Button
                    type="button"
                    onClick={addField}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Add Field
                  </Button>
                </div>

                {formData.fields.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>{t('common.noFieldsAdded')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.fields.map((field, index) => (
                      <FieldEditor
                        key={field.id}
                        field={field}
                        index={index}
                        onUpdate={(fieldData) => updateField(index, fieldData)}
                        onRemove={() => removeField(index)}
                        onMove={(direction) => moveField(index, direction)}
                        fieldTypes={fieldTypes}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Form Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="allowMultipleSubmissions"
                        checked={formData.settings.allowMultipleSubmissions}
                        onChange={(e) => handleNestedInputChange('settings', 'allowMultipleSubmissions', e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor="allowMultipleSubmissions" className="text-sm text-gray-700">
                        Allow multiple submissions
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="requireAuthentication"
                        checked={formData.settings.requireAuthentication}
                        onChange={(e) => handleNestedInputChange('settings', 'requireAuthentication', e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor="requireAuthentication" className="text-sm text-gray-700">
                        Require user authentication
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="showProgressBar"
                        checked={formData.settings.showProgressBar}
                        onChange={(e) => handleNestedInputChange('settings', 'showProgressBar', e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor="showProgressBar" className="text-sm text-gray-700">
                        Show progress bar
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Submit Button Text
                      </label>
                      <Input
                        value={formData.settings.submitButtonText}
                        onChange={(e) => handleNestedInputChange('settings', 'submitButtonText', e.target.value)}
                        placeholder="Submit"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Success Message
                      </label>
                      <textarea
                        value={formData.settings.successMessage}
                        onChange={(e) => handleNestedInputChange('settings', 'successMessage', e.target.value)}
                        placeholder="Thank you for your submission!"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        rows={2}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Redirect URL (optional)
                      </label>
                      <Input
                        value={formData.settings.redirectUrl}
                        onChange={(e) => handleNestedInputChange('settings', 'redirectUrl', e.target.value)}
                        placeholder="/thank-you"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Menu Placement Tab */}
            {activeTab === 'menu' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Menu Placement</h3>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="menuEnabled"
                    checked={formData.menuPlacement.enabled}
                    onChange={(e) => handleNestedInputChange('menuPlacement', 'enabled', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="menuEnabled" className="text-sm text-gray-700">
                    Add to website menu
                  </label>
                </div>
                
                {formData.menuPlacement.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Menu Location
                      </label>
                      <select
                        value={formData.menuPlacement.location}
                        onChange={(e) => handleNestedInputChange('menuPlacement', 'location', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="header">Header Menu</option>
                        <option value="footer">Footer Menu</option>
                        <option value="sidebar">Sidebar</option>
                        <option value="none">None</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Menu Label
                      </label>
                      <Input
                        value={formData.menuPlacement.label}
                        onChange={(e) => handleNestedInputChange('menuPlacement', 'label', e.target.value)}
                        placeholder={t('common.contactUs')}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Menu Order
                      </label>
                      <Input
                        type="number"
                        value={formData.menuPlacement.order}
                        onChange={(e) => handleNestedInputChange('menuPlacement', 'order', parseInt(e.target.value))}
                        placeholder="0"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </form>
    </div>
  );
};

// Field Editor Component
const FieldEditor = ({ field, index, onUpdate, onRemove, onMove, fieldTypes }) => {
  const [fieldData, setFieldData] = useState(field);

  useEffect(() => {
    setFieldData(field);
  }, [field]);

  const handleFieldChange = (key, value) => {
    const updated = { ...fieldData, [key]: value };
    setFieldData(updated);
    onUpdate(updated);
  };

  const addOption = () => {
    const newOptions = [...(fieldData.options || []), { value: '', label: '' }];
    handleFieldChange('options', newOptions);
  };

  const updateOption = (optionIndex, key, value) => {
    const newOptions = [...(fieldData.options || [])];
    newOptions[optionIndex] = { ...newOptions[optionIndex], [key]: value };
    handleFieldChange('options', newOptions);
  };

  const removeOption = (optionIndex) => {
    const newOptions = (fieldData.options || []).filter((_, i) => i !== optionIndex);
    handleFieldChange('options', newOptions);
  };

  const needsOptions = ['select', 'radio', 'checkbox'].includes(fieldData.type);

  return (
    <Card className="p-4">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-500">Field {index + 1}</span>
          <div className="flex space-x-1">
            <button
              type="button"
              onClick={() => onMove('up')}
              disabled={index === 0}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => onMove('down')}
              disabled={index === fieldData.order}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              ↓
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-red-600 hover:text-red-700 text-sm"
        >
          Remove
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Field Type
          </label>
          <select
            value={fieldData.type}
            onChange={(e) => handleFieldChange('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            {fieldTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Field Label *
          </label>
          <Input
            value={fieldData.label}
            onChange={(e) => handleFieldChange('label', e.target.value)}
            placeholder={t('common.fieldLabel')}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Placeholder
          </label>
          <Input
            value={fieldData.placeholder}
            onChange={(e) => handleFieldChange('placeholder', e.target.value)}
            placeholder="Enter placeholder text..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <Input
            value={fieldData.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            placeholder="Help text for this field..."
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={fieldData.required}
            onChange={(e) => handleFieldChange('required', e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">Required field</span>
        </label>
      </div>

      {needsOptions && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Options
            </label>
            <button
              type="button"
              onClick={addOption}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Add Option
            </button>
          </div>
          
          <div className="space-y-2">
            {(fieldData.options || []).map((option, optionIndex) => (
              <div key={optionIndex} className="flex space-x-2">
                <Input
                  value={option.value}
                  onChange={(e) => updateOption(optionIndex, 'value', e.target.value)}
                  placeholder="Value"
                  className="flex-1"
                />
                <Input
                  value={option.label}
                  onChange={(e) => updateOption(optionIndex, 'label', e.target.value)}
                  placeholder="Label"
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeOption(optionIndex)}
                  className="text-red-600 hover:text-red-700 px-2"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default FormEditor;
