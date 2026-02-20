import React, { useEffect, useRef } from 'react';
import { Logo } from './Logo';
import { Language } from '../types';
import { NAV_ITEMS, TRANSLATIONS } from '../constants';
import { Bell, User, Globe, Menu, X, Search, ShieldCheck } from 'lucide-react';
import { gsap } from 'gsap';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  lang: Language;
  setLang: (l: Language) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, lang, setLang }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const t = TRANSLATIONS[lang];

  // Handle RTL Direction
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // GSAP Sidebar Animation
  // GSAP Sidebar Animation (Mobile Only)
  useEffect(() => {
    let ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(max-width: 767px)", () => {
        if (sidebarOpen) {
          gsap.to(sidebarRef.current, { x: 0, duration: 0.4, ease: 'power3.out' });
        } else {
          const xOffset = lang === 'ar' ? '100%' : '-100%';
          gsap.to(sidebarRef.current, { x: xOffset, duration: 0.3, ease: 'power3.in' });
        }
      });

      // Reset transform on desktop to allow Tailwind to take over
      mm.add("(min-width: 768px)", () => {
        gsap.set(sidebarRef.current, { clearProps: "x" });
      });
    }, sidebarRef);

    return () => ctx.revert();
  }, [sidebarOpen, lang]);

  return (
    <div className={`min-h-screen bg-surface-base text-zinc-900 font-sans flex overflow-hidden ${lang === 'ar' ? 'font-sans' : 'font-english'}`}>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        ref={sidebarRef}
        className={`fixed md:relative top-0 bottom-0 start-0 w-72 bg-white/60 backdrop-blur-3xl border-e border-white/50 z-50 transform md:transform-none ${lang === 'ar' ? 'translate-x-full' : '-translate-x-full'} md:translate-x-0 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)]`}
      >
        <div className="p-8 flex items-center justify-between md:justify-start gap-4">
          <Logo size="lg" />
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-zinc-400 hover:text-zinc-900 ms-auto">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group
                  ${isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
                  }`}
              >
                <item.icon size={22} className={isActive ? 'drop-shadow-[0_0_8px_rgba(235,86,36,0.5)]' : 'group-hover:scale-110 transition-transform'} />
                <span className="font-bold text-base">{item.label[lang]}</span>
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-primary ms-auto shadow-[0_0_10px_#eb5624]"></span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/40 bg-zinc-50/30">
          <div className="bg-white/80 p-5 rounded-3xl border border-white/60 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity text-primary">
              <ShieldCheck size={80} />
            </div>
            {/* Loyalty Program */}
            <h3 className="font-bold text-sm text-zinc-800 mb-1 flex items-center gap-2">
              {lang === 'ar' ? 'المستوى الذهبي' : 'Gold Status'}
            </h3>
            <p className="text-xs text-zinc-500 mb-4">{lang === 'ar' ? 'لديك 3 حجوزات قادمة' : 'You have 3 upcoming bookings'}</p>
            <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full w-[70%] rounded-full shadow-[0_0_10px_rgba(235,86,36,0.5)]"></div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative h-screen overflow-y-auto overflow-x-hidden scroll-smooth bg-zinc-50/50">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/50 backdrop-blur-3xl border-b border-white/60 px-6 py-4 flex items-center justify-between shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 text-zinc-500 hover:bg-zinc-100 rounded-xl">
              <Menu size={24} />
            </button>

            <div className="hidden md:flex items-center gap-3 px-5 py-3 bg-white/80 border border-zinc-200 rounded-2xl focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all w-96">
              <Search size={18} className="text-zinc-400" />
              <input
                type="text"
                placeholder={t.search_placeholder}
                className="bg-transparent border-none outline-none text-sm text-zinc-900 w-full placeholder-zinc-400 font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-zinc-100 text-zinc-500 hover:text-primary transition-colors text-xs font-bold border border-transparent hover:border-zinc-200"
            >
              <Globe size={16} />
              <span>{lang === 'ar' ? 'EN' : 'AR'}</span>
            </button>

            <button className="relative p-2 text-zinc-500 hover:text-zinc-900 transition-colors">
              <Bell size={24} />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white"></span>
            </button>

            <Link to="/profile" className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-orange-600 p-[2px] shadow-md block transition-transform hover:scale-105">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                <User size={22} className="text-zinc-600" />
              </div>
            </Link>
          </div>
        </header >

        <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main >

    </div >
  );
};