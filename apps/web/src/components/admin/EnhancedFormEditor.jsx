import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import Alert from '../ui/Alert';
import api from '../../services/api';

const EnhancedFormEditor = ({ form, onSave, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    slug: '',
    status: 'draft',
    fields: [],
    validation: {
      required: [],
      customRules: []
    },
    settings: {
      allowMultipleSubmissions: false,
      requireAuthentication: false,
      showProgressBar: true,
      redirectUrl: '',
      successMessage: '',
      emailNotifications: false,
      notificationEmails: []
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (form) {
      setFormData({
        title: form.title || '',
        description: form.description || '',
        slug: form.slug || '',
        status: form.status || 'draft',
        fields: form.fields || [],
        validation: form.validation || { required: [], customRules: [] },
        settings: form.settings || {
          allowMultipleSubmissions: false,
          requireAuthentication: false,
          showProgressBar: true,
          redirectUrl: '',
          successMessage: '',
          emailNotifications: false,
          notificationEmails: []
        }
      });
    }
  }, [form]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const addField = () => {
    const newField = {
      id: Date.now().toString(),
      type: 'text',
      label: '',
      placeholder: '',
      required: false,
      options: [],
      validation: {
        minLength: '',
        maxLength: '',
        pattern: '',
        customMessage: ''
      }
    };
    
    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
  };

  const updateField = (fieldId, updates) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }));
  };

  const removeField = (fieldId) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const endpoint = form ? `/admin/forms/${form._id}` : '/admin/forms';
      const method = form ? 'PUT' : 'POST';
      
      const response = await api[method.toLowerCase()](endpoint, formData);
      
      setSuccess(form ? 'Form updated successfully' : 'Form created successfully');
      onSave(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save form');
    } finally {
      setLoading(false);
    }
  };

  const fieldTypes = [
    { value: 'text', label: 'Text Input' },
    { value: 'textarea', label: 'Text Area' },
    { value: 'email', label: 'Email' },
    { value: 'number', label: 'Number' },
    { value: 'select', label: 'Dropdown' },
    { value: 'radio', label: 'Radio Buttons' },
    { value: 'checkbox', label: 'Checkboxes' },
    { value: 'date', label: 'Date' },
    { value: 'file', label: 'File Upload' },
    { value: 'rating', label: 'Rating' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {form ? 'Edit Form' : 'Create New Form'}
        </h2>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-ludus-orange hover:bg-ludus-orange-dark"
          >
            {loading ? 'Saving...' : 'Save Form'}
          </Button>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Settings */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Form Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Form Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter form title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter form description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ludus-orange focus:border-transparent"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug *
                </label>
                <Input
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="form-slug"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ludus-orange focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Form Options</h4>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.settings.allowMultipleSubmissions}
                    onChange={(e) => handleNestedChange('settings', 'allowMultipleSubmissions', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Allow multiple submissions</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.settings.requireAuthentication}
                    onChange={(e) => handleNestedChange('settings', 'requireAuthentication', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Require authentication</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.settings.showProgressBar}
                    onChange={(e) => handleNestedChange('settings', 'showProgressBar', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Show progress bar</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.settings.emailNotifications}
                    onChange={(e) => handleNestedChange('settings', 'emailNotifications', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Email notifications</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Success Message
                </label>
                <textarea
                  value={formData.settings.successMessage}
                  onChange={(e) => handleNestedChange('settings', 'successMessage', e.target.value)}
                  placeholder="Thank you for your submission!"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ludus-orange focus:border-transparent"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Redirect URL
                </label>
                <Input
                  value={formData.settings.redirectUrl}
                  onChange={(e) => handleNestedChange('settings', 'redirectUrl', e.target.value)}
                  placeholder="https://example.com/thank-you"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Form Fields */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Form Fields</h3>
              <Button
                onClick={addField}
                variant="outline"
                size="sm"
              >
                Add Field
              </Button>
            </div>

            <div className="space-y-4">
              {formData.fields.map((field, index) => (
                <FieldEditor
                  key={field.id}
                  field={field}
                  index={index}
                  onUpdate={(updates) => updateField(field.id, updates)}
                  onRemove={() => removeField(field.id)}
                  fieldTypes={fieldTypes}
                />
              ))}

              {formData.fields.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📝</div>
                  <p>No fields added yet. Click "Add Field" to get started.</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const FieldEditor = ({ field, index, onUpdate, onRemove, fieldTypes }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFieldChange = (key, value) => {
    onUpdate({ [key]: value });
  };

  const handleValidationChange = (key, value) => {
    onUpdate({
      validation: {
        ...field.validation,
        [key]: value
      }
    });
  };

  const addOption = () => {
    const newOptions = [...(field.options || []), { label: '', value: '' }];
    onUpdate({ options: newOptions });
  };

  const updateOption = (optionIndex, key, value) => {
    const newOptions = [...(field.options || [])];
    newOptions[optionIndex] = { ...newOptions[optionIndex], [key]: value };
    onUpdate({ options: newOptions });
  };

  const removeOption = (optionIndex) => {
    const newOptions = (field.options || []).filter((_, i) => i !== optionIndex);
    onUpdate({ options: newOptions });
  };

  const needsOptions = ['select', 'radio', 'checkbox'].includes(field.type);

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
          <span className="text-sm font-medium text-gray-900">
            {field.label || 'Untitled Field'}
          </span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
            {fieldTypes.find(t => t.value === field.type)?.label}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600"
          >
            {isExpanded ? '−' : '+'}
          </button>
          <button
            onClick={onRemove}
            className="text-red-400 hover:text-red-600"
          >
            🗑️
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Field Type
              </label>
              <select
                value={field.type}
                onChange={(e) => handleFieldChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ludus-orange focus:border-transparent"
              >
                {fieldTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => handleFieldChange('required', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Required</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label *
            </label>
            <Input
              value={field.label}
              onChange={(e) => handleFieldChange('label', e.target.value)}
              placeholder="Field label"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Placeholder
            </label>
            <Input
              value={field.placeholder}
              onChange={(e) => handleFieldChange('placeholder', e.target.value)}
              placeholder="Field placeholder"
            />
          </div>

          {needsOptions && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Options
                </label>
                <Button
                  onClick={addOption}
                  variant="outline"
                  size="sm"
                >
                  Add Option
                </Button>
              </div>
              
              <div className="space-y-2">
                {(field.options || []).map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center space-x-2">
                    <Input
                      value={option.label}
                      onChange={(e) => updateOption(optionIndex, 'label', e.target.value)}
                      placeholder="Option label"
                      className="flex-1"
                    />
                    <Input
                      value={option.value}
                      onChange={(e) => updateOption(optionIndex, 'value', e.target.value)}
                      placeholder="Option value"
                      className="flex-1"
                    />
                    <button
                      onClick={() => removeOption(optionIndex)}
                      className="text-red-400 hover:text-red-600"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Length
              </label>
              <Input
                type="number"
                value={field.validation?.minLength || ''}
                onChange={(e) => handleValidationChange('minLength', e.target.value)}
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Length
              </label>
              <Input
                type="number"
                value={field.validation?.maxLength || ''}
                onChange={(e) => handleValidationChange('maxLength', e.target.value)}
                placeholder="100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custom Validation Pattern (Regex)
            </label>
            <Input
              value={field.validation?.pattern || ''}
              onChange={(e) => handleValidationChange('pattern', e.target.value)}
              placeholder="^[a-zA-Z0-9]+$"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custom Error Message
            </label>
            <Input
              value={field.validation?.customMessage || ''}
              onChange={(e) => handleValidationChange('customMessage', e.target.value)}
              placeholder="Please enter a valid value"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedFormEditor;
