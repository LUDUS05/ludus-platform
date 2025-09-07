import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import Logo from '../components/common/Logo';

const OnboardLandingPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  const getCurrentLanguageText = () => (i18n.language === 'ar' ? 'English' : 'العربية');

  const handleStart = () => {
    const ref = searchParams.get('ref');
    const url = ref ? `/onboarding?ref=${ref}` : '/onboarding';
    navigate(url);
  };

  return (
    <div className="min-h-screen bg-[#e0e0e0]" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'} lang={i18n.language}>
      <style>
        {`
          .neumorphic { box-shadow: 8px 8px 16px #bebebe, -8px -8px 16px #ffffff; background-color: #e0e0e0; }
          .neumorphic-pressed { box-shadow: inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff; }
          .neumorphic-subtle { box-shadow: 4px 4px 8px #bebebe, -4px -4px 8px #ffffff; background-color: #e0e0e0; }
        `}
      </style>

      {/* Language Switcher */}
      <div className="max-w-md mx-auto px-4 pt-6 pb-4">
        <div className="neumorphic rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-gray-700" />
            <span className="text-sm text-gray-700 font-medium">{t('auth.language')}</span>
          </div>
          <button
            onClick={toggleLanguage}
            className="neumorphic-subtle hover:neumorphic-pressed px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium text-gray-700"
          >
            {getCurrentLanguageText()}
          </button>
        </div>
      </div>

      {/* Card */}
      <div className="max-w-md mx-auto px-4 pb-24">
        <div className="neumorphic rounded-2xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <Logo className="h-20 w-auto" />
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-4">{t('onboarding.title')}</h1>
          <p className="text-gray-600 mb-8">{t('onboarding.subtitle')}</p>

          <div className="mb-6">
            <p className="text-sm text-gray-500">
              {t('user.registration.alreadyHaveAccount')}{' '}
              <Link to="/login" className="text-orange-500 font-medium hover:underline">
                {t('common.login')}
              </Link>
            </p>
          </div>

          <button
            onClick={handleStart}
            className="neumorphic-subtle hover:neumorphic-pressed w-full py-3 px-6 rounded-xl text-lg font-medium text-gray-700 transition-all duration-200"
          >
            {t('onboarding.getStarted') || t('user.registration.getStarted')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardLandingPage;


