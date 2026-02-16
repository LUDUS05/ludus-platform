import React from 'react';

const Logo = ({ className = "h-8 w-auto", showText = false, variant = "auto" }) => {
  // For now, we'll use the light version by default
  // In the future, this could be enhanced to detect theme and switch automatically
  const logoSrc = variant === "dark" ? "/logos/ludus-logo-dark.png" : "/logos/ludus-logo-light.png";

  return (
    <div className={`flex items-center ${showText ? 'space-x-2' : ''}`}>
      <img 
        src={logoSrc}
        alt="LUDUS" 
        className={className}
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