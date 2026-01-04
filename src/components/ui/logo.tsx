
import React from 'react';
import { Link } from 'react-router-dom';
import { useWebsiteTheme } from '@/hooks/use-website-theme';
import logoImage from '@/assets/TL-logo-v4.png';

interface LogoProps {
  onClick?: () => void;
  asChild?: boolean;
}

const Logo: React.FC<LogoProps> = ({ onClick, asChild = false }) => {
  const { theme } = useWebsiteTheme();
  
  const logoContent = (
    <>
      <img 
        src={logoImage}
        alt="TradeLayout Logo" 
        className="w-8 h-8 scale-y-[0.7]"
      />
      <div className="flex flex-col leading-tight">
        <span className="text-xl md:text-2xl font-serif font-bold text-green-600 dark:text-green-400">
          TradeLayout
        </span>
        <span className="text-[10px] md:text-xs text-foreground/70">
          By Unificater - The Language of Visual Trading
        </span>
      </div>
    </>
  );

  if (asChild) {
    return (
      <div className="flex items-center space-x-2 transition-opacity hover:opacity-80" onClick={onClick}>
        {logoContent}
      </div>
    );
  }

  return (
    <Link 
      to="/" 
      className="flex items-center space-x-2 transition-opacity hover:opacity-80"
      onClick={onClick}
    >
      {logoContent}
    </Link>
  );
};

export default Logo;
