import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';
import api from '../../services/api';

const SystemSettings = () => {
  const { t, i18n } = useTranslation();
  const [settings, setSettings] = useState({
    site: {
      name: { en: '', ar: '' },
      description: { en: '', ar: '' },
      logo: '',
      favicon: '',
      timezone: 'Asia/Riyadh',
      language: 'en',
      currency: 'SAR'
    },
    email: {
      fromName: '',
      fromEmail: '',
      smtpHost: '',
      smtpPort: 587
    },
    features: {
      userRegistration: true,
      guestBooking: false,
      multiLanguage: true,
      reviews: true,
      notifications: true
    },
    payment: {
      moyasarEnabled: true,
      testMode: true,
      supportedMethods: []
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('site');

  const tabs = [
    { id: 'site', label: 'Site Settings', icon: '🌐' },
    { id: 'email', label: 'Email Settings', icon: '📧' },
    { id: 'features', label: 'Features', icon: '⚙️' },
    { id: 'payment', label: 'Payment', icon: '💳' },
    { id: 'maintenance', label: 'Maintenance', icon: '🔧' }
  ];

  const timezones = [
    'Asia/Riyadh', 'Asia/Dubai', 'Europe/London', 'America/New_York', 'Asia/Tokyo'
  ];

  const currencies = [
    { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' }
  ];

  const paymentMethods = [
    { id: 'credit_card', name: 'Credit Card', icon: '💳' },
    { id: 'mada', name: 'MADA', icon: '🏦' },
    { id: 'apple_pay', name: 'Apple Pay', icon: '🍎' },
    { id: 'stc_pay', name: 'STC Pay', icon: '📱' },
    { id: 'sadad', name: 'SADAD', icon: '🏛️' }
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/settings');
      setSettings(response.data.data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      await api.put('/admin/settings', settings);
      setMessage({ type: 'success', text: 'Settings saved successfully' });
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (section, key, value, language = null) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: language 
          ? { ...prev[section][key], [language]: value }
          : value
      }
    }));
  };

  const toggleFeature = (feature) => {
    setSettings(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: !prev.features[feature]
      }
    }));
  };

  const togglePaymentMethod = (method) => {
    setSettings(prev => ({
      ...prev,
      payment: {
        ...prev.payment,
        supportedMethods: prev.payment.supportedMethods.includes(method)
          ? prev.payment.supportedMethods.filter(m => m !== method)
          : [...prev.payment.supportedMethods, method]
      }
    }));
  };

  const testEmailConfiguration = async () => {
    try {
      setMessage({ type: 'info', text: 'Sending test email...' });
      await api.post('/admin/settings/test-email');
      setMessage({ type: 'success', text: 'Test email sent successfully' });
    } catch (error) {
      console.error('Test email failed:', error);
      setMessage({ type: 'error', text: 'Failed to send test email' });
    }
  };

  const clearCache = async () => {
    try {
      setMessage({ type: 'info', text: 'Clearing cache...' });
      await api.post('/admin/settings/clear-cache');
      setMessage({ type: 'success', text: 'Cache cleared successfully' });
    } catch (error) {
      console.error('Clear cache failed:', error);
      setMessage({ type: 'error', text: 'Failed to clear cache' });
    }
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `ludus-settings-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-ludus-orange border-t-transparent mx-auto"></div>
        <p className="text-ludus-gray-600 mt-4">Loading system settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-display-sm font-bold text-ludus-dark">
            System Settings
          </h1>
          <p className="text-body-sm text-ludus-gray-600">
            Configure LUDUS platform settings and preferences
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={exportSettings}
            className="text-ludus-dark border-ludus-gray-300"
          >
            📤 Export Settings
          </Button>
          <Button
            onClick={saveSettings}
            disabled={saving}
            className="bg-ludus-orange text-white"
          >
            {saving ? '💾 Saving...' : '💾 Save All Settings'}
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

      {/* Tabs */}
      <Card className="p-0">
        <div className="flex border-b border-ludus-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-ludus-orange text-ludus-orange bg-ludus-orange/5'
                  : 'border-transparent text-ludus-gray-600 hover:text-ludus-dark hover:border-ludus-gray-300'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                {tab.icon} {tab.label}
              </span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Site Settings Tab */}
          {activeTab === 'site' && (
            <div className="space-y-6">
              <h3 className="text-body-lg font-semibold text-ludus-dark">Site Configuration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                    Site Name (English)
                  </label>
                  <Input
                    value={settings.site.name.en}
                    onChange={(e) => updateSetting('site', 'name', e.target.value, 'en')}
                    placeholder="LUDUS Platform"
                  />
                </div>
                
                <div>
                  <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                    Site Name (Arabic)
                  </label>
                  <Input
                    value={settings.site.name.ar}
                    onChange={(e) => updateSetting('site', 'name', e.target.value, 'ar')}
                    placeholder="منصة لودوس"
                    dir="rtl"
                  />
                </div>
                
                <div>
                  <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                    Description (English)
                  </label>
                  <textarea
                    value={settings.site.description.en}
                    onChange={(e) => updateSetting('site', 'description', e.target.value, 'en')}
                    placeholder="Discover amazing local activities"
                    className="w-full px-3 py-2 border border-ludus-gray-300 rounded-md resize-none h-20"
                  />
                </div>
                
                <div>
                  <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                    Description (Arabic)
                  </label>
                  <textarea
                    value={settings.site.description.ar}
                    onChange={(e) => updateSetting('site', 'description', e.target.value, 'ar')}
                    placeholder="اكتشف أنشطة محلية مذهلة"
                    className="w-full px-3 py-2 border border-ludus-gray-300 rounded-md resize-none h-20"
                    dir="rtl"
                  />
                </div>
                
                <div>
                  <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                    Timezone
                  </label>
                  <select
                    value={settings.site.timezone}
                    onChange={(e) => updateSetting('site', 'timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-ludus-gray-300 rounded-md"
                  >
                    {timezones.map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                    Default Currency
                  </label>
                  <select
                    value={settings.site.currency}
                    onChange={(e) => updateSetting('site', 'currency', e.target.value)}
                    className="w-full px-3 py-2 border border-ludus-gray-300 rounded-md"
                  >
                    {currencies.map(currency => (
                      <option key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.name} ({currency.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Email Settings Tab */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-body-lg font-semibold text-ludus-dark">Email Configuration</h3>
                <Button
                  variant="outline"
                  onClick={testEmailConfiguration}
                  className="text-ludus-dark border-ludus-gray-300"
                >
                  📧 Send Test Email
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                    From Name
                  </label>
                  <Input
                    value={settings.email.fromName}
                    onChange={(e) => updateSetting('email', 'fromName', e.target.value)}
                    placeholder="LUDUS Platform"
                  />
                </div>
                
                <div>
                  <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                    From Email
                  </label>
                  <Input
                    type="email"
                    value={settings.email.fromEmail}
                    onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)}
                    placeholder="hi@letsludus.com"
                  />
                </div>
                
                <div>
                  <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                    SMTP Host
                  </label>
                  <Input
                    value={settings.email.smtpHost}
                    onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)}
                    placeholder="smtp-relay.gmail.com"
                  />
                </div>
                
                <div>
                  <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                    SMTP Port
                  </label>
                  <Input
                    type="number"
                    value={settings.email.smtpPort}
                    onChange={(e) => updateSetting('email', 'smtpPort', parseInt(e.target.value))}
                    placeholder="587"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Features Tab */}
          {activeTab === 'features' && (
            <div className="space-y-6">
              <h3 className="text-body-lg font-semibold text-ludus-dark">Platform Features</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(settings.features).map(([feature, enabled]) => (
                  <Card key={feature} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-ludus-dark capitalize">
                          {feature.replace(/([A-Z])/g, ' $1').trim()}
                        </h4>
                        <p className="text-sm text-ludus-gray-600">
                          {getFeatureDescription(feature)}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={() => toggleFeature(feature)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ludus-orange/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ludus-orange"></div>
                      </label>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Payment Tab */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              <h3 className="text-body-lg font-semibold text-ludus-dark">Payment Configuration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-ludus-dark">Moyasar Gateway</h4>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.payment.moyasarEnabled}
                        onChange={(e) => updateSetting('payment', 'moyasarEnabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ludus-orange/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ludus-orange"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="testMode"
                      checked={settings.payment.testMode}
                      onChange={(e) => updateSetting('payment', 'testMode', e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="testMode" className="text-sm text-ludus-dark">
                      Test Mode
                    </label>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <h4 className="font-medium text-ludus-dark mb-4">Supported Payment Methods</h4>
                  <div className="space-y-2">
                    {paymentMethods.map(method => (
                      <div key={method.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={method.id}
                          checked={settings.payment.supportedMethods.includes(method.id)}
                          onChange={() => togglePaymentMethod(method.id)}
                          className="mr-2"
                        />
                        <label htmlFor={method.id} className="text-sm text-ludus-dark">
                          {method.icon} {method.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Maintenance Tab */}
          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              <h3 className="text-body-lg font-semibold text-ludus-dark">System Maintenance</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-6 text-center">
                  <div className="text-3xl mb-3">🗑️</div>
                  <h4 className="font-medium text-ludus-dark mb-2">Clear Cache</h4>
                  <p className="text-sm text-ludus-gray-600 mb-4">
                    Clear application cache and temporary files
                  </p>
                  <Button
                    variant="outline"
                    onClick={clearCache}
                    className="text-ludus-dark border-ludus-gray-300"
                  >
                    Clear Cache
                  </Button>
                </Card>
                
                <Card className="p-6 text-center">
                  <div className="text-3xl mb-3">📊</div>
                  <h4 className="font-medium text-ludus-dark mb-2">System Info</h4>
                  <div className="text-sm text-ludus-gray-600 space-y-1">
                    <p>Version: 1.0.0</p>
                    <p>Environment: {process.env.NODE_ENV}</p>
                    <p>Last Updated: {new Date().toLocaleDateString()}</p>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

const getFeatureDescription = (feature) => {
  const descriptions = {
    userRegistration: 'Allow new users to register accounts',
    guestBooking: 'Allow bookings without user registration',
    multiLanguage: 'Enable multiple language support',
    reviews: 'Allow users to rate and review activities',
    notifications: 'Send email notifications to users'
  };
  return descriptions[feature] || 'Feature configuration';
};

export default SystemSettings;