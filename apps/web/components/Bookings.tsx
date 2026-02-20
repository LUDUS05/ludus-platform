import React, { useState } from 'react';
import { TRANSLATIONS } from '../constants';
import { Language, Activity } from '../types';
import { Calendar, MapPin, Clock, ArrowRight, Filter } from 'lucide-react';

interface BookingsProps {
    lang: Language;
}

export const Bookings: React.FC<BookingsProps> = ({ lang }) => {
    const t = TRANSLATIONS[lang];
    const [filter, setFilter] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');

    // Mock Bookings Data
    const bookings = [
        {
            id: 'b1',
            activity: {
                title: { ar: 'بطولة البادل للمحترفين', en: 'Pro Padel Tournament' },
                image: 'https://picsum.photos/800/600?random=2',
                location: { address: { city: 'Riyadh' } },
                price: { amount: 350, currency: 'SAR' },
                date: '2024-03-15',
                time: '18:00',
            },
            status: 'upcoming',
            tickets: 2,
            total: 700
        },
        {
            id: 'b2',
            activity: {
                title: { ar: 'ورشة الخيل العربية', en: 'Arabian Horse Workshop' },
                image: 'https://picsum.photos/800/600?random=3',
                location: { address: { city: 'Diriyah' } },
                price: { amount: 500, currency: 'SAR' },
                date: '2024-02-20',
                time: '16:00',
            },
            status: 'past',
            tickets: 1,
            total: 500
        }
    ];

    const filteredBookings = bookings.filter(b => b.status === filter);

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900 dark:text-white mb-2">{t.bookings}</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        {lang === 'ar' ? 'إدارة حجوزاتك ومتابعة الفعاليات القادمة' : 'Manage your bookings and track upcoming events'}
                    </p>
                </div>

                <div className="flex bg-white dark:bg-white/5 p-1 rounded-xl border border-zinc-200 dark:border-white/10">
                    {(['upcoming', 'past', 'cancelled'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === f
                                    ? 'bg-primary text-white shadow-lg'
                                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10'
                                }`}
                        >
                            {f === 'upcoming' ? (lang === 'ar' ? 'قادمة' : 'Upcoming') :
                                f === 'past' ? (lang === 'ar' ? 'سابقة' : 'Past') :
                                    (lang === 'ar' ? 'ملغاة' : 'Cancelled')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bookings List */}
            <div className="grid gap-6">
                {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => (
                        <div key={booking.id} className="bg-white dark:bg-surface-card border border-zinc-200 dark:border-white/5 rounded-3xl p-6 flex flex-col md:flex-row gap-6 hover:border-primary/30 transition-all group">
                            {/* Image */}
                            <div className="w-full md:w-64 h-48 md:h-auto rounded-2xl overflow-hidden relative shrink-0">
                                <img
                                    src={booking.activity.image}
                                    alt={booking.activity.title[lang]}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-zinc-900 dark:text-white">
                                    {booking.status === 'upcoming' ? (lang === 'ar' ? 'مؤكد' : 'Confirmed') : (lang === 'ar' ? 'مكتمل' : 'Completed')}
                                </div>
                            </div>

                            {/* Details */}
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                                            {booking.activity.title[lang]}
                                        </h3>
                                        <span className="text-xl font-black text-primary">
                                            {booking.total} <span className="text-sm font-medium text-zinc-500">{t.currency}</span>
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-4 text-sm text-zinc-500 dark:text-zinc-400 mt-4">
                                        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-white/5 px-3 py-1.5 rounded-lg">
                                            <Calendar size={16} className="text-primary" />
                                            <span>{booking.activity.date}</span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-white/5 px-3 py-1.5 rounded-lg">
                                            <Clock size={16} className="text-primary" />
                                            <span>{booking.activity.time}</span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-white/5 px-3 py-1.5 rounded-lg">
                                            <MapPin size={16} className="text-primary" />
                                            <span>{booking.activity.location.address.city}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-6 pt-6 border-t border-zinc-100 dark:border-white/5">
                                    <div className="text-sm">
                                        <span className="text-zinc-500 dark:text-zinc-400">{lang === 'ar' ? 'التذاكر:' : 'Tickets:'}</span>
                                        <span className="font-bold text-zinc-900 dark:text-white ms-2">{booking.tickets}</span>
                                    </div>

                                    <button className="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
                                        {lang === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                                        <ArrowRight size={18} className={lang === 'ar' ? 'rotate-180' : ''} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 bg-zinc-50 dark:bg-white/5 rounded-3xl border border-dashed border-zinc-200 dark:border-white/10">
                        <Filter size={48} className="mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                            {lang === 'ar' ? 'لا توجد حجوزات' : 'No bookings found'}
                        </h3>
                        <p className="text-zinc-500 dark:text-zinc-400">
                            {lang === 'ar' ? 'لم تقم بأي حجوزات في هذه الفئة بعد' : 'You havent made any bookings in this category yet'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
