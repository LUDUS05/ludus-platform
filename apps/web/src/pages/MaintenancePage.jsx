import React from 'react';
import { useTranslation } from 'react-i18next';

const MaintenancePage = () => {
  const { t } = useTranslation();

  return (
    <div className="maintenance-container">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700&display=swap');
          
          .maintenance-container {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #2B2B2B 0%, #1A1A1A 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            position: relative;
            overflow: hidden;
            color: white;
          }
          
          .maintenance-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at 30% 20%, rgba(255, 102, 0, 0.15) 0%, transparent 50%),
                        radial-gradient(circle at 70% 80%, rgba(255, 102, 0, 0.1) 0%, transparent 50%);
            pointer-events: none;
          }
          
          .content-wrapper {
            text-align: center;
            max-width: 600px;
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
            filter: brightness(0) invert(1);
          }
          
          .maintenance-icon {
            width: 120px;
            height: 120px;
            background: rgba(255, 102, 0, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 40px;
            font-size: 48px;
            animation: pulse 2s ease-in-out infinite;
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.05); opacity: 1; }
          }
          
          .maintenance-badge {
            display: inline-block;
            background: rgba(255, 102, 0, 0.2);
            color: #FF6600;
            padding: 8px 20px;
            border-radius: 50px;
            font-size: 14px;
            font-weight: 500;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            margin-bottom: 30px;
            border: 2px solid rgba(255, 102, 0, 0.3);
          }
          
          .main-title {
            font-size: 48px;
            font-weight: 700;
            color: white;
            margin-bottom: 20px;
            font-family: 'Manrope', sans-serif;
            line-height: 1.1;
            letter-spacing: -0.02em;
          }
          
          .subtitle {
            font-size: 20px;
            color: #CCCCCC;
            margin-bottom: 40px;
            line-height: 1.4;
          }
          
          .info-card {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 20px;
            padding: 40px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            margin-bottom: 40px;
          }
          
          .info-title {
            font-size: 18px;
            font-weight: 600;
            color: white;
            margin-bottom: 16px;
            font-family: 'Manrope', sans-serif;
          }
          
          .info-text {
            font-size: 16px;
            color: #CCCCCC;
            line-height: 1.6;
            margin-bottom: 24px;
          }
          
          .status-indicator {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            font-size: 15px;
            color: #CCCCCC;
          }
          
          .status-dot {
            width: 8px;
            height: 8px;
            background: #FF6600;
            border-radius: 50%;
            animation: blink 1.5s ease-in-out infinite;
          }
          
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
          
          .contact-info {
            background: rgba(255, 255, 255, 0.03);
            border-radius: 16px;
            padding: 24px;
            border: 1px solid rgba(255, 255, 255, 0.08);
          }
          
          .contact-title {
            font-size: 16px;
            font-weight: 600;
            color: white;
            margin-bottom: 12px;
          }
          
          .contact-text {
            font-size: 14px;
            color: #CCCCCC;
            line-height: 1.5;
          }
          
          .contact-text a {
            color: #FF6600;
            text-decoration: none;
            font-weight: 500;
          }
          
          .contact-text a:hover {
            text-decoration: underline;
          }
          
          @media (max-width: 768px) {
            .main-title {
              font-size: 36px;
            }
            
            .subtitle {
              font-size: 18px;
            }
            
            .info-card {
              padding: 30px 25px;
            }
            
            .maintenance-icon {
              width: 100px;
              height: 100px;
              font-size: 40px;
            }
          }
          
          @media (max-width: 480px) {
            .maintenance-container {
              padding: 15px;
            }
            
            .main-title {
              font-size: 28px;
            }
            
            .subtitle {
              font-size: 16px;
            }
            
            .info-card {
              padding: 25px 20px;
            }
          }
        `}
      </style>
      
      <div className="content-wrapper">
        {/* Logo */}
        <div className="ludus-logo">
          <img src="/logos/ludus-logo-light.png" alt="LUDUS" />
        </div>
        
        {/* Maintenance Icon */}
        <div className="maintenance-icon">
          🔧
        </div>
        
        {/* Maintenance Badge */}
        <div className="maintenance-badge">
          {t('maintenance.badge', 'Under Maintenance')}
        </div>
        
        {/* Main Content */}
        <h1 className="main-title">
          {t('maintenance.title', 'We\'ll be back soon!')}
        </h1>
        
        <p className="subtitle">
          {t('maintenance.subtitle', 'We\'re currently updating our platform to serve you better.')}
        </p>
        
        {/* Info Card */}
        <div className="info-card">
          <h3 className="info-title">{t('maintenance.info.title', 'What\'s happening?')}</h3>
          <p className="info-text">
            {t('maintenance.info.description', 'Our team is working hard to improve your experience. We\'re implementing new features and ensuring everything runs smoothly for your return.')}
          </p>
          
          <div className="status-indicator">
            <div className="status-dot"></div>
            <span>{t('maintenance.status', 'Maintenance in progress')}</span>
          </div>
        </div>
        
        {/* Contact Info */}
        <div className="contact-info">
          <h4 className="contact-title">{t('maintenance.contact.title', 'Need immediate assistance?')}</h4>
          <p className="contact-text">
            {t('maintenance.contact.description', 'Reach out to us at')}{' '}
            <a href="mailto:hi@letsludus.com">hi@letsludus.com</a>
            {t('maintenance.contact.suffix', ' and we\'ll get back to you as soon as possible.')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;