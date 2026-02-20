import React, { useEffect, useRef, useState } from 'react';
import { Language, Activity } from '../types';
import { MOCK_ACTIVITIES, TRANSLATIONS } from '../constants';
import { MapPin, Star, Users, ArrowRight, Heart, Filter, Calendar, X, CheckCircle, CreditCard, Flame, Share2, Check } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register plugin safely (check if window exists)
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface FeedProps {
  lang: Language;
}

export const ActivityFeed: React.FC<FeedProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const gridRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState('all');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [bookingStep, setBookingStep] = useState<'details' | 'processing' | 'success'>('details');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredActivities = filter === 'all'
    ? MOCK_ACTIVITIES
    : MOCK_ACTIVITIES.filter(act => act.category === filter);

  useEffect(() => {
    // Staggered Fade In
    if (gridRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo('.activity-card',
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: gridRef.current,
              start: 'top 80%',
            }
          }
        );
      }, gridRef);
      return () => ctx.revert();
    }
  }, [filter]);

  const handleBookNow = (activity: Activity) => {
    setSelectedActivity(activity);
    setSelectedDate(new Date(activity.availability.nextSlot));
    setBookingStep('details');
  };

  const handleConfirmBooking = () => {
    setBookingStep('processing');
    // Simulate API call
    setTimeout(() => {
      setBookingStep('success');
    }, 1500);
  };

  const closeBooking = () => {
    setSelectedActivity(null);
    setBookingStep('details');
    setSelectedDate(null);
  };

  const handleShare = async (e: React.MouseEvent, activity: Activity) => {
    e.stopPropagation();
    const shareData = {
      title: activity.title[lang],
      text: activity.description[lang],
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(shareData.url);
      setCopiedId(activity._id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Generate next 7 days for date picker
  const getNextDays = (startDateStr: string, days = 7) => {
    const start = new Date(startDateStr);
    return Array.from({ length: days }, (_, i) => {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      return date;
    });
  };

  return (
    <div className="space-y-8">
      {/* Hero Section - Light overlay and refined typography */}
      <div className="relative rounded-[2rem] md:rounded-[2.5rem] overflow-hidden h-[400px] md:h-[550px] group shadow-xl">
        <img
          src="https://images.unsplash.com/photo-1545562083-c583d014b261?q=80&w=2070&auto=format&fit=crop"
          alt="Saudi Desert"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80 md:to-black/70"></div>

        <div className="absolute bottom-0 w-full p-6 md:p-12 flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
          <div className="max-w-2xl space-y-3 md:space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-primary text-white rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <Flame size={12} fill="white" /> {t.trending}
              </span>
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} md:size={14} fill="currentColor" />)}
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white leading-tight tracking-tight">
              {lang === 'ar' ? 'اكتشف سحر العلا' : 'Discover Magic of AlUla'}
            </h1>
            <p className="text-white/90 text-sm md:text-lg max-w-xl line-clamp-2 font-medium">
              {lang === 'ar'
                ? 'انطلق في رحلة عبر الزمن في قلب الصحراء العربية، حيث تلتقي الطبيعة الخلابة بالتاريخ العريق.'
                : 'Embark on a journey through time in the heart of the Arabian desert, where stunning nature meets ancient history.'}
            </p>
          </div>

          <button
            onClick={() => handleBookNow(MOCK_ACTIVITIES[0])}
            className="w-full md:w-auto px-8 py-3.5 md:py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-2xl transition-all flex items-center gap-3 group/btn shadow-xl shadow-primary/20 min-w-[160px] justify-center transform hover:scale-105 active:scale-95"
          >
            {t.book_now}
            <ArrowRight size={18} className={`transition-transform group-hover/btn:translate-x-1 ${lang === 'ar' ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Bar - Pill Style */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide pt-2">
        <button className="flex items-center gap-2 px-6 py-3 bg-white/70 backdrop-blur-md rounded-full text-zinc-900 whitespace-nowrap hover:bg-white transition-colors border border-zinc-200 shadow-sm">
          <Filter size={18} className="text-primary" />
          <span className="font-bold">{t.filters.filter_btn}</span>
        </button>
        {['all', 'sports', 'entertainment', 'cultural', 'outdoor'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-6 py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap capitalize border
              ${filter === cat
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                : 'bg-white/70 text-zinc-500 border-zinc-200 hover:text-zinc-900 hover:bg-white shadow-sm'}`}
          >
            {t.filters[cat as keyof typeof t.filters]}
          </button>
        ))}
      </div>

      {/* Activity Grid - Updated Card Design */}
      <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {filteredActivities.map((activity) => (
          <div
            key={activity._id}
            className="activity-card bg-white/70 backdrop-blur-md rounded-3xl overflow-hidden group transition-all duration-500 hover:-translate-y-2 relative shadow-lg border border-white/40"
          >
            {/* Image Area */}
            <div className="relative h-[280px] p-3 pb-0">
              <div className="w-full h-full rounded-3xl overflow-hidden relative shadow-inner">
                <img
                  src={activity.images[0]}
                  alt={activity.title[lang]}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60"></div>

                {/* Floating Action Buttons */}
                <div className="absolute top-3 end-3 flex gap-2">
                  <button
                    onClick={(e) => handleShare(e, activity)}
                    className="p-2.5 bg-white/80 backdrop-blur-md text-zinc-800 rounded-full hover:bg-primary hover:text-white transition-colors border border-white/20 shadow-sm"
                  >
                    {copiedId === activity._id ? (
                      <Check size={18} />
                    ) : (
                      <Share2 size={18} />
                    )}
                  </button>
                  <button className="p-2.5 bg-white/80 backdrop-blur-md text-zinc-800 rounded-full hover:bg-primary hover:text-white transition-colors border border-white/20 shadow-sm">
                    <Heart size={18} />
                  </button>
                </div>

                {/* Category Badge */}
                <div className="absolute top-3 start-3 px-3 py-1.5 bg-primary/90 backdrop-blur-sm rounded-full flex items-center gap-1 text-[10px] text-white font-bold uppercase tracking-widest shadow-lg">
                  {activity.category}
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="px-5 pb-5 pt-3 flex flex-col relative">
              {/* Rating */}
              <div className="flex items-center gap-1 mb-1">
                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-bold text-zinc-900">{activity.rating.average}</span>
                <span className="text-xs text-zinc-400">({activity.rating.count})</span>
              </div>

              <h3 className="text-xl font-black text-zinc-900 mb-1 leading-snug group-hover:text-primary transition-colors">{activity.title[lang]}</h3>
              <p className="text-zinc-500 text-sm mb-4 line-clamp-2 font-medium leading-relaxed">{activity.description[lang]}</p>

              <div className="flex items-center justify-between mt-auto pt-2">
                <div>
                  <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest mb-0.5">{lang === 'ar' ? 'السعر' : 'Price'}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-zinc-900">{activity.price.amount}</span>
                    <span className="text-sm text-primary font-bold">{t.currency}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleBookNow(activity)}
                  className="px-6 py-3 bg-zinc-900 text-white hover:bg-primary font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-primary/20 transform active:scale-95"
                >
                  {lang === 'ar' ? 'حجز' : 'Book'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal - Light Glassmorphism */}
      {selectedActivity && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div
            className="bg-white/80 backdrop-blur-2xl border border-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden transform transition-all scale-100 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative background glow */}
            <div className="absolute top-[-50%] left-[-50%] w-full h-full bg-primary/10 blur-[100px] rounded-full pointer-events-none"></div>

            {/* Header */}
            <div className="flex items-center justify-between p-8 pb-4 relative z-10">
              <h3 className="font-black text-zinc-900 text-2xl">{t.book_now}</h3>
              <button onClick={closeBooking} className="text-zinc-400 hover:text-zinc-900 transition-colors bg-white/50 p-2.5 rounded-full border border-zinc-100">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 relative z-10 pt-0">
              {bookingStep === 'details' && (
                <div className="space-y-6">
                  <div className="flex gap-5 items-center bg-zinc-50/50 p-4 rounded-3xl border border-zinc-100">
                    <img
                      src={selectedActivity.images[0]}
                      alt={selectedActivity.title[lang]}
                      className="w-24 h-24 rounded-2xl object-cover shadow-md"
                    />
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Star size={12} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-bold text-zinc-600">{selectedActivity.rating.average}</span>
                      </div>
                      <h4 className="font-black text-zinc-900 mb-1 text-lg leading-tight">{selectedActivity.title[lang]}</h4>
                      <p className="text-sm text-primary font-bold">
                        {selectedActivity.vendor.businessName}
                      </p>
                    </div>
                  </div>

                  {/* Enhanced Date Picker */}
                  <div className="space-y-3">
                    <label className="text-xs text-zinc-400 font-black uppercase tracking-widest flex items-center gap-2">
                      <Calendar size={14} className="text-primary" />
                      {t.select_date}
                    </label>
                    <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
                      {getNextDays(selectedActivity.availability.nextSlot).map((date, i) => {
                        const isSelected = selectedDate?.toDateString() === date.toDateString();
                        return (
                          <button
                            key={i}
                            onClick={() => setSelectedDate(date)}
                            className={`min-w-[4.5rem] p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1 duration-200
                                   ${isSelected
                                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30 scale-105'
                                : 'bg-white border-zinc-100 text-zinc-500 hover:border-zinc-300 hover:text-zinc-900'
                              }
                                 `}
                          >
                            <span className={`text-[10px] uppercase font-black ${isSelected ? 'opacity-100' : 'opacity-60'}`}>
                              {date.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'short' })}
                            </span>
                            <span className="text-2xl font-black">
                              {date.getDate()}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-zinc-100 space-y-4 shadow-sm">
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-zinc-500 font-bold flex items-center gap-2"><Calendar size={16} className="text-zinc-300" /> {lang === 'ar' ? 'التاريخ المحدد' : 'Selected Date'}</span>
                      <span className="text-zinc-900 font-black px-3 py-1 rounded-lg border border-zinc-100">
                        {selectedDate ? selectedDate.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { day: 'numeric', month: 'short' }) : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-zinc-500 font-bold flex items-center gap-2"><Users size={16} className="text-zinc-300" /> {lang === 'ar' ? 'الضيوف' : 'Guests'}</span>
                      <span className="text-zinc-900 font-black px-3 py-1 rounded-lg border border-zinc-100">1 {lang === 'ar' ? 'شخص' : 'Person'}</span>
                    </div>
                    <div className="h-px bg-zinc-100 my-2"></div>
                    <div className="flex justify-between items-end">
                      <span className="text-zinc-500 font-black uppercase text-xs tracking-widest">{lang === 'ar' ? 'المجموع' : 'Total'}</span>
                      <span className="text-3xl font-black text-primary">{selectedActivity.price.amount} <small className="text-sm font-bold text-zinc-400">{t.currency}</small></span>
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmBooking}
                    className="w-full py-4.5 bg-zinc-900 hover:bg-zinc-800 text-white font-black text-lg rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-95"
                  >
                    <CreditCard size={22} />
                    {lang === 'ar' ? 'تأكيد وحجز' : 'Confirm & Book'}
                  </button>
                </div>
              )}

              {bookingStep === 'processing' && (
                <div className="flex flex-col items-center justify-center py-16 space-y-6">
                  <div className="relative">
                    <div className="w-24 h-24 border-4 border-zinc-100 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-24 h-24 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Flame size={28} className="text-primary animate-pulse" />
                    </div>
                  </div>
                  <p className="text-zinc-600 font-black animate-pulse tracking-tight">{lang === 'ar' ? 'جاري معالجة طلبك...' : 'Processing your request...'}</p>
                </div>
              )}

              {bookingStep === 'success' && (
                <div className="flex flex-col items-center justify-center py-8 space-y-6 text-center animate-in zoom-in duration-500">
                  <div className="w-28 h-28 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-2 ring-4 ring-green-100 shadow-lg">
                    <CheckCircle size={56} />
                  </div>
                  <div>
                    <h4 className="text-3xl font-black text-zinc-900 tracking-tight mb-2">{lang === 'ar' ? 'تم الحجز بنجاح!' : 'Booking Confirmed!'}</h4>
                    <p className="text-zinc-500 max-w-xs text-sm leading-relaxed font-medium mx-auto">
                      {lang === 'ar'
                        ? 'تم تأكيد حجزك بنجاح. سنرسل لك التفاصيل قريباً.'
                        : 'Your booking is confirmed. We will send you the details shortly.'}
                    </p>
                  </div>
                  <button
                    onClick={closeBooking}
                    className="mt-4 w-full py-4 bg-zinc-900 text-white font-black rounded-2xl transition-transform hover:scale-105"
                  >
                    {lang === 'ar' ? 'تم' : 'Great'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};