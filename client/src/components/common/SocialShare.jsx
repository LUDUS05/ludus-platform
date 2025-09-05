import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FaFacebook, 
  FaTwitter, 
  FaWhatsapp, 
  FaLinkedin, 
  FaTelegram,
  FaShare,
  FaLink
} from 'react-icons/fa';

const SocialShare = ({ 
  url, 
  title, 
  description, 
  image, 
  hashtags = ['LUDUS', 'Activities', 'SaudiArabia'],
  className = ''
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showCopyMessage, setShowCopyMessage] = useState(false);

  // Encode URL components for sharing
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const encodedImage = encodeURIComponent(image || '');
  const hashtagString = hashtags.join(',');

  // Social media sharing URLs
  const socialPlatforms = [
    {
      name: 'Facebook',
      icon: FaFacebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}%20-%20${encodedDescription}`,
      color: 'hover:text-blue-600'
    },
    {
      name: 'Twitter',
      icon: FaTwitter,
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&hashtags=${hashtagString}`,
      color: 'hover:text-blue-400'
    },
    {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      color: 'hover:text-green-600'
    },
    {
      name: 'LinkedIn',
      icon: FaLinkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: 'hover:text-blue-700'
    },
    {
      name: 'Telegram',
      icon: FaTelegram,
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      color: 'hover:text-blue-500'
    }
  ];

  const handleShare = (platform) => {
    // Open sharing window
    const shareWindow = window.open(
      platform.url,
      'share',
      'width=600,height=400,scrollbars=yes,resizable=yes'
    );
    
    // Close dropdown after sharing
    setIsOpen(false);
    
    // Analytics tracking (could be enhanced)
    if (window.gtag) {
      window.gtag('event', 'share', {
        method: platform.name.toLowerCase(),
        content_type: 'activity',
        content_id: url
      });
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setShowCopyMessage(true);
      setTimeout(() => setShowCopyMessage(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setShowCopyMessage(true);
      setTimeout(() => setShowCopyMessage(false), 2000);
    }
    setIsOpen(false);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url
        });
        setIsOpen(false);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-ludus-orange transition-colors rounded-lg hover:bg-gray-50"
        aria-label={t('common.share')}
      >
        <FaShare className="w-5 h-5" />
        <span className="text-sm font-medium">{t('common.share')}</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          ></div>
          
          {/* Dropdown Content */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-4">
              <h3 className="font-medium text-gray-900 mb-3">{t('social.shareActivity')}</h3>
              
              {/* Native Share (mobile) */}
              {navigator.share && (
                <button
                  onClick={handleNativeShare}
                  className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 text-left mb-2"
                >
                  <div className="w-8 h-8 bg-ludus-orange rounded-full flex items-center justify-center">
                    <FaShare className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">{t('social.shareVia')}</span>
                </button>
              )}

              {/* Social Platforms */}
              <div className="space-y-1">
                {socialPlatforms.map((platform) => {
                  const IconComponent = platform.icon;
                  return (
                    <button
                      key={platform.name}
                      onClick={() => handleShare(platform)}
                      className={`w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 text-left transition-colors ${platform.color}`}
                    >
                      <div className="w-8 h-8 flex items-center justify-center">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium">{platform.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Copy Link */}
              <div className="border-t border-gray-200 mt-3 pt-3">
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 text-left"
                >
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FaLink className="w-5 h-5 text-gray-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {showCopyMessage ? t('social.linkCopied') : t('social.copyLink')}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};


export default SocialShare;