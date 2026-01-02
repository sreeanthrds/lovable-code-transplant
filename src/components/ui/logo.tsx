
import React from 'react';
import { Link } from 'react-router-dom';
import { useWebsiteTheme } from '@/hooks/use-website-theme';

interface LogoProps {
  onClick?: () => void;
  asChild?: boolean;
}

const Logo: React.FC<LogoProps> = ({ onClick, asChild = false }) => {
  const { theme } = useWebsiteTheme();
  
  const logoContent = (
    <>
      <img 
        src="/lovable-uploads/771c5927-40d8-4bfb-b06c-7a4b061d694d.png"
        alt="TradeLayout Logo" 
        className="w-8 h-8 md:w-10 md:h-10"
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
