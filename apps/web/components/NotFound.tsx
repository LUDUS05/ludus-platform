import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Logo } from './Logo';

export const NotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6 overscroll-none text-center relative overflow-hidden">
            {/* Background elements for creativity */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -z-10 mix-blend-multiply dark:mix-blend-screen pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-400/10 rounded-full blur-[100px] -z-10 mix-blend-multiply dark:mix-blend-screen pointer-events-none"></div>

            <Logo size="xl" showText={false} className="mb-8 opacity-20" />

            <div className="relative">
                <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-zinc-800 to-zinc-400 dark:from-zinc-100 dark:to-zinc-600 tracking-tighter">
                    404
                </h1>
                <div className="absolute -top-4 -right-12 rotate-12 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    Lost?
                </div>
            </div>

            <h2 className="mt-6 text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                Looks like you've strayed off the path.
            </h2>
            <p className="mt-4 text-zinc-500 dark:text-zinc-400 max-w-md mx-auto text-lg leading-relaxed">
                The activity or page you're searching for doesn't exist in our arena. Let's get you back in the game.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full max-w-xs sm:max-w-none">
                <button
                    onClick={() => navigate(-1)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Go Back
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-semibold hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
                >
                    <Home size={20} />
                    Return Home
                </button>
            </div>
        </div>
    );
};
