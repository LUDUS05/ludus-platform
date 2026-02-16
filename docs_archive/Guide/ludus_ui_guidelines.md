# LUDUS UI Design System & Guidelines

## Table of Contents
1. [Brand Foundation](#brand-foundation)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Component Library](#component-library)
5. [Layout & Spacing](#layout--spacing)
6. [Icons & Imagery](#icons--imagery)
7. [Mobile-First Responsive Design](#mobile-first-responsive-design)
8. [RTL Support](#rtl-support)
9. [Interaction & Animation](#interaction--animation)
10. [Implementation Guidelines](#implementation-guidelines)

---

## Brand Foundation

### Vision & Mission
**Tagline**: "Discover, Play and Connect"  
**Mission**: Transform how people discover, book, and participate in local activities by providing a seamless, social platform for Saudi youth.

### Brand Personality
- **Friendly**: Approachable and welcoming interface
- **Bold**: Confident design choices with strong visual hierarchy
- **Innovative**: Modern, cutting-edge user experience
- **Authentic**: Genuine connections and real experiences

### Target Audience
- **Primary**: Saudi youth (under 35)
- **Characteristics**: Tech-savvy, socially active, mobile-first users
- **Behavior**: Community-oriented, experience-seeking, digitally native

---

## Color System

### Primary Colors (Light Theme)

```css
/* LUDUS Orange - Primary Brand Color */
--ludus-orange: #FF6600;
--ludus-orange-light: #FF8533;
--ludus-orange-dark: #CC5200;
--ludus-orange-10: rgba(255, 102, 0, 0.1);
--ludus-orange-20: rgba(255, 102, 0, 0.2);

/* Charcoal Gray - Text & UI */
--charcoal-gray: #2B2B2B;
--charcoal-light: #404040;
--charcoal-dark: #1A1A1A;

/* Soft White - Backgrounds */
--soft-white: #FAFAFA;
--pure-white: #FFFFFF;

/* Warm Gray - Surfaces */
--warm-gray: #EEEEEE;
--warm-gray-light: #F5F5F5;
--warm-gray-dark: #E0E0E0;
```

### Dark Theme Colors

```css
/* Dark Theme Background Hierarchy */
--dark-bg-primary: #0F0F0F;      /* Main background */
--dark-bg-secondary: #1A1A1A;    /* Card backgrounds */
--dark-bg-tertiary: #2B2B2B;     /* Elevated surfaces */
--dark-bg-quaternary: #404040;   /* Interactive elements */

/* Dark Theme Text Colors */
--dark-text-primary: #FFFFFF;    /* Primary text */
--dark-text-secondary: #E0E0E0;  /* Secondary text */
--dark-text-tertiary: #B0B0B0;   /* Tertiary text */
--dark-text-disabled: #6B7280;   /* Disabled text */

/* Dark Theme LUDUS Orange (Enhanced for dark backgrounds) */
--dark-ludus-orange: #FF7A1A;    /* Slightly brighter for visibility */
--dark-ludus-orange-light: #FF9933;
--dark-ludus-orange-dark: #E55A00;
--dark-ludus-orange-10: rgba(255, 122, 26, 0.1);
--dark-ludus-orange-20: rgba(255, 122, 26, 0.2);

/* Dark Theme Borders & Dividers */
--dark-border-primary: #404040;   /* Strong borders */
--dark-border-secondary: #2B2B2B; /* Subtle borders */
--dark-border-tertiary: #1A1A1A;  /* Very subtle borders */

/* Dark Theme Overlays */
--dark-overlay-light: rgba(0, 0, 0, 0.4);
--dark-overlay-medium: rgba(0, 0, 0, 0.6);
--dark-overlay-heavy: rgba(0, 0, 0, 0.8);
```

### Secondary Colors

```css
/* Accent Blue - Secondary Actions */
--accent-blue: #00ADEF;
--accent-blue-light: #33C1F2;
--accent-blue-dark: #0088BF;

/* Success Green */
--success-green: #10B981;
--success-light: #34D399;
--success-dark: #059669;

/* Warning Orange */
--warning-orange: #F59E0B;
--warning-light: #FBBF24;
--warning-dark: #D97706;

/* Error Red */
--error-red: #EF4444;
--error-light: #F87171;
--error-dark: #DC2626;
```

### Tailwind CSS Custom Colors

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Light theme colors
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
        
        // Dark theme colors
        dark: {
          bg: {
            primary: '#0F0F0F',
            secondary: '#1A1A1A',
            tertiary: '#2B2B2B',
            quaternary: '#404040',
          },
          text: {
            primary: '#FFFFFF',
            secondary: '#E0E0E0',
            tertiary: '#B0B0B0',
            disabled: '#6B7280',
          },
          ludus: {
            orange: '#FF7A1A',
            'orange-light': '#FF9933',
            'orange-dark': '#E55A00',
          },
          border: {
            primary: '#404040',
            secondary: '#2B2B2B',
            tertiary: '#1A1A1A',
          }
        }
      }
    }
  }
}
```

### Theme Configuration

```javascript
// utils/theme.js - Theme management utility
export const themeConfig = {
  light: {
    background: {
      primary: '#FAFAFA',
      secondary: '#FFFFFF',
      tertiary: '#F5F5F5',
    },
    text: {
      primary: '#2B2B2B',
      secondary: '#404040',
      tertiary: '#6B7280',
    },
    brand: {
      primary: '#FF6600',
      secondary: '#FF8533',
    }
  },
  dark: {
    background: {
      primary: '#0F0F0F',
      secondary: '#1A1A1A',
      tertiary: '#2B2B2B',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#E0E0E0',
      tertiary: '#B0B0B0',
    },
    brand: {
      primary: '#FF7A1A',
      secondary: '#FF9933',
    }
  }
};
```

---

## Typography

### Primary Font: Inter
**Source**: Google Fonts  
**Weights**: 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)

### Font Scale & Usage

```css
/* Headings */
.heading-xl {
  font-size: 2.5rem; /* 40px */
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.heading-lg {
  font-size: 2rem; /* 32px */
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.01em;
}

.heading-md {
  font-size: 1.5rem; /* 24px */
  font-weight: 600;
  line-height: 1.33;
}

.heading-sm {
  font-size: 1.25rem; /* 20px */
  font-weight: 600;
  line-height: 1.4;
}

.heading-xs {
  font-size: 1.125rem; /* 18px */
  font-weight: 600;
  line-height: 1.44;
}

/* Body Text */
.body-lg {
  font-size: 1.125rem; /* 18px */
  font-weight: 400;
  line-height: 1.56;
}

.body-md {
  font-size: 1rem; /* 16px */
  font-weight: 400;
  line-height: 1.5;
}

.body-sm {
  font-size: 0.875rem; /* 14px */
  font-weight: 400;
  line-height: 1.43;
}

.body-xs {
  font-size: 0.75rem; /* 12px */
  font-weight: 400;
  line-height: 1.5;
}

/* Labels & Captions */
.label-lg {
  font-size: 1rem; /* 16px */
  font-weight: 500;
  line-height: 1.5;
}

.label-md {
  font-size: 0.875rem; /* 14px */
  font-weight: 500;
  line-height: 1.43;
}

.label-sm {
  font-size: 0.75rem; /* 12px */
  font-weight: 500;
  line-height: 1.5;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

### Tailwind Typography Classes

```javascript
// Custom Tailwind typography utilities
.text-display-xl { @apply text-4xl font-bold leading-tight tracking-tight; }
.text-display-lg { @apply text-3xl font-semibold leading-tight tracking-tight; }
.text-display-md { @apply text-2xl font-semibold leading-tight; }
.text-display-sm { @apply text-xl font-semibold leading-normal; }
.text-display-xs { @apply text-lg font-semibold leading-normal; }

.text-body-lg { @apply text-lg font-normal leading-relaxed; }
.text-body-md { @apply text-base font-normal leading-normal; }
.text-body-sm { @apply text-sm font-normal leading-normal; }
.text-body-xs { @apply text-xs font-normal leading-normal; }

.text-label-lg { @apply text-base font-medium leading-normal; }
.text-label-md { @apply text-sm font-medium leading-normal; }
.text-label-sm { @apply text-xs font-medium leading-normal uppercase tracking-wider; }
```

---

## Component Library

### Buttons

#### Primary Button (Theme-Aware)
```jsx
// Primary Button Component with Dark Theme Support
const PrimaryButton = ({ children, size = 'md', disabled = false, ...props }) => {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };

  return (
    <button
      className={`
        bg-ludus-orange hover:bg-ludus-orange-dark 
        dark:bg-dark-ludus-orange dark:hover:bg-dark-ludus-orange-dark
        text-white font-semibold rounded-xl
        transition-all duration-200 ease-in-out
        active:scale-95 shadow-lg hover:shadow-xl
        dark:shadow-dark-bg-tertiary dark:hover:shadow-dark-bg-quaternary
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
```

#### Secondary Button (Theme-Aware)
```jsx
const SecondaryButton = ({ children, size = 'md', ...props }) => {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };

  return (
    <button
      className={`
        bg-white border-2 border-ludus-orange text-ludus-orange
        hover:bg-ludus-orange hover:text-white
        dark:bg-dark-bg-secondary dark:border-dark-ludus-orange dark:text-dark-ludus-orange
        dark:hover:bg-dark-ludus-orange dark:hover:text-white
        font-semibold rounded-xl transition-all duration-200
        ${sizeClasses[size]}
      `}
      {...props}
    >
      {children}
    </button>
  );
};
```

#### Ghost Button
```jsx
const GhostButton = ({ children, size = 'md', ...props }) => (
  <button
    className={`
      bg-transparent text-charcoal hover:bg-warm-light
      font-medium rounded-xl transition-all duration-200
      ${sizeClasses[size]}
    `}
    {...props}
  >
    {children}
  </button>
);
```

### Cards

#### Activity Card
```jsx
const ActivityCard = ({ activity, onBook, onSave }) => (
  <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
    {/* Image */}
    <div className="relative h-48 bg-warm overflow-hidden">
      <img 
        src={activity.image} 
        alt={activity.title}
        className="w-full h-full object-cover"
      />
      <button 
        onClick={onSave}
        className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
      >
        <HeartIcon className="w-5 h-5" />
      </button>
    </div>

    {/* Content */}
    <div className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="px-2 py-1 bg-ludus-orange-10 text-ludus-orange text-xs font-medium rounded-full">
          {activity.category}
        </span>
        <div className="flex items-center text-xs text-gray-500">
          <LocationIcon className="w-3 h-3 mr-1" />
          {activity.location}
        </div>
      </div>

      <h3 className="text-lg font-semibold text-charcoal mb-2 line-clamp-2">
        {activity.title}
      </h3>

      <div className="flex items-center justify-between">
        <div className="text-lg font-bold text-ludus-orange">
          {activity.price} SAR
        </div>
        <PrimaryButton size="sm" onClick={onBook}>
          Join
        </PrimaryButton>
      </div>
    </div>
  </div>
);
```

### Input Components

#### Text Input
```jsx
const TextInput = ({ label, error, ...props }) => (
  <div className="space-y-2">
    {label && (
      <label className="block text-sm font-medium text-charcoal">
        {label}
      </label>
    )}
    <input
      className={`
        w-full px-4 py-3 rounded-xl border-2 
        bg-white text-charcoal placeholder-gray-400
        focus:outline-none focus:ring-2 focus:ring-ludus-orange/20 
        transition-colors duration-200
        ${error 
          ? 'border-error-red focus:border-error-red' 
          : 'border-warm focus:border-ludus-orange'
        }
      `}
      {...props}
    />
    {error && (
      <p className="text-sm text-error-red">{error}</p>
    )}
  </div>
);
```

#### Search Input
```jsx
const SearchInput = ({ placeholder = "Search activities...", ...props }) => (
  <div className="relative">
    <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
    <input
      className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-warm 
                 focus:border-ludus-orange focus:outline-none focus:ring-2 
                 focus:ring-ludus-orange/20 bg-white text-charcoal"
      placeholder={placeholder}
      {...props}
    />
  </div>
);
```

### Navigation

#### Bottom Navigation (Mobile)
```jsx
const BottomNav = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'discover', icon: CompassIcon, label: 'Discover' },
    { id: 'activities', icon: CalendarIcon, label: 'Activities' },
    { id: 'bookings', icon: TicketIcon, label: 'Bookings' },
    { id: 'profile', icon: UserIcon, label: 'Profile' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-warm z-50">
      <div className="flex items-center justify-around py-2">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors
              ${activeTab === id 
                ? 'text-ludus-orange bg-ludus-orange-10' 
                : 'text-gray-500 hover:text-charcoal'
              }`}
          >
            <Icon className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};
```

### Filters & Tags

#### Filter Chip
```jsx
const FilterChip = ({ label, active, onClick, icon: Icon }) => (
  <button
    onClick={onClick}
    className={`
      inline-flex items-center gap-2 px-4 py-2 rounded-full
      font-medium text-sm transition-all duration-200
      ${active 
        ? 'bg-ludus-orange text-white shadow-lg' 
        : 'bg-white text-charcoal border border-warm hover:border-ludus-orange'
      }
    `}
  >
    {Icon && <Icon className="w-4 h-4" />}
    {label}
  </button>
);
```

---

## Layout & Spacing

### Grid System
```css
/* Container sizes */
.container-sm { max-width: 640px; }
.container-md { max-width: 768px; }
.container-lg { max-width: 1024px; }
.container-xl { max-width: 1280px; }

/* Spacing scale (based on 4px) */
.space-1 { margin: 0.25rem; }  /* 4px */
.space-2 { margin: 0.5rem; }   /* 8px */
.space-3 { margin: 0.75rem; }  /* 12px */
.space-4 { margin: 1rem; }     /* 16px */
.space-5 { margin: 1.25rem; }  /* 20px */
.space-6 { margin: 1.5rem; }   /* 24px */
.space-8 { margin: 2rem; }     /* 32px */
.space-10 { margin: 2.5rem; }  /* 40px */
.space-12 { margin: 3rem; }    /* 48px */
```

### Page Layouts

#### Mobile Layout
```jsx
const MobileLayout = ({ children }) => (
  <div className="min-h-screen bg-soft-white">
    {/* Header */}
    <header className="sticky top-0 z-40 bg-white border-b border-warm px-4 py-3">
      <div className="flex items-center justify-between">
        <button className="p-2 -ml-2">
          <MenuIcon className="w-6 h-6" />
        </button>
        <img src="/logo.svg" alt="LUDUS" className="h-8" />
        <button className="p-2 -mr-2">
          <BellIcon className="w-6 h-6" />
        </button>
      </div>
    </header>

    {/* Main Content */}
    <main className="pb-20">
      {children}
    </main>

    {/* Bottom Navigation */}
    <BottomNav />
  </div>
);
```

---

## Icons & Imagery

### Icon System
**Library**: Heroicons (outline & solid)  
**Size Scale**: 16px, 20px, 24px, 32px  
**Color**: Inherit from parent or text-gray-500 default

```jsx
// Icon usage examples
<CompassIcon className="w-5 h-5 text-ludus-orange" />
<CalendarIcon className="w-6 h-6 text-charcoal" />
<UserIcon className="w-4 h-4 text-gray-500" />
```

### Category Icons
```jsx
const CategoryIcons = {
  sports: () => <div className="w-8 h-8 bg-ludus-orange rounded-full flex items-center justify-center">⚽</div>,
  music: () => <div className="w-8 h-8 bg-accent-blue rounded-full flex items-center justify-center">🎵</div>,
  art: () => <div className="w-8 h-8 bg-success-green rounded-full flex items-center justify-center">🎨</div>,
  food: () => <div className="w-8 h-8 bg-warning-orange rounded-full flex items-center justify-center">🍴</div>,
};
```

### Image Guidelines
- **Aspect Ratios**: 16:9 (hero), 4:3 (cards), 1:1 (avatars)
- **Quality**: High-resolution, authentic photos
- **Style**: Natural lighting, genuine moments, diverse representation
- **Compression**: WebP format preferred, fallback to JPEG

---

## Mobile-First Responsive Design

### Breakpoint System
```javascript
// Tailwind breakpoints
const breakpoints = {
  sm: '640px',   // Small tablets
  md: '768px',   // Tablets
  lg: '1024px',  // Laptops
  xl: '1280px',  // Desktops
  '2xl': '1536px' // Large screens
};
```

### Responsive Patterns

#### Mobile-First Activity Grid
```jsx
const ActivityGrid = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
    {activities.map(activity => (
      <ActivityCard key={activity.id} activity={activity} />
    ))}
  </div>
);
```

#### Responsive Typography
```css
.responsive-heading {
  @apply text-2xl sm:text-3xl lg:text-4xl font-bold;
}

.responsive-body {
  @apply text-sm sm:text-base lg:text-lg;
}
```

---

## RTL Support

### RTL Configuration
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      // RTL-aware spacing
      spacing: {
        'rtl-4': 'var(--spacing-4)',
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwindcss-rtl'),
  ]
}
```

### RTL Component Examples
```jsx
// RTL-aware component
const RTLCard = ({ title, content, dir = 'ltr' }) => (
  <div 
    className={`p-4 rounded-xl bg-white ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
    dir={dir}
  >
    <h3 className="font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{content}</p>
  </div>
);

// RTL-aware layout
const RTLLayout = ({ children, isRTL }) => (
  <div className={`${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
    {children}
  </div>
);
```

### Arabic Typography
```css
/* Arabic font optimization */
.arabic-text {
  font-family: 'Noto Sans Arabic', 'Inter', sans-serif;
  line-height: 1.6;
  letter-spacing: normal;
}

.arabic-heading {
  font-weight: 600;
  line-height: 1.4;
}
```

---

## Dark Theme Implementation

### Theme Toggle Component

```jsx
// ThemeToggle.jsx - Theme switcher component
import React, { useState, useEffect } from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDark(shouldUseDark);
    
    // Apply theme to document
    if (shouldUseDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="
        p-2 rounded-xl transition-colors duration-200
        bg-warm hover:bg-warm-dark
        dark:bg-dark-bg-tertiary dark:hover:bg-dark-bg-quaternary
        text-charcoal dark:text-dark-text-primary
      "
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <SunIcon className="w-5 h-5" />
      ) : (
        <MoonIcon className="w-5 h-5" />
      )}
    </button>
  );
};
```

### Dark Theme Card Component

```jsx
// ActivityCard with full dark theme support
const ActivityCard = ({ activity, onBook, onSave }) => (
  <div className="
    bg-white dark:bg-dark-bg-secondary 
    rounded-2xl shadow-lg hover:shadow-xl 
    dark:shadow-dark-bg-tertiary dark:hover:shadow-dark-bg-quaternary
    transition-shadow duration-300 overflow-hidden
    border border-transparent dark:border-dark-border-secondary
  ">
    {/* Image */}
    <div className="relative h-48 bg-warm dark:bg-dark-bg-tertiary overflow-hidden">
      <img 
        src={activity.image} 
        alt={activity.title}
        className="w-full h-full object-cover"
      />
      <button 
        onClick={onSave}
        className="
          absolute top-4 right-4 p-2 
          bg-white/80 dark:bg-dark-bg-secondary/80 
          backdrop-blur-sm rounded-full 
          hover:bg-white dark:hover:bg-dark-bg-secondary 
          transition-colors
        "
      >
        <HeartIcon className="w-5 h-5 text-charcoal dark:text-dark-text-primary" />
      </button>
    </div>

    {/* Content */}
    <div className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="
          px-2 py-1 
          bg-ludus-orange-10 dark:bg-dark-ludus-orange-10 
          text-ludus-orange dark:text-dark-ludus-orange 
          text-xs font-medium rounded-full
        ">
          {activity.category}
        </span>
        <div className="flex items-center text-xs text-gray-500 dark:text-dark-text-tertiary">
          <LocationIcon className="w-3 h-3 mr-1" />
          {activity.location}
        </div>
      </div>

      <h3 className="
        text-lg font-semibold 
        text-charcoal dark:text-dark-text-primary 
        mb-2 line-clamp-2
      ">
        {activity.title}
      </h3>

      <div className="flex items-center justify-between">
        <div className="
          text-lg font-bold 
          text-ludus-orange dark:text-dark-ludus-orange
        ">
          {activity.price} SAR
        </div>
        <PrimaryButton size="sm" onClick={onBook}>
          Join
        </PrimaryButton>
      </div>
    </div>
  </div>
);
```

### Dark Theme Input Components

```jsx
// TextInput with dark theme support
const TextInput = ({ label, error, ...props }) => (
  <div className="space-y-2">
    {label && (
      <label className="
        block text-sm font-medium 
        text-charcoal dark:text-dark-text-primary
      ">
        {label}
      </label>
    )}
    <input
      className={`
        w-full px-4 py-3 rounded-xl border-2 
        bg-white dark:bg-dark-bg-secondary 
        text-charcoal dark:text-dark-text-primary 
        placeholder-gray-400 dark:placeholder-dark-text-tertiary
        focus:outline-none focus:ring-2 focus:ring-ludus-orange/20 
        dark:focus:ring-dark-ludus-orange/20
        transition-colors duration-200
        ${error 
          ? 'border-error-red focus:border-error-red' 
          : 'border-warm dark:border-dark-border-secondary focus:border-ludus-orange dark:focus:border-dark-ludus-orange'
        }
      `}
      {...props}
    />
    {error && (
      <p className="text-sm text-error-red">{error}</p>
    )}
  </div>
);
```

### Dark Theme Layout

```jsx
// App layout with theme support
const AppLayout = ({ children }) => (
  <div className="
    min-h-screen 
    bg-soft-white dark:bg-dark-bg-primary
    text-charcoal dark:text-dark-text-primary
    transition-colors duration-300
  ">
    {/* Header */}
    <header className="
      sticky top-0 z-40 
      bg-white dark:bg-dark-bg-secondary 
      border-b border-warm dark:border-dark-border-secondary 
      px-4 py-3
    ">
      <div className="flex items-center justify-between">
        <button className="p-2 -ml-2">
          <MenuIcon className="w-6 h-6 text-charcoal dark:text-dark-text-primary" />
        </button>
        <img src="/logo.svg" alt="LUDUS" className="h-8" />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button className="p-2 -mr-2">
            <BellIcon className="w-6 h-6 text-charcoal dark:text-dark-text-primary" />
          </button>
        </div>
      </div>
    </header>

    {/* Main Content */}
    <main className="pb-20">
      {children}
    </main>
  </div>
);
```

### CSS Variables Integration

```css
/* globals.css - CSS variables for theme switching */
:root {
  /* Light theme variables */
  --bg-primary: #FAFAFA;
  --bg-secondary: #FFFFFF;
  --text-primary: #2B2B2B;
  --text-secondary: #404040;
  --border-primary: #EEEEEE;
  --ludus-orange: #FF6600;
}

.dark {
  /* Dark theme variables */
  --bg-primary: #0F0F0F;
  --bg-secondary: #1A1A1A;
  --text-primary: #FFFFFF;
  --text-secondary: #E0E0E0;
  --border-primary: #404040;
  --ludus-orange: #FF7A1A;
}

/* Usage in components */
.themed-component {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border-color: var(--border-primary);
}
```

---

## Interaction & Animation

### Animation System Overview
**Philosophy**: Purposeful, delightful, and performance-focused animations that enhance user experience without overwhelming  
**Timing**: 200ms for micro-interactions, 300-500ms for transitions, 800ms+ for complex sequences  
**Easing**: Custom cubic-bezier curves for natural movement patterns

### Advanced Micro-Interactions

```css
/* Enhanced button interactions */
.btn-ludus {
  @apply relative overflow-hidden transition-all duration-200 ease-out;
  transform: translateZ(0); /* Hardware acceleration */
}

.btn-ludus:hover {
  @apply shadow-xl scale-105;
  box-shadow: 0 20px 25px -5px rgba(255, 102, 0, 0.15);
}

.btn-ludus:active {
  @apply scale-95;
  transition-duration: 100ms;
}

/* Ripple effect */
.btn-ludus::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.btn-ludus:active::before {
  width: 300px;
  height: 300px;
}

/* Floating animation */
.float-animation {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

/* Pulse animation */
.pulse-ludus {
  animation: pulse-ludus 2s infinite;
}

@keyframes pulse-ludus {
  0%, 100% { 
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 102, 0, 0.7);
  }
  50% { 
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(255, 102, 0, 0);
  }
}

/* Shimmer loading effect */
.shimmer {
  position: relative;
  overflow: hidden;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Dark theme shimmer */
.dark .shimmer {
  background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
  background-size: 200% 100%;
}
```

### Glass Morphism & Backdrop Effects

```css
/* Glass morphism base */
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}

/* Dark theme glass */
.dark .glass {
  background: rgba(26, 26, 26, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5);
}

/* LUDUS branded glass */
.glass-ludus {
  background: rgba(255, 102, 0, 0.1);
  backdrop-filter: blur(12px) saturate(1.8);
  -webkit-backdrop-filter: blur(12px) saturate(1.8);
  border: 1px solid rgba(255, 102, 0, 0.2);
  box-shadow: 
    0 8px 32px 0 rgba(255, 102, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* Frosted glass navigation */
.nav-glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px) saturate(1.8);
  -webkit-backdrop-filter: blur(20px) saturate(1.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
}

.dark .nav-glass {
  background: rgba(15, 15, 15, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.3);
}
```

### Advanced Card Animations

```jsx
// Enhanced Activity Card with advanced effects
const ActivityCard = ({ activity, onBook, onSave, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ 
      duration: 0.5, 
      delay: index * 0.1,
      ease: [0.25, 0.46, 0.45, 0.94] 
    }}
    whileHover={{ 
      y: -8,
      scale: 1.02,
      transition: { duration: 0.2 } 
    }}
    whileTap={{ scale: 0.98 }}
    className="
      group relative overflow-hidden rounded-2xl
      bg-white dark:bg-dark-bg-secondary
      shadow-lg hover:shadow-2xl
      border border-transparent dark:border-dark-border-secondary
      transition-all duration-300 ease-out
      backdrop-blur-sm
    "
  >
    {/* Image with parallax effect */}
    <div className="relative h-48 overflow-hidden">
      <motion.img 
        src={activity.image} 
        alt={activity.title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.7 }}
      />
      
      {/* Gradient overlay */}
      <div className="
        absolute inset-0 
        bg-gradient-to-t from-black/20 via-transparent to-transparent
        opacity-0 group-hover:opacity-100
        transition-opacity duration-300
      " />
      
      {/* Floating save button */}
      <motion.button 
        onClick={onSave}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="
          absolute top-4 right-4 p-3
          glass-ludus rounded-full
          text-white shadow-lg
          transition-all duration-200
        "
      >
        <HeartIcon className="w-5 h-5" />
      </motion.button>
      
      {/* Category badge with slide animation */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="
          absolute bottom-4 left-4
          px-3 py-1 glass rounded-full
          text-xs font-medium text-white
        "
      >
        {activity.category}
      </motion.div>
    </div>

    {/* Content with stagger animation */}
    <motion.div 
      className="p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <h3 className="
        text-lg font-semibold mb-2 line-clamp-2
        text-charcoal dark:text-dark-text-primary
        group-hover:text-ludus-orange dark:group-hover:text-dark-ludus-orange
        transition-colors duration-200
      ">
        {activity.title}
      </h3>

      <div className="flex items-center justify-between">
        <motion.div 
          className="text-lg font-bold text-ludus-orange dark:text-dark-ludus-orange"
          whileHover={{ scale: 1.05 }}
        >
          {activity.price} SAR
        </motion.div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBook}
          className="
            px-4 py-2 bg-ludus-orange hover:bg-ludus-orange-dark
            text-white font-semibold rounded-xl
            shadow-lg hover:shadow-xl
            transition-all duration-200
          "
        >
          Join
        </motion.button>
      </div>
    </motion.div>
  </motion.div>
);
```

### Loading Animations

```jsx
// Skeleton loading with shimmer
const SkeletonLoader = ({ className = "" }) => (
  <div className={`shimmer rounded-xl ${className}`}>
    <div className="animate-pulse">
      <div className="h-48 bg-gray-200 dark:bg-dark-bg-tertiary rounded-t-xl" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-dark-bg-tertiary rounded w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-dark-bg-tertiary rounded w-1/2" />
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 dark:bg-dark-bg-tertiary rounded w-20" />
          <div className="h-8 bg-gray-200 dark:bg-dark-bg-tertiary rounded w-16" />
        </div>
      </div>
    </div>
  </div>
);

// Spinner with LUDUS branding
const LudusSpinner = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} relative`}>
      <div className="
        absolute inset-0 rounded-full
        border-2 border-ludus-orange/20 dark:border-dark-ludus-orange/20
      " />
      <div className="
        absolute inset-0 rounded-full
        border-2 border-transparent border-t-ludus-orange dark:border-t-dark-ludus-orange
        animate-spin
      " />
    </div>
  );
};

// Progress bar with gradient
const ProgressBar = ({ progress, animated = true }) => (
  <div className="w-full bg-warm dark:bg-dark-bg-tertiary rounded-full h-2 overflow-hidden">
    <motion.div
      className="
        h-full bg-gradient-to-r from-ludus-orange to-ludus-orange-light
        dark:from-dark-ludus-orange dark:to-dark-ludus-orange-light
        rounded-full
      "
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: animated ? 0.5 : 0 }}
    />
  </div>
);
```

### Page Transitions & Route Animations

```jsx
// Enhanced page transitions
const PageTransition = ({ children, direction = 'up' }) => {
  const variants = {
    up: {
      initial: { opacity: 0, y: 50 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -50 }
    },
    slide: {
      initial: { opacity: 0, x: 100 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -100 }
    },
    scale: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.1 }
    }
  };

  return (
    <motion.div
      initial={variants[direction].initial}
      animate={variants[direction].animate}
      exit={variants[direction].exit}
      transition={{ 
        duration: 0.4, 
        ease: [0.25, 0.46, 0.45, 0.94] 
      }}
    >
      {children}
    </motion.div>
  );
};

// Modal with backdrop animation
const AnimatedModal = ({ isOpen, onClose, children }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        />
        
        {/* Modal content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          transition={{ 
            type: "spring",
            damping: 25,
            stiffness: 300 
          }}
          className="
            fixed inset-4 z-50 md:inset-auto md:top-1/2 md:left-1/2 
            md:-translate-x-1/2 md:-translate-y-1/2
            max-w-md w-full mx-auto
            glass rounded-2xl p-6
          "
        >
          {children}
        </motion.div>
      </>
    )}
  </AnimatePresence>
);
```

### Scroll-Based Animations & Parallax

```jsx
// Intersection Observer hook for scroll animations
const useInView = (threshold = 0.1) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isInView];
};

// Scroll-triggered animation component
const ScrollReveal = ({ children, direction = 'up', delay = 0 }) => {
  const [ref, isInView] = useInView(0.2);
  
  const variants = {
    up: { y: 50, opacity: 0 },
    down: { y: -50, opacity: 0 },
    left: { x: -50, opacity: 0 },
    right: { x: 50, opacity: 0 },
    scale: { scale: 0.8, opacity: 0 }
  };

  return (
    <motion.div
      ref={ref}
      initial={variants[direction]}
      animate={isInView ? { x: 0, y: 0, scale: 1, opacity: 1 } : variants[direction]}
      transition={{ 
        duration: 0.6,
        delay: isInView ? delay : 0,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      {children}
    </motion.div>
  );
};

// Parallax section component
const ParallaxSection = ({ children, speed = 0.5, className = "" }) => {
  const [offsetY, setOffsetY] = useState(0);
  const ref = useRef();

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const scrolled = window.pageYOffset;
        const parallax = scrolled * speed;
        setOffsetY(parallax);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: `translateY(${offsetY}px)`,
        willChange: 'transform'
      }}
    >
      {children}
    </div>
  );
};

// Stagger animation for lists
const StaggerContainer = ({ children, staggerDelay = 0.1 }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={{
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: staggerDelay
        }
      }
    }}
  >
    {children}
  </motion.div>
);

const StaggerItem = ({ children, direction = 'up' }) => {
  const variants = {
    up: { y: 20, opacity: 0 },
    down: { y: -20, opacity: 0 },
    left: { x: -20, opacity: 0 },
    right: { x: 20, opacity: 0 }
  };

  return (
    <motion.div
      variants={{
        hidden: variants[direction],
        visible: { x: 0, y: 0, opacity: 1 }
      }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
};
```

### Interactive UI Patterns

```jsx
// Floating Action Button with magnetic effect
const FloatingActionButton = ({ onClick, icon: Icon, notifications = 0 }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    setMousePosition({
      x: (e.clientX - centerX) * 0.3,
      y: (e.clientY - centerY) * 0.3
    });
  };

  return (
    <motion.button
      className="
        fixed bottom-6 right-6 z-50
        w-14 h-14 bg-ludus-orange hover:bg-ludus-orange-dark
        dark:bg-dark-ludus-orange dark:hover:bg-dark-ludus-orange-dark
        rounded-full shadow-lg hover:shadow-2xl
        flex items-center justify-center
        text-white
      "
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePosition({ x: 0, y: 0 });
      }}
      animate={{
        x: mousePosition.x,
        y: mousePosition.y,
        scale: isHovered ? 1.1 : 1
      }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Icon className="w-6 h-6" />
      
      {notifications > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="
            absolute -top-2 -right-2
            w-6 h-6 bg-error-red
            rounded-full flex items-center justify-center
            text-xs font-bold text-white
          "
        >
          {notifications > 99 ? '99+' : notifications}
        </motion.div>
      )}
    </motion.button>
  );
};

// Swipeable card component
const SwipeableCard = ({ children, onSwipeLeft, onSwipeRight, className = "" }) => {
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });
  
  const handleDragEnd = (event, info) => {
    const swipeThreshold = 100;
    
    if (info.offset.x > swipeThreshold && onSwipeRight) {
      onSwipeRight();
    } else if (info.offset.x < -swipeThreshold && onSwipeLeft) {
      onSwipeLeft();
    }
  };

  return (
    <motion.div
      className={`cursor-grab active:cursor-grabbing ${className}`}
      drag="x"
      dragConstraints={dragConstraints}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05, rotate: info => info.offset.x / 10 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {children}
    </motion.div>
  );
};

// Progressive image loading with blur effect
const ProgressiveImage = ({ src, placeholder, alt, className = "" }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(placeholder);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setImageLoaded(true);
    };
    img.src = src;
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.img
        src={imageSrc}
        alt={alt}
        className="w-full h-full object-cover"
        initial={{ filter: "blur(10px)", scale: 1.1 }}
        animate={{ 
          filter: imageLoaded ? "blur(0px)" : "blur(10px)",
          scale: imageLoaded ? 1 : 1.1
        }}
        transition={{ duration: 0.5 }}
      />
      
      {!imageLoaded && (
        <div className="
          absolute inset-0 
          flex items-center justify-center
          bg-warm dark:bg-dark-bg-tertiary
        ">
          <LudusSpinner size="md" />
        </div>
      )}
    </div>
  );
};
```

### Advanced Gesture Interactions

```jsx
// Multi-touch gesture handler
const GestureHandler = ({ children, onPinch, onRotate, onSwipe }) => {
  const [gestures, setGestures] = useState({
    scale: 1,
    rotation: 0,
    x: 0,
    y: 0
  });

  return (
    <motion.div
      style={{
        scale: gestures.scale,
        rotate: gestures.rotation,
        x: gestures.x,
        y: gestures.y
      }}
      onPan={(event, info) => {
        setGestures(prev => ({
          ...prev,
          x: prev.x + info.delta.x,
          y: prev.y + info.delta.y
        }));
      }}
      onPinch={(event, info) => {
        setGestures(prev => ({
          ...prev,
          scale: Math.max(0.5, Math.min(3, prev.scale * info.scale))
        }));
        onPinch?.(info);
      }}
      className="touch-none select-none"
    >
      {children}
    </motion.div>
  );
};

// Pull-to-refresh component
const PullToRefresh = ({ onRefresh, children }) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const refreshThreshold = 80;

  const handleDrag = (event, info) => {
    if (window.scrollY === 0 && info.offset.y > 0) {
      setIsPulling(true);
      setPullDistance(Math.min(info.offset.y, refreshThreshold * 1.5));
    }
  };

  const handleDragEnd = (event, info) => {
    if (pullDistance >= refreshThreshold) {
      onRefresh();
    }
    setIsPulling(false);
    setPullDistance(0);
  };

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      style={{ y: isPulling ? pullDistance * 0.5 : 0 }}
    >
      {/* Pull indicator */}
      <motion.div
        className="
          absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full
          flex items-center justify-center
          w-8 h-8 rounded-full
          bg-ludus-orange dark:bg-dark-ludus-orange
          text-white
        "
        animate={{
          opacity: isPulling ? 1 : 0,
          rotate: pullDistance >= refreshThreshold ? 180 : 0
        }}
      >
        <ArrowDownIcon className="w-4 h-4" />
      </motion.div>
      
      {children}
    </motion.div>
  );
};
```

### Performance Optimization

```css
/* GPU acceleration utilities */
.gpu-accelerated {
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}

/* Optimized animations */
.optimized-animation {
  will-change: transform, opacity;
}

.optimized-animation:not(:hover):not(:focus):not(:active) {
  will-change: auto;
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .glass {
    background: rgba(255, 255, 255, 0.9);
    border: 2px solid currentColor;
  }
  
  .dark .glass {
    background: rgba(0, 0, 0, 0.9);
  }
}
```

### Animation Configuration

```javascript
// framer-motion.config.js
export const springConfig = {
  type: "spring",
  stiffness: 300,
  damping: 30
};

export const easeConfig = {
  duration: 0.3,
  ease: [0.25, 0.46, 0.45, 0.94]
};

export const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};
```

### Unsplash API Integration

```javascript
// services/unsplash.js - Unsplash service utilities
class UnsplashService {
  constructor(accessKey, secretKey) {
    this.accessKey = accessKey;
    this.secretKey = secretKey;
    this.baseURL = 'https://api.unsplash.com';
  }

  // Get category-specific images for activities
  async getActivityImages(category, count = 20, orientation = 'landscape') {
    const categoryMap = {
      sports: 'sports,fitness,outdoor,activity',
      music: 'music,concert,instrument,performance',
      art: 'art,creative,painting,gallery',
      food: 'food,restaurant,cooking,dining',
      technology: 'technology,coding,computer,innovation',
      travel: 'travel,adventure,explore,journey',
      wellness: 'wellness,yoga,meditation,health'
    };

    const query = categoryMap[category] || category;
    
    try {
      const response = await fetch(
        `${this.baseURL}/search/photos?query=${query}&per_page=${count}&orientation=${orientation}&client_id=${this.accessKey}`
      );
      const data = await response.json();
      
      return data.results.map(photo => ({
        id: photo.id,
        urls: {
          thumb: photo.urls.thumb,
          small: photo.urls.small,
          regular: photo.urls.regular,
          full: photo.urls.full
        },
        alt: photo.alt_description || photo.description,
        blurHash: photo.blur_hash,
        color: photo.color,
        user: {
          name: photo.user.name,
          username: photo.user.username,
          profileUrl: photo.user.links.html
        },
        downloadUrl: photo.links.download_location
      }));
    } catch (error) {
      console.error('Unsplash API error:', error);
      return [];
    }
  }

  // Get specific image by ID
  async getImageById(imageId) {
    try {
      const response = await fetch(
        `${this.baseURL}/photos/${imageId}?client_id=${this.accessKey}`
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching image:', error);
      return null;
    }
  }

  // Search images with specific keywords
  async searchImages(query, options = {}) {
    const {
      page = 1,
      perPage = 20,
      orientation = 'landscape',
      color = null,
      orderBy = 'relevant'
    } = options;

    const params = new URLSearchParams({
      query,
      page,
      per_page: perPage,
      orientation,
      order_by: orderBy,
      client_id: this.accessKey
    });

    if (color) params.append('color', color);

    try {
      const response = await fetch(`${this.baseURL}/search/photos?${params}`);
      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }

  // Track download for Unsplash API requirements
  async trackDownload(downloadUrl) {
    try {
      await fetch(`${downloadUrl}?client_id=${this.accessKey}`);
    } catch (error) {
      console.error('Download tracking error:', error);
    }
  }

  // Generate optimized URL for specific dimensions
  getOptimizedUrl(imageUrl, width, height, quality = 80) {
    return `${imageUrl}&w=${width}&h=${height}&q=${quality}&fit=crop&crop=faces,center`;
  }
}

// Initialize service with LUDUS credentials
export const unsplashService = new UnsplashService(
  process.env.REACT_APP_UNSPLASH_ACCESS_KEY || 'T4QQB3TTgpU4fhw_-JzAaTaO6X4IAgkckPrkwXDjRw0',
  process.env.REACT_APP_UNSPLASH_SECRET_KEY || 'HJDa9-_B3y0-giWPwJ6oOLtIdhq7UHdRugLGSSf8f6A'
);

// Application ID: 784371
// For development, you can also use direct initialization:
// export const unsplashService = new UnsplashService(
//   'T4QQB3TTgpU4fhw_-JzAaTaO6X4IAgkckPrkwXDjRw0',
//   'HJDa9-_B3y0-giWPwJ6oOLtIdhq7UHdRugLGSSf8f6A'
// );
```

### Enhanced Progressive Image Component

```jsx
// components/ui/ProgressiveImage.jsx - Enhanced with Unsplash
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Blurhash } from 'react-blurhash';

const ProgressiveImage = ({ 
  unsplashId, 
  src, 
  alt, 
  blurHash,
  className = "",
  width,
  height,
  category,
  onLoad,
  attribution = true
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      try {
        let finalSrc = src;
        let finalBlurHash = blurHash;
        let userData = null;

        // If unsplashId provided, fetch from Unsplash
        if (unsplashId && !src) {
          const data = await unsplashService.getImageById(unsplashId);
          if (data) {
            finalSrc = unsplashService.getOptimizedUrl(
              data.urls.regular, 
              width || 800, 
              height || 600
            );
            finalBlurHash = data.blur_hash;
            userData = data.user;
            setImageData(data);
          }
        }
        
        // If category provided, get random image
        if (category && !src && !unsplashId) {
          const images = await unsplashService.getActivityImages(category, 1);
          if (images.length > 0) {
            const image = images[0];
            finalSrc = width && height 
              ? unsplashService.getOptimizedUrl(image.urls.regular, width, height)
              : image.urls.regular;
            finalBlurHash = image.blurHash;
            userData = image.user;
            setImageData(image);
          }
        }

        if (finalSrc) {
          const img = new Image();
          img.onload = () => {
            setImageSrc(finalSrc);
            setImageLoaded(true);
            
            // Track download for Unsplash
            if (imageData?.downloadUrl) {
              unsplashService.trackDownload(imageData.downloadUrl);
            }
            
            onLoad?.(imageData);
          };
          img.onerror = () => setError(true);
          img.src = finalSrc;
        }
      } catch (err) {
        console.error('Image loading error:', err);
        setError(true);
      }
    };

    loadImage();
  }, [unsplashId, src, category, width, height]);

  if (error) {
    return (
      <div className={`bg-warm dark:bg-dark-bg-tertiary flex items-center justify-center ${className}`}>
        <div className="text-center p-4">
          <div className="w-12 h-12 bg-gray-300 dark:bg-dark-bg-quaternary rounded-full mx-auto mb-2 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-xs text-gray-500">Image unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* BlurHash placeholder */}
      {!imageLoaded && blurHash && (
        <Blurhash
          hash={blurHash}
          width="100%"
          height="100%"
          resolutionX={32}
          resolutionY={32}
          punch={1}
          className="absolute inset-0"
        />
      )}

      {/* Fallback gradient if no blurHash */}
      {!imageLoaded && !blurHash && (
        <div className="absolute inset-0 bg-gradient-to-br from-ludus-orange/20 to-ludus-orange-dark/20 dark:from-dark-ludus-orange/20 dark:to-dark-ludus-orange-dark/20">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-ludus-orange border-t-transparent dark:border-dark-ludus-orange" />
          </div>
        </div>
      )}

      {/* Main image */}
      {imageSrc && (
        <motion.img
          src={imageSrc}
          alt={alt || imageData?.alt || 'Activity image'}
          className="w-full h-full object-cover"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ 
            opacity: imageLoaded ? 1 : 0,
            scale: imageLoaded ? 1 : 1.1
          }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          onLoad={() => setImageLoaded(true)}
        />
      )}

      {/* Attribution overlay */}
      {attribution && imageData?.user && imageLoaded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="
            absolute bottom-2 right-2
            glass rounded-full px-2 py-1
            text-xs text-white
            opacity-0 group-hover:opacity-100
            transition-opacity duration-200
          "
        >
          <a 
            href={imageData.user.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            📷 {imageData.user.name}
          </a>
        </motion.div>
      )}
    </div>
  );
};

export default ProgressiveImage;
```

### Enhanced Activity Card with Unsplash

```jsx
// Enhanced Activity Card with Unsplash integration
const ActivityCard = ({ activity, onBook, onSave, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ 
      duration: 0.5, 
      delay: index * 0.1,
      ease: [0.25, 0.46, 0.45, 0.94] 
    }}
    whileHover={{ 
      y: -8,
      scale: 1.02,
      transition: { duration: 0.2 } 
    }}
    whileTap={{ scale: 0.98 }}
    className="
      group relative overflow-hidden rounded-2xl
      bg-white dark:bg-dark-bg-secondary
      shadow-lg hover:shadow-2xl
      border border-transparent dark:border-dark-border-secondary
      transition-all duration-300 ease-out
    "
  >
    {/* Enhanced image with Unsplash */}
    <div className="relative h-48 overflow-hidden">
      <ProgressiveImage
        unsplashId={activity.unsplashId}
        src={activity.image}
        category={activity.category}
        alt={activity.title}
        width={400}
        height={240}
        className="w-full h-full"
        attribution={false}
      />
      
      {/* Dynamic gradient overlay based on image colors */}
      <div className="
        absolute inset-0 
        bg-gradient-to-t from-black/50 via-transparent to-transparent
        opacity-0 group-hover:opacity-100
        transition-opacity duration-300
      " />
      
      {/* Floating save button with glass effect */}
      <motion.button 
        onClick={onSave}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="
          absolute top-4 right-4 p-3
          glass-ludus rounded-full
          text-white shadow-lg
          transition-all duration-200
        "
      >
        <HeartIcon className="w-5 h-5" />
      </motion.button>
      
      {/* Category badge */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="
          absolute bottom-4 left-4
          px-3 py-1 glass rounded-full
          text-xs font-medium text-white
        "
      >
        {activity.category}
      </motion.div>

      {/* Image quality indicator */}
      <div className="
        absolute top-4 left-4
        px-2 py-1 glass-ludus rounded-full
        text-xs font-medium text-white
        opacity-0 group-hover:opacity-100
        transition-opacity duration-200
      ">
        HD
      </div>
    </div>

    {/* Content remains the same */}
    <motion.div 
      className="p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <h3 className="
        text-lg font-semibold mb-2 line-clamp-2
        text-charcoal dark:text-dark-text-primary
        group-hover:text-ludus-orange dark:group-hover:text-dark-ludus-orange
        transition-colors duration-200
      ">
        {activity.title}
      </h3>

      <div className="flex items-center justify-between">
        <motion.div 
          className="text-lg font-bold text-ludus-orange dark:text-dark-ludus-orange"
          whileHover={{ scale: 1.05 }}
        >
          {activity.price} SAR
        </motion.div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBook}
          className="
            px-4 py-2 bg-ludus-orange hover:bg-ludus-orange-dark
            text-white font-semibold rounded-xl
            shadow-lg hover:shadow-xl
            transition-all duration-200
          "
        >
          Join
        </motion.button>
      </div>
    </motion.div>
  </motion.div>
);
```

### Unsplash Image Gallery Component

```jsx
// components/ui/UnsplashGallery.jsx - Gallery with lazy loading
const UnsplashGallery = ({ 
  category, 
  columns = 3, 
  onImageSelect,
  searchQuery = "" 
}) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadImages = async (pageNum = 1, isNew = false) => {
    setLoading(true);
    
    try {
      const newImages = searchQuery 
        ? await unsplashService.searchImages(searchQuery, { 
            page: pageNum, 
            perPage: 20 
          })
        : await unsplashService.getActivityImages(category, 20);

      if (isNew) {
        setImages(newImages);
      } else {
        setImages(prev => [...prev, ...newImages]);
      }
      
      setHasMore(newImages.length === 20);
    } catch (error) {
      console.error('Failed to load images:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages(1, true);
    setPage(1);
  }, [category, searchQuery]);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadImages(nextPage, false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Masonry grid */}
      <div 
        className={`grid gap-4`}
        style={{ 
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gridAutoRows: '200px'
        }}
      >
        <StaggerContainer>
          {images.map((image, index) => (
            <StaggerItem key={image.id} direction="up">
              <motion.div
                className="relative group cursor-pointer overflow-hidden rounded-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onImageSelect?.(image)}
                style={{
                  gridRowEnd: `span ${Math.ceil(Math.random() * 2) + 1}`
                }}
              >
                <ProgressiveImage
                  unsplashId={image.id}
                  alt={image.alt}
                  blurHash={image.blurHash}
                  className="w-full h-full"
                  attribution={true}
                />
                
                {/* Overlay on hover */}
                <div className="
                  absolute inset-0 
                  bg-gradient-to-t from-black/70 via-transparent to-transparent
                  opacity-0 group-hover:opacity-100
                  transition-opacity duration-200
                  flex items-end p-4
                ">
                  <div className="text-white">
                    <p className="text-sm font-medium">
                      Select Image
                    </p>
                  </div>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>

      {/* Load more button */}
      {hasMore && (
        <div className="flex justify-center">
          <motion.button
            onClick={loadMore}
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="
              px-6 py-3 bg-ludus-orange hover:bg-ludus-orange-dark
              disabled:opacity-50 disabled:cursor-not-allowed
              text-white font-semibold rounded-xl
              shadow-lg hover:shadow-xl
              transition-all duration-200
            "
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Loading...
              </div>
            ) : (
              'Load More Images'
            )}
          </motion.button>
        </div>
      )}
    </div>
  );
};
```

---

## Implementation Guidelines

### File Structure
```
src/
├── components/
│   ├── ui/           # Base UI components
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Card.jsx
│   │   └── index.js
│   ├── layout/       # Layout components
│   │   ├── Header.jsx
│   │   ├── BottomNav.jsx
│   │   └── Container.jsx
│   └── features/     # Feature-specific components
│       ├── activities/
│       ├── booking/
│       └── profile/
├── styles/
│   ├── globals.css   # Global styles & Tailwind imports
│   ├── components.css # Component-specific styles
│   └── rtl.css       # RTL-specific styles
└── utils/
    ├── cn.js         # Class name utility
    └── theme.js      # Theme configuration
```

### Code Standards

#### Component Template
```jsx
import React from 'react';
import { cn } from '@/utils/cn';

interface ComponentProps {
  className?: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export const Component = ({ 
  className, 
  children, 
  variant = 'primary',
  size = 'md',
  ...props 
}: ComponentProps) => {
  return (
    <div
      className={cn(
        'base-styles',
        {
          'variant-primary': variant === 'primary',
          'variant-secondary': variant === 'secondary',
          'size-sm': size === 'sm',
          'size-md': size === 'md',
          'size-lg': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
```

#### Utility Function
```javascript
// utils/cn.js - Class name utility
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

### Performance Considerations
- Use `React.memo` for expensive components
- Implement lazy loading for images and routes
- Optimize bundle size with tree shaking
- Use CSS-in-JS only when necessary
- Prefer Tailwind utilities over custom CSS

### Accessibility Guidelines
- Maintain WCAG 2.1 AA compliance
- Use semantic HTML elements
- Implement proper ARIA labels
- Ensure keyboard navigation
- Test with screen readers
- Maintain 4.5:1 color contrast ratio

---

## Quality Checklist

### Design Review
- [ ] Consistent spacing using 4px grid
- [ ] Proper color usage from defined palette
- [ ] Typography follows established scale
- [ ] Icons are properly sized and aligned
- [ ] Interactive elements have hover/focus states
- [ ] Mobile-first responsive design
- [ ] RTL layout support where needed

### Code Review
- [ ] Components follow naming conventions
- [ ] Proper TypeScript interfaces defined
- [ ] Accessibility attributes included  
- [ ] Performance optimizations applied
- [ ] Error states handled
- [ ] Loading states implemented
- [ ] Responsive breakpoints tested

### Testing
- [ ] Visual regression testing
- [ ] Cross-browser compatibility
- [ ] Mobile device testing
- [ ] RTL layout verification
- [ ] Accessibility audit
- [ ] Performance benchmarks
- [ ] User acceptance testing

---

*This design system serves as the foundation for all LUDUS UI components and should be regularly updated as the platform evolves.*