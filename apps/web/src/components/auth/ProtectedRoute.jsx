import React from 'react';
import { useAuth } from '../../context/AuthContext';

// ProtectedRoute component - redirects removed
// Now simply renders children without redirect logic
const ProtectedRoute = ({ children }) => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft-white dark:dark-bg-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-ludus-orange dark:border-dark-ludus-orange border-t-transparent"></div>
      </div>
    );
  }

  // No redirects - just render children
  return children;
};

export default ProtectedRoute;
