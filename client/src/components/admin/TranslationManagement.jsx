import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import Alert from '../ui/Alert';

const TranslationManagement = () => {
  const { t, i18n } = useTranslation();
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [missingTranslations, setMissingTranslations] = useState([]);
  const [autoTranslateMode, setAutoTranslateMode] = useState(false);
  const [translationHistory, setTranslationHistory] = useState([]);
  
  // New state for automated workflows and ML
  const [workflows, setWorkflows] = useState([]);
  const [activeWorkflows, setActiveWorkflows] = useState([]);
  const [mlModels, setMlModels] = useState([]);
  const [trainingStatus, setTrainingStatus] = useState({});
  const [contentUpdates, setContentUpdates] = useState([]);
  const [workflowTemplates, setWorkflowTemplates] = useState([]);
  const [showWorkflowBuilder, setShowWorkflowBuilder] = useState(false);
  const [showMLDashboard, setShowMLDashboard] = useState(false);

  const languages = [
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  const categories = [
    'all',
    'common',
    'navigation',
    'auth',
    'activities',
    'booking',
    'payment',
    'dashboard',
    'admin',
    'vendor',
    'wallet',
    'map',
    'home',
    'user',
    'partner'
  ];

  useEffect(() => {
    loadTranslations();
    detectMissingTranslations();
    loadWorkflows();
    loadMLModels();
    loadContentUpdates();
  }, [selectedLanguage]);

  const loadTranslations = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from your API
      const response = await import(`../../i18n/locales/${selectedLanguage}.json`);
      setTranslations(response.default);
    } catch (error) {
      console.error('Failed to load translations:', error);
    } finally {
      setLoading(false);
    }
  };

  const detectMissingTranslations = () => {
    // Compare Arabic and English translations to find missing keys
    const arTranslations = require(`../../i18n/locales/ar.json`);
    const enTranslations = require(`../../i18n/locales/en.json`);
    
    const missing = [];
    const allKeys = new Set([...Object.keys(arTranslations), ...Object.keys(enTranslations)]);
    
    allKeys.forEach(key => {
      if (!arTranslations[key] || !enTranslations[key]) {
        missing.push({
          key,
          ar: arTranslations[key] || 'MISSING',
          en: enTranslations[key] || 'MISSING'
        });
      }
    });
    
    setMissingTranslations(missing);
  };

  const handleTranslationUpdate = (key, value) => {
    setTranslations(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveTranslations = async () => {
    try {
      setLoading(true);
      // In a real app, this would save to your API
      console.log('Saving translations:', translations);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update translation history
      setTranslationHistory(prev => [{
        timestamp: new Date().toISOString(),
        language: selectedLanguage,
        changes: Object.keys(translations).length
      }, ...prev]);
      
      alert('Translations saved successfully!');
    } catch (error) {
      console.error('Failed to save translations:', error);
      alert('Failed to save translations');
    } finally {
      setLoading(false);
    }
  };

  const exportTranslations = () => {
    const dataStr = JSON.stringify(translations, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `translations-${selectedLanguage}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importTranslations = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          setTranslations(imported);
          alert('Translations imported successfully!');
        } catch (error) {
          alert('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    }
  };

  const autoTranslateMissing = async () => {
    try {
      setLoading(true);
      setAutoTranslateMode(true);
      
      // Simulate AI translation process
      for (const missing of missingTranslations) {
        if (missing.ar === 'MISSING' && selectedLanguage === 'ar') {
          // Simulate Arabic translation
          const translated = await simulateTranslation(missing.en, 'en', 'ar');
          handleTranslationUpdate(missing.key, translated);
        } else if (missing.en === 'MISSING' && selectedLanguage === 'en') {
          // Simulate English translation
          const translated = await simulateTranslation(missing.ar, 'ar', 'en');
          handleTranslationUpdate(missing.key, translated);
        }
        
        // Add delay to simulate processing
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      setAutoTranslateMode(false);
      alert('Auto-translation completed!');
    } catch (error) {
      console.error('Auto-translation failed:', error);
      setAutoTranslateMode(false);
    } finally {
      setLoading(false);
    }
  };

  const simulateTranslation = async (text, fromLang, toLang) => {
    // This would integrate with Google Translate, DeepL, or other translation services
    // For now, we'll simulate with some basic transformations
    
    if (fromLang === 'en' && toLang === 'ar') {
      // Simulate English to Arabic translation
      const translations = {
        'Welcome': 'مرحباً',
        'Login': 'تسجيل الدخول',
        'Register': 'التسجيل',
        'Home': 'الرئيسية',
        'Activities': 'الأنشطة',
        'Profile': 'الملف الشخصي',
        'Dashboard': 'لوحة التحكم',
        'Settings': 'الإعدادات',
        'Save': 'حفظ',
        'Cancel': 'إلغاء',
        'Delete': 'حذف',
        'Edit': 'تعديل',
        'View': 'عرض',
        'Search': 'بحث',
        'Loading': 'جاري التحميل...'
      };
      
      return translations[text] || `[AR: ${text}]`;
    } else if (fromLang === 'ar' && toLang === 'en') {
      // Simulate Arabic to English translation
      const translations = {
        'مرحباً': 'Welcome',
        'تسجيل الدخول': 'Login',
        'التسجيل': 'Register',
        'الرئيسية': 'Home',
        'الأنشطة': 'Activities',
        'الملف الشخصي': 'Profile',
        'لوحة التحكم': 'Dashboard',
        'الإعدادات': 'Settings',
        'حفظ': 'Save',
        'إلغاء': 'Cancel',
        'حذف': 'Delete',
        'تعديل': 'Edit',
        'عرض': 'View',
        'بحث': 'Search',
        'جاري التحميل...': 'Loading...'
      };
      
      return translations[text] || `[EN: ${text}]`;
    }
    
    return text;
  };

  const filteredTranslations = Object.entries(translations).filter(([key, value]) => {
    const matchesSearch = key.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         value.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || key.startsWith(filterCategory);
    return matchesSearch && matchesCategory;
  });

  // ===== AUTOMATED WORKFLOWS =====
  
  const loadWorkflows = () => {
    // Load predefined workflow templates
    const templates = [
      {
        id: 'content-update',
        name: 'Content Update Workflow',
        description: 'Automatically detect and translate new content',
        triggers: ['new-content', 'content-update'],
        steps: [
          'detect-new-content',
          'extract-text',
          'translate-content',
          'validate-translation',
          'deploy-updates'
        ],
        isActive: false
      },
      {
        id: 'quality-improvement',
        name: 'Quality Improvement Workflow',
        description: 'Continuously improve translation quality',
        triggers: ['user-feedback', 'quality-score'],
        steps: [
          'collect-feedback',
          'analyze-issues',
          'retrain-models',
          'test-improvements',
          'deploy-updates'
        ],
        isActive: false
      },
      {
        id: 'bulk-translation',
        name: 'Bulk Translation Workflow',
        description: 'Handle large-scale translation projects',
        triggers: ['bulk-import', 'scheduled-update'],
        steps: [
          'validate-import',
          'batch-translate',
          'quality-check',
          'approve-translations',
          'deploy-batch'
        ],
        isActive: false
      }
    ];
    
    setWorkflowTemplates(templates);
    setWorkflows(templates);
  };

  const activateWorkflow = (workflowId) => {
    const updatedWorkflows = workflows.map(w => 
      w.id === workflowId ? { ...w, isActive: true } : w
    );
    setWorkflows(updatedWorkflows);
    
    // Add to active workflows
    const workflow = workflows.find(w => w.id === workflowId);
    if (workflow) {
      setActiveWorkflows(prev => [...prev, { ...workflow, startedAt: new Date().toISOString() }]);
    }
  };

  const deactivateWorkflow = (workflowId) => {
    const updatedWorkflows = workflows.map(w => 
      w.id === workflowId ? { ...w, isActive: false } : w
    );
    setWorkflows(updatedWorkflows);
    
    // Remove from active workflows
    setActiveWorkflows(prev => prev.filter(w => w.id !== workflowId));
  };

  const executeWorkflow = async (workflowId) => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow) return;

    try {
      setLoading(true);
      
      // Execute workflow steps
      for (const step of workflow.steps) {
        console.log(`Executing step: ${step}`);
        await executeWorkflowStep(step);
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing
      }
      
      alert(`Workflow "${workflow.name}" completed successfully!`);
    } catch (error) {
      console.error('Workflow execution failed:', error);
      alert('Workflow execution failed');
    } finally {
      setLoading(false);
    }
  };

  const executeWorkflowStep = async (step) => {
    switch (step) {
      case 'detect-new-content':
        return await detectNewContent();
      case 'extract-text':
        return await extractTextFromContent();
      case 'translate-content':
        return await translateNewContent();
      case 'validate-translation':
        return await validateTranslations();
      case 'deploy-updates':
        return await deployTranslationUpdates();
      case 'collect-feedback':
        return await collectUserFeedback();
      case 'analyze-issues':
        return await analyzeTranslationIssues();
      case 'retrain-models':
        return await retrainMLModels();
      case 'test-improvements':
        return await testTranslationImprovements();
      case 'deploy-batch':
        return await deployBatchTranslations();
      default:
        console.log(`Unknown step: ${step}`);
    }
  };

  // ===== MACHINE LEARNING CAPABILITIES =====
  
  const loadMLModels = () => {
    const models = [
      {
        id: 'translation-quality',
        name: 'Translation Quality Model',
        description: 'AI model for assessing translation quality',
        status: 'trained',
        accuracy: 94.2,
        lastTrained: '2024-01-15',
        trainingData: 15420,
        languages: ['ar', 'en']
      },
      {
        id: 'context-understanding',
        name: 'Context Understanding Model',
        description: 'Deep learning model for context-aware translation',
        status: 'training',
        accuracy: 87.6,
        lastTrained: '2024-01-10',
        trainingData: 8920,
        languages: ['ar', 'en']
      },
      {
        id: 'cultural-adaptation',
        name: 'Cultural Adaptation Model',
        description: 'Model for cultural context and localization',
        status: 'ready',
        accuracy: 91.8,
        lastTrained: '2024-01-12',
        trainingData: 12340,
        languages: ['ar', 'en']
      }
    ];
    
    setMlModels(models);
    
    // Set training status
    const status = {};
    models.forEach(model => {
      status[model.id] = {
        isTraining: model.status === 'training',
        progress: model.status === 'training' ? Math.floor(Math.random() * 100) : 100
      };
    });
    setTrainingStatus(status);
  };

  const startModelTraining = async (modelId) => {
    try {
      setTrainingStatus(prev => ({
        ...prev,
        [modelId]: { isTraining: true, progress: 0 }
      }));

      // Simulate training process
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setTrainingStatus(prev => ({
          ...prev,
          [modelId]: { isTraining: true, progress: i }
        }));
      }

      // Update model status
      setMlModels(prev => prev.map(model => 
        model.id === modelId 
          ? { ...model, status: 'trained', lastTrained: new Date().toISOString() }
          : model
      ));

      setTrainingStatus(prev => ({
        ...prev,
        [modelId]: { isTraining: false, progress: 100 }
      }));

      alert(`Model "${modelId}" training completed!`);
    } catch (error) {
      console.error('Model training failed:', error);
      setTrainingStatus(prev => ({
        ...prev,
        [modelId]: { isTraining: false, progress: 0 }
      }));
    }
  };

  const retrainMLModels = async () => {
    try {
      // Retrain all models with new data
      for (const model of mlModels) {
        await startModelTraining(model.id);
      }
      return true;
    } catch (error) {
      console.error('Model retraining failed:', error);
      return false;
    }
  };

  // ===== CONTENT UPDATE DETECTION =====
  
  const loadContentUpdates = () => {
    const updates = [
      {
        id: 1,
        type: 'new-page',
        content: 'New "About Us" page content',
        language: 'en',
        timestamp: '2024-01-15T10:30:00Z',
        status: 'pending-translation'
      },
      {
        id: 2,
        type: 'updated-content',
        content: 'Updated activity descriptions',
        language: 'en',
        timestamp: '2024-01-14T15:45:00Z',
        status: 'translated'
      },
      {
        id: 3,
        type: 'new-feature',
        content: 'New wallet payment options',
        language: 'en',
        timestamp: '2024-01-13T09:20:00Z',
        status: 'pending-translation'
      }
    ];
    
    setContentUpdates(updates);
  };

  const detectNewContent = async () => {
    // Simulate content detection
    console.log('Detecting new content...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  };

  const extractTextFromContent = async () => {
    // Simulate text extraction
    console.log('Extracting text from content...');
    await new Promise(resolve => setTimeout(resolve, 800));
    return true;
  };

  const translateNewContent = async () => {
    // Simulate content translation
    console.log('Translating new content...');
    await new Promise(resolve => setTimeout(resolve, 1500));
    return true;
  };

  const validateTranslations = async () => {
    // Simulate translation validation
    console.log('Validating translations...');
    await new Promise(resolve => setTimeout(resolve, 600));
    return true;
  };

  const deployTranslationUpdates = async () => {
    // Simulate deployment
    console.log('Deploying translation updates...');
    await new Promise(resolve => setTimeout(resolve, 1200));
    return true;
  };

  const collectUserFeedback = async () => {
    // Simulate feedback collection
    console.log('Collecting user feedback...');
    await new Promise(resolve => setTimeout(resolve, 900));
    return true;
  };

  const analyzeTranslationIssues = async () => {
    // Simulate issue analysis
    console.log('Analyzing translation issues...');
    await new Promise(resolve => setTimeout(resolve, 1100));
    return true;
  };

  const testTranslationImprovements = async () => {
    // Simulate improvement testing
    console.log('Testing translation improvements...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  };

  const deployBatchTranslations = async () => {
    // Simulate batch deployment
    console.log('Deploying batch translations...');
    await new Promise(resolve => setTimeout(resolve, 1400));
    return true;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Translation Management</h1>
          <p className="text-gray-600 mt-2">Manage and automate translations for your website</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={exportTranslations} variant="outline">
            Export
          </Button>
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".json"
              onChange={importTranslations}
              className="hidden"
            />
            <Button variant="outline" as="span">
              Import
            </Button>
          </label>
          <Button onClick={saveTranslations} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => {
            setShowWorkflowBuilder(false);
            setShowMLDashboard(false);
          }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            !showWorkflowBuilder && !showMLDashboard
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Translations
        </button>
        <button
          onClick={() => {
            setShowWorkflowBuilder(true);
            setShowMLDashboard(false);
          }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            showWorkflowBuilder
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Automated Workflows
        </button>
        <button
          onClick={() => {
            setShowWorkflowBuilder(false);
            setShowMLDashboard(true);
          }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            showMLDashboard
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Machine Learning
        </button>
      </div>

      {/* Main Content */}
      {!showWorkflowBuilder && !showMLDashboard && (
        <>
          {/* Language Selection */}
          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <h2 className="text-lg font-semibold">Select Language</h2>
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLanguage(lang.code)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                      selectedLanguage === lang.code
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Missing Translations Alert */}
          {missingTranslations.length > 0 && (
            <Alert variant="destructive">
              <div className="flex items-center justify-between">
                <div>
                  <strong>Missing Translations Detected!</strong>
                  <p className="text-sm mt-1">
                    {missingTranslations.length} translation keys are missing in one or both languages.
                  </p>
                </div>
                <Button 
                  onClick={autoTranslateMissing} 
                  disabled={autoTranslateMode}
                  size="sm"
                >
                  {autoTranslateMode ? 'Translating...' : 'Auto-Translate Missing'}
                </Button>
              </div>
            </Alert>
          )}

          {/* Filters and Search */}
          <Card>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Translations
                  </label>
                  <Input
                    placeholder="Search by key or value..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Category
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={() => {
                      setSearchTerm('');
                      setFilterCategory('all');
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Translation Editor */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  Translation Editor - {languages.find(l => l.code === selectedLanguage)?.name}
                </h2>
                <div className="text-sm text-gray-500">
                  {filteredTranslations.length} of {Object.keys(translations).length} translations
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading translations...</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredTranslations.map(([key, value]) => (
                    <div key={key} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start space-x-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Translation Key
                          </label>
                          <Input
                            value={key}
                            readOnly
                            className="bg-gray-50"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Value
                          </label>
                          <Input
                            value={value}
                            onChange={(e) => handleTranslationUpdate(key, e.target.value)}
                            placeholder={`Enter ${languages.find(l => l.code === selectedLanguage)?.name} translation`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Translation History */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Translation History</h2>
              <div className="space-y-2">
                {translationHistory.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {entry.language.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {entry.changes} changes saved
                    </span>
                  </div>
                ))}
                {translationHistory.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No translation history yet</p>
                )}
              </div>
            </div>
          </Card>

          {/* Auto-Translation Settings */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Auto-Translation Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">AI-Powered Translation</h3>
                    <p className="text-sm text-gray-600">
                      Automatically translate missing content using AI services
                    </p>
                  </div>
                  <Button
                    onClick={autoTranslateMissing}
                    disabled={missingTranslations.length === 0 || autoTranslateMode}
                    variant="outline"
                  >
                    {autoTranslateMode ? 'Translating...' : 'Translate Missing'}
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Translation Services</h4>
                    <div className="space-y-2 text-sm text-blue-800">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span>Google Translate API</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span>DeepL API</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span>Microsoft Translator</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Quality Features</h4>
                    <div className="space-y-2 text-sm text-green-800">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>Context-aware translation</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>Pluralization support</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>Cultural adaptation</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Automated Workflows Dashboard */}
      {showWorkflowBuilder && (
        <>
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Automated Workflows</h2>
                <Button onClick={() => setShowWorkflowBuilder(false)} variant="outline">
                  Back to Translations
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workflowTemplates.map(workflow => (
                  <Card key={workflow.id} className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">{workflow.name}</h3>
                        <div className={`w-3 h-3 rounded-full ${
                          workflow.isActive ? 'bg-green-500' : 'bg-gray-300'
                        }`}></div>
                      </div>
                      
                      <p className="text-sm text-gray-600">{workflow.description}</p>
                      
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Steps:</h4>
                        <div className="space-y-1">
                          {workflow.steps.map((step, index) => (
                            <div key={index} className="flex items-center space-x-2 text-xs text-gray-600">
                              <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                                {index + 1}
                              </span>
                              <span className="capitalize">{step.replace(/-/g, ' ')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {workflow.isActive ? (
                          <>
                            <Button
                              onClick={() => executeWorkflow(workflow.id)}
                              disabled={loading}
                              size="sm"
                              className="flex-1"
                            >
                              Execute Now
                            </Button>
                            <Button
                              onClick={() => deactivateWorkflow(workflow.id)}
                              variant="outline"
                              size="sm"
                            >
                              Deactivate
                            </Button>
                          </>
                        ) : (
                          <Button
                            onClick={() => activateWorkflow(workflow.id)}
                            className="flex-1"
                            size="sm"
                          >
                            Activate Workflow
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </Card>

          {/* Active Workflows */}
          {activeWorkflows.length > 0 && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Active Workflows</h3>
                <div className="space-y-3">
                  {activeWorkflows.map(workflow => (
                    <div key={workflow.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <div>
                          <h4 className="font-medium text-blue-900">{workflow.name}</h4>
                          <p className="text-sm text-blue-700">
                            Started: {new Date(workflow.startedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => executeWorkflow(workflow.id)}
                          disabled={loading}
                          size="sm"
                        >
                          {loading ? 'Running...' : 'Run Now'}
                        </Button>
                        <Button
                          onClick={() => deactivateWorkflow(workflow.id)}
                          variant="outline"
                          size="sm"
                        >
                          Stop
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Content Updates */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Content Updates</h3>
              <div className="space-y-3">
                {contentUpdates.map(update => (
                  <div key={update.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        update.status === 'pending-translation' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <div>
                        <h4 className="font-medium text-gray-900">{update.content}</h4>
                        <p className="text-sm text-gray-600">
                          {update.type} • {new Date(update.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        update.status === 'pending-translation' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {update.status.replace('-', ' ')}
                      </span>
                      {update.status === 'pending-translation' && (
                        <Button size="sm" variant="outline">
                          Translate Now
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Machine Learning Dashboard */}
      {showMLDashboard && (
        <>
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Machine Learning Models</h2>
                <Button onClick={() => setShowMLDashboard(false)} variant="outline">
                  Back to Translations
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mlModels.map(model => (
                  <Card key={model.id} className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">{model.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          model.status === 'trained' ? 'bg-green-100 text-green-800' :
                          model.status === 'training' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {model.status}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600">{model.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Accuracy:</span>
                          <span className="font-medium">{model.accuracy}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Training Data:</span>
                          <span className="font-medium">{model.trainingData.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Last Trained:</span>
                          <span className="font-medium">{new Date(model.lastTrained).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      {trainingStatus[model.id]?.isTraining && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Training Progress:</span>
                            <span className="font-medium">{trainingStatus[model.id].progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${trainingStatus[model.id].progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex space-x-2">
                        {model.status === 'ready' && (
                          <Button
                            onClick={() => startModelTraining(model.id)}
                            size="sm"
                            className="flex-1"
                          >
                            Start Training
                          </Button>
                        )}
                        {model.status === 'trained' && (
                          <Button
                            onClick={() => startModelTraining(model.id)}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            Retrain Model
                          </Button>
                        )}
                        <Button
                          onClick={() => {}} // View model details
                          variant="outline"
                          size="sm"
                        >
                          Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </Card>

          {/* ML Performance Metrics */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">94.2%</div>
                  <div className="text-sm text-blue-800">Overall Accuracy</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">87.6%</div>
                  <div className="text-sm text-green-800">Context Understanding</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">91.8%</div>
                  <div className="text-sm text-purple-800">Cultural Adaptation</div>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600">15,420</div>
                  <div className="text-sm text-orange-800">Training Samples</div>
                </div>
              </div>
            </div>
          </Card>

          {/* ML Training History */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Training History</h3>
              <div className="space-y-3">
                {mlModels.map(model => (
                  <div key={model.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{model.name}</h4>
                      <p className="text-sm text-gray-600">
                        Last trained: {new Date(model.lastTrained).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        Accuracy: {model.accuracy}%
                      </span>
                      <Button
                        onClick={() => startModelTraining(model.id)}
                        disabled={trainingStatus[model.id]?.isTraining}
                        size="sm"
                        variant="outline"
                      >
                        {trainingStatus[model.id]?.isTraining ? 'Training...' : 'Train Again'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default TranslationManagement;