import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  // Ensure proper RTL setup on component mount and language change
  useEffect(() => {
    const updateDocumentDirection = () => {
      const currentLang = i18n.language;
      const isRTL = currentLang === 'ar';
      
      // Update document attributes
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      document.documentElement.lang = currentLang;
      
      // Update body class for additional styling if needed
      document.body.classList.remove('rtl', 'ltr');
      document.body.classList.add(isRTL ? 'rtl' : 'ltr');
      
      // Store preference in localStorage
      localStorage.setItem('preferred-language', currentLang);
    };

    updateDocumentDirection();
    
    // Listen for language changes
    i18n.on('languageChanged', updateDocumentDirection);
    
    // Cleanup listener on unmount
    return () => {
      i18n.off('languageChanged', updateDocumentDirection);
    };
  }, [i18n]);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-ludus-orange hover:bg-gray-50 rounded-md transition-colors duration-200"
      title={t('language.switchLanguage')}
    >
      <span className="text-lg mr-2">
        {i18n.language === 'en' ? '🇸🇦' : '🇺🇸'}
      </span>
      <span className="font-semibold">
        {i18n.language === 'en' ? t('language.ar') : t('language.en')}
      </span>
    </button>
  );
};

export default LanguageSwitcher;