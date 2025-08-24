import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const HowItWorksPage = () => {
  const { t } = useTranslation();
  const [visibleSections, setVisibleSections] = useState(new Set());
  const sectionRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set(prev).add(entry.target.dataset.section));
          }
        });
      },
      { threshold: 0.2, rootMargin: '50px' }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const steps = [
    {
      number: 1,
      titleKey: 'howItWorks.steps.browse.title',
      descriptionKey: 'howItWorks.steps.browse.description',
      icon: '🔍',
      gradient: 'from-ludus-orange to-orange-500',
      bgIcon: 'bg-gradient-to-br from-ludus-orange/10 to-orange-500/10'
    },
    {
      number: 2,
      titleKey: 'howItWorks.steps.choose.title',
      descriptionKey: 'howItWorks.steps.choose.description',
      icon: '📅',
      gradient: 'from-blue-500 to-blue-600',
      bgIcon: 'bg-gradient-to-br from-blue-500/10 to-blue-600/10'
    },
    {
      number: 3,
      titleKey: 'howItWorks.steps.pay.title',
      descriptionKey: 'howItWorks.steps.pay.description',
      icon: '💳',
      gradient: 'from-green-500 to-emerald-600',
      bgIcon: 'bg-gradient-to-br from-green-500/10 to-emerald-600/10'
    },
    {
      number: 4,
      titleKey: 'howItWorks.steps.enjoy.title',
      descriptionKey: 'howItWorks.steps.enjoy.description',
      icon: '✨',
      gradient: 'from-purple-500 to-indigo-600',
      bgIcon: 'bg-gradient-to-br from-purple-500/10 to-indigo-600/10'
    }
  ];

  const features = [
    {
      titleKey: 'howItWorks.features.verified.title',
      descriptionKey: 'howItWorks.features.verified.description',
      icon: '✅',
      color: 'text-success-green',
      bgColor: 'bg-success-green/10',
      borderColor: 'border-success-green/20'
    },
    {
      titleKey: 'howItWorks.features.instant.title',
      descriptionKey: 'howItWorks.features.instant.description',
      icon: '⚡',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20'
    },
    {
      titleKey: 'howItWorks.features.secure.title',
      descriptionKey: 'howItWorks.features.secure.description',
      icon: '🔒',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      titleKey: 'howItWorks.features.support.title',
      descriptionKey: 'howItWorks.features.support.description',
      icon: '📞',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-warm-light/50 overflow-hidden">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease-out;
        }
        .animate-on-scroll.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .float-animation {
          animation: float 3s ease-in-out infinite;
        }
        .pulse-animation {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-ludus-orange/10 rounded-full float-animation" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-blue-500/10 rounded-full float-animation" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-1/4 w-20 h-20 bg-green-500/10 rounded-full float-animation" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-purple-500/10 rounded-full float-animation" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-ludus-orange via-orange-500 to-ludus-orange text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto container-padding text-center">
          <div className="animate-on-scroll" data-section="hero" ref={el => sectionRefs.current[0] = el}>
            <h1 className="text-display-lg md:text-display-xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="block" style={{ animation: 'slideInUp 1s ease-out 0.2s both' }}>
                {t('howItWorks.title')}
              </span>
            </h1>
            <p className="text-body-lg md:text-xl text-white/95 max-w-3xl mx-auto leading-relaxed" style={{ animation: 'slideInUp 1s ease-out 0.4s both' }}>
              {t('howItWorks.subtitle')}
            </p>
          </div>
          
          {/* Animated Icons */}
          <div className="flex justify-center mt-12 space-x-8" style={{ animation: 'slideInUp 1s ease-out 0.6s both' }}>
            <div className="text-4xl float-animation" style={{ animationDelay: '0s' }}>🎯</div>
            <div className="text-4xl float-animation" style={{ animationDelay: '0.5s' }}>🚀</div>
            <div className="text-4xl float-animation" style={{ animationDelay: '1s' }}>⭐</div>
          </div>
        </div>
      </div>

      {/* Steps Section */}
      <div className="py-20 relative">
        <div className="max-w-6xl mx-auto container-padding">
          <div className={`animate-on-scroll text-center mb-16 ${visibleSections.has('steps') ? 'visible' : ''}`} 
               data-section="steps" 
               ref={el => sectionRefs.current[1] = el}>
            <h2 className="text-display-md lg:text-5xl font-bold text-charcoal mb-4">
              {t('howItWorks.gettingStarted')}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-ludus-orange to-orange-500 mx-auto rounded-full"></div>
          </div>
          
          {/* Process Flow Line */}
          <div className="hidden lg:block absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-ludus-orange/30 to-transparent"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div key={step.number} 
                   className={`animate-on-scroll ${visibleSections.has('steps') ? 'visible' : ''}`} 
                   style={{ animationDelay: `${index * 0.2}s` }}>
                <Card className="text-center p-8 hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border-2 hover:border-ludus-orange/20 group relative overflow-hidden">
                  {/* Background gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white to-warm-light/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative z-10">
                    {/* Step connection line */}
                    {index < steps.length - 1 && (
                      <div className="hidden lg:block absolute top-12 -right-6 w-12 h-px bg-gradient-to-r from-ludus-orange/40 to-transparent"></div>
                    )}
                    
                    {/* Icon with animation */}
                    <div className={`w-20 h-20 ${step.bgIcon} rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 pulse-animation`}>
                      <span className="filter drop-shadow-sm">{step.icon}</span>
                    </div>
                    
                    {/* Step number with gradient */}
                    <div className={`w-10 h-10 bg-gradient-to-r ${step.gradient} text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {step.number}
                    </div>
                    
                    <h3 className="text-lg font-bold text-charcoal mb-3 group-hover:text-ludus-orange transition-colors duration-300">
                      {t(step.titleKey)}
                    </h3>
                    
                    <p className="text-body-md text-soft-gray leading-relaxed">
                      {t(step.descriptionKey)}
                    </p>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gradient-to-br from-white to-warm-light/30 py-20 relative">
        <div className="max-w-6xl mx-auto container-padding">
          <div className={`animate-on-scroll text-center mb-16 ${visibleSections.has('features') ? 'visible' : ''}`} 
               data-section="features" 
               ref={el => sectionRefs.current[2] = el}>
            <h2 className="text-display-md lg:text-5xl font-bold text-charcoal mb-4">
              {t('howItWorks.whyChoose')}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-success-green to-emerald-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} 
                   className={`animate-on-scroll ${visibleSections.has('features') ? 'visible' : ''}`} 
                   style={{ animationDelay: `${index * 0.15}s` }}>
                <Card className={`text-center p-8 hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border-2 ${feature.borderColor} hover:border-opacity-40 group relative overflow-hidden`}>
                  {/* Animated background */}
                  <div className={`absolute inset-0 ${feature.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  
                  <div className="relative z-10">
                    {/* Icon with pulse effect */}
                    <div className={`w-20 h-20 ${feature.bgColor} rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <span className={`${feature.color} filter drop-shadow-sm group-hover:animate-pulse`}>{feature.icon}</span>
                    </div>
                    
                    <h3 className={`text-lg font-bold text-charcoal mb-3 group-hover:${feature.color} transition-colors duration-300`}>
                      {t(feature.titleKey)}
                    </h3>
                    
                    <p className="text-body-md text-soft-gray leading-relaxed group-hover:text-charcoal transition-colors duration-300">
                      {t(feature.descriptionKey)}
                    </p>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-ludus-orange/10 via-warm-light to-ludus-orange/10 py-20 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-1/4 w-6 h-6 bg-ludus-orange/20 rounded-full float-animation" style={{ animationDelay: '0s' }}></div>
          <div className="absolute bottom-10 right-1/4 w-4 h-4 bg-blue-500/20 rounded-full float-animation" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-10 w-8 h-8 bg-green-500/20 rounded-full float-animation" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto container-padding text-center">
          <div className={`animate-on-scroll ${visibleSections.has('cta') ? 'visible' : ''}`} 
               data-section="cta" 
               ref={el => sectionRefs.current[3] = el}>
            <h2 className="text-display-md lg:text-5xl font-bold text-charcoal mb-6">
              {t('howItWorks.readyToStart')}
            </h2>
            
            <p className="text-body-lg md:text-xl text-soft-gray mb-10 max-w-2xl mx-auto leading-relaxed">
              {t('howItWorks.joinAdventurers')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link to="/activities" className="group">
                <Button variant="primary" size="lg" className="transform group-hover:scale-105 group-hover:shadow-xl transition-all duration-300 px-8 py-4">
                  <span className="flex items-center space-x-2">
                    <span>{t('howItWorks.browseActivities')}</span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </span>
                </Button>
              </Link>
              
              <Link to="/register" className="group">
                <Button variant="secondary" size="lg" className="transform group-hover:scale-105 group-hover:shadow-xl transition-all duration-300 px-8 py-4">
                  <span className="flex items-center space-x-2">
                    <span>⭐</span>
                    <span>{t('howItWorks.signUpNow')}</span>
                  </span>
                </Button>
              </Link>
            </div>
            
            {/* Trust indicators */}
            <div className="mt-12 pt-8 border-t border-warm/30">
              <p className="text-sm text-soft-gray mb-4">Trusted by 1000+ adventurers</p>
              <div className="flex justify-center items-center space-x-6 opacity-60">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-lg">⭐</span>
                  ))}
                </div>
                <span className="text-sm text-soft-gray">4.9/5 rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;