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
      {/* Language Switcher */}
      <div className="neo-language-switcher">
        <div className="neo-language-container">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-gray-700" />
            <span className="text-sm text-gray-700 font-medium">
              {i18n.language === 'ar' ? 'اللغة' : 'Language'}
            </span>
          </div>
          <button
            onClick={toggleLanguage}
            className="neo-language-button"
            type="button"
          >
            {getCurrentLanguageText()}
          </button>
        </div>
      </div>

      <div className="neo-content neo-layout">
        <Outlet />
      </div>

      <nav className="neo-nav">
        <div className="neo-nav-container">
          <div className="neo-nav-bar">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.url);
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.url}
                  className={`neo-nav-item ${isActive ? 'active' : ''}`}
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

