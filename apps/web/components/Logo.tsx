import React from 'react';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    showText?: boolean;
    className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '' }) => {
    const iconSize = {
        sm: 'h-6',
        md: 'h-8',
        lg: 'h-10',
        xl: 'h-12',
        '2xl': 'h-16',
    };

    const labelSize = {
        sm: 'text-lg',
        md: 'text-2xl',
        lg: 'text-3xl',
        xl: 'text-4xl',
        '2xl': 'text-5xl',
    };

    // Exact LUDUS brand orange based on tailwind config
    const brandColor = '#eb5624';

    return (
        <div className={`flex items-center gap-2 select-none ${className}`}>
            <svg
                viewBox="0 0 100 100"
                className={`${iconSize[size]} shrink-0`}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="xMidYMid meet"
            >
                {/* Left larger shape */}
                <path d="M 28 85 L 68 85 L 85 70 L 45 70 L 45 15 L 28 30 Z" fill={brandColor} />
                {/* Right smaller shape */}
                <path d="M 57 15 L 57 60 L 70 60 L 70 15 Z" fill={brandColor} />
            </svg>

            {showText && (
                <span
                    className={`${labelSize[size]} font-black tracking-[-0.05em] text-zinc-900 dark:text-white leading-none mt-1`}
                    style={{ color: brandColor, fontFamily: 'Inter, sans-serif' }}
                >
                    LUDUS
                </span>
            )}
        </div>
    );
};
