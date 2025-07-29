import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher';
import ThemeToggle from '../ui/ThemeToggle';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-white dark:bg-dark-bg-secondary shadow-sm border-b border-warm dark:border-dark-border-secondary backdrop-blur-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto container-padding">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-ludus-orange dark:bg-dark-ludus-orange rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110 shadow-lg">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className="text-xl font-bold text-charcoal dark:text-dark-text-primary transition-colors duration-200">LUDUS</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/activities"
              className="text-charcoal dark:text-dark-text-secondary hover:text-ludus-orange dark:hover:text-dark-ludus-orange font-medium transition-colors duration-200"
            >
              {t('navigation.activities')}
            </Link>
            <Link
              to="/how-it-works"
              className="text-charcoal dark:text-dark-text-secondary hover:text-ludus-orange dark:hover:text-dark-ludus-orange font-medium transition-colors duration-200"
            >
              How It Works
            </Link>
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className="text-charcoal dark:text-dark-text-secondary hover:text-ludus-orange dark:hover:text-dark-ludus-orange font-medium transition-colors duration-200"
              >
                {t('dashboard.myBookings')}
              </Link>
            )}
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            <LanguageSwitcher />
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 text-charcoal dark:text-dark-text-primary hover:text-ludus-orange dark:hover:text-dark-ludus-orange transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-ludus-orange/10 dark:bg-dark-ludus-orange/10 rounded-full flex items-center justify-center">
                    <span className="text-ludus-orange dark:text-dark-ludus-orange font-medium text-sm">
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </span>
                  </div>
                  <span className="font-medium">{user?.firstName}</span>
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-bg-tertiary rounded-xl shadow-xl border border-warm dark:border-dark-border-secondary py-2 z-50 backdrop-blur-sm">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-charcoal dark:text-dark-text-primary hover:bg-warm-light dark:hover:bg-dark-bg-quaternary transition-colors duration-200 rounded-lg mx-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t('navigation.profile')}
                    </Link>
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-charcoal dark:text-dark-text-primary hover:bg-warm-light dark:hover:bg-dark-bg-quaternary transition-colors duration-200 rounded-lg mx-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t('dashboard.myBookings')}
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-charcoal dark:text-dark-text-primary hover:bg-warm-light dark:hover:bg-dark-bg-quaternary transition-colors duration-200 rounded-lg mx-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {t('navigation.admin')}
                      </Link>
                    )}
                    <hr className="my-2 border-warm dark:border-dark-border-secondary mx-2" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-charcoal dark:text-dark-text-primary hover:bg-warm-light dark:hover:bg-dark-bg-quaternary transition-colors duration-200 rounded-lg mx-2"
                    >
                      {t('common.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-charcoal dark:text-dark-text-secondary hover:text-ludus-orange dark:hover:text-dark-ludus-orange font-medium transition-colors duration-200"
                >
                  {t('common.login')}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-ludus-orange hover:bg-ludus-orange-dark dark:bg-dark-ludus-orange dark:hover:bg-dark-ludus-orange-dark text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
                >
                  {t('common.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg text-charcoal dark:text-dark-text-primary hover:text-ludus-orange dark:hover:text-dark-ludus-orange hover:bg-warm-light dark:hover:bg-dark-bg-tertiary transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-warm dark:border-dark-border-secondary py-4 bg-white/95 dark:bg-dark-bg-secondary/95 backdrop-blur-sm">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/activities"
                className="text-charcoal dark:text-dark-text-secondary hover:text-ludus-orange dark:hover:text-dark-ludus-orange font-medium transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('navigation.activities')}
              </Link>
              <Link
                to="/how-it-works"
                className="text-charcoal dark:text-dark-text-secondary hover:text-ludus-orange dark:hover:text-dark-ludus-orange font-medium transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-charcoal dark:text-dark-text-secondary hover:text-ludus-orange dark:hover:text-dark-ludus-orange font-medium transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('dashboard.myBookings')}
                  </Link>
                  <Link
                    to="/profile"
                    className="text-charcoal dark:text-dark-text-secondary hover:text-ludus-orange dark:hover:text-dark-ludus-orange font-medium transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('navigation.profile')}
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="text-charcoal dark:text-dark-text-secondary hover:text-ludus-orange dark:hover:text-dark-ludus-orange font-medium transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t('navigation.admin')}
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-left text-charcoal dark:text-dark-text-secondary hover:text-ludus-orange dark:hover:text-dark-ludus-orange font-medium transition-colors duration-200"
                  >
                    {t('common.logout')}
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-3 pt-4 border-t border-warm dark:border-dark-border-secondary">
                  <Link
                    to="/login"
                    className="text-charcoal dark:text-dark-text-secondary hover:text-ludus-orange dark:hover:text-dark-ludus-orange font-medium transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('common.login')}
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-ludus-orange hover:bg-ludus-orange-dark dark:bg-dark-ludus-orange dark:hover:bg-dark-ludus-orange-dark text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('common.register')}
                  </Link>
                </div>
              )}
              <div className="pt-4 border-t border-warm dark:border-dark-border-secondary flex items-center justify-between">
                <LanguageSwitcher />
                <ThemeToggle className="scale-90" />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;