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

### Primary Colors

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
  theme: {
    extend: {
      colors: {
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
        }
      }
    }
  }
}
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

#### Primary Button
```jsx
// Primary Button Component
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
        text-white font-semibold rounded-xl
        transition-all duration-200 ease-in-out
        active:scale-95 shadow-lg hover:shadow-xl
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

#### Secondary Button
```jsx
const SecondaryButton = ({ children, size = 'md', ...props }) => (
  <button
    className={`
      bg-white border-2 border-ludus-orange text-ludus-orange
      hover:bg-ludus-orange hover:text-white
      font-semibold rounded-xl transition-all duration-200
      ${sizeClasses[size]}
    `}
    {...props}
  >
    {children}
  </button>
);
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

## Interaction & Animation

### Micro-Interactions
```css
/* Button press animation */
.btn-press {
  @apply transition-transform duration-100 ease-out active:scale-95;
}

/* Card hover effect */
.card-hover {
  @apply transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1;
}

/* Loading spinner */
.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

### Page Transitions
```jsx
// Using Framer Motion for page transitions
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);
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