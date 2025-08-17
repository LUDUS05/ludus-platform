import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import FacebookLogin from 'react-facebook-login';
import { useAuth } from '../../context/AuthContext';

const SocialLogin = ({ onSuccess, onError }) => {
  const { t } = useTranslation();
  const { loginWithSocial } = useAuth();

  // Load Google Identity Services script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        });
      }
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleGoogleResponse = async (response) => {
    try {
      const result = await loginWithSocial('google', response.credential);
      onSuccess?.(result);
    } catch (error) {
      console.error('Google login error:', error);
      onError?.(error);
    }
  };

  const handleFacebookResponse = async (response) => {
    if (response.accessToken) {
      try {
        const result = await loginWithSocial('facebook', response.accessToken);
        onSuccess?.(result);
      } catch (error) {
        console.error('Facebook login error:', error);
        onError?.(error);
      }
    } else {
      console.log('Facebook login cancelled');
    }
  };

  const handleGoogleClick = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    }
  };

  const handleAppleLogin = () => {
    // Apple Sign In integration would go here
    // For now, show a placeholder
    alert('Apple Sign In coming soon!');
  };

  return (
    <div className="social-login-container">
      <style>
        {`
          .social-login-container {
            margin-top: 24px;
          }
          
          .social-divider {
            position: relative;
            margin: 24px 0;
          }
          
          .social-divider::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 1px;
            background: #E5E5E5;
          }
          
          .social-divider-text {
            background: white;
            color: #666;
            font-size: 14px;
            padding: 0 16px;
            position: relative;
            display: inline-block;
            margin: 0 auto;
            width: fit-content;
          }
          
          .social-buttons {
            display: flex;
            justify-content: center;
            gap: 16px;
            margin-bottom: 16px;
          }
          
          .social-button {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 56px;
            height: 56px;
            border-radius: 50%;
            border: 2px solid #E5E5E5;
            background: white;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
          }
          
          .social-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
          }
          
          .social-button:active {
            transform: translateY(0);
          }
          
          .social-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
          }
          
          .social-button.google {
            border-color: #4285F4;
          }
          
          .social-button.google:hover {
            border-color: #3367D6;
            background: #4285F4;
          }
          
          .social-button.google:hover .social-icon {
            filter: brightness(0) invert(1);
          }
          
          .social-button.facebook {
            border-color: #1877F2;
          }
          
          .social-button.facebook:hover {
            border-color: #166FE5;
            background: #1877F2;
          }
          
          .social-button.facebook:hover .social-icon {
            filter: brightness(0) invert(1);
          }
          
          .social-button.apple {
            border-color: #000000;
          }
          
          .social-button.apple:hover {
            border-color: #000000;
            background: #000000;
          }
          
          .social-button.apple:hover .social-icon {
            filter: brightness(0) invert(1);
          }
          
          .social-icon {
            width: 24px;
            height: 24px;
            transition: filter 0.3s ease;
          }
          
          .social-hint {
            text-align: center;
            font-size: 13px;
            color: #666;
            margin-top: 12px;
            line-height: 1.4;
          }
          
          @media (max-width: 480px) {
            .social-buttons {
              gap: 12px;
            }
            
            .social-button {
              width: 48px;
              height: 48px;
            }
            
            .social-icon {
              width: 20px;
              height: 20px;
            }
          }
        `}
      </style>
      
      <div className="social-divider">
        <div className="social-divider-text">
          {t('auth.continueWith', 'Or continue with')}
        </div>
      </div>

      <div className="social-buttons">
        {/* Google Login */}
        <button
          onClick={handleGoogleClick}
          className="social-button google"
          title={t('auth.continueWithGoogle', 'Continue with Google')}
        >
          <svg className="social-icon" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        </button>

        {/* Facebook Login */}
        <FacebookLogin
          appId={process.env.REACT_APP_FACEBOOK_APP_ID}
          callback={handleFacebookResponse}
          render={(renderProps) => (
            <button
              onClick={renderProps.onClick}
              disabled={renderProps.disabled}
              className="social-button facebook"
              title={t('auth.continueWithFacebook', 'Continue with Facebook')}
            >
              <svg className="social-icon" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </button>
          )}
        />

        {/* Apple Login */}
        <button
          onClick={handleAppleLogin}
          className="social-button apple"
          title={t('auth.continueWithApple', 'Continue with Apple')}
        >
          <svg className="social-icon" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
          </svg>
        </button>
      </div>
      
      <div className="social-hint">
        {t('auth.socialHint', 'Quick and secure sign-in with your social accounts')}
      </div>
    </div>
  );
};

export default SocialLogin;