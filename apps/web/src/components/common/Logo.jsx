import React from 'react';

const Logo = ({ className = "h-8 w-auto", showText = false }) => {
  const handleImageError = (e) => {
    console.warn('Logo image failed to load:', e.target.src);
    // Fallback to text if image fails to load
    e.target.style.display = 'none';
    const textSpan = e.target.nextElementSibling;
    if (textSpan) {
      textSpan.style.display = 'inline-block';
    }
  };

  // Always show text fallback if showText is true or if we want immediate visibility
  if (showText) {
    return (
      <div className={`flex items-center space-x-2`}>
        <span className="text-2xl font-bold text-ludus-orange dark:text-dark-ludus-orange" style={{ letterSpacing: '2px' }}>
          LUDUS
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center`}>
      {/* Light theme logo (dark logo on light background) */}
      <img 
        src="/logos/ludus-logo-dark.png"
        alt="LUDUS" 
        className={`${className} block dark:hidden`}
        onError={handleImageError}
        loading="eager"
        onLoad={() => console.log('Dark logo loaded successfully')}
      />
      <span 
        className={`${className.replace('h-8 w-auto', 'text-2xl')} font-bold text-ludus-orange dark:text-dark-ludus-orange hidden`}
        style={{ letterSpacing: '2px' }}
      >
        LUDUS
      </span>
      
      {/* Dark theme logo (light logo on dark background) */}
      <img 
        src="/logos/ludus-logo-light.png"
        alt="LUDUS" 
        className={`${className} hidden dark:block`}
        onError={handleImageError}
        loading="eager"
        onLoad={() => console.log('Light logo loaded successfully')}
      />
      <span 
        className={`${className.replace('h-8 w-auto', 'text-2xl')} font-bold text-ludus-orange dark:text-dark-ludus-orange hidden`}
        style={{ letterSpacing: '2px' }}
      >
        LUDUS
      </span>
    </div>
  );
};

export default Logo;