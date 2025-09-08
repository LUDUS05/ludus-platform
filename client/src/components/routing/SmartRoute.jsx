import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ComingSoonPage from '../../pages/ComingSoonPage';
import NewOnboarding from '../../pages/NewOnboarding';

const SmartRoute = ({ children, path }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft-white dark:dark-bg-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-ludus-orange dark:border-dark-ludus-orange border-t-transparent"></div>
      </div>
    );
  }

  // Check if user is admin
  const isAdmin = user && user.role === 'admin';

  // Always allow access to /hi (new onboarding page)
  if (path === '/hi') {
    return <NewOnboarding />;
  }

  // For /profile: redirect to /hi for non-logged-in users, allow access for logged-in users
  if (path === '/profile') {
    if (!isAuthenticated) {
      return <Navigate to="/hi" replace />;
    }
    return children;
  }

  // For /share: redirect to /hi for non-logged-in users, allow access for logged-in users
  if (path === '/share') {
    if (!isAuthenticated) {
      return <Navigate to="/hi" replace />;
    }
    return children;
  }

  // For root path "/": redirect to /hi for non-logged-in users
  if (path === '/') {
    if (!isAuthenticated) {
      return <Navigate to="/hi" replace />;
    }
    return children;
  }

  // For all other pages:
  // - Non-admins: show Coming Soon page
  // - Admins: allow access to all pages
  if (!isAdmin) {
    return <ComingSoonPage />;
  }

  // For admins: allow access to all pages
  return children;
};

export default SmartRoute;
