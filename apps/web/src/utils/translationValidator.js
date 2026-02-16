/**
 * Translation validation utilities
 * Provides functions to validate translation completeness and consistency
 */

/**
 * Recursively get all keys from a nested object
 * @param {Object} obj - The object to extract keys from
 * @param {string} prefix - Current key prefix
 * @returns {Array} Array of dot-notation keys
 */
export const getAllKeys = (obj, prefix = '') => {
  const keys = [];
  
  if (!obj || typeof obj !== 'object') {
    return keys;
  }
  
  Object.keys(obj).forEach(key => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys.push(...getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  });
  
  return keys;
};

/**
 * Get nested value from object using dot notation
 * @param {Object} obj - The object to search in
 * @param {string} path - Dot-notation path
 * @returns {any} The value at the path, or undefined
 */
export const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
};

/**
 * Set nested value in object using dot notation
 * @param {Object} obj - The object to modify
 * @param {string} path - Dot-notation path
 * @param {any} value - Value to set
 */
export const setNestedValue = (obj, path, value) => {
  const keys = path.split('.');
  const lastKey = keys.pop();
  
  const target = keys.reduce((current, key) => {
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    return current[key];
  }, obj);
  
  target[lastKey] = value;
};

/**
 * Validate translations between two language objects
 * @param {Object} primaryTranslations - Primary language translations (usually English)
 * @param {Object} secondaryTranslations - Secondary language translations
 * @param {Object} options - Validation options
 * @returns {Object} Validation results
 */
export const validateTranslations = (primaryTranslations, secondaryTranslations, options = {}) => {
  const {
    ignorePlurals = false,
    ignoreContexts = false,
    checkEmptyValues = true,
    checkUnusedKeys = true
  } = options;

  const primaryKeys = getAllKeys(primaryTranslations);
  const secondaryKeys = getAllKeys(secondaryTranslations);
  
  // Find missing keys in secondary language
  const missingInSecondary = primaryKeys.filter(key => {
    if (ignorePlurals && key.includes('_plural')) {
      return false;
    }
    if (ignoreContexts && key.includes('_context')) {
      return false;
    }
    return !secondaryKeys.includes(key);
  });
  
  // Find extra keys in secondary language
  const extraInSecondary = secondaryKeys.filter(key => {
    if (ignorePlurals && key.includes('_plural')) {
      return false;
    }
    if (ignoreContexts && key.includes('_context')) {
      return false;
    }
    return !primaryKeys.includes(key);
  });
  
  // Find empty values
  const emptyValues = [];
  if (checkEmptyValues) {
    secondaryKeys.forEach(key => {
      const value = getNestedValue(secondaryTranslations, key);
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        emptyValues.push(key);
      }
    });
  }
  
  // Find potentially unused keys (keys that exist in secondary but not primary)
  const unusedKeys = checkUnusedKeys ? extraInSecondary : [];
  
  // Calculate completion percentage
  const totalPrimaryKeys = primaryKeys.length;
  const matchingKeys = primaryKeys.filter(key => secondaryKeys.includes(key)).length;
  const completionPercentage = totalPrimaryKeys > 0 ? (matchingKeys / totalPrimaryKeys) * 100 : 100;
  
  return {
    isComplete: missingInSecondary.length === 0,
    completionPercentage: Math.round(completionPercentage * 100) / 100,
    totalKeys: {
      primary: primaryKeys.length,
      secondary: secondaryKeys.length,
      matching: matchingKeys
    },
    issues: {
      missingInSecondary,
      extraInSecondary,
      emptyValues,
      unusedKeys
    },
    summary: {
      missing: missingInSecondary.length,
      extra: extraInSecondary.length,
      empty: emptyValues.length,
      unused: unusedKeys.length
    }
  };
};

/**
 * Validate multiple languages against a primary language
 * @param {Object} primaryTranslations - Primary language translations
 * @param {Object} allTranslations - Object containing all language translations
 * @param {Object} options - Validation options
 * @returns {Object} Multi-language validation results
 */
export const validateMultipleLanguages = (primaryTranslations, allTranslations, options = {}) => {
  const results = {};
  
  Object.keys(allTranslations).forEach(lang => {
    if (allTranslations[lang] !== primaryTranslations) {
      results[lang] = validateTranslations(primaryTranslations, allTranslations[lang], options);
    }
  });
  
  return results;
};

/**
 * Generate missing translations template
 * @param {Array} missingKeys - Array of missing keys
 * @param {Object} primaryTranslations - Primary translations for reference
 * @returns {Object} Template object with missing keys
 */
export const generateMissingTemplate = (missingKeys, primaryTranslations) => {
  const template = {};
  
  missingKeys.forEach(key => {
    const primaryValue = getNestedValue(primaryTranslations, key);
    setNestedValue(template, key, `[TRANSLATE: ${primaryValue}]`);
  });
  
  return template;
};

/**
 * Find translation keys that match a pattern
 * @param {Object} translations - Translations object
 * @param {RegExp|string} pattern - Pattern to match
 * @returns {Array} Matching keys
 */
export const findKeysByPattern = (translations, pattern) => {
  const allKeys = getAllKeys(translations);
  const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
  
  return allKeys.filter(key => regex.test(key));
};

/**
 * Check for potential translation issues
 * @param {Object} translations - Translations object
 * @returns {Object} Issues found
 */
export const checkTranslationIssues = (translations) => {
  const allKeys = getAllKeys(translations);
  const issues = {
    duplicateValues: [],
    suspiciousKeys: [],
    longValues: [],
    interpolationIssues: []
  };
  
  const values = new Map();
  
  allKeys.forEach(key => {
    const value = getNestedValue(translations, key);
    
    if (typeof value === 'string') {
      // Check for duplicate values
      if (values.has(value)) {
        issues.duplicateValues.push({
          key1: values.get(value),
          key2: key,
          value
        });
      } else {
        values.set(value, key);
      }
      
      // Check for suspicious keys (same as value)
      if (value === key.split('.').pop()) {
        issues.suspiciousKeys.push({ key, value });
      }
      
      // Check for very long values (potential formatting issues)
      if (value.length > 200) {
        issues.longValues.push({ key, length: value.length });
      }
      
      // Check for interpolation issues
      const interpolationPattern = /\{\{([^}]+)\}\}/g;
      const matches = value.match(interpolationPattern);
      if (matches) {
        matches.forEach(match => {
          const variable = match.slice(2, -2).trim();
          if (!variable || variable.includes('{{') || variable.includes('}}')) {
            issues.interpolationIssues.push({ key, issue: match });
          }
        });
      }
    }
  });
  
  return issues;
};

/**
 * Export translations to various formats
 * @param {Object} translations - Translations object
 * @param {string} format - Export format ('json', 'csv', 'xlsx')
 * @returns {string|Object} Exported data
 */
export const exportTranslations = (translations, format = 'json') => {
  const allKeys = getAllKeys(translations);
  
  switch (format.toLowerCase()) {
    case 'csv': {
      const rows = [['Key', 'Value']];
      allKeys.forEach(key => {
        const value = getNestedValue(translations, key);
        rows.push([key, String(value).replace(/"/g, '""')]);
      });
      return rows.map(row => `"${row[0]}","${row[1]}"`).join('\n');
    }
    
    case 'flat': {
      const flat = {};
      allKeys.forEach(key => {
        flat[key] = getNestedValue(translations, key);
      });
      return flat;
    }
    
    case 'json':
    default:
      return JSON.stringify(translations, null, 2);
  }
};

/**
 * Import translations from flat format
 * @param {Object} flatTranslations - Flat translations object
 * @returns {Object} Nested translations object
 */
export const importFromFlat = (flatTranslations) => {
  const nested = {};
  
  Object.keys(flatTranslations).forEach(key => {
    setNestedValue(nested, key, flatTranslations[key]);
  });
  
  return nested;
};

// Translation validation middleware for development
export const createValidationMiddleware = (options = {}) => {
  const { 
    logMissingKeys = true,
    logDuplicateValues = true,
    autoFixEmptyValues = false
  } = options;
  
  return (translations, language) => {
    if (process.env.NODE_ENV !== 'development') {
      return translations;
    }
    
    const issues = checkTranslationIssues(translations);
    
    if (logMissingKeys && issues.suspiciousKeys.length > 0) {
      console.warn(`🌐 Suspicious translation keys in ${language}:`, issues.suspiciousKeys);
    }
    
    if (logDuplicateValues && issues.duplicateValues.length > 0) {
      console.warn(`🌐 Duplicate translation values in ${language}:`, issues.duplicateValues);
    }
    
    if (autoFixEmptyValues) {
      // This would need implementation based on requirements
      console.log(`🌐 Would auto-fix empty values for ${language}`);
    }
    
    return translations;
  };
};