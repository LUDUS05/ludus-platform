# LUDUS Translation System Guide

## Overview

The LUDUS platform now supports full Arabic (default) and English localization with automatic RTL/LTR layout switching. Arabic is set as the default language, and users can switch between languages using the language switcher component.

## Features

- **Arabic as Default**: The website loads in Arabic by default
- **RTL Support**: Automatic right-to-left layout for Arabic
- **Language Switching**: Easy toggle between Arabic and English
- **Comprehensive Coverage**: All UI elements are translated
- **Pluralization**: Proper Arabic pluralization rules
- **Fallback System**: Graceful fallback to Arabic if translations are missing

## File Structure

```
client/src/i18n/
├── index.js              # i18n configuration
├── locales/
│   ├── ar.json          # Arabic translations
│   └── en.json          # English translations
```

## Usage

### 1. Basic Translation

```jsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <p>{t('common.loading')}</p>
    </div>
  );
};
```

### 2. Language Switching

```jsx
import LanguageSwitcher from '../components/LanguageSwitcher';

const Header = () => {
  return (
    <header>
      <LanguageSwitcher />
      {/* Other header content */}
    </header>
  );
};
```

### 3. Pluralization

Arabic has complex pluralization rules that are automatically handled:

```jsx
// Arabic pluralization
t('activities.activity_0')     // "لا توجد أنشطة"
t('activities.activity_1')     // "نشاط واحد"
t('activities.activity_2')     // "نشاطان اثنان"
t('activities.activity_few', { count: 3 })    // "3 أنشطة"
t('activities.activity_many', { count: 10 })  // "10 نشاط"
t('activities.activity_other', { count: 25 }) // "25 نشاط"
```

### 4. Interpolation

```jsx
// With variables
t('user.registration.questions.lastName.question', { name: 'Ahmed' })
// Arabic: "واسم العائلة، Ahmed؟"
// English: "And your last name, Ahmed?"
```

## Translation Keys

### Common Actions
- `common.loading` - Loading text
- `common.save` - Save button
- `common.cancel` - Cancel button
- `common.delete` - Delete button
- `common.error` - Error message
- `common.success` - Success message

### Navigation
- `navigation.home` - Home link
- `navigation.activities` - Activities link
- `navigation.profile` - Profile link
- `navigation.wallet` - Wallet link
- `navigation.map` - Map link

### Authentication
- `auth.login` - Login text
- `auth.register` - Register text
- `auth.email` - Email field
- `auth.password` - Password field
- `auth.firstName` - First name field
- `auth.lastName` - Last name field

### Activities
- `activities.title` - Activities title
- `activities.search` - Search placeholder
- `activities.category` - Category label
- `activities.city` - City label
- `activities.priceRange` - Price range label

### Wallet
- `wallet.title` - Wallet title
- `wallet.balance` - Balance label
- `wallet.addFunds` - Add funds button
- `wallet.withdrawFunds` - Withdraw funds button
- `wallet.transactions` - Transactions label

### Map
- `map.title` - Map page title
- `map.subtitle` - Map page subtitle
- `map.searchLocation` - Location search label
- `map.activitiesFound` - Activities found text

## RTL/LTR Layout

The system automatically handles layout direction:

### CSS Classes
- `rtl` - Applied to body when language is Arabic
- `ltr` - Applied to body when language is English

### Tailwind Utilities
```jsx
// Use RTL-aware spacing
<div className="space-x-4 rtl:space-x-reverse">
  <span>First</span>
  <span>Second</span>
</div>

// Use RTL-aware flexbox
<div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### JavaScript Detection
```jsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  return (
    <div className={isRTL ? 'text-right' : 'text-left'}>
      {/* Content */}
    </div>
  );
};
```

## Adding New Translations

### 1. Add to English File
```json
{
  "newSection": {
    "title": "New Section Title",
    "description": "New section description"
  }
}
```

### 2. Add to Arabic File
```json
{
  "newSection": {
    "title": "عنوان القسم الجديد",
    "description": "وصف القسم الجديد"
  }
}
```

### 3. Use in Component
```jsx
const { t } = useTranslation();

return (
  <div>
    <h2>{t('newSection.title')}</h2>
    <p>{t('newSection.description')}</p>
  </div>
);
```

## Best Practices

### 1. Always Use Translation Keys
```jsx
// ❌ Don't do this
<h1>Welcome to LUDUS</h1>

// ✅ Do this instead
<h1>{t('home.welcomeTitle')}</h1>
```

### 2. Use Descriptive Key Names
```jsx
// ❌ Too generic
t('title')

// ✅ More descriptive
t('home.welcomeTitle')
```

### 3. Group Related Translations
```json
{
  "user": {
    "registration": {
      "title": "Join LUDUS",
      "subtitle": "Discover amazing activities"
    }
  }
}
```

### 4. Handle Missing Translations Gracefully
```jsx
// The system will fallback to Arabic if a translation is missing
// But you can also provide a fallback
t('new.key', 'Fallback text')
```

## Testing Translations

### 1. Language Switcher
Use the language switcher in the header to test both languages.

### 2. RTL Layout
Switch to Arabic to verify RTL layout works correctly.

### 3. Translation Coverage
Visit all pages to ensure no hardcoded text remains.

### 4. Pluralization
Test with different numbers to verify pluralization rules.

## Troubleshooting

### Common Issues

1. **Text not translating**: Check if the translation key exists in both language files
2. **RTL not working**: Verify the language is set to 'ar' and check CSS classes
3. **Missing translations**: Add missing keys to both language files
4. **Layout breaking**: Use RTL-aware CSS utilities and flexbox properties

### Debug Mode

To enable debug mode, set `debug: true` in `i18n/index.js`:

```js
.init({
  debug: true,
  // ... other options
})
```

## Performance Considerations

- Translations are loaded once and cached
- Language switching is instant
- RTL/LTR switching updates DOM attributes efficiently
- No unnecessary re-renders during language changes

## Browser Support

- Modern browsers with ES6+ support
- Automatic language detection from browser settings
- LocalStorage for language preference persistence
- Graceful fallback for unsupported features

## Future Enhancements

- Support for additional languages
- Dynamic translation loading
- Translation management interface
- Context-aware translations
- A/B testing for different translations
