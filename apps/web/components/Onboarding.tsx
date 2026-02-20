import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { useAuth } from '../src/context/AuthContext';
import { Compass, Calendar, Users, ArrowRight } from 'lucide-react';
import { Language } from '../types';
import { Logo } from './Logo';

interface OnboardingProps {
  lang: Language;
  onClose: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ lang, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const steps = [
    {
      icon: Compass,
      title: lang === 'ar' ? 'اكتشف' : 'Discover',
      desc: lang === 'ar' ? 'اعثر على أفضل الفعاليات والأماكن من حولك.' : 'Find the best events and hidden gems around you.',
      color: 'text-primary',
      bg: 'bg-primary/5'
    },
    {
      icon: Calendar,
      title: lang === 'ar' ? 'احجز' : 'Book',
      desc: lang === 'ar' ? 'حجز فوري وسلس لجميع تجاربك المفضلة.' : 'Instant and seamless booking for all your experiences.',
      color: 'text-blue-500',
      bg: 'bg-blue-500/5'
    },
    {
      icon: Users,
      title: lang === 'ar' ? 'تواصل' : 'Connect',
      desc: lang === 'ar' ? 'انضم إلى مجتمع نشط وشارك لحظاتك.' : 'Join an active community and share your moments.',
      color: 'text-purple-500',
      bg: 'bg-purple-500/5'
    }
  ];

  useEffect(() => {
    const tl = gsap.timeline();

    tl.fromTo(overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5 }
    )
      .fromTo(modalRef.current,
        { y: 50, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.2)' },
        "-=0.3"
      );

  }, []);

  const handleClose = () => {
    const tl = gsap.timeline({ onComplete: onClose });
    tl.to(modalRef.current, { y: 20, opacity: 0, scale: 0.95, duration: 0.3 })
      .to(overlayRef.current, { opacity: 0, duration: 0.3 }, "-=0.2");
  };

  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      onClose(); // Close onboarding on success
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div ref={overlayRef} className="absolute inset-0 bg-zinc-900/40 backdrop-blur-md" onClick={handleClose}></div>

      <div ref={modalRef} className="bg-white border border-zinc-100 w-full max-w-lg rounded-[2.5rem] p-10 relative shadow-2xl overflow-hidden">

        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Logo size="2xl" showText={false} />
            </div>
            <h2 className="text-3xl font-black text-zinc-900 mb-2">
              {lang === 'ar' ? 'مرحباً بك' : 'Welcome Back'}
            </h2>
            <p className="text-zinc-500 font-bold text-sm">
              {lang === 'ar' ? 'سجل دخولك للمتابعة' : 'Sign in to continue'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-500 text-sm p-3 rounded-xl font-bold text-center">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 ms-1 uppercase">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl px-4 py-3 outline-none font-bold text-zinc-900 transition-all"
                placeholder="user@example.com"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 ms-1 uppercase">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl px-4 py-3 outline-none font-bold text-zinc-900 transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-zinc-900 hover:bg-zinc-800 text-white font-black text-lg rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? '...' : (lang === 'ar' ? 'تسجيل الدخول' : 'Sign In')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={handleClose} className="text-sm font-bold text-zinc-400 hover:text-zinc-600">
              {lang === 'ar' ? 'تخطى الآن' : 'Skip for now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};