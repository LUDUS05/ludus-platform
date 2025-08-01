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
      className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
      title={t('language.switchLanguage')}
    >
      <svg
        className="w-4 h-4 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
        />
      </svg>
      {i18n.language === 'en' ? t('language.arabic') : t('language.english')}
    </button>
  );
};

export default LanguageSwitcher;