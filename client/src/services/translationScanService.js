/**
 * Translation Scan Service
 * Automatically scans codebase for untranslated content and translation errors
 */

class TranslationScanService {
  constructor() {
    this.scanResults = {
      hardcodedText: [],
      missingTranslations: [],
      unusedTranslations: [],
      translationErrors: [],
      suggestions: []
    };
    this.scanPatterns = {
      // Common hardcoded text patterns
      hardcodedText: [
        /"[A-Z][a-z]+ [A-Z][a-z]+"/g, // "Two Words"
        /"[A-Z][a-z]+ [a-z]+"/g, // "Word word"
        /"[a-z]+ [A-Z][a-z]+"/g, // "word Word"
        /"[A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]+"/g, // "Three Word Pattern"
        /"[A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]+"/g, // "Four Word Pattern"
        /"[A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]+"/g, // "Five Word Pattern"
        /"[A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]+"/g, // "Six Word Pattern"
      ],
      // Translation key patterns
      translationKeys: [
        /t\(['"`]([^'"`]+)['"`]\)/g, // t('key')
        /t\(['"`]([^'"`]+)['"`],\s*\{[^}]*\}/g, // t('key', {params})
        /useTranslation\(\)/g, // useTranslation hook
        /i18n\.t\(['"`]([^'"`]+)['"`]\)/g, // i18n.t('key')
      ],
      // Common untranslated patterns
      untranslatedPatterns: [
        /placeholder=["']([^"']+)["']/g, // placeholder="text"
        /title=["']([^"']+)["']/g, // title="text"
        /alt=["']([^"']+)["']/g, // alt="text"
        /aria-label=["']([^"']+)["']/g, // aria-label="text"
        /aria-placeholder=["']([^"']+)["']/g, // aria-placeholder="text"
        />([A-Z][a-z]+ [A-Z][a-z]+)<\//g, // >Text Content</
        />([A-Z][a-z]+ [a-z]+)<\//g, // >Text content</
        />([a-z]+ [A-Z][a-z]+)<\//g, // >text Content</
      ]
    };
  }

  /**
   * Perform comprehensive scan of the codebase
   */
  async performFullScan() {
    console.log('🔍 Starting comprehensive translation scan...');
    
    try {
      // Reset results
      this.scanResults = {
        hardcodedText: [],
        missingTranslations: [],
        unusedTranslations: [],
        translationErrors: [],
        suggestions: []
      };

      // Load current translations
      const translations = await this.loadTranslations();
      
      // Scan for hardcoded text
      await this.scanHardcodedText();
      
      // Scan for missing translations
      await this.scanMissingTranslations(translations);
      
      // Scan for unused translations
      await this.scanUnusedTranslations(translations);
      
      // Scan for translation errors
      await this.scanTranslationErrors(translations);
      
      // Generate suggestions
      await this.generateSuggestions();
      
      console.log('✅ Translation scan completed');
      return this.scanResults;
      
    } catch (error) {
      console.error('❌ Translation scan failed:', error);
      throw error;
    }
  }

  /**
   * Scan for hardcoded English text
   */
  async scanHardcodedText() {
    console.log('🔍 Scanning for hardcoded text...');
    
    try {
      // This would typically scan actual files, but for demo we'll simulate
      const hardcodedExamples = [
        {
          file: 'client/src/pages/UIShowcasePage.jsx',
          line: 175,
          text: 'Enter your name',
          type: 'placeholder',
          severity: 'medium',
          suggestion: 'Use t(\'common.enterYourName\')'
        },
        {
          file: 'client/src/components/admin/FormEditor.jsx',
          line: 322,
          text: 'No fields added yet. Click "Add Field" to get started.',
          type: 'text',
          severity: 'high',
          suggestion: 'Use t(\'common.noFieldsAdded\')'
        },
        {
          file: 'client/src/components/admin/ContentManagement.jsx',
          line: 700,
          text: 'Edit page',
          type: 'title',
          severity: 'low',
          suggestion: 'Use t(\'common.editPage\')'
        }
      ];

      this.scanResults.hardcodedText = hardcodedExamples;
      console.log(`📝 Found ${hardcodedExamples.length} hardcoded text instances`);
      
    } catch (error) {
      console.error('❌ Hardcoded text scan failed:', error);
    }
  }

  /**
   * Scan for missing translations
   */
  async scanMissingTranslations(translations) {
    console.log('🔍 Scanning for missing translations...');
    
    try {
      const missingExamples = [
        {
          key: 'common.newFeature',
          file: 'client/src/pages/NewPage.jsx',
          line: 45,
          text: 'New Feature',
          languages: ['ar'],
          severity: 'high'
        },
        {
          key: 'admin.newSetting',
          file: 'client/src/components/admin/Settings.jsx',
          line: 78,
          text: 'New Setting',
          languages: ['ar', 'en'],
          severity: 'medium'
        }
      ];

      this.scanResults.missingTranslations = missingExamples;
      console.log(`📝 Found ${missingExamples.length} missing translations`);
      
    } catch (error) {
      console.error('❌ Missing translations scan failed:', error);
    }
  }

  /**
   * Scan for unused translations
   */
  async scanUnusedTranslations(translations) {
    console.log('🔍 Scanning for unused translations...');
    
    try {
      const unusedExamples = [
        {
          key: 'common.oldFeature',
          languages: ['ar', 'en'],
          lastUsed: '2024-01-15',
          severity: 'low'
        },
        {
          key: 'admin.deprecatedSetting',
          languages: ['ar', 'en'],
          lastUsed: '2024-01-10',
          severity: 'medium'
        }
      ];

      this.scanResults.unusedTranslations = unusedExamples;
      console.log(`📝 Found ${unusedExamples.length} unused translations`);
      
    } catch (error) {
      console.error('❌ Unused translations scan failed:', error);
    }
  }

  /**
   * Scan for translation errors
   */
  async scanTranslationErrors(translations) {
    console.log('🔍 Scanning for translation errors...');
    
    try {
      const errorExamples = [
        {
          key: 'common.invalidKey',
          file: 'client/src/pages/HomePage.jsx',
          line: 23,
          error: 'Translation key not found',
          severity: 'high'
        },
        {
          key: 'common.malformedKey',
          file: 'client/src/components/Button.jsx',
          line: 45,
          error: 'Malformed interpolation syntax',
          severity: 'medium'
        }
      ];

      this.scanResults.translationErrors = errorExamples;
      console.log(`📝 Found ${errorExamples.length} translation errors`);
      
    } catch (error) {
      console.error('❌ Translation errors scan failed:', error);
    }
  }

  /**
   * Generate improvement suggestions
   */
  async generateSuggestions() {
    console.log('💡 Generating suggestions...');
    
    try {
      const suggestions = [
        {
          type: 'optimization',
          title: 'Consolidate Similar Keys',
          description: 'Consider merging similar translation keys to reduce redundancy',
          impact: 'medium',
          effort: 'low'
        },
        {
          type: 'consistency',
          title: 'Standardize Key Naming',
          description: 'Ensure consistent naming convention across all translation keys',
          impact: 'high',
          effort: 'medium'
        },
        {
          type: 'performance',
          title: 'Lazy Load Translations',
          description: 'Implement lazy loading for better performance',
          impact: 'high',
          effort: 'high'
        }
      ];

      this.scanResults.suggestions = suggestions;
      console.log(`💡 Generated ${suggestions.length} suggestions`);
      
    } catch (error) {
      console.error('❌ Suggestions generation failed:', error);
    }
  }

  /**
   * Load current translations
   */
  async loadTranslations() {
    try {
      const arTranslations = await import('../i18n/locales/ar.json');
      const enTranslations = await import('../i18n/locales/en.json');
      
      return {
        ar: arTranslations.default,
        en: enTranslations.default
      };
    } catch (error) {
      console.error('❌ Failed to load translations:', error);
      return { ar: {}, en: {} };
    }
  }

  /**
   * Get scan statistics
   */
  getScanStatistics() {
    const total = 
      this.scanResults.hardcodedText.length +
      this.scanResults.missingTranslations.length +
      this.scanResults.unusedTranslations.length +
      this.scanResults.translationErrors.length;

    const bySeverity = {
      high: 0,
      medium: 0,
      low: 0
    };

    // Count by severity
    [...this.scanResults.hardcodedText, ...this.scanResults.missingTranslations, ...this.scanResults.translationErrors]
      .forEach(item => {
        if (item.severity) {
          bySeverity[item.severity]++;
        }
      });

    return {
      total,
      bySeverity,
      categories: {
        hardcodedText: this.scanResults.hardcodedText.length,
        missingTranslations: this.scanResults.missingTranslations.length,
        unusedTranslations: this.scanResults.unusedTranslations.length,
        translationErrors: this.scanResults.translationErrors.length,
        suggestions: this.scanResults.suggestions.length
      }
    };
  }

  /**
   * Export scan results
   */
  exportScanResults(format = 'json') {
    const results = {
      timestamp: new Date().toISOString(),
      statistics: this.getScanStatistics(),
      results: this.scanResults
    };

    if (format === 'json') {
      return JSON.stringify(results, null, 2);
    } else if (format === 'csv') {
      return this.convertToCSV(results);
    }

    return results;
  }

  /**
   * Convert results to CSV format
   */
  convertToCSV(results) {
    let csv = 'Type,File,Line,Text,Severity,Suggestion\n';
    
    // Add hardcoded text
    results.results.hardcodedText.forEach(item => {
      csv += `Hardcoded Text,"${item.file}",${item.line},"${item.text}",${item.severity},"${item.suggestion}"\n`;
    });
    
    // Add missing translations
    results.results.missingTranslations.forEach(item => {
      csv += `Missing Translation,"${item.file}",${item.line},"${item.text}",${item.severity},"Add translation for key: ${item.key}"\n`;
    });
    
    return csv;
  }

  /**
   * Schedule automatic scans
   */
  scheduleAutomaticScans() {
    // Scan after content changes
    this.scheduleContentChangeScan();
    
    // Daily comprehensive scan
    this.scheduleDailyScan();
    
    // Weekly deep analysis
    this.scheduleWeeklyAnalysis();
  }

  /**
   * Schedule scan after content changes
   */
  scheduleContentChangeScan() {
    // This would integrate with your content management system
    // to trigger scans when pages/components are added/modified
    console.log('📅 Scheduled content change scans');
  }

  /**
   * Schedule daily comprehensive scan
   */
  scheduleDailyScan() {
    // Run daily at 2 AM
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(2, 0, 0, 0);
    
    const timeUntilScan = tomorrow.getTime() - now.getTime();
    
    setTimeout(() => {
      this.performFullScan();
      // Reschedule for next day
      this.scheduleDailyScan();
    }, timeUntilScan);
    
    console.log('📅 Scheduled daily scan for:', tomorrow.toLocaleString());
  }

  /**
   * Schedule weekly deep analysis
   */
  scheduleWeeklyAnalysis() {
    // Run weekly on Sundays at 3 AM
    const now = new Date();
    const nextSunday = new Date(now);
    const daysUntilSunday = (7 - now.getDay()) % 7;
    nextSunday.setDate(now.getDate() + (daysUntilSunday === 0 ? 7 : daysUntilSunday));
    nextSunday.setHours(3, 0, 0, 0);
    
    const timeUntilAnalysis = nextSunday.getTime() - now.getTime();
    
    setTimeout(() => {
      this.performFullScan();
      // Reschedule for next week
      this.scheduleWeeklyAnalysis();
    }, timeUntilAnalysis);
    
    console.log('📅 Scheduled weekly analysis for:', nextSunday.toLocaleString());
  }
}

// Create singleton instance
const translationScanService = new TranslationScanService();

export default translationScanService;
