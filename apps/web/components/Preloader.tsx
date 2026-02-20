import React, { useEffect, useState } from 'react';
import { Logo } from './Logo';

interface PreloaderProps {
    minDisplayTime?: number; // Minimum time to show in ms
    onComplete?: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ minDisplayTime = 1500, onComplete }) => {
    const [isFadingOut, setIsFadingOut] = useState(false);

    useEffect(() => {
        const timer1 = setTimeout(() => {
            setIsFadingOut(true);
        }, minDisplayTime);

        const timer2 = setTimeout(() => {
            if (onComplete) onComplete();
        }, minDisplayTime + 500); // 500ms for fade out animation

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [minDisplayTime, onComplete]);

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 transition-opacity duration-500 ${isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
            <div className="flex flex-col items-center justify-center relative">
                {/* Pulsing glow background */}
                <div className="absolute inset-0 bg-primary-glow/30 dark:bg-primary-glow/10 blur-3xl rounded-full scale-150 animate-pulse-slow"></div>

                {/* Logo with bounce/pulse animation */}
                <div className="relative z-10 animate-pulse">
                    <Logo size="2xl" showText={true} />
                </div>

                {/* Loading indicator line */}
                <div className="w-32 h-1 mt-8 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden relative z-10">
                    <div className="h-full bg-primary animate-[loading_1.5s_ease-in-out_infinite] origin-left"></div>
                </div>
            </div>

            <style>{`
                @keyframes loading {
                    0% { transform: scaleX(0); transform-origin: left; }
                    50% { transform: scaleX(1); transform-origin: left; }
                    50.1% { transform: scaleX(1); transform-origin: right; }
                    100% { transform: scaleX(0); transform-origin: right; }
                }
            `}</style>
        </div>
    );
};
