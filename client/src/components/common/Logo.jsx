import React from 'react';

const Logo = ({ className = "h-8 w-auto", showText = false, variant = "auto" }) => {
  return (
    <div className={`flex items-center ${showText ? 'space-x-2' : ''}`}>
      {/* Light theme logo (dark logo on light background) */}
      <img 
        src="/logos/ludus-logo-dark.png"
        alt="LUDUS" 
        className={`${className} block dark:hidden`}
      />
      {/* Dark theme logo (light logo on dark background) */}
      <img 
        src="/logos/ludus-logo-light.png"
        alt="LUDUS" 
        className={`${className} hidden dark:block`}
      />
      {showText && (
        <span className="text-xl font-bold text-gray-900 dark:text-white">
          LUDUS
        </span>
      )}
    </div>
  );
};

export default Logo;