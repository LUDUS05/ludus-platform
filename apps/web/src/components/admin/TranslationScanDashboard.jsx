import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

import translationScanService from '../../services/translationScanService';
Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  RefreshCw,
  Clock,
  FileText,
  Globe,
  TrendingUp,
  Filter,
  Eye,
  Edit
} from 'lucide-react';

const TranslationScanDashboard = () => {
  const { t } = useTranslation();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [autoScanEnabled, setAutoScanEnabled] = useState(true);

  useEffect(() => {
    loadScanHistory();
    if (autoScanEnabled) {
      translationScanService.scheduleAutomaticScans();
    }
  }, [autoScanEnabled]);

  const loadScanHistory = async () => {
    // Load previous scan results from localStorage or API
    const history = JSON.parse(localStorage.getItem('translationScanHistory') || '[]');
    setScanHistory(history);
  };

  const performScan = async () => {
    setIsScanning(true);
    try {
      const results = await translationScanService.performFullScan();
      setScanResults(results);

      // Save to history
      const newHistory = [{
        id: Date.now(),
        timestamp: new Date().toISOString(),
        results: results,
        statistics: translationScanService.getScanStatistics()
      }, ...scanHistory.slice(0, 9)]; // Keep last 10 scans

      setScanHistory(newHistory);
      localStorage.setItem('translationScanHistory', JSON.stringify(newHistory));

    } catch (error) {
      console.error('Scan failed:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const exportResults = (format) => {
    if (!scanResults) return;

    const data = translationScanService.exportScanResults(format);
    const blob = new Blob([data], {
      type: format === 'json' ? 'application/json' : 'text/csv'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translation-scan-${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return <XCircle className="w-4 h-4" />;
      case 'medium': return <AlertTriangle className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const filteredResults = () => {
    if (!scanResults) return { hardcodedText: [], missingTranslations: [], unusedTranslations: [], translationErrors: [] };

    let results = { ...scanResults };

    // Filter by category
    if (selectedCategory !== 'all') {
      Object.keys(results).forEach(key => {
        if (key !== selectedCategory) {
          results[key] = [];
        }
      });
    }

    // Filter by severity
    if (selectedSeverity !== 'all') {
      Object.keys(results).forEach(key => {
        if (Array.isArray(results[key])) {
          results[key] = results[key].filter(item => item.severity === selectedSeverity);
        }
      });
    }

    return results;
  };

  const statistics = scanResults ? translationScanService.getScanStatistics() : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('admin.translationScan.title', 'Translation Scan Dashboard')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('admin.translationScan.subtitle', 'Automatically detect untranslated content and translation errors')}
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={performScan}
            disabled={isScanning}
            className="flex items-center space-x-2"
          >
            {isScanning ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>
              {isScanning
                ? t('admin.translationScan.scanning', 'Scanning...')
                : t('admin.translationScan.startScan', 'Start Scan')
              }
            </span>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('admin.translationScan.totalIssues', 'Total Issues')}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statistics.total}
                </p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('admin.translationScan.highSeverity', 'High Severity')}
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {statistics.bySeverity.high}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('admin.translationScan.mediumSeverity', 'Medium Severity')}
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {statistics.bySeverity.medium}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('admin.translationScan.suggestions', 'Suggestions')}
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {statistics.categories.suggestions}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('admin.translationScan.filters', 'Filters')}:
            </span>
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">{t('admin.translationScan.allCategories', 'All Categories')}</option>
            <option value="hardcodedText">{t('admin.translationScan.hardcodedText', 'Hardcoded Text')}</option>
            <option value="missingTranslations">{t('admin.translationScan.missingTranslations', 'Missing Translations')}</option>
            <option value="unusedTranslations">{t('admin.translationScan.unusedTranslations', 'Unused Translations')}</option>
            <option value="translationErrors">{t('admin.translationScan.translationErrors', 'Translation Errors')}</option>
          </select>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">{t('admin.translationScan.allSeverities', 'All Severities')}</option>
            <option value="high">{t('admin.translationScan.high', 'High')}</option>
            <option value="medium">{t('admin.translationScan.medium', 'Medium')}</option>
            <option value="low">{t('admin.translationScan.low', 'Low')}</option>
          </select>
        </div>
      </Card>

      {/* Scan Results */}
      {scanResults && (
        <div className="space-y-6">
          {/* Hardcoded Text */}
          {filteredResults().hardcodedText.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>{t('admin.translationScan.hardcodedText', 'Hardcoded Text')}</span>
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    {filteredResults().hardcodedText.length}
                  </span>
                </h3>
              </div>

              <div className="space-y-3">
                {filteredResults().hardcodedText.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(item.severity)}`}>
                            {getSeverityIcon(item.severity)}
                            <span className="ml-1 capitalize">{item.severity}</span>
                          </span>
                          <span className="text-sm text-gray-500">{item.type}</span>
                        </div>
                        <p className="text-sm text-gray-900 dark:text-white mb-1">
                          <strong>File:</strong> {item.file}:{item.line}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          <strong>Text:</strong> "{item.text}"
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          <strong>Suggestion:</strong> {item.suggestion}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Missing Translations */}
          {filteredResults().missingTranslations.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>{t('admin.translationScan.missingTranslations', 'Missing Translations')}</span>
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                    {filteredResults().missingTranslations.length}
                  </span>
                </h3>
              </div>

              <div className="space-y-3">
                {filteredResults().missingTranslations.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(item.severity)}`}>
                            {getSeverityIcon(item.severity)}
                            <span className="ml-1 capitalize">{item.severity}</span>
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 dark:text-white mb-1">
                          <strong>Key:</strong> {item.key}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                          <strong>File:</strong> {item.file}:{item.line}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          <strong>Missing in:</strong> {item.languages.join(', ')}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Suggestions */}
          {filteredResults().suggestions.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>{t('admin.translationScan.suggestions', 'Suggestions')}</span>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    {filteredResults().suggestions.length}
                  </span>
                </h3>
              </div>

              <div className="space-y-3">
                {filteredResults().suggestions.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                          {item.title}
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          {item.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs">
                          <span className={`px-2 py-1 rounded-full ${item.impact === 'high' ? 'bg-red-100 text-red-800' :
                              item.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                            }`}>
                            Impact: {item.impact}
                          </span>
                          <span className={`px-2 py-1 rounded-full ${item.effort === 'high' ? 'bg-red-100 text-red-800' :
                              item.effort === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                            }`}>
                            Effort: {item.effort}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Export and Actions */}
      {scanResults && (
        <Card className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => exportResults('json')}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>{t('admin.translationScan.exportJson', 'Export JSON')}</span>
              </Button>
              <Button
                onClick={() => exportResults('csv')}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>{t('admin.translationScan.exportCsv', 'Export CSV')}</span>
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={autoScanEnabled}
                  onChange={(e) => setAutoScanEnabled(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t('admin.translationScan.autoScan', 'Auto Scan')}
                </span>
              </label>
            </div>
          </div>
        </Card>
      )}

      {/* Scan History */}
      {scanHistory.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('admin.translationScan.scanHistory', 'Scan History')}
          </h3>
          <div className="space-y-2">
            {scanHistory.map((scan) => (
              <div key={scan.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(scan.timestamp).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {scan.statistics.total} issues found
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setScanResults(scan.results)}
                >
                  <Eye className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default TranslationScanDashboard;
