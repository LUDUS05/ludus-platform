/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}", // Include root files like App.tsx, index.tsx
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Cairo', 'sans-serif'],
                english: ['Inter', 'sans-serif'],
            },
            colors: {
                primary: {
                    DEFAULT: '#eb5624', // Brand Orange
                    hover: '#c2410b',   // Darker Orange
                    light: '#f27a50',   // Lighter Orange
                    glow: 'rgba(235, 86, 36, 0.5)'
                },
                surface: {
                    base: '#f4f4f5',    // zinc-100 (Light Background)
                    card: 'rgba(255, 255, 255, 0.7)', // Glass White
                    elevated: 'rgba(255, 255, 255, 0.9)',
                    highlight: 'rgba(0, 0, 0, 0.05)'
                }
            },
            borderRadius: {
                '4xl': '2rem',
                '5xl': '2.5rem',
            },
            animation: {
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }
        }
    },
    plugins: [],
}
