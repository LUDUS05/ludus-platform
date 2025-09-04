import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import Alert from '../ui/Alert';
import api from '../../services/api';

const FormDisplay = () => {
  const { slug } = useParams();
  const { t } = useTranslation();
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    if (slug) {
      fetchForm();
      setStartTime(Date.now());
    }
  }, [slug]);

  const fetchForm = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/forms/${slug}`);
      setForm(response.data.data.form);
    } catch (err) {
      setError('Form not found or not available');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldId, value) => {
    setResponses(prev => ({
      ...prev,
      [fieldId]: { value }
    }));
  };

  const handleFileChange = (fieldId, files) => {
    setResponses(prev => ({
      ...prev,
      [fieldId]: {
        ...prev[fieldId],
        files: Array.from(files)
      }
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    form.fields.forEach(field => {
      if (field.required && (!responses[field.id] || !responses[field.id].value)) {
        errors.push(`Field "${field.label}" is required`);
      }
      
      if (responses[field.id] && responses[field.id].value) {
        // Basic validation
        if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(responses[field.id].value)) {
          errors.push(`Invalid email format for field "${field.label}"`);
        }
        
        if (field.type === 'number' && isNaN(responses[field.id].value)) {
          errors.push(`Invalid number format for field "${field.label}"`);
        }
      }
    });
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      const submissionTime = Math.round((Date.now() - startTime) / 1000);
      
      const response = await api.post(`/forms/${slug}/submit`, {
        responses: Object.entries(responses).map(([fieldId, data]) => ({
          fieldId,
          value: data.value,
          files: data.files || []
        })),
        metadata: {
          submissionTime,
          source: 'web'
        }
      });
      
      setSuccess(response.data.message);
      
      // Redirect if specified
      if (response.data.data.redirectUrl) {
        setTimeout(() => {
          window.location.href = response.data.data.redirectUrl;
        }, 2000);
      }
      
      // Clear form
      setResponses({});
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit form');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field) => {
    const fieldValue = responses[field.id]?.value || '';
    const fieldFiles = responses[field.id]?.files || [];

    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
      case 'phone':
        return (
          <Input
            type={field.type}
            value={fieldValue}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="w-full"
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={fieldValue}
            onChange={(e) => handleInputChange(field.id, parseFloat(e.target.value))}
            placeholder={field.placeholder}
            required={field.required}
            className="w-full"
          />
        );
      
      case 'textarea':
        return (
          <textarea
            value={fieldValue}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            rows={4}
          />
        );
      
      case 'date':
        return (
          <Input
            type="date"
            value={fieldValue}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            className="w-full"
          />
        );
      
      case 'select':
        return (
          <select
            value={fieldValue}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select an option...</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center">
                <input
                  type="radio"
                  name={field.id}
                  value={option.value}
                  checked={fieldValue === option.value}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  required={field.required}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );
      
      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center">
                <input
                  type="checkbox"
                  value={option.value}
                  checked={fieldValue.includes ? fieldValue.includes(option.value) : false}
                  onChange={(e) => {
                    const currentValues = Array.isArray(fieldValue) ? fieldValue : [];
                    const newValues = e.target.checked
                      ? [...currentValues, option.value]
                      : currentValues.filter(v => v !== option.value);
                    handleInputChange(field.id, newValues);
                  }}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );
      
      case 'file':
        return (
          <div>
            <input
              type="file"
              onChange={(e) => handleFileChange(field.id, e.target.files)}
              multiple
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            {fieldFiles.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                Selected: {fieldFiles.map(file => file.name).join(', ')}
              </div>
            )}
          </div>
        );
      
      default:
        return (
          <Input
            type="text"
            value={fieldValue}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="w-full"
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Alert
          type="error"
          message="Form not found or not available"
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{form.title}</h1>
          {form.description && (
            <p className="text-gray-600">{form.description}</p>
          )}
        </div>

        {form.settings.showProgressBar && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Object.keys(responses).length} / {form.fields.length} fields</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(Object.keys(responses).length / form.fields.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

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

        <form onSubmit={handleSubmit} className="space-y-6">
          {form.fields
            .sort((a, b) => a.order - b.order)
            .map((field) => (
              <div key={field.id} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.description && (
                  <p className="text-sm text-gray-500">{field.description}</p>
                )}
                {renderField(field)}
              </div>
            ))}

          <div className="pt-6 border-t">
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {submitting ? 'Submitting...' : form.settings.submitButtonText}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default FormDisplay;
