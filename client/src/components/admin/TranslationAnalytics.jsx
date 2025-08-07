import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { getGlobalTranslationStats, clearTranslationStats } from '../../hooks/useTranslationWithFallback';
import { validateTranslations, checkTranslationIssues } from '../../utils/translationValidator';
import enTranslations from '../../i18n/locales/en.json';
import arTranslations from '../../i18n/locales/ar.json';

const TranslationAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    usage: {},
    missingKeys: [],
    validation: null,
    issues: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Get usage statistics from the enhanced hook
      const stats = getGlobalTranslationStats();
      
      // Validate translations
      const validation = validateTranslations(enTranslations, arTranslations, {
        ignorePlurals: false,
        checkEmptyValues: true
      });

      // Check for translation issues
      const enIssues = checkTranslationIssues(enTranslations);
      const arIssues = checkTranslationIssues(arTranslations);

      setAnalytics({
        usage: stats.usage,
        missingKeys: stats.missingKeys,
        validation,
        issues: {
          english: enIssues,
          arabic: arIssues
        }
      });
    } catch (error) {
      console.error('Failed to load translation analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearStats = () => {
    clearTranslationStats();
    setAnalytics(prev => ({
      ...prev,
      usage: {},
      missingKeys: []
    }));
  };

  const getMostUsedTranslations = () => {
    return Object.entries(analytics.usage)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
  };

  const getLeastUsedTranslations = () => {
    return Object.entries(analytics.usage)
      .sort(([,a], [,b]) => a - b)
      .slice(0, 10);
  };

  const getUsageByNamespace = () => {
    const namespaceUsage = {};
    Object.keys(analytics.usage).forEach(key => {
      const namespace = key.split('.')[0];
      namespaceUsage[namespace] = (namespaceUsage[namespace] || 0) + analytics.usage[key];
    });
    return Object.entries(namespaceUsage).sort(([,a], [,b]) => b - a);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-ludus-orange border-t-transparent"></div>
      </div>
    );
  }

  const mostUsed = getMostUsedTranslations();
  const leastUsed = getLeastUsedTranslations();
  const namespaceUsage = getUsageByNamespace();
  const { validation, issues } = analytics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-display-sm font-bold text-ludus-dark">
            Translation Analytics
          </h1>
          <p className="text-body-sm text-ludus-gray-600">
            Monitor translation usage and system health
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={loadAnalytics}
            className="text-ludus-dark border-ludus-gray-300"
          >
            🔄 Refresh
          </Button>
          <Button
            variant="outline"
            onClick={handleClearStats}
            className="text-red-600 border-red-300"
          >
            🗑️ Clear Stats
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-r from-ludus-orange to-ludus-orange-600 text-white">
          <div className="text-2xl font-bold">{Object.keys(analytics.usage).length}</div>
          <div className="text-sm opacity-90">Keys Used</div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="text-2xl font-bold">
            {Object.values(analytics.usage).reduce((sum, count) => sum + count, 0)}
          </div>
          <div className="text-sm opacity-90">Total Usage</div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="text-2xl font-bold">
            {validation ? `${validation.completionPercentage}%` : 'N/A'}
          </div>
          <div className="text-sm opacity-90">AR Completion</div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-r from-red-500 to-red-600 text-white">
          <div className="text-2xl font-bold">{analytics.missingKeys.length}</div>
          <div className="text-sm opacity-90">Missing Keys</div>
        </Card>
      </div>

      {/* Translation Validation */}
      {validation && (
        <Card className="p-6">
          <h3 className="text-body-lg font-semibold text-ludus-dark mb-4">
            Translation Validation Results
          </h3>
          
          {validation.isComplete ? (
            <Alert type="success" message="All translations are complete! 🎉" />
          ) : (
            <div className="space-y-4">
              <Alert 
                type="warning" 
                message={`${validation.summary.missing} translations missing in Arabic`} 
              />
              
              <div className="bg-ludus-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-ludus-dark mb-2">Missing Translations:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {validation.issues.missingInSecondary.slice(0, 10).map(key => (
                    <div key={key} className="text-sm font-mono text-ludus-gray-700">
                      {key}
                    </div>
                  ))}
                </div>
                {validation.issues.missingInSecondary.length > 10 && (
                  <p className="text-sm text-ludus-gray-600 mt-2">
                    ... and {validation.issues.missingInSecondary.length - 10} more
                  </p>
                )}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Usage Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Used Translations */}
        <Card className="p-6">
          <h3 className="text-body-lg font-semibold text-ludus-dark mb-4">
            Most Used Translations
          </h3>
          <div className="space-y-2">
            {mostUsed.length > 0 ? mostUsed.map(([key, count]) => (
              <div key={key} className="flex justify-between items-center p-2 bg-ludus-gray-50 rounded">
                <span className="text-sm font-mono text-ludus-gray-800 truncate">{key}</span>
                <span className="text-sm font-bold text-ludus-orange">{count}</span>
              </div>
            )) : (
              <p className="text-ludus-gray-600 text-center py-4">No usage data available</p>
            )}
          </div>
        </Card>

        {/* Namespace Usage */}
        <Card className="p-6">
          <h3 className="text-body-lg font-semibold text-ludus-dark mb-4">
            Usage by Namespace
          </h3>
          <div className="space-y-2">
            {namespaceUsage.map(([namespace, count]) => (
              <div key={namespace} className="flex justify-between items-center p-2 bg-ludus-gray-50 rounded">
                <span className="text-sm font-semibold text-ludus-gray-800">{namespace}</span>
                <span className="text-sm font-bold text-ludus-orange">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Translation Issues */}
      {issues && (
        <Card className="p-6">
          <h3 className="text-body-lg font-semibold text-ludus-dark mb-4">
            Translation Quality Issues
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* English Issues */}
            <div>
              <h4 className="text-body-md font-medium text-ludus-dark mb-3">English</h4>
              <div className="space-y-3">
                {issues.english.duplicateValues.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-orange-600 mb-1">
                      Duplicate Values ({issues.english.duplicateValues.length})
                    </h5>
                    <div className="text-xs text-ludus-gray-600 space-y-1">
                      {issues.english.duplicateValues.slice(0, 3).map((dup, index) => (
                        <div key={index}>
                          {dup.key1} = {dup.key2}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {issues.english.longValues.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-yellow-600 mb-1">
                      Long Values ({issues.english.longValues.length})
                    </h5>
                    <div className="text-xs text-ludus-gray-600">
                      {issues.english.longValues.slice(0, 3).map(item => item.key).join(', ')}
                    </div>
                  </div>
                )}

                {issues.english.interpolationIssues.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-red-600 mb-1">
                      Interpolation Issues ({issues.english.interpolationIssues.length})
                    </h5>
                    <div className="text-xs text-ludus-gray-600 space-y-1">
                      {issues.english.interpolationIssues.slice(0, 3).map((issue, index) => (
                        <div key={index}>
                          {issue.key}: {issue.issue}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Arabic Issues */}
            <div>
              <h4 className="text-body-md font-medium text-ludus-dark mb-3">Arabic</h4>
              <div className="space-y-3">
                {issues.arabic.duplicateValues.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-orange-600 mb-1">
                      Duplicate Values ({issues.arabic.duplicateValues.length})
                    </h5>
                    <div className="text-xs text-ludus-gray-600 space-y-1">
                      {issues.arabic.duplicateValues.slice(0, 3).map((dup, index) => (
                        <div key={index}>
                          {dup.key1} = {dup.key2}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {issues.arabic.longValues.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-yellow-600 mb-1">
                      Long Values ({issues.arabic.longValues.length})
                    </h5>
                    <div className="text-xs text-ludus-gray-600">
                      {issues.arabic.longValues.slice(0, 3).map(item => item.key).join(', ')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Missing Keys Alert */}
      {analytics.missingKeys.length > 0 && (
        <Card className="p-6 border-l-4 border-red-500">
          <h3 className="text-body-lg font-semibold text-red-600 mb-4">
            Missing Translation Keys (Development)
          </h3>
          <p className="text-sm text-ludus-gray-600 mb-3">
            These keys were requested but not found in translation files:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {analytics.missingKeys.slice(0, 12).map(key => (
              <div key={key} className="text-sm font-mono bg-red-50 text-red-700 px-2 py-1 rounded">
                {key}
              </div>
            ))}
          </div>
          {analytics.missingKeys.length > 12 && (
            <p className="text-sm text-ludus-gray-600 mt-2">
              ... and {analytics.missingKeys.length - 12} more missing keys
            </p>
          )}
        </Card>
      )}
    </div>
  );
};

export default TranslationAnalytics;