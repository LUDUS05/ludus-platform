const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { auth, requireRole } = require('../middleware/auth');

// Translation file paths
const getTranslationFilePath = (language) => {
  const clientPath = path.join(__dirname, '../../../client/src/i18n/locales');
  return path.join(clientPath, `${language}.json`);
};

// Get all translations for a specific language and namespace
router.get('/admin/translations/:language/:namespace', auth, requireRole('admin'), async (req, res) => {
  try {
    const { language, namespace } = req.params;
    
    // Validate language
    if (!['en', 'ar', 'fr', 'es', 'de'].includes(language)) {
      return res.status(400).json({
        status: 'error',
        message: 'Unsupported language'
      });
    }

    const filePath = getTranslationFilePath(language);
    
    // Read the translation file
    const fileContent = await fs.readFile(filePath, 'utf8');
    const translations = JSON.parse(fileContent);
    
    // Get specific namespace or all translations
    const namespaceTranslations = namespace === 'all' ? translations : translations[namespace] || {};
    
    res.json({
      status: 'success',
      data: namespaceTranslations,
      meta: {
        language,
        namespace,
        keyCount: Object.keys(namespaceTranslations).length
      }
    });
  } catch (error) {
    console.error('Error fetching translations:', error);
    
    if (error.code === 'ENOENT') {
      res.status(404).json({
        status: 'error',
        message: 'Translation file not found'
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch translations'
      });
    }
  }
});

// Update translations for a specific language and namespace
router.put('/admin/translations/:language/:namespace', auth, requireRole('admin'), async (req, res) => {
  try {
    const { language, namespace } = req.params;
    const { translations: newTranslations } = req.body;
    
    // Validate input
    if (!newTranslations || typeof newTranslations !== 'object') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid translations data'
      });
    }

    const filePath = getTranslationFilePath(language);
    
    // Read existing translations
    let existingTranslations = {};
    try {
      const fileContent = await fs.readFile(filePath, 'utf8');
      existingTranslations = JSON.parse(fileContent);
    } catch (error) {
      // File doesn't exist, start with empty object
      console.log('Translation file does not exist, creating new one');
    }
    
    // Update the specific namespace
    if (namespace === 'all') {
      existingTranslations = newTranslations;
    } else {
      existingTranslations[namespace] = newTranslations;
    }
    
    // Write back to file
    await fs.writeFile(filePath, JSON.stringify(existingTranslations, null, 2), 'utf8');
    
    res.json({
      status: 'success',
      message: 'Translations updated successfully',
      data: existingTranslations[namespace],
      meta: {
        language,
        namespace,
        keyCount: Object.keys(newTranslations).length
      }
    });
  } catch (error) {
    console.error('Error updating translations:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update translations'
    });
  }
});

// Get translation statistics
router.get('/admin/translations/stats', auth, requireRole('admin'), async (req, res) => {
  try {
    const languages = ['en', 'ar'];
    const stats = {};
    
    for (const lang of languages) {
      try {
        const filePath = getTranslationFilePath(lang);
        const fileContent = await fs.readFile(filePath, 'utf8');
        const translations = JSON.parse(fileContent);
        
        // Count keys recursively
        const countKeys = (obj) => {
          let count = 0;
          for (const key in obj) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
              count += countKeys(obj[key]);
            } else {
              count += 1;
            }
          }
          return count;
        };
        
        stats[lang] = {
          totalKeys: countKeys(translations),
          namespaces: Object.keys(translations).length,
          fileSize: Buffer.byteLength(fileContent, 'utf8')
        };
      } catch (error) {
        stats[lang] = {
          totalKeys: 0,
          namespaces: 0,
          fileSize: 0,
          error: 'File not found'
        };
      }
    }
    
    res.json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    console.error('Error getting translation stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get translation statistics'
    });
  }
});

// Validate translations (check for missing keys between languages)
router.get('/admin/translations/validate', auth, requireRole('admin'), async (req, res) => {
  try {
    const enPath = getTranslationFilePath('en');
    const arPath = getTranslationFilePath('ar');
    
    const enContent = await fs.readFile(enPath, 'utf8');
    const arContent = await fs.readFile(arPath, 'utf8');
    
    const enTranslations = JSON.parse(enContent);
    const arTranslations = JSON.parse(arContent);
    
    // Get all keys recursively
    const getAllKeys = (obj, prefix = '') => {
      const keys = [];
      for (const key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          keys.push(...getAllKeys(obj[key], fullKey));
        } else {
          keys.push(fullKey);
        }
      }
      return keys;
    };
    
    const enKeys = getAllKeys(enTranslations);
    const arKeys = getAllKeys(arTranslations);
    
    const missingInArabic = enKeys.filter(key => !arKeys.includes(key));
    const missingInEnglish = arKeys.filter(key => !enKeys.includes(key));
    
    res.json({
      status: 'success',
      data: {
        totalEnglishKeys: enKeys.length,
        totalArabicKeys: arKeys.length,
        missingInArabic,
        missingInEnglish,
        isComplete: missingInArabic.length === 0 && missingInEnglish.length === 0
      }
    });
  } catch (error) {
    console.error('Error validating translations:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to validate translations'
    });
  }
});

// Export translations for backup
router.get('/admin/translations/export/:language', auth, requireRole('admin'), async (req, res) => {
  try {
    const { language } = req.params;
    const filePath = getTranslationFilePath(language);
    
    const fileContent = await fs.readFile(filePath, 'utf8');
    const translations = JSON.parse(fileContent);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${language}_translations.json"`);
    res.send(JSON.stringify(translations, null, 2));
  } catch (error) {
    console.error('Error exporting translations:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to export translations'
    });
  }
});

module.exports = router;