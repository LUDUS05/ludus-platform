import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';
import axios from 'axios';

const SiteSettingsManagement = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    comingSoonMode: false,
    maintenanceMode: false,
    comingSoonTitle: '',
    comingSoonMessage: '',
    maintenanceTitle: '',
    maintenanceMessage: '',
    estimatedReturnTime: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/site-settings');
      setSettings(response.data);
      setFormData({
        comingSoonMode: response.data.comingSoonMode || false,
        maintenanceMode: response.data.maintenanceMode || false,
        comingSoonTitle: response.data.comingSoonTitle || 'LUDUS is Coming Soon',
        comingSoonMessage: response.data.comingSoonMessage || 'We\'re building something amazing. Get ready to discover incredible activities and experiences!',
        maintenanceTitle: response.data.maintenanceTitle || 'Under Maintenance',
        maintenanceMessage: response.data.maintenanceMessage || 'We\'re currently updating our platform to serve you better. We\'ll be back shortly!',
        estimatedReturnTime: response.data.estimatedReturnTime ? new Date(response.data.estimatedReturnTime).toISOString().slice(0, 16) : ''
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError('Failed to load site settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const submitData = { ...formData };
      if (submitData.estimatedReturnTime) {
        submitData.estimatedReturnTime = new Date(submitData.estimatedReturnTime).toISOString();
      }

      await axios.put('/api/site-settings', submitData);
      setSuccess('Site settings updated successfully');
      fetchSettings();
    } catch (error) {
      console.error('Error updating settings:', error);
      setError(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleMode = async (mode) => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      if (mode === 'comingSoon') {
        await axios.post('/api/site-settings/toggle-coming-soon');
        setSuccess(`Coming soon mode ${!formData.comingSoonMode ? 'enabled' : 'disabled'}`);
      } else if (mode === 'maintenance') {
        await axios.post('/api/site-settings/toggle-maintenance');
        setSuccess(`Maintenance mode ${!formData.maintenanceMode ? 'enabled' : 'disabled'}`);
      }

      fetchSettings();
    } catch (error) {
      console.error('Error toggling mode:', error);
      setError(error.response?.data?.message || 'Failed to toggle mode');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-display-sm font-bold text-charcoal dark:text-dark-text-primary mb-6">
        Site Mode Management
      </h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" className="mb-6">
          {success}
        </Alert>
      )}

      {/* Quick Toggle Section */}
      <div className="bg-white dark:bg-dark-bg-secondary rounded-xl p-6 mb-8 border border-warm dark:border-dark-border-secondary">
        <h2 className="text-body-lg font-semibold text-charcoal dark:text-dark-text-primary mb-4">
          Quick Actions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 bg-soft-white dark:bg-dark-bg-tertiary rounded-lg border border-warm dark:border-dark-border-secondary">
            <div>
              <h3 className="font-medium text-charcoal dark:text-dark-text-primary">Coming Soon Mode</h3>
              <p className="text-sm text-charcoal-light dark:text-dark-text-secondary">
                Show coming soon page to visitors
              </p>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                formData.comingSoonMode 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}>
                {formData.comingSoonMode ? 'Active' : 'Inactive'}
              </span>
            </div>
            <Button
              onClick={() => toggleMode('comingSoon')}
              variant={formData.comingSoonMode ? "destructive" : "primary"}
              size="sm"
              disabled={saving}
            >
              {formData.comingSoonMode ? 'Disable' : 'Enable'}
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-soft-white dark:bg-dark-bg-tertiary rounded-lg border border-warm dark:border-dark-border-secondary">
            <div>
              <h3 className="font-medium text-charcoal dark:text-dark-text-primary">Maintenance Mode</h3>
              <p className="text-sm text-charcoal-light dark:text-dark-text-secondary">
                Show maintenance page to visitors
              </p>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                formData.maintenanceMode 
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}>
                {formData.maintenanceMode ? 'Active' : 'Inactive'}
              </span>
            </div>
            <Button
              onClick={() => toggleMode('maintenance')}
              variant={formData.maintenanceMode ? "destructive" : "secondary"}
              size="sm"
              disabled={saving}
            >
              {formData.maintenanceMode ? 'Disable' : 'Enable'}
            </Button>
          </div>
        </div>
      </div>

      {/* Detailed Settings Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-bg-secondary rounded-xl p-6 border border-warm dark:border-dark-border-secondary">
        <h2 className="text-body-lg font-semibold text-charcoal dark:text-dark-text-primary mb-6">
          Page Content Settings
        </h2>

        <div className="space-y-6">
          {/* Coming Soon Settings */}
          <div className="border-b border-warm dark:border-dark-border-secondary pb-6">
            <h3 className="text-body-md font-medium text-charcoal dark:text-dark-text-primary mb-4">
              Coming Soon Page
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Title"
                name="comingSoonTitle"
                value={formData.comingSoonTitle}
                onChange={handleInputChange}
                placeholder="Enter coming soon page title"
              />
              
              <div>
                <label className="block text-sm font-medium text-charcoal dark:text-dark-text-primary mb-2">
                  Message
                </label>
                <textarea
                  name="comingSoonMessage"
                  value={formData.comingSoonMessage}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-warm dark:border-dark-border-secondary rounded-lg focus:ring-2 focus:ring-ludus-orange dark:focus:ring-dark-ludus-orange focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-charcoal dark:text-dark-text-primary"
                  placeholder="Enter coming soon page message"
                />
              </div>
            </div>
          </div>

          {/* Maintenance Settings */}
          <div className="border-b border-warm dark:border-dark-border-secondary pb-6">
            <h3 className="text-body-md font-medium text-charcoal dark:text-dark-text-primary mb-4">
              Maintenance Page
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Title"
                name="maintenanceTitle"
                value={formData.maintenanceTitle}
                onChange={handleInputChange}
                placeholder="Enter maintenance page title"
              />
              
              <div>
                <label className="block text-sm font-medium text-charcoal dark:text-dark-text-primary mb-2">
                  Message
                </label>
                <textarea
                  name="maintenanceMessage"
                  value={formData.maintenanceMessage}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-warm dark:border-dark-border-secondary rounded-lg focus:ring-2 focus:ring-ludus-orange dark:focus:ring-dark-ludus-orange focus:border-transparent bg-white dark:bg-dark-bg-tertiary text-charcoal dark:text-dark-text-primary"
                  placeholder="Enter maintenance page message"
                />
              </div>

              <Input
                label="Estimated Return Time (Optional)"
                name="estimatedReturnTime"
                type="datetime-local"
                value={formData.estimatedReturnTime}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Mode Toggles */}
          <div>
            <h3 className="text-body-md font-medium text-charcoal dark:text-dark-text-primary mb-4">
              Site Modes
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center space-x-3 p-4 border border-warm dark:border-dark-border-secondary rounded-lg cursor-pointer hover:bg-soft-white dark:hover:bg-dark-bg-tertiary">
                <input
                  type="checkbox"
                  name="comingSoonMode"
                  checked={formData.comingSoonMode}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-ludus-orange bg-white border-warm rounded focus:ring-ludus-orange dark:focus:ring-dark-ludus-orange dark:ring-offset-dark-bg-primary dark:bg-dark-bg-tertiary dark:border-dark-border-secondary"
                />
                <div>
                  <div className="font-medium text-charcoal dark:text-dark-text-primary">Enable Coming Soon Mode</div>
                  <div className="text-sm text-charcoal-light dark:text-dark-text-secondary">Show coming soon page to all visitors</div>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-4 border border-warm dark:border-dark-border-secondary rounded-lg cursor-pointer hover:bg-soft-white dark:hover:bg-dark-bg-tertiary">
                <input
                  type="checkbox"
                  name="maintenanceMode"
                  checked={formData.maintenanceMode}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-ludus-orange bg-white border-warm rounded focus:ring-ludus-orange dark:focus:ring-dark-ludus-orange dark:ring-offset-dark-bg-primary dark:bg-dark-bg-tertiary dark:border-dark-border-secondary"
                />
                <div>
                  <div className="font-medium text-charcoal dark:text-dark-text-primary">Enable Maintenance Mode</div>
                  <div className="text-sm text-charcoal-light dark:text-dark-text-secondary">Show maintenance page to all visitors</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-warm dark:border-dark-border-secondary mt-6">
          <Button
            type="submit"
            disabled={saving}
            className="min-w-[120px]"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SiteSettingsManagement;