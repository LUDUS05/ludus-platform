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