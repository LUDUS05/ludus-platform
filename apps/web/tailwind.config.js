/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // LUDUS Brand Colors
        ludus: {
          orange: '#FF6600',
          'orange-light': '#FF8533',
          'orange-dark': '#CC5200',
        },
        charcoal: {
          DEFAULT: '#2B2B2B',
          light: '#404040',
          dark: '#1A1A1A',
        },
        'soft-white': '#FAFAFA',
        warm: {
          DEFAULT: '#EEEEEE',
          light: '#F5F5F5',
          dark: '#E0E0E0',
        },
        accent: {
          blue: '#00ADEF',
          'blue-light': '#33C1F2',
          'blue-dark': '#0088BF',
        },
        'success-green': '#10B981',
        'success-light': '#34D399',
        'success-dark': '#059669',
        'warning-orange': '#F59E0B',
        'warning-light': '#FBBF24',
        'warning-dark': '#D97706',
        'error-red': '#EF4444',
        'error-light': '#F87171',
        'error-dark': '#DC2626',
        'accent-blue-dark': '#0088BF',
        'success-dark': '#059669',
        'warning-dark': '#D97706',

        // Dark Theme Colors - Enhanced based on UX feedback
        dark: {
          bg: {
            primary: '#121212',    // Changed from pure black for better visual comfort
            secondary: '#1E1E1E',  // Elevated cards/components background
            tertiary: '#2B2B2B',   // Further elevated elements
            quaternary: '#404040', // Highest elevation elements
          },
          text: {
            primary: 'rgba(224, 224, 224, 0.87)',  // Off-white with 87% opacity for primary text
            secondary: 'rgba(224, 224, 224, 0.60)', // Off-white with 60% opacity for secondary text
            tertiary: 'rgba(224, 224, 224, 0.38)',  // Off-white with 38% opacity for disabled text
            disabled: 'rgba(224, 224, 224, 0.24)',  // Off-white with 24% opacity for disabled
          },
          ludus: {
            orange: '#E65A00',     // Desaturated orange for dark mode comfort
            'orange-light': '#FF8533', // Slightly desaturated light variant
            'orange-dark': '#CC4700', // Desaturated dark variant
          },
          accent: {
            blue: '#0099CC',       // Desaturated blue for dark mode
            green: '#00A86B',      // Desaturated green for dark mode
          },
          success: '#00A86B',      // Desaturated success color
          warning: '#E6A500',      // Desaturated warning color
          error: '#D32F2F',       // Desaturated error color
          border: {
            primary: '#404040',
            secondary: '#2B2B2B',
            tertiary: '#1A1A1A',
          }
        },
        // Legacy colors for compatibility
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        secondary: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      // Custom typography utilities
      fontSize: {
        // Display text sizes
        'display-xl': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg': ['2rem', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '600' }],
        'display-md': ['1.5rem', { lineHeight: '1.33', fontWeight: '600' }],
        'display-sm': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        'display-xs': ['1.125rem', { lineHeight: '1.44', fontWeight: '600' }],
        // Body text sizes
        'body-lg': ['1.125rem', { lineHeight: '1.56', fontWeight: '400' }],
        'body-md': ['1rem', { lineHeight: '1.5', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.43', fontWeight: '400' }],
        'body-xs': ['0.75rem', { lineHeight: '1.5', fontWeight: '400' }],
        // Label text sizes
        'label-lg': ['1rem', { lineHeight: '1.5', fontWeight: '500' }],
        'label-md': ['0.875rem', { lineHeight: '1.43', fontWeight: '500' }],
        'label-sm': ['0.75rem', { lineHeight: '1.5', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }],
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '40px',
        '3xl': '64px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    function({ addUtilities }) {
      const newUtilities = {
        // RTL utilities
        '.rtl': {
          direction: 'rtl',
        },
        '.ltr': {
          direction: 'ltr',
        },
        // Button press animation
        '.btn-press': {
          '@apply transition-transform duration-100 ease-out active:scale-95': {},
        },
        // Card hover effect
        '.card-hover': {
          '@apply transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1': {},
        },
        // Arabic text optimization
        '.arabic-text': {
          fontFamily: '"Noto Sans Arabic", "Inter", sans-serif',
          lineHeight: '1.6',
          letterSpacing: 'normal',
        },
        '.arabic-heading': {
          fontWeight: '600',
          lineHeight: '1.4',
        },
        // Glass morphism utilities
        '.glass': {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        },
        '.glass-ludus': {
          background: 'rgba(255, 102, 0, 0.1)',
          backdropFilter: 'blur(12px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(12px) saturate(1.8)',
          border: '1px solid rgba(255, 102, 0, 0.2)',
          boxShadow: '0 8px 32px 0 rgba(255, 102, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        },
        // Performance optimization utilities
        '.gpu-accelerated': {
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          perspective: '1000px',
        },
        '.optimized-animation': {
          willChange: 'transform, opacity',
        },
        // Enhanced dark mode utilities
        '.dark-bg-primary': {
          backgroundColor: '#121212',
        },
        '.dark-bg-secondary': {
          backgroundColor: '#1E1E1E',
        },
        '.dark-bg-tertiary': {
          backgroundColor: '#2B2B2B',
        },
        '.dark-text-primary': {
          color: 'rgba(224, 224, 224, 0.87)',
        },
        '.dark-text-secondary': {
          color: 'rgba(224, 224, 224, 0.60)',
        },
        '.dark-text-tertiary': {
          color: 'rgba(224, 224, 224, 0.38)',
        },
      }
      addUtilities(newUtilities, ['responsive', 'hover', 'dark'])
    }
  ],
};