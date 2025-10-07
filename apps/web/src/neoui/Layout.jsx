import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, Search, User, Calendar, Globe, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './neumorphic.css';

const navItems = [
  { id: 'home', title: 'اكتشف', url: '/neo/home', icon: Home },
  { id: 'search', title: 'بحث', url: '/neo/search', icon: Search },
  { id: 'dashboard', title: 'لوحة التحكم', url: '/neo/dashboard', icon: Calendar },
  { id: 'wallet', title: 'المحفظة', url: '/neo/wallet', icon: Wallet },
  { id: 'profile', title: 'الملف الشخصي', url: '/neo/profile', icon: User },
];

export default function Layout() {
  const location = useLocation();
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  const getCurrentLanguageText = () => {
    return i18n.language === 'ar' ? 'English' : 'العربية';
  };

  return (
    <div className="neo-container" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'} lang={i18n.language}>
      {/* Main Content */}
      <div className="neo-content neo-layout">
        <Outlet />
      </div>

      {/* Compact Vertical Navigation Bar - Positioned next to content */}
      <nav className="neo-nav-vertical">
        <div className="neo-nav-vertical-container">
          {/* Language Switcher - Top */}
          <div className="neo-language-section">
            <div className="neo-language-item">
              <Globe className="w-4 h-4 text-gray-600" />
              <button
                onClick={toggleLanguage}
                className="neo-language-button-compact"
                type="button"
              >
                {getCurrentLanguageText()}
              </button>
            </div>
          </div>

          {/* Navigation Items - Vertical */}
          <div className="neo-nav-items-vertical">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.url);
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.url}
                  className={`neo-nav-item-vertical ${isActive ? 'active' : ''}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{item.title}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}

