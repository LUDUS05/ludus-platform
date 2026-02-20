import React from 'react';
import { TRANSLATIONS } from '../constants';
import { Language } from '../types';
import { Users, DollarSign, Activity, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface AdminDashboardProps {
    lang: Language;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ lang }) => {
    // Use translations or hardcode admin strings

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-black text-zinc-900 dark:text-white">Admin Dashboard</h1>
                <div className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    System Operational
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-surface-card border border-zinc-200 dark:border-white/5 p-6 rounded-3xl">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-zinc-500">Total Users</p>
                            <h3 className="text-2xl font-black text-zinc-900 dark:text-white">12,450</h3>
                        </div>
                    </div>
                    <p className="text-xs text-green-500 font-bold">+12% from last month</p>
                </div>

                <div className="bg-white dark:bg-surface-card border border-zinc-200 dark:border-white/5 p-6 rounded-3xl">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-zinc-500">Total Revenue</p>
                            <h3 className="text-2xl font-black text-zinc-900 dark:text-white">SAR 450.5k</h3>
                        </div>
                    </div>
                    <p className="text-xs text-green-500 font-bold">+5% from last month</p>
                </div>

                <div className="bg-white dark:bg-surface-card border border-zinc-200 dark:border-white/5 p-6 rounded-3xl">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                            <Activity size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-zinc-500">Active Events</p>
                            <h3 className="text-2xl font-black text-zinc-900 dark:text-white">85</h3>
                        </div>
                    </div>
                    <p className="text-xs text-zinc-500 font-bold">Currently live</p>
                </div>
            </div>

            {/* Recent Flags / Moderation */}
            <div className="bg-white dark:bg-surface-card border border-zinc-200 dark:border-white/5 rounded-3xl p-8">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Content Moderation Queue</h2>
                <div className="space-y-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-white/5 rounded-2xl">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-red-500/10 text-red-500 rounded-lg">
                                    <AlertTriangle size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-zinc-900 dark:text-white">User Report #{1000 + i}</h4>
                                    <p className="text-sm text-zinc-500">Inappropriate comment in "Desert Camping"</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 hover:bg-green-500/10 text-green-500 rounded-lg transition-colors" title="Approve">
                                    <CheckCircle size={20} />
                                </button>
                                <button className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors" title="Ban">
                                    <XCircle size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
