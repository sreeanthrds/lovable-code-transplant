import * as React from 'react';

type Theme = 'dark' | 'light';

interface WebsiteThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const WebsiteThemeContext = React.createContext<WebsiteThemeContextType | undefined>(undefined);

export const WebsiteThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = React.useState<Theme>(() => {
    // Get initial theme from localStorage or default to dark
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('tradelayout-website-theme');
      return (stored as Theme) || 'dark';
    }
    return 'dark';
  });

  React.useEffect(() => {
    const root = window.document.documentElement;
    
    // Apply website theme classes
    root.classList.remove('website-light', 'website-dark');
    root.classList.add(`website-${theme}`);
    
    // Also apply the base theme for now (backward compatibility)
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // Store theme in localStorage
    localStorage.setItem('tradelayout-website-theme', theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <WebsiteThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </WebsiteThemeContext.Provider>
  );
};

export const useWebsiteTheme = (): WebsiteThemeContextType => {
  const context = React.useContext(WebsiteThemeContext);
  if (context === undefined) {
    throw new Error('useWebsiteTheme must be used within a WebsiteThemeProvider');
  }
  return context;
};