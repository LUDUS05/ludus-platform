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
      // In a real app, this would save to your API/database
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
    </div>
  );
};

export default TranslationManagement;