import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStrategyTheme } from '@/hooks/use-strategy-theme';

const StrategyThemeToggle = () => {
  const { theme, toggleTheme } = useStrategyTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="h-10 w-10 p-0 rounded-full border border-white/20 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/30"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      style={{
        background: 'linear-gradient(135deg, hsl(var(--card) / 0.5) 0%, hsl(var(--card) / 0.3) 100%)',
        backdropFilter: 'blur(32px) saturate(180%)',
        WebkitBackdropFilter: 'blur(32px) saturate(180%)',
        boxShadow: '0 4px 16px -4px hsl(var(--glass-shadow) / 0.3), 0 0 0 1px hsl(var(--glass-highlight) / 0.1) inset'
      }}
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4 text-primary transition-transform hover:rotate-90 duration-300" />
      ) : (
        <Moon className="h-4 w-4 text-primary transition-transform hover:-rotate-12 duration-300" />
      )}
      <span className="sr-only">Toggle strategy theme</span>
    </Button>
  );
};

export default StrategyThemeToggle;