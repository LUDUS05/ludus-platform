import React, { useEffect, useRef } from 'react';
import { Language, ExtendedUserProfile } from '../types';
import { TRANSLATIONS, MOCK_USER_PROFILE } from '../constants';
import { Star, UserPlus, MessageCircle, CheckCircle2, MapPin, Link as LinkIcon, Instagram } from 'lucide-react';
import { gsap } from 'gsap';

interface UserProfileProps {
  lang: Language;
}

// Custom SVGs for brand icons not in standard lucide set
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" height="1em" width="1em">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const SnapchatIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" height="1em" width="1em">
    <path d="M12.04 2c-2.66 0-4.8 1.8-4.8 4.03 0 1.57 1.07 2.91 2.66 3.56-.15.36-.25.84-.25 1.32 0 1.21.63 2.24 1.6 2.77-.47.12-1.6.35-2.3.47-.63.11-1.27.22-1.31 1.03-.04.65.46 1.04.95 1.27.56.26 1.3.33 1.3.33s-.45.78-1.5 1.43c-.6.36-1.27.77-1.08 1.7.15.69.9.86 1.47.93 1.02.11 2.23.15 3.27.15 1.04 0 2.25-.04 3.27-.15.57-.07 1.32-.24 1.47-.93.2-.93-.48-1.34-1.08-1.7-1.06-.65-1.5-1.43-1.5-1.43s.74-.07 1.3-.33c.49-.23.99-.62.95-1.27-.05-.81-.68-.92-1.32-1.03-.7-.12-1.83-.35-2.3-.47.97-.53 1.6-1.56 1.6-2.77 0-.48-.1-.96-.25-1.32 1.59-.65 2.66-1.99 2.66-3.56C16.84 3.8 14.7 2 12.04 2z" />
  </svg>
);

export const UserProfile: React.FC<UserProfileProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const user = MOCK_USER_PROFILE;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.profile-anim',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="max-w-4xl mx-auto pb-20">
      {/* Profile Header Card */}
      <div className="profile-anim bg-white/60 backdrop-blur-3xl rounded-[3rem] border border-white/60 overflow-hidden relative mb-8 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
        {/* Cover Area */}
        <div className="h-48 bg-gradient-to-r from-primary/20 via-primary/5 to-orange-500/10 relative">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#eb5624 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}></div>
        </div>

        <div className="px-6 md:px-12 pb-10 relative">
          {/* Profile Picture & Basic Info */}
          <div className="flex flex-col md:flex-row gap-8 items-start -mt-24 mb-10">
            <div className="relative group">
              <div className="w-40 h-40 md:w-48 md:h-48 rounded-[2.5rem] p-2 bg-white/80 backdrop-blur-md shadow-2xl ring-1 ring-white/50 relative z-10">
                <img
                  src={user.profilePicture}
                  alt={user.firstName}
                  className="w-full h-full rounded-[2.2rem] object-cover shadow-inner"
                />
              </div>
              <div className="absolute bottom-4 end-4 bg-primary text-white p-2.5 rounded-full border-4 border-white shadow-lg z-20" title={t.profile.verified}>
                <CheckCircle2 size={20} />
              </div>
            </div>

            <div className="flex-1 pt-0 md:pt-20 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h1 className="text-4xl font-black text-zinc-900 flex items-center gap-3">
                    {user.firstName} {user.lastName}
                  </h1>
                  <p className="text-zinc-500 font-bold text-lg">@{user.firstName.toLowerCase()}</p>
                </div>

                <div className="flex gap-4">
                  <button className="flex-1 md:flex-none px-8 py-3.5 bg-primary hover:bg-primary-hover text-white font-black rounded-2xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:scale-105">
                    <UserPlus size={20} />
                    {t.profile.add_friend}
                  </button>
                  <button className="flex-1 md:flex-none px-8 py-3.5 bg-white hover:bg-zinc-50 text-zinc-900 font-black rounded-2xl transition-all border border-zinc-200 flex items-center justify-center gap-2 shadow-sm">
                    <MessageCircle size={20} />
                    {t.profile.message}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bio & Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="md:col-span-2 space-y-8">
              {/* Bio */}
              <div>
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">{t.profile.bio}</h3>
                <p className="text-zinc-700 leading-relaxed text-lg font-medium whitespace-pre-line">{user.bio}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-5 bg-white rounded-3xl border border-zinc-100 flex flex-col items-center justify-center gap-1 shadow-sm">
                  <span className="text-3xl font-black text-zinc-900">{user.stats.activitiesParticipated}</span>
                  <span className="text-[10px] text-zinc-400 font-black uppercase tracking-wider">{t.profile.activities}</span>
                </div>
                <div className="p-5 bg-white rounded-3xl border border-zinc-100 flex flex-col items-center justify-center gap-1 shadow-sm">
                  <span className="text-3xl font-black text-zinc-900">{user.stats.friendsCount}</span>
                  <span className="text-[10px] text-zinc-400 font-black uppercase tracking-wider">{t.profile.friends}</span>
                </div>
                <div className="p-5 bg-white rounded-3xl border border-zinc-100 flex flex-col items-center justify-center gap-1 shadow-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-3xl font-black text-zinc-900">{user.rating.average}</span>
                    <Star size={18} className="text-yellow-500 fill-yellow-500" />
                  </div>
                  <span className="text-[10px] text-zinc-400 font-black uppercase tracking-wider">{user.rating.count} {t.profile.reviews}</span>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {/* Social Accounts */}
              <div className="bg-zinc-50/50 rounded-3xl p-6 border border-zinc-100 shadow-inner">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-5">{t.profile.socials}</h3>
                <div className="space-y-3">
                  {user.socials.map((social) => (
                    <a
                      key={social.platform}
                      href={social.url}
                      className="flex items-center justify-between p-4 rounded-2xl bg-white hover:bg-zinc-50 transition-all group border border-zinc-100 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md
                               ${social.platform === 'instagram' ? 'bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600' : ''}
                               ${social.platform === 'tiktok' ? 'bg-zinc-900' : ''}
                               ${social.platform === 'snapchat' ? 'bg-yellow-400 text-black' : ''}
                             `}>
                          {social.platform === 'instagram' && <Instagram size={22} />}
                          {social.platform === 'tiktok' && <TikTokIcon className="text-xl" />}
                          {social.platform === 'snapchat' && <SnapchatIcon className="text-xl" />}
                        </div>
                        <span className="text-sm font-black text-zinc-900 group-hover:text-primary transition-colors dir-ltr">{social.username}</span>
                      </div>
                      <LinkIcon size={14} className="text-zinc-300 group-hover:text-primary transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      <div className="profile-anim">
        <h2 className="text-2xl font-black text-zinc-900 mb-6 px-4 flex items-center gap-3">
          {t.profile.badges}
          <span className="text-[10px] bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/10 uppercase tracking-widest">{user.badges.length} TOTAL</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {user.badges.map((badge) => (
            <div key={badge.id} className="p-6 rounded-[2.5rem] bg-white border border-zinc-100 flex flex-col gap-4 relative overflow-hidden group hover:scale-[1.05] hover:shadow-xl transition-all shadow-sm">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${badge.color.replace('text-', 'bg-').split(' ')[0]} bg-opacity-10`}>
                {badge.icon}
              </div>
              <div>
                <h3 className="font-black text-zinc-900 mb-1">{badge.label[lang]}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed font-bold">{badge.description[lang]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};