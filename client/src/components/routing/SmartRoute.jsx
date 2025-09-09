import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ComingSoonPage from '../../pages/ComingSoonPage';
import NewOnboarding from '../../pages/NewOnboarding';

const SmartRoute = ({ children, path }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  // Debug logging
  console.log('SmartRoute Debug:', {
    path,
    isAuthenticated,
    user: user ? { id: user.id, role: user.role } : null,
    isLoading,
    currentURL: window.location.href,
    currentPath: window.location.pathname
  });
  
  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft-white dark:dark-bg-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-ludus-orange dark:border-dark-ludus-orange border-t-transparent"></div>
      </div>
    );
  }

  // Check if user is admin
  const isAdmin = user && (user.role === 'admin' || user.email === 'admin@ludusapp.com');

  // Handle admin routes specifically
  if (path && path.startsWith('/admin')) {
    console.log('🔐 Admin route access check:', {
      path,
      isAuthenticated,
      user: user ? { id: user.id, role: user.role, adminRole: user.adminRole } : null,
      isAdmin
    });
    
    if (!isAuthenticated) {
      console.log('❌ Not authenticated, redirecting to /hi');
      return <Navigate to="/hi" replace />;
    }
    if (!isAdmin) {
      console.log('❌ Not admin user, showing Coming Soon page');
      return <ComingSoonPage />;
    }
    console.log('✅ Admin access granted');
    return children;
  }

  // Handle /login (dedicated login page)
  if (path === '/login') {
    // Always allow access to login page, even in coming soon mode
    return children;
  }

  // Handle /hi (new onboarding page)
  if (path === '/hi') {
    // If user is authenticated and has completed onboarding, redirect to dashboard
    if (isAuthenticated && user && user.onboarding_completed) {
      return <Navigate to="/dashboard" replace />;
    }
    // Otherwise, show onboarding (for both authenticated and non-authenticated users)
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
