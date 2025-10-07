import React, { useEffect, useRef } from 'react';
import { Button } from '../../ui/Button';
import { gsap } from '../../../utils/gsap-setup';

const SocialProofStep = ({ config, onComplete, onSkip, t }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const cards = containerRef.current.querySelectorAll('.sp-card');
    gsap.fromTo(cards, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out' });
  }, []);

  const highlights = (config?.socialProofConfig?.highlights && config.socialProofConfig.highlights.length > 0)
    ? config.socialProofConfig.highlights
    : [
        { icon: '📅', title: { en: t('onboarding.steps.socialProof.activities.title'), ar: t('onboarding.steps.socialProof.activities.title') }, description: { en: t('onboarding.steps.socialProof.activities.subtitle'), ar: t('onboarding.steps.socialProof.activities.subtitle') } },
        { icon: '👥', title: { en: t('onboarding.steps.socialProof.members.title'), ar: t('onboarding.steps.socialProof.members.title') }, description: { en: t('onboarding.steps.socialProof.members.subtitle'), ar: t('onboarding.steps.socialProof.members.subtitle') } },
        { icon: '⭐', title: { en: t('onboarding.steps.socialProof.rating.title'), ar: t('onboarding.steps.socialProof.rating.title') }, description: { en: t('onboarding.steps.socialProof.rating.subtitle'), ar: t('onboarding.steps.socialProof.rating.subtitle') } }
      ];

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4" ref={containerRef}>
      <div className="max-w-4xl w-full text-center">
        <div className="mb-8">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900">
            {t('onboarding.steps.socialProof.title')}
          </h2>
          <p className="text-gray-600 mt-2">{t('onboarding.steps.socialProof.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {highlights.map((item, idx) => (
            <div key={idx} className="sp-card bg-white/80 backdrop-blur rounded-2xl p-6 shadow-md">
              <div className="text-4xl mb-3">{item.icon}</div>
              <div className="text-xl font-semibold text-gray-900">{item.title.en}</div>
              <div className="text-sm text-gray-500">{item.title.ar}</div>
              <p className="text-gray-600 mt-2">{item.description.en}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-3">
          {config?.socialProofConfig?.showSkip !== false && (
            <Button variant="ghost" onClick={() => onSkip?.()}> {t('onboarding.skip')} </Button>
          )}
          <Button variant="primary" onClick={() => onComplete?.({ socialProofViewed: true })}>
            {t('onboarding.continue')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SocialProofStep;


