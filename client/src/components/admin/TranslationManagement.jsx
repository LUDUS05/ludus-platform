import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';
import api from '../../services/api';

const TranslationManagement = () => {
  const { t, i18n } = useTranslation();
  const [translations, setTranslations] = useState({});
  const [selectedNamespace, setSelectedNamespace] = useState('common');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
  ];

  const namespaces = [
    'common', 'navigation', 'auth', 'activities', 'booking', 
    'payment', 'dashboard', 'admin', 'vendor', 'profile',
    'currency', 'language', 'howItWorks', 'home', 'forgotPassword'
  ];

  useEffect(() => {
    fetchTranslations();
  }, [selectedLanguage, selectedNamespace]);

  const fetchTranslations = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/translations/${selectedLanguage}/${selectedNamespace}`);
      setTranslations(response.data.data);
    } catch (error) {
      console.error('Failed to fetch translations:', error);
      setMessage({ type: 'error', text: 'Failed to load translations' });
    } finally {
      setLoading(false);
    }
  };

  const saveTranslations = async () => {
    try {
      setSaving(true);
      await api.put(`/admin/translations/${selectedLanguage}/${selectedNamespace}`, {
        translations
      });
      setMessage({ type: 'success', text: 'Translations saved successfully' });
    } catch (error) {
      console.error('Failed to save translations:', error);
      setMessage({ type: 'error', text: 'Failed to save translations' });
    } finally {
      setSaving(false);
    }
  };

  const addNewTranslation = () => {
    if (newKey && newValue) {
      setTranslations(prev => ({
        ...prev,
        [newKey]: newValue
      }));
      setNewKey('');
      setNewValue('');
    }
  };

  const deleteTranslation = (key) => {
    const updatedTranslations = { ...translations };
    delete updatedTranslations[key];
    setTranslations(updatedTranslations);
  };

  const updateTranslation = (key, value) => {
    setTranslations(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const filteredTranslations = Object.entries(translations).filter(([key, value]) =>
    key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportTranslations = () => {
    const dataStr = JSON.stringify(translations, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${selectedLanguage}_${selectedNamespace}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importTranslations = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          setTranslations(imported);
          setMessage({ type: 'success', text: 'Translations imported successfully' });
        } catch (error) {
          setMessage({ type: 'error', text: 'Failed to import translations' });
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-display-sm font-bold text-ludus-dark">
            Translation Management
          </h1>
          <p className="text-body-sm text-ludus-gray-600">
            Manage multilingual content for LUDUS Platform
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={exportTranslations}
            className="text-ludus-dark border-ludus-gray-300"
          >
            📤 Export
          </Button>
          <label className="cursor-pointer">
            <Button
              variant="outline"
              as="span"
              className="text-ludus-dark border-ludus-gray-300"
            >
              📥 Import
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={importTranslations}
              className="hidden"
            />
          </label>
          <Button
            onClick={saveTranslations}
            disabled={saving}
            className="bg-ludus-orange text-white"
          >
            {saving ? '💾 Saving...' : '💾 Save All'}
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

      {/* Language and Namespace Selection */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-label-sm font-medium text-ludus-dark mb-2">
              Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-ludus-gray-300 rounded-md text-ludus-dark"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-label-sm font-medium text-ludus-dark mb-2">
              Namespace
            </label>
            <select
              value={selectedNamespace}
              onChange={(e) => setSelectedNamespace(e.target.value)}
              className="w-full px-3 py-2 border border-ludus-gray-300 rounded-md text-ludus-dark"
            >
              {namespaces.map(ns => (
                <option key={ns} value={ns}>
                  {ns}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-label-sm font-medium text-ludus-dark mb-2">
              Search Translations
            </label>
            <Input
              placeholder="Search key or value..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </Card>

      {/* Add New Translation */}
      <Card className="p-6">
        <h3 className="text-body-lg font-semibold text-ludus-dark mb-4">
          Add New Translation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Translation key (e.g., newFeature)"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
          />
          <Input
            placeholder="Translation value"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
          />
          <Button
            onClick={addNewTranslation}
            disabled={!newKey || !newValue}
            className="bg-ludus-orange text-white"
          >
            ➕ Add Translation
          </Button>
        </div>
      </Card>

      {/* Translation Editor */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-body-lg font-semibold text-ludus-dark">
            Translations ({filteredTranslations.length})
          </h3>
          <div className="text-label-sm text-ludus-gray-600">
            {selectedLanguage.toUpperCase()} / {selectedNamespace}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-ludus-orange border-t-transparent mx-auto"></div>
            <p className="text-ludus-gray-600 mt-2">Loading translations...</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredTranslations.map(([key, value]) => (
              <div
                key={key}
                className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-ludus-gray-50 rounded-lg"
              >
                <div className="text-label-sm font-mono text-ludus-gray-800 break-all">
                  {key}
                </div>
                <Input
                  value={value}
                  onChange={(e) => updateTranslation(key, e.target.value)}
                  className="text-sm"
                  dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteTranslation(key)}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  🗑️ Delete
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-r from-ludus-orange to-ludus-orange-600 text-white">
          <div className="text-2xl font-bold">{Object.keys(translations).length}</div>
          <div className="text-sm opacity-90">Total Keys</div>
        </Card>
        <Card className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="text-2xl font-bold">{languages.length}</div>
          <div className="text-sm opacity-90">Languages</div>
        </Card>
        <Card className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="text-2xl font-bold">{namespaces.length}</div>
          <div className="text-sm opacity-90">Namespaces</div>
        </Card>
        <Card className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="text-2xl font-bold">100%</div>
          <div className="text-sm opacity-90">Coverage</div>
        </Card>
      </div>
    </div>
  );
};

export default TranslationManagement;