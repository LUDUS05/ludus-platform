import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import ar from './locales/ar.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en
      },
      ar: {
        translation: ar
      }
    },
    fallbackLng: 'en',
    debug: false,
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    },

    interpolation: {
      escapeValue: false
    },

    // Arabic pluralization rules
    pluralSeparator: '_',
    contextSeparator: '_',
    
    // Custom plural rule for Arabic
    lng: 'ar',
    pluralRules: {
      ar: {
        plurals: function(n) {
          if (n === 0) return 0; // zero
          if (n === 1) return 1; // one
          if (n === 2) return 2; // two
          if (n % 100 >= 3 && n % 100 <= 10) return 3; // few
          if (n % 100 >= 11) return 4; // many
          return 5; // other
        }
      }
    }
  });

// Auto-setup document attributes on initialization
i18n.on('initialized', (options) => {
  const currentLang = i18n.language;
  setupDocumentAttributes(currentLang);
});

// Setup document attributes for RTL/LTR support
function setupDocumentAttributes(language) {
  const isRTL = language === 'ar';
  
  // Update document attributes
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  document.documentElement.lang = language;
  
  // Update body class
  document.body.classList.remove('rtl', 'ltr');
  document.body.classList.add(isRTL ? 'rtl' : 'ltr');
  
  // Store preference
  localStorage.setItem('preferred-language', language);
}

// Listen for language changes and update document
i18n.on('languageChanged', (lng) => {
  setupDocumentAttributes(lng);
});

// Export the setup function for manual use if needed
export { setupDocumentAttributes };
export default i18n;