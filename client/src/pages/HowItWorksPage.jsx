import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

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
      <div className="bg-ludus-orange text-white py-16">
        <div className="max-w-7xl mx-auto container-padding text-center">
          <h1 className="text-display-lg md:text-display-xl font-bold mb-4">
            {t('howItWorks.title')}
          </h1>
          <p className="text-body-lg text-white/90 max-w-2xl mx-auto">
            {t('howItWorks.subtitle')}
          </p>
        </div>
      </div>

      {/* Steps Section */}
      <div className="py-16">
        <div className="max-w-6xl mx-auto container-padding">
          <h2 className="text-display-md font-bold text-center text-charcoal mb-12">
            {t('howItWorks.gettingStarted')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step) => (
              <Card key={step.number} className="text-center p-6">
                <div className="w-16 h-16 bg-warm-light rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                  {step.icon}
                </div>
                <div className="w-8 h-8 bg-ludus-orange text-white rounded-full flex items-center justify-center text-label-sm font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-body-lg font-semibold text-charcoal mb-2">
                  {t(step.titleKey)}
                </h3>
                <p className="text-body-md text-soft-gray">
                  {t(step.descriptionKey)}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto container-padding">
          <h2 className="text-display-md font-bold text-center text-charcoal mb-12">
            {t('howItWorks.whyChoose')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6">
                <div className="w-16 h-16 bg-success-green/10 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-body-lg font-semibold text-charcoal mb-2">
                  {t(feature.titleKey)}
                </h3>
                <p className="text-body-md text-soft-gray">
                  {t(feature.descriptionKey)}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-warm-light py-16">
        <div className="max-w-4xl mx-auto container-padding text-center">
          <h2 className="text-display-md font-bold text-charcoal mb-4">
            {t('howItWorks.readyToStart')}
          </h2>
          <p className="text-body-lg text-soft-gray mb-8">
            {t('howItWorks.joinAdventurers')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/activities">
              <Button variant="primary" size="lg">
                {t('howItWorks.browseActivities')}
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="secondary" size="lg">
                {t('howItWorks.signUpNow')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;