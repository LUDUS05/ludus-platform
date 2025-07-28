import React from 'react';
import { cn } from '../../utils/cn';

const Card = ({ 
  children, 
  className, 
  hover = false, 
  padding = 'md',
  ...props 
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-lg overflow-hidden',
        hover && 'hover:shadow-xl transition-shadow duration-300',
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className, ...props }) => (
  <div
    className={cn('px-6 py-4 border-b border-warm', className)}
    {...props}
  >
    {children}
  </div>
);

const CardBody = ({ children, className, ...props }) => (
  <div
    className={cn('p-6', className)}
    {...props}
  >
    {children}
  </div>
);

const CardFooter = ({ children, className, ...props }) => (
  <div
    className={cn('px-6 py-4 border-t border-warm bg-soft-white', className)}
    {...props}
  >
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;