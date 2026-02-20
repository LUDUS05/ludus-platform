import React from 'react';
import { TRANSLATIONS } from '../constants';
import { Language } from '../types';
import { MessageSquare, Heart, Share2, Users, MoreHorizontal } from 'lucide-react';

interface CommunityProps {
    lang: Language;
}

export const Community: React.FC<CommunityProps> = ({ lang }) => {
    const t = TRANSLATIONS[lang];

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900 dark:text-white mb-2">{t.community}</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        {lang === 'ar' ? 'تواصل مع أشخاص يشاركونك نفس الاهتمامات' : 'Connect with people who share your interests'}
                    </p>
                </div>
                <button className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all">
                    {lang === 'ar' ? 'إنشاء منشور' : 'Create Post'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Feed */}
                <div className="lg:col-span-2 space-y-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white dark:bg-surface-card border border-zinc-200 dark:border-white/5 rounded-3xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <img src={`https://i.pravatar.cc/150?u=${i}`} alt="User" className="w-10 h-10 rounded-full" />
                                    <div>
                                        <h3 className="font-bold text-zinc-900 dark:text-white">Ahmed Ali</h3>
                                        <p className="text-xs text-zinc-500">2 hours ago</p>
                                    </div>
                                </div>
                                <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                                    <MoreHorizontal size={20} />
                                </button>
                            </div>

                            <p className="text-zinc-600 dark:text-zinc-300 mb-4 leading-relaxed">
                                {lang === 'ar'
                                    ? 'تجربة رائعة اليوم في فعالية ركوب الخيل في الدرعية! التنظيم كان ممتازاً والأجواء خيالية. أنصح الجميع بالتجربة. 🐴✨'
                                    : 'Amazing experience today at the horse riding event in Diriyah! Organization was excellent and the vibes were unreal. Highly recommend! 🐴✨'}
                            </p>

                            <img src={`https://picsum.photos/800/400?random=${i + 10}`} alt="Post" className="w-full h-64 object-cover rounded-2xl mb-4" />

                            <div className="flex items-center gap-6 pt-4 border-t border-zinc-100 dark:border-white/5">
                                <button className="flex items-center gap-2 text-zinc-500 hover:text-red-500 transition-colors">
                                    <Heart size={20} />
                                    <span>245</span>
                                </button>
                                <button className="flex items-center gap-2 text-zinc-500 hover:text-primary transition-colors">
                                    <MessageSquare size={20} />
                                    <span>56</span>
                                </button>
                                <button className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors ms-auto">
                                    <Share2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sidebar - Groups */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-surface-card border border-zinc-200 dark:border-white/5 rounded-3xl p-6">
                        <h3 className="font-bold text-xl text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                            <Users size={20} className="text-primary" />
                            {lang === 'ar' ? 'مجموعات مقترحة' : 'Suggested Groups'}
                        </h3>

                        <div className="space-y-4">
                            {[1, 2, 3, 4].map((g) => (
                                <div key={g} className="flex items-center gap-3 p-3 hover:bg-zinc-50 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer">
                                    <div className="w-12 h-12 rounded-xl bg-zinc-200 dark:bg-white/10 flex items-center justify-center text-2xl">
                                        {g === 1 ? '🎾' : g === 2 ? '🎨' : g === 3 ? '🏕️' : '🚴'}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-zinc-900 dark:text-white text-sm">
                                            {g === 1 ? 'Padel Lovers' : g === 2 ? 'Art & Soul' : g === 3 ? 'Desert Campers' : 'Riyadh Cyclists'}
                                        </h4>
                                        <p className="text-xs text-zinc-500">{120 * g} {lang === 'ar' ? 'عضو' : 'members'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-4 py-3 text-primary font-bold text-sm bg-primary/5 hover:bg-primary/10 rounded-xl transition-colors">
                            {lang === 'ar' ? 'استكشاف المزيد' : 'Discover More'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};
