import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../common/Logo';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Vendors', href: '/admin/vendors', icon: '🏢' },
    { name: 'Activities', href: '/admin/activities', icon: '🎯' },
    { name: 'Bookings', href: '/admin/bookings', icon: '📅' },
    { name: 'Payments', href: '/admin/payments', icon: '💰' },
    { name: 'Categories', href: '/admin/categories', icon: '📂' },
    { name: 'Content', href: '/admin/content', icon: '📝' },
    { name: 'Translations', href: '/admin/translations', icon: '🌐' },
    { name: 'Settings', href: '/admin/settings', icon: '⚙️' },
  ];

  const isActivePath = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  // Redirect if not admin
  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">You don't have permission to access the admin panel.</p>
          <Link
            to="/"
            className="bg-ludus-orange text-white px-6 py-2 rounded-md hover:bg-ludus-orange-dark transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar Backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`admin-sidebar w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out ${
          sidebarOpen 
            ? 'translate-x-0 lg:translate-x-0' 
            : '-translate-x-full lg:-translate-x-full'
        } fixed inset-y-0 left-0 z-50 lg:static lg:inset-0`}>
          <div className="sidebar-container flex flex-col h-full">
            {/* Logo */}
            <div className="sidebar-header flex items-center justify-between h-16 px-4 border-b border-gray-200">
              <Link to="/admin" className="flex flex-col items-center">
                <Logo className="h-6 w-auto mb-1" />
                <span className="text-xs font-medium text-gray-500">Admin</span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="sidebar-close-btn lg:hidden p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                <svg className="close-icon w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav flex-1 px-4 py-6 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                  className={`nav-item flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                    isActivePath(item.href)
                      ? 'nav-item-active bg-ludus-orange/10 text-ludus-orange border-r-2 border-ludus-orange'
                      : 'nav-item-inactive text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span className="nav-icon mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* User Info & Logout */}
            <div className="sidebar-footer border-t border-gray-200 p-4">
              <div className="user-info flex items-center mb-4">
                <div className="user-avatar w-8 h-8 bg-ludus-orange rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user?.firstName?.charAt(0)}
                </div>
                <div className="user-details ml-3 flex-1">
                  <p className="user-name text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="user-role text-xs text-gray-500">Administrator</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="logout-btn w-full flex items-center px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <span className="logout-icon mr-3">🚪</span>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content flex-1 transition-all duration-200 ease-in-out">
          {/* Top Bar */}
          <header className="admin-header bg-white shadow-sm border-b border-gray-200">
            <div className="header-container px-6 py-4">
              <div className="header-content flex items-center justify-between">
                <div className="header-left flex items-center">
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="mobile-menu-toggle p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 lg:hidden"
                  >
                    <svg className="hamburger-icon w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="desktop-menu-toggle hidden lg:block p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 mr-4"
                  >
                    <svg className="sidebar-toggle-icon w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <h1 className="page-title text-2xl font-semibold text-gray-900">
                    {navigation.find(item => isActivePath(item.href))?.name || 'Admin Panel'}
                  </h1>
                </div>
                <div className="header-right flex items-center space-x-4">
                  <span className="current-date text-sm text-gray-500">
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="page-content p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;