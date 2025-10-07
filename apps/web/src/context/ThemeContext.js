/**
 * LUDUS Platform - Theme Context
 * Light theme only - Dark mode disabled
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Always use light theme - dark mode disabled
    setIsDark(false);
    updateTheme(false);
    setIsLoading(false);
  }, []);

  const updateTheme = (useDark) => {
    // Force light theme - dark mode disabled
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
  };

  const toggleTheme = () => {
    // Disabled - always stays in light mode
    return;
  };

  const setTheme = (theme) => {
    // Disabled - always stays in light mode
    return;
  };

  const value = {
    isDark: false, // Always false
    isLoading,
    toggleTheme,
    setTheme,
    theme: 'light' // Always light
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;