import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, Search, User, Calendar } from 'lucide-react';

const navItems = [
  { id: 'home', title: 'اكتشف', url: '/neo/home', icon: Home },
  { id: 'search', title: 'بحث', url: '/neo/search', icon: Search },
  { id: 'dashboard', title: 'لوحة التحكم', url: '/neo/dashboard', icon: Calendar },
  { id: 'profile', title: 'الملف الشخصي', url: '/neo/profile', icon: User },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#e0e0e0]" style={{ backgroundColor: '#e0e0e0' }} dir="rtl" lang="ar">
      <style>
        {`
          .neumorphic {
            box-shadow: 8px 8px 16px #bebebe, -8px -8px 16px #ffffff;
            background-color: #e0e0e0;
          }
          .neumorphic-pressed {
            box-shadow: inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff;
          }
          .neumorphic-subtle {
            box-shadow: 4px 4px 8px #bebebe, -4px -4px 8px #ffffff;
            background-color: #e0e0e0;
          }
          .text-neumorphic {
            color: #2d3748;
            text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
          }
        `}
      </style>

      <div className="max-w-md mx-auto pb-24 px-4 pt-6">
        <Outlet />
      </div>

      <nav className="fixed bottom-4 left-0 right-0">
        <div className="max-w-md mx-auto">
          <div className="neumorphic rounded-2xl p-3 flex items-center justify-around">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.url);
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.url}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                    isActive ? 'neumorphic-pressed' : 'hover:neumorphic-subtle'
                  }`}
                >
                  <Icon className="w-5 h-5 text-gray-700" />
                  <span className="text-xs text-gray-700">{item.title}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}

