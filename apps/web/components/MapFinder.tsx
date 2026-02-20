import React, { useState, useEffect, useRef } from 'react';
import { Language, Activity } from '../types';
import { MOCK_ACTIVITIES, TRANSLATIONS } from '../constants';
import { MapPin, Navigation, Search, Music, Dribbble, Palette, Utensils, Bookmark, X, Star, Calendar, ArrowRight, LocateFixed, SlidersHorizontal, ChevronLeft } from 'lucide-react';
import { gsap } from 'gsap';

interface MapFinderProps {
  lang: Language;
}

// Mock positions (Percentages relative to container)
const MOCK_POSITIONS: Record<string, { x: number; y: number }> = {
  '1': { x: 20, y: 30 }, // Top Left
  '2': { x: 60, y: 45 }, // Center Right
  '3': { x: 40, y: 60 }, // Bottom Center
  '4': { x: 75, y: 25 }, // Top Right
};

export const MapFinder: React.FC<MapFinderProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const pinsRef = useRef<HTMLDivElement>(null);

  // Filter activities
  const filteredActivities = selectedCategory === 'all' 
    ? MOCK_ACTIVITIES 
    : MOCK_ACTIVITIES.filter(act => {
        if (selectedCategory === 'sports') return act.category === 'sports';
        if (selectedCategory === 'music') return act.category === 'entertainment';
        if (selectedCategory === 'cultural') return act.category === 'cultural';
        if (selectedCategory === 'food') return act.category === 'food';
        return true;
    });

  // Initial Map Load Animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.map-interface', 
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' }
      );
    }, mapRef);
    return () => ctx.revert();
  }, []);

  // Activity Card Animation
  useEffect(() => {
    if (selectedActivity && cardRef.current) {
      gsap.fromTo(cardRef.current,
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
      );
    }
  }, [selectedActivity]);

  const categories = [
    { id: 'sports', icon: Dribbble, label: t.filters.sports, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'music', icon: Music, label: t.map_finder.find_music, color: 'text-purple-500', bg: 'bg-purple-50' },
    { id: 'cultural', icon: Palette, label: t.filters.cultural, color: 'text-pink-500', bg: 'bg-pink-50' },
    { id: 'food', icon: Utensils, label: t.map_finder.find_food, color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  return (
    <div ref={mapRef} className="map-interface relative w-full h-[85vh] rounded-[3rem] overflow-hidden border border-zinc-200 shadow-2xl group bg-white">
      
      {/* Map Background - Slightly lighter city view */}
      <div 
        className="absolute inset-0 bg-zinc-100 cursor-grab active:cursor-grabbing transform transition-transform duration-700"
        style={{
           backgroundImage: `url('https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=2070&auto=format&fit=crop')`, 
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           filter: 'brightness(0.9) contrast(1.1) saturate(0.9) grayscale(0.2)' 
        }}
      >
        {/* Riyadh Location Marker (Decorative) */}
        <div className="absolute top-[40%] left-[55%] transform -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20">
           <div className="w-96 h-96 rounded-full border-4 border-primary/20 flex items-center justify-center animate-[pulse_6s_infinite]">
              <div className="w-64 h-64 rounded-full border-2 border-primary/10"></div>
           </div>
        </div>
        
        {/* Location Label */}
        <div className="absolute top-[48%] left-[55%] transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white shadow-xl">
               <MapPin size={16} className="text-primary" />
               <span className="text-[10px] font-black text-zinc-900 uppercase tracking-[0.2em]">Riyadh District</span>
            </div>
        </div>
      </div>

      {/* Floating Header / Search Bar */}
      <div className="absolute top-8 left-0 right-0 px-8 z-30 flex flex-col gap-5 pointer-events-none">
         <div className="flex gap-4 pointer-events-auto">
            <button className="w-16 h-16 bg-white/80 backdrop-blur-2xl border border-white rounded-2xl flex items-center justify-center text-zinc-500 hover:text-primary transition-all shadow-xl group">
               <ChevronLeft size={28} className={`${lang === 'ar' ? 'rotate-180' : ''} group-hover:scale-110 transition-transform`} />
            </button>
            <div className="flex-1 bg-white/80 backdrop-blur-2xl border border-white rounded-2xl flex items-center px-6 shadow-xl group/search focus-within:ring-2 focus-within:ring-primary/20 transition-all">
               <Search size={24} className="text-zinc-400 group-focus-within/search:text-primary transition-colors" />
               <input 
                 type="text" 
                 placeholder={t.search_placeholder}
                 className="w-full bg-transparent border-none outline-none text-zinc-900 px-4 py-4 placeholder:text-zinc-400 font-bold text-sm"
               />
            </div>
            <button className="w-16 h-16 bg-white/80 backdrop-blur-2xl border border-white rounded-2xl flex items-center justify-center text-zinc-500 hover:text-primary transition-all shadow-xl group">
               <SlidersHorizontal size={24} className="group-hover:rotate-180 transition-transform duration-700" />
            </button>
         </div>

         {/* Category Pills */}
         <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2 pointer-events-auto">
            <button 
               onClick={() => setSelectedCategory('all')}
               className={`px-8 py-3.5 rounded-2xl backdrop-blur-xl border text-sm font-black transition-all shadow-xl whitespace-nowrap
                 ${selectedCategory === 'all' ? 'bg-primary text-white border-primary shadow-primary/30' : 'bg-white/80 text-zinc-500 border-white hover:bg-white'}
               `}
            >
               {t.filters.all}
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl backdrop-blur-xl border text-sm font-black transition-all shadow-xl whitespace-nowrap
                   ${selectedCategory === cat.id 
                     ? 'bg-zinc-900 text-white border-zinc-900 shadow-zinc-900/20' 
                     : 'bg-white/80 text-zinc-600 border-white hover:bg-white'
                   }
                `}
              >
                <cat.icon size={18} className={selectedCategory === cat.id ? 'text-white' : cat.color} />
                <span>{cat.label}</span>
              </button>
            ))}
         </div>
      </div>

      {/* Pins Layer */}
      <div ref={pinsRef} className="absolute inset-0 z-10">
        {filteredActivities.map((activity) => {
          const pos = MOCK_POSITIONS[activity._id] || { x: 50, y: 50 };
          const isSelected = selectedActivity?._id === activity._id;
          
          return (
            <button
              key={activity._id}
              onClick={() => setSelectedActivity(activity)}
              className={`map-pin absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 z-10
                ${isSelected ? 'scale-125 z-50' : 'hover:scale-110 z-20'}
              `}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              <div className={`absolute inset-0 rounded-2xl animate-ping opacity-50 duration-2000 ${isSelected ? 'bg-primary' : 'bg-white'}`}></div>
              
              <div className={`
                relative w-16 h-16 rounded-2xl border-4 shadow-2xl flex items-center justify-center backdrop-blur-md transition-all duration-300
                ${isSelected 
                  ? 'bg-primary border-white text-white rotate-[10deg]' 
                  : 'bg-white/90 border-white text-zinc-900 hover:border-primary hover:text-primary'
                }
              `}>
                {activity.category === 'sports' && <Dribbble size={26} />}
                {activity.category === 'outdoor' && <MapPin size={26} />}
                {activity.category === 'cultural' && <Palette size={26} />}
                {activity.category === 'entertainment' && <Music size={26} />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Controls */}
      <div className="absolute bottom-32 right-8 flex flex-col gap-4 z-20">
         <button className="w-16 h-16 rounded-2xl bg-white/80 backdrop-blur-2xl border border-white text-zinc-700 hover:text-primary flex items-center justify-center shadow-2xl transition-all group active:scale-90">
            <Navigation size={28} className="group-hover:scale-110 transition-transform" />
         </button>
         <button className="w-16 h-16 rounded-2xl bg-white/80 backdrop-blur-2xl border border-white text-zinc-700 hover:text-primary flex items-center justify-center shadow-2xl transition-all group active:scale-90">
            <LocateFixed size={28} className="group-hover:scale-110 transition-transform" />
         </button>
      </div>

      {/* Details Card */}
      {selectedActivity && (
        <div className="absolute bottom-0 left-0 w-full p-4 md:p-8 z-40 bg-gradient-to-t from-white/90 via-white/50 to-transparent pt-32">
           <div 
             ref={cardRef}
             className="bg-white/90 backdrop-blur-3xl border border-white rounded-[3rem] p-6 shadow-2xl relative overflow-hidden"
           >
             <button 
               onClick={() => setSelectedActivity(null)}
               className="absolute top-6 right-6 p-3 text-zinc-400 hover:text-zinc-900 bg-zinc-100/50 hover:bg-zinc-200/50 rounded-2xl transition-colors z-20"
             >
                <X size={24} />
             </button>

             <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-44 h-44 md:h-44 rounded-[2.5rem] overflow-hidden relative shrink-0 shadow-lg group-image">
                   <img src={selectedActivity.images[0]} alt={selectedActivity.title[lang]} className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700" />
                   <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black text-primary uppercase border border-white shadow-md">
                      {selectedActivity.category}
                   </div>
                </div>

                <div className="flex-1 flex flex-col justify-center">
                   <h3 className="text-2xl md:text-3xl font-black text-zinc-900 mb-3 pe-12">{selectedActivity.title[lang]}</h3>
                   
                   <div className="flex items-center gap-4 text-zinc-500 text-sm mb-6">
                      <span className="flex items-center gap-2 bg-zinc-50 px-4 py-2 rounded-xl font-bold border border-zinc-100">
                        <Calendar size={16} className="text-primary"/> 
                        {selectedActivity.availability.nextSlot}
                      </span>
                      <span className="flex items-center gap-2 bg-zinc-50 px-4 py-2 rounded-xl font-bold border border-zinc-100">
                        <MapPin size={16} className="text-primary"/> 
                        Riyadh, KSA
                      </span>
                   </div>

                   <div className="flex items-center justify-between mt-auto pt-6 border-t border-zinc-100">
                      <div className="flex flex-col">
                         <span className="text-[10px] uppercase text-zinc-400 font-black tracking-[0.2em] mb-1">{lang === 'ar' ? 'يبدأ من' : 'Starts from'}</span>
                         <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-zinc-900">{selectedActivity.price.amount}</span>
                            <span className="text-sm font-black text-primary">{t.currency}</span>
                         </div>
                      </div>
                      
                      <div className="flex gap-4">
                         <button className="w-16 h-16 rounded-2xl bg-zinc-100/50 hover:bg-zinc-200/50 text-zinc-500 hover:text-zinc-900 transition-all flex items-center justify-center group shadow-sm">
                            <Bookmark size={24} className="group-hover:scale-110 transition-transform" />
                         </button>
                         <button className="px-10 py-4 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/30 flex items-center gap-3 transition-all hover:scale-105 active:scale-95">
                            {t.book_now}
                            <ArrowRight size={24} className={lang === 'ar' ? 'rotate-180' : ''} />
                         </button>
                      </div>
                   </div>
                </div>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};