import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const HowItWorksPage = () => {
  const { t } = useTranslation();

  const steps = [
    {
      number: 1,
      titleKey: 'howItWorks.steps.browse.title',
      descriptionKey: 'howItWorks.steps.browse.description',
      icon: '🔍'
    },
    {
      number: 2,
      titleKey: 'howItWorks.steps.choose.title',
      descriptionKey: 'howItWorks.steps.choose.description',
      icon: '📅'
    },
    {
      number: 3,
      titleKey: 'howItWorks.steps.pay.title',
      descriptionKey: 'howItWorks.steps.pay.description',
      icon: '💳'
    },
    {
      number: 4,
      titleKey: 'howItWorks.steps.enjoy.title',
      descriptionKey: 'howItWorks.steps.enjoy.description',
      icon: '✨'
    }
  ];

  const features = [
    {
      titleKey: 'howItWorks.features.verified.title',
      descriptionKey: 'howItWorks.features.verified.description',
      icon: '✅'
    },
    {
      titleKey: 'howItWorks.features.instant.title',
      descriptionKey: 'howItWorks.features.instant.description',
      icon: '⚡'
    },
    {
      titleKey: 'howItWorks.features.secure.title',
      descriptionKey: 'howItWorks.features.secure.description',
      icon: '🔒'
    },
    {
      titleKey: 'howItWorks.features.support.title',
      descriptionKey: 'howItWorks.features.support.description',
      icon: '📞'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto container-padding text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('howItWorks.title')}
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            {t('howItWorks.subtitle')}
          </p>
        </div>
      </div>

      {/* Steps Section */}
      <div className="py-16">
        <div className="max-w-6xl mx-auto container-padding">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {t('howItWorks.gettingStarted')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                  {step.icon}
                </div>
                <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t(step.titleKey)}
                </h3>
                <p className="text-gray-600">
                  {t(step.descriptionKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto container-padding">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {t('howItWorks.whyChoose')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t(feature.titleKey)}
                </h3>
                <p className="text-gray-600">
                  {t(feature.descriptionKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-4xl mx-auto container-padding text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('howItWorks.readyToStart')}
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            {t('howItWorks.joinAdventurers')}
          </p>
          <div className="space-x-4">
            <Link
              to="/activities"
              className="btn-primary text-lg px-8 py-3"
            >
              {t('howItWorks.browseActivities')}
            </Link>
            <Link
              to="/register"
              className="btn-outline text-lg px-8 py-3"
            >
              {t('howItWorks.signUpNow')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;