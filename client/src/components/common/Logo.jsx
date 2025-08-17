import React from 'react';

const Logo = ({ className = "h-8 w-auto", showText = false, variant = "auto" }) => {
  const handleImageError = (e) => {
    // Fallback to text if image fails to load
    e.target.style.display = 'none';
    const textSpan = e.target.nextElementSibling;
    if (textSpan) {
      textSpan.style.display = 'inline-block';
    }
  };

  return (
    <div className={`flex items-center ${showText ? 'space-x-2' : ''}`}>
      {/* Light theme logo (dark logo on light background) */}
      <img 
        src="/logos/ludus-logo-dark.png"
        alt="LUDUS" 
        className={`${className} block dark:hidden`}
        onError={handleImageError}
        loading="eager"
      />
      <span 
        className={`${className.replace('h-8 w-auto', 'text-2xl')} font-bold text-gray-900 dark:text-white hidden`}
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
      />
      <span 
        className={`${className.replace('h-8 w-auto', 'text-2xl')} font-bold text-white hidden`}
        style={{ letterSpacing: '2px' }}
      >
        LUDUS
      </span>
      
      {showText && (
        <span className="text-xl font-bold text-gray-900 dark:text-white">
          LUDUS
        </span>
      )}
    </div>
  );
};

export default Logo;