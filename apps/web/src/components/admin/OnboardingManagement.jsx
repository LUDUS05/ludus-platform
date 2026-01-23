import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import Alert from '../ui/Alert';
import { Card } from '../ui/Card';
import onboardingService from '../../services/onboardingService';

const OnboardingManagement = () => {
  useTranslation();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await onboardingService.getFullConfig();
      setConfig(response.config);
    } catch (error) {
      console.error('Error loading onboarding config:', error);
      setError('Failed to load onboarding configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await onboardingService.updateConfig(config);
      setSuccess('Onboarding configuration updated successfully');
    } catch (error) {
      console.error('Error saving onboarding config:', error);
      setError('Failed to update onboarding configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleOnboarding = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const response = await onboardingService.toggleOnboarding();
      setConfig(prev => ({
        ...prev,
        isEnabled: response.isEnabled
      }));
      setSuccess(response.message);
    } catch (error) {
      console.error('Error toggling onboarding:', error);
      setError('Failed to toggle onboarding system');
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (path, value) => {
    setConfig(prev => {
      const newConfig = { ...prev };
      const keys = path.split('.');
      let current = newConfig;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  };

  const addStep = () => {
    const allowedIds = ['welcome', 'auth', 'profile', 'referral', 'interests', 'preferences']
    const existing = new Set((config.steps || []).map(s => s.stepId))
    const nextId = allowedIds.find(id => !existing.has(id))
    if (!nextId) {
      setError('All allowed steps are already present')
      return
    }
    const nextOrder = (config.steps || []).length
    const newStep = {
      stepId: nextId,
      isEnabled: true,
      isRequired: true,
      order: nextOrder,
      config: {}
    }
    setConfig(prev => ({
      ...prev,
      steps: [...(prev.steps || []), newStep]
    }))
  }

  const removeStep = (index) => {
    setConfig(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  const moveStep = (index, direction) => {
    const newSteps = [...config.steps];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex >= 0 && newIndex < newSteps.length) {
      [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
      newSteps[index].order = index;
      newSteps[newIndex].order = newIndex;

      setConfig(prev => ({
        ...prev,
        steps: newSteps
      }));
    }
  };

  const tabs = [
    { id: 'general', label: 'General Settings', icon: '⚙️' },
    { id: 'steps', label: 'Step Configuration', icon: '📋' },
    { id: 'welcome', label: 'Welcome Step', icon: '👋' },
    { id: 'auth', label: 'Authentication', icon: '🔐' },
    { id: 'profile', label: 'Profile Fields', icon: '👤' },
    { id: 'interests', label: 'Interests', icon: '🎯' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading onboarding configuration...</p>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Failed to load onboarding configuration</p>
        <Button onClick={loadConfig} variant="primary">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Onboarding Management</h1>
          <p className="text-gray-600">Configure the user onboarding experience</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={handleToggleOnboarding}
            variant={config.isEnabled ? "outline" : "primary"}
            disabled={saving}
          >
            {config.isEnabled ? 'Disable Onboarding' : 'Enable Onboarding'}
          </Button>
          <Button
            onClick={handleSave}
            variant="primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center space-x-4">
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${config.isEnabled
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
          }`}>
          {config.isEnabled ? 'Enabled' : 'Disabled'}
        </div>
        <span className="text-sm text-gray-500">
          Version {config.version} • Last updated {new Date(config.updatedAt).toLocaleDateString()}
        </span>
      </div>

      {/* Alerts */}
      {error && (
        <Alert type="error" message={error} onClose={() => setError('')} />
      )}
      {success && (
        <Alert type="success" message={success} onClose={() => setSuccess('')} />
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
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
      <div className="mt-6">
        {activeTab === 'general' && (
          <Card>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  System Status
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={config.isEnabled}
                    onChange={(e) => updateConfig('isEnabled', e.target.checked)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-600">
                    Enable onboarding system for new users
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Analytics
                </label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={config.analytics?.trackStepCompletion}
                      onChange={(e) => updateConfig('analytics.trackStepCompletion', e.target.checked)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-600">Track step completion</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={config.analytics?.trackDropOffPoints}
                      onChange={(e) => updateConfig('analytics.trackDropOffPoints', e.target.checked)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-600">Track drop-off points</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={config.analytics?.trackTimeToCompletion}
                      onChange={(e) => updateConfig('analytics.trackTimeToCompletion', e.target.checked)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-600">Track time to completion</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'steps' && (
          <Card>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Onboarding Steps</h3>
                <Button onClick={addStep} variant="outline" size="sm">
                  Add Step
                </Button>
              </div>

              <div className="space-y-3">
                {config.steps.map((step, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-500">#{step.order + 1}</span>
                        <span className="font-medium text-gray-900">{step.stepId}</span>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${step.isEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {step.isEnabled ? 'Enabled' : 'Disabled'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${step.isRequired ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                            {step.isRequired ? 'Required' : 'Optional'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => moveStep(index, 'up')}
                        variant="outline"
                        size="sm"
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        onClick={() => moveStep(index, 'down')}
                        variant="outline"
                        size="sm"
                        disabled={index === config.steps.length - 1}
                      >
                        ↓
                      </Button>
                      <Button
                        onClick={() => removeStep(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'welcome' && (
          <Card>
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Welcome Step Configuration</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title (English)
                </label>
                <Input
                  value={config.welcomeConfig?.title?.en || ''}
                  onChange={(e) => updateConfig('welcomeConfig.title.en', e.target.value)}
                  placeholder="Welcome to LUDUS"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title (Arabic)
                </label>
                <Input
                  value={config.welcomeConfig?.title?.ar || ''}
                  onChange={(e) => updateConfig('welcomeConfig.title.ar', e.target.value)}
                  placeholder="مرحباً بك في لودوس"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtitle (English)
                </label>
                <textarea
                  value={config.welcomeConfig?.subtitle?.en || ''}
                  onChange={(e) => updateConfig('welcomeConfig.subtitle.en', e.target.value)}
                  placeholder="Discover amazing activities and connect with like-minded people"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtitle (Arabic)
                </label>
                <textarea
                  value={config.welcomeConfig?.subtitle?.ar || ''}
                  onChange={(e) => updateConfig('welcomeConfig.subtitle.ar', e.target.value)}
                  placeholder="اكتشف أنشطة رائعة وتواصل مع أشخاص متشابهين في التفكير"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                />
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'interests' && (
          <Card>
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Interests Configuration</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Selections
                </label>
                <Input
                  type="number"
                  value={config.interestsConfig?.minSelections || 3}
                  onChange={(e) => updateConfig('interestsConfig.minSelections', parseInt(e.target.value))}
                  min="1"
                  max="12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Selections
                </label>
                <Input
                  type="number"
                  value={config.interestsConfig?.maxSelections || 12}
                  onChange={(e) => updateConfig('interestsConfig.maxSelections', parseInt(e.target.value))}
                  min="1"
                  max="12"
                />
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Categories</h4>
                <div className="space-y-3">
                  {config.interestsConfig?.categories?.map((category, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
                      <span className="text-2xl">{category.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{category.name.en}</div>
                        <div className="text-sm text-gray-600">{category.name.ar}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={category.isEnabled}
                          onChange={(e) => {
                            const newCategories = [...config.interestsConfig.categories];
                            newCategories[index].isEnabled = e.target.checked;
                            updateConfig('interestsConfig.categories', newCategories);
                          }}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-500">Enabled</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OnboardingManagement;
