import { vi } from 'vitest';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// This file runs before each test file.
// It is the ideal place to set up a global test environment.

// Initialize i18next for tests
i18n
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    ns: ['translations'],
    defaultNS: 'translations',
    resources: { en: { translations: {} } },
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    }
  });


// Mock localStorage for the JSDOM environment
const localStorageMock = (function() {
  let store = {};
  return {
    getItem(key) {
      return store[key] || null;
    },
    setItem(key, value) {
      // Handle null or undefined values gracefully
      if (value === undefined || value === null) {
        store[key] = '';
      } else {
        store[key] = value.toString();
      }
    },
    removeItem(key) {
      delete store[key];
    },
    clear() {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock window.matchMedia for JSDOM
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
