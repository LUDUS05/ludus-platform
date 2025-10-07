/**
 * @fileoverview Enhanced translation hook with fallbacks and analytics for LUDUS platform.
 * 
 * This module provides an advanced translation hook that extends react-i18next with
 * comprehensive fallback mechanisms, usage analytics, validation, and utility functions.
 * It's specifically designed for the LUDUS platform's bilingual (Arabic/English) needs.
 * 
 * Key Features:
 * - Multi-level fallback system (namespace → fallback namespace → fallback key → default value)
 * - Translation usage analytics and tracking
 * - Missing translation detection and logging
 * - Batch translation support
 * - Safe translation with error handling
 * - Currency and date formatting with locale support
 * - RTL/LTR direction detection
 * - Development-time warnings and debugging
 * 
 * @version 1.0.0
 * @author LUDUS Development Team
 * @since 2025-01-01
 * @see {@link https://react.i18next.com/} react-i18next documentation
 */

import { useTranslation } from 'react-i18next';
import { useCallback, useRef } from 'react';

// Translation usage analytics
const translationUsageLog = new Map();
const missingTranslations = new Set();

/**
 * Enhanced translation hook with fallbacks, logging, and validation
 * @param {string} namespace - Translation namespace (default: 'common')
 * @param {Object} options - Configuration options
 */
const useTranslationWithFallback = (namespace = 'common', options = {}) => {
  const { t, i18n } = useTranslation(namespace);
  const fallbackTranslation = useTranslation(options.fallbackNamespace || 'common');
  const usageLogRef = useRef(new Map());
  
  const {
    enableLogging = process.env.NODE_ENV === 'development',
    enableAnalytics = true,
    fallbackNamespace = 'common',
    enableWarnings = process.env.NODE_ENV === 'development'
  } = options;

  /**
   * Enhanced translation function with fallbacks and logging
   * @param {string} key - Translation key
   * @param {Object} options - i18next options and custom settings
   */
  const translate = useCallback((key, translateOptions = {}) => {
    const {
      defaultValue,
      fallbackKey,
      silent = false,
      count,
      context,
      ...i18nOptions
    } = translateOptions;

    // Handle pluralization
    const pluralOptions = count !== undefined ? { count, ...i18nOptions } : i18nOptions;
    
    // Add context if provided
    const contextOptions = context ? { context, ...pluralOptions } : pluralOptions;
    
    // Try to get translation from current namespace
    let translation = t(key, contextOptions);
    let translationFound = translation !== key;
    let usedNamespace = namespace;
    let usedFallback = false;

    // If translation not found and we have a fallback namespace
    if (!translationFound && fallbackNamespace && fallbackNamespace !== namespace) {
      translation = fallbackTranslation.t(key, contextOptions);
      translationFound = translation !== key;
      usedNamespace = fallbackNamespace;
      usedFallback = true;
    }

    // If still not found, try fallback key
    if (!translationFound && fallbackKey) {
      translation = t(fallbackKey, contextOptions);
      translationFound = translation !== fallbackKey;
    }

    // Use default value if provided and no translation found
    if (!translationFound && defaultValue) {
      translation = defaultValue;
      translationFound = true;
    }

    // Log missing translations in development
    if (!translationFound && enableWarnings && !silent) {
      const fullKey = `${namespace}.${key}`;
      if (!missingTranslations.has(fullKey)) {
        console.warn(`🌐 Missing translation: ${fullKey}`);
        missingTranslations.add(fullKey);
      }
    }

    // Analytics logging
    if (enableAnalytics) {
      const analyticsKey = `${usedNamespace}.${key}`;
      const currentCount = translationUsageLog.get(analyticsKey) || 0;
      translationUsageLog.set(analyticsKey, currentCount + 1);
      
      // Component-level usage tracking
      const localCount = usageLogRef.current.get(analyticsKey) || 0;
      usageLogRef.current.set(analyticsKey, localCount + 1);
    }

    // Development logging
    if (enableLogging && !silent) {
      console.log(`🌐 Translation used: ${key}`, {
        namespace: usedNamespace,
        fallbackUsed: usedFallback,
        found: translationFound,
        value: translation
      });
    }

    return translation;
  }, [t, fallbackTranslation, namespace, fallbackNamespace, enableLogging, enableAnalytics, enableWarnings]);

  /**
   * Batch translate multiple keys
   * @param {Array} keys - Array of translation keys
   * @param {Object} options - Common options for all translations
   */
  const translateBatch = useCallback((keys, batchOptions = {}) => {
    return keys.reduce((acc, key) => {
      acc[key] = translate(key, batchOptions);
      return acc;
    }, {});
  }, [translate]);

  /**
   * Conditional translation with fallback text
   * @param {string} key - Translation key
   * @param {string} fallbackText - Text to use if translation missing
   * @param {Object} options - Translation options
   */
  const translateWithFallback = useCallback((key, fallbackText, translateOptions = {}) => {
    return translate(key, { 
      ...translateOptions, 
      defaultValue: fallbackText,
      silent: true 
    });
  }, [translate]);

  /**
   * Safe translation that never throws errors
   * @param {string} key - Translation key
   * @param {Object} options - Translation options
   */
  const safeTrans = useCallback((key, translateOptions = {}) => {
    try {
      return translate(key, { ...translateOptions, silent: true });
    } catch (error) {
      console.error(`Translation error for key ${key}:`, error);
      return translateOptions.defaultValue || key;
    }
  }, [translate]);

  /**
   * Get component usage statistics
   */
  const getUsageStats = useCallback(() => {
    return {
      componentUsage: Object.fromEntries(usageLogRef.current),
      globalUsage: Object.fromEntries(translationUsageLog),
      missingKeys: Array.from(missingTranslations)
    };
  }, []);

  /**
   * Check if a translation key exists
   * @param {string} key - Translation key to check
   */
  const hasTranslation = useCallback((key) => {
    const translation = t(key);
    return translation !== key;
  }, [t]);

  /**
   * Get current language direction
   */
  const getDirection = useCallback(() => {
    return i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  /**
   * Format currency with current locale
   * @param {number} amount - Amount to format
   * @param {string} currency - Currency code (default: SAR)
   */
  const formatCurrency = useCallback((amount, currency = 'SAR') => {
    const locale = i18n.language === 'ar' ? 'ar-SA' : 'en-SA';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0
    }).format(amount);
  }, [i18n.language]);

  /**
   * Format date with current locale
   * @param {Date} date - Date to format
   * @param {Object} options - Intl.DateTimeFormat options
   */
  const formatDate = useCallback((date, dateOptions = {}) => {
    const locale = i18n.language === 'ar' ? 'ar-SA' : 'en-SA';
    return new Intl.DateTimeFormat(locale, dateOptions).format(date);
  }, [i18n.language]);

  return {
    // Core translation functions
    t: translate,
    translateBatch,
    translateWithFallback,
    safeTrans,
    
    // Utility functions
    hasTranslation,
    getDirection,
    formatCurrency,
    formatDate,
    
    // Analytics and debugging
    getUsageStats,
    
    // Original i18n properties
    i18n,
    ready: i18n.isInitialized,
    language: i18n.language
  };
};

// Export analytics functions for admin use
export const getGlobalTranslationStats = () => ({
  usage: Object.fromEntries(translationUsageLog),
  missingKeys: Array.from(missingTranslations)
});

export const clearTranslationStats = () => {
  translationUsageLog.clear();
  missingTranslations.clear();
};

export default useTranslationWithFallback;