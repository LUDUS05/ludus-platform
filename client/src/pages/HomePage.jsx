import React from 'react';
import { useTranslation } from 'react-i18next';

const HomePage = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-soft-white dark:dark-bg-primary">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto container-padding py-20">
        <div className="text-center">
          <h1 className="text-display-xl font-bold text-charcoal dark:dark-text-primary mb-6">
            {t('home.welcomeTitle')}
          </h1>
          <p className="text-body-lg text-charcoal-light dark:dark-text-secondary mb-12 max-w-2xl mx-auto">
            {t('home.welcomeSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="/activities" className="btn-primary btn-lg">
              {t('home.exploreActivities')}
            </a>
            <a href="/register" className="btn-secondary btn-lg">
              {t('home.getStarted')}
            </a>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white dark:bg-dark-bg-secondary py-20">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="text-display-lg font-bold text-charcoal dark:dark-text-primary mb-4">
              Why Choose LUDUS?
            </h2>
            <p className="text-body-md text-charcoal-light dark:dark-text-secondary max-w-2xl mx-auto">
              Discover unique experiences and connect with local activity providers across Saudi Arabia
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-ludus-orange/10 dark:bg-dark-ludus-orange/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-body-lg font-semibold text-charcoal dark:dark-text-primary mb-3">
                Curated Experiences
              </h3>
              <p className="text-body-md text-charcoal-light dark:dark-text-secondary">
                Handpicked activities from trusted local providers to ensure quality and authenticity
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-ludus-orange/10 dark:bg-dark-ludus-orange/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">💳</span>
              </div>
              <h3 className="text-body-lg font-semibold text-charcoal dark:dark-text-primary mb-3">
                Secure Payments
              </h3>
              <p className="text-body-md text-charcoal-light dark:dark-text-secondary">
                Safe and secure booking with support for local payment methods including MADA and STC Pay
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-ludus-orange/10 dark:bg-dark-ludus-orange/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">📱</span>
              </div>
              <h3 className="text-body-lg font-semibold text-charcoal dark:dark-text-primary mb-3">
                Mobile Optimized
              </h3>
              <p className="text-body-md text-charcoal-light dark:dark-text-secondary">
                Seamlessly book and manage your activities on any device, anywhere, anytime
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-ludus-orange dark:bg-dark-ludus-orange py-20">
        <div className="max-w-7xl mx-auto container-padding text-center">
          <h2 className="text-display-lg font-bold text-white mb-6">
            Ready to Start Your Adventure?
          </h2>
          <p className="text-body-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of explorers discovering amazing experiences across Saudi Arabia
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="/activities" className="btn-secondary btn-lg bg-white text-ludus-orange hover:bg-warm">
              Browse Activities
            </a>
            <a href="/partner-registration" className="btn-outline btn-lg border-white text-white hover:bg-white hover:text-ludus-orange">
              Become a Partner
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;