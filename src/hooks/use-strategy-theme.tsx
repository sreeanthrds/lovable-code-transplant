import React, { useState, useEffect, createContext, useContext } from 'react';

type Theme = 'dark' | 'light';

interface StrategyThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const StrategyThemeContext = createContext<StrategyThemeContextType | undefined>(undefined);

export const StrategyThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Get initial theme from localStorage or default to dark
    const stored = localStorage.getItem('tradelayout-strategy-theme');
    return (stored as Theme) || 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Apply strategy theme classes
    root.classList.remove('strategy-light', 'strategy-dark');
    root.classList.add(`strategy-${theme}`);
    
    // Store theme in localStorage
    localStorage.setItem('tradelayout-strategy-theme', theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <StrategyThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </StrategyThemeContext.Provider>
  );
};

export const useStrategyTheme = (): StrategyThemeContextType => {
  const context = useContext(StrategyThemeContext);
  if (context === undefined) {
    throw new Error('useStrategyTheme must be used within a StrategyThemeProvider');
  }
  return context;
};