import React, { useEffect, useRef } from 'react';
import { StatMetric, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Users, DollarSign, Activity as ActivityIcon, Package, Calendar } from 'lucide-react';
import { gsap } from 'gsap';

interface DashboardProps {
  lang: Language;
}

// Mock Data for Vendor Analytics
const data = [
  { name: 'Jan', bookings: 400, revenue: 24000 },
  { name: 'Feb', bookings: 300, revenue: 18980 },
  { name: 'Mar', bookings: 200, revenue: 9800 },
  { name: 'Apr', bookings: 278, revenue: 39080 },
  { name: 'May', bookings: 189, revenue: 48000 },
  { name: 'Jun', bookings: 239, revenue: 38000 },
  { name: 'Jul', bookings: 349, revenue: 43000 },
];

export const Dashboard: React.FC<DashboardProps> = ({ lang }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[lang];

  const statsData: StatMetric[] = [
    { label: { ar: 'الحجوزات النشطة', en: 'Active Bookings' }, value: '1,245', change: 12.5, trend: 'up' },
    { label: { ar: 'إجمالي الإيرادات', en: 'Total Revenue' }, value: '240K', change: 8.2, trend: 'up' },
    { label: { ar: 'متوسط التقييم', en: 'Avg Rating' }, value: '4.8', change: -1.2, trend: 'down' },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.dashboard-card',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
           <h2 className="text-3xl font-black text-zinc-900 tracking-tight">{t.vendor_dashboard.title}</h2>
           <p className="text-zinc-500 text-sm mt-1 font-bold">{t.vendor_dashboard.subtitle}</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-zinc-200 rounded-2xl text-sm text-zinc-600 hover:text-zinc-900 hover:border-zinc-300 transition-all font-black shadow-sm">
            <Package size={18} />
            {t.vendor_dashboard.manage_activities}
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-2xl text-sm shadow-lg shadow-primary/20 transition-all font-black hover:scale-105">
            <Calendar size={18} />
            {t.vendor_dashboard.manage_bookings}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsData.map((stat, index) => (
          <div key={index} className="dashboard-card p-8 bg-white/70 backdrop-blur-md border border-white rounded-[2.5rem] shadow-lg hover:shadow-xl transition-all group">
             <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-zinc-50 rounded-2xl group-hover:bg-primary/10 transition-colors">
                   {index === 0 && <Users size={26} className="text-blue-500" />}
                   {index === 1 && <DollarSign size={26} className="text-primary" />}
                   {index === 2 && <ActivityIcon size={26} className="text-purple-500" />}
                </div>
                <span className={`flex items-center gap-1 text-xs font-black px-2.5 py-1.5 rounded-xl ${stat.trend === 'up' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                  {stat.change > 0 ? '+' : ''}{stat.change}%
                  {stat.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                </span>
             </div>
             <div className="text-4xl font-black text-zinc-900 mb-2 tracking-tighter">
                {index === 1 && <span className="text-lg align-top mr-1">{t.currency}</span>}
                {stat.value}
             </div>
             <div className="text-xs text-zinc-400 font-black uppercase tracking-widest">{stat.label[lang]}</div>
          </div>
        ))}
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="dashboard-card p-8 bg-white/70 backdrop-blur-md border border-white rounded-[2.5rem] shadow-lg">
          <h3 className="text-xl font-black text-zinc-900 mb-8 flex items-center gap-2">
            <span className="w-2 h-8 bg-primary rounded-full"></span>
            {lang === 'ar' ? 'اتجاهات الإيرادات' : 'Revenue Trends'}
          </h3>
          <div className="h-[300px] w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eb5624" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#eb5624" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" vertical={false} />
                <XAxis dataKey="name" stroke="#a1a1aa" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontWeight: 'bold'}} dy={10} />
                <YAxis stroke="#a1a1aa" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontWeight: 'bold'}} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(8px)', borderColor: '#f1f1f1', color: '#18181b', borderRadius: '16px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#eb5624' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#eb5624" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bookings Overview */}
        <div className="dashboard-card p-8 bg-white/70 backdrop-blur-md border border-white rounded-[2.5rem] shadow-lg">
          <h3 className="text-xl font-black text-zinc-900 mb-8 flex items-center gap-2">
            <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
            {lang === 'ar' ? 'ملخص الحجوزات' : 'Bookings Overview'}
          </h3>
          <div className="h-[300px] w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" vertical={false} />
                <XAxis dataKey="name" stroke="#a1a1aa" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontWeight: 'bold'}} dy={10} />
                <YAxis stroke="#a1a1aa" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontWeight: 'bold'}} dx={-10} />
                <Tooltip 
                  cursor={{fill: '#f4f4f5'}}
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(8px)', borderColor: '#f1f1f1', color: '#18181b', borderRadius: '16px', fontWeight: 'bold' }}
                />
                <Bar dataKey="bookings" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};