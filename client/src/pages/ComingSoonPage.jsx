import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ComingSoonPage = () => {
  const { t } = useTranslation();

  return (
    <div className="coming-soon-container">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700&display=swap');
          
          .coming-soon-container {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            position: relative;
            overflow: hidden;
          }
          
          .coming-soon-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at 30% 20%, rgba(255, 102, 0, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 70% 80%, rgba(255, 102, 0, 0.08) 0%, transparent 50%);
            pointer-events: none;
          }
          
          .content-wrapper {
            text-align: center;
            max-width: 800px;
            width: 100%;
            position: relative;
            z-index: 1;
          }
          
          .ludus-logo {
            width: 150px;
            height: 50px;
            margin: 0 auto 40px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .ludus-logo img {
            height: 100%;
            width: auto;
            object-fit: contain;
          }
          
          .coming-soon-badge {
            display: inline-block;
            background: rgba(255, 102, 0, 0.1);
            color: #FF6600;
            padding: 8px 20px;
            border-radius: 50px;
            font-size: 14px;
            font-weight: 500;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            margin-bottom: 30px;
            border: 2px solid rgba(255, 102, 0, 0.2);
          }
          
          .main-title {
            font-size: 56px;
            font-weight: 700;
            color: #2B2B2B;
            margin-bottom: 20px;
            font-family: 'Manrope', sans-serif;
            line-height: 1.1;
            letter-spacing: -0.02em;
          }
          
          .subtitle {
            font-size: 22px;
            color: #666;
            margin-bottom: 50px;
            line-height: 1.4;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
          }
          
          .registration-options {
            display: flex;
            justify-content: center;
            gap: 40px;
            margin-bottom: 60px;
            flex-wrap: wrap;
          }
          
          .registration-card {
            background: white;
            border-radius: 20px;
            padding: 40px 30px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
            transition: all 0.3s ease;
            text-decoration: none;
            color: inherit;
            min-width: 280px;
            max-width: 320px;
            border: 2px solid transparent;
            position: relative;
            overflow: hidden;
          }
          
          .registration-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #FF6600, #E55A00);
            transform: scaleX(0);
            transition: transform 0.3s ease;
          }
          
          .registration-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
            border-color: #FF6600;
          }
          
          .registration-card:hover::before {
            transform: scaleX(1);
          }
          
          .card-icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #FF6600, #E55A00);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
            font-size: 36px;
            color: white;
            box-shadow: 0 8px 20px rgba(255, 102, 0, 0.3);
          }
          
          .card-title {
            font-size: 24px;
            font-weight: 600;
            color: #2B2B2B;
            margin-bottom: 12px;
            font-family: 'Manrope', sans-serif;
          }
          
          .card-description {
            font-size: 16px;
            color: #666;
            line-height: 1.5;
            margin-bottom: 24px;
          }
          
          .card-cta {
            background: #FF6600;
            color: white;
            border: none;
            border-radius: 12px;
            padding: 12px 24px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            width: 100%;
            font-family: inherit;
          }
          
          .card-cta:hover {
            background: #E55A00;
            transform: translateY(-2px);
          }
          
          .social-section {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
            margin-bottom: 40px;
            max-width: 500px;
            margin-left: auto;
            margin-right: auto;
          }
          
          .social-title {
            font-size: 20px;
            font-weight: 600;
            color: #2B2B2B;
            margin-bottom: 20px;
            font-family: 'Manrope', sans-serif;
          }
          
          .social-links {
            display: flex;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
          }
          
          .social-link {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 20px;
            background: #F8F9FA;
            border-radius: 12px;
            text-decoration: none;
            color: #666;
            font-size: 15px;
            font-weight: 500;
            transition: all 0.3s ease;
            border: 2px solid transparent;
          }
          
          .social-link:hover {
            background: #FF6600;
            color: white;
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(255, 102, 0, 0.3);
          }
          
          .social-icon {
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .footer-text {
            color: #999;
            font-size: 14px;
            line-height: 1.6;
          }
          
          .footer-text a {
            color: #FF6600;
            text-decoration: none;
            font-weight: 500;
          }
          
          .footer-text a:hover {
            text-decoration: underline;
          }
          
          @media (max-width: 768px) {
            .main-title {
              font-size: 42px;
            }
            
            .subtitle {
              font-size: 18px;
            }
            
            .registration-options {
              gap: 30px;
            }
            
            .registration-card {
              min-width: 260px;
              padding: 30px 25px;
            }
            
            .social-section {
              padding: 30px 25px;
            }
          }
          
          @media (max-width: 480px) {
            .coming-soon-container {
              padding: 15px;
            }
            
            .main-title {
              font-size: 32px;
            }
            
            .subtitle {
              font-size: 16px;
            }
            
            .registration-options {
              flex-direction: column;
              align-items: center;
              gap: 20px;
            }
            
            .registration-card {
              width: 100%;
              max-width: 320px;
            }
            
            .social-links {
              flex-direction: column;
              gap: 15px;
            }
            
            .social-link {
              justify-content: center;
              width: 100%;
            }
          }
        `}
      </style>
      
      <div className="content-wrapper">
        {/* Logo */}
        <div className="ludus-logo">
          <img src="/logos/ludus-logo-dark.png" alt="LUDUS" />
        </div>
        
        {/* Coming Soon Badge */}
        <div className="coming-soon-badge">
          {t('comingSoon.badge', 'Coming Soon')}
        </div>
        
        {/* Main Content */}
        <h1 className="main-title">
          {t('comingSoon.title', 'LUDUS is Coming Soon')}
        </h1>
        
        <p className="subtitle">
          {t('comingSoon.subtitle', 'We\'re building something amazing. Get ready to discover incredible activities and experiences in your city!')}
        </p>
        
        {/* Registration Options */}
        <div className="registration-options">
          <Link to="/register" className="registration-card">
            <div className="card-icon">👤</div>
            <h3 className="card-title">{t('comingSoon.userRegistration.title', 'Join as User')}</h3>
            <p className="card-description">
              {t('comingSoon.userRegistration.description', 'Be the first to discover amazing activities and experiences when we launch.')}
            </p>
            <button className="card-cta">
              {t('comingSoon.userRegistration.cta', 'Sign Up Now')}
            </button>
          </Link>
          
          <Link to="/partner-registration" className="registration-card">
            <div className="card-icon">🏢</div>
            <h3 className="card-title">{t('comingSoon.partnerRegistration.title', 'Join as Partner')}</h3>
            <p className="card-description">
              {t('comingSoon.partnerRegistration.description', 'List your business and connect with customers looking for great experiences.')}
            </p>
            <button className="card-cta">
              {t('comingSoon.partnerRegistration.cta', 'Become a Partner')}
            </button>
          </Link>
        </div>
        
        {/* Social Media Section */}
        <div className="social-section">
          <h3 className="social-title">{t('comingSoon.followUs', 'Follow us for updates')}</h3>
          <div className="social-links">
            <a href="#" className="social-link">
              <span className="social-icon">📧</span>
              Newsletter
            </a>
            <a href="#" className="social-link">
              <span className="social-icon">📱</span>
              Instagram
            </a>
            <a href="#" className="social-link">
              <span className="social-icon">💬</span>
              Twitter
            </a>
          </div>
        </div>
        
        {/* Footer */}
        <div className="footer-text">
          {t('comingSoon.footer', 'Questions? Contact us at')}{' '}
          <a href="mailto:hi@letsludus.com">hi@letsludus.com</a>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonPage;