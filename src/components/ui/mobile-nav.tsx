import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAdminRole } from '@/hooks/useAdminRole';
import Logo from './logo';

interface MobileNavProps {
  isOpen: boolean;
  toggleMenu: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ toggleMenu }) => {
  const { isAdmin } = useAdminRole();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <>
      <div className="flex flex-col space-y-6 p-6 h-full">
        {/* Logo */}
        <div className="flex items-center pb-4">
          <Link to="/" onClick={toggleMenu} className="flex items-center space-x-2">
            <Logo asChild />
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col space-y-4 flex-1">
          <Link 
            to="/" 
            className={`py-3 text-base hover:text-primary transition-colors ${isActive('/') 
              ? 'text-primary font-medium' 
              : 'text-foreground/80'}`}
            onClick={toggleMenu}
          >
            Home
          </Link>
          
          <Link
            to="/app/strategies"
            className={`py-3 text-left text-base hover:text-primary transition-colors ${location.pathname.startsWith('/app/strategies') 
              ? 'text-primary font-medium' 
              : 'text-foreground/80'}`}
            onClick={toggleMenu}
          >
            Strategies
          </Link>
          
          <Link
            to="/app/live-trading"
            className={`py-3 text-left text-base hover:text-primary transition-colors ${location.pathname.startsWith('/app/live-trading') 
              ? 'text-primary font-medium' 
              : 'text-foreground/80'}`}
            onClick={toggleMenu}
          >
            Live Trade
          </Link>
          
          <Link
            to="/app/backtesting"
            className={`py-3 text-left text-base hover:text-primary transition-colors ${location.pathname.startsWith('/app/backtesting') 
              ? 'text-primary font-medium' 
              : 'text-foreground/80'}`}
            onClick={toggleMenu}
          >
            Backtesting
          </Link>
          
          {isAdmin && (
            <Link
              to="/app/admin"
              className={`py-3 text-left text-base hover:text-primary transition-colors ${location.pathname.includes('/admin') 
                ? 'text-primary font-medium' 
                : 'text-foreground/80'}`}
              onClick={toggleMenu}
            >
              Admin
            </Link>
          )}
          
          <Link 
            to="/pitch" 
            className={`py-3 text-base hover:text-primary transition-colors ${isActive('/pitch') 
              ? 'text-primary font-medium' 
              : 'text-foreground/80'}`}
            onClick={toggleMenu}
          >
            Pitch
          </Link>
          
          {/* Auth Section */}
          <div className="flex flex-col space-y-4 pt-6 border-t border-border mt-auto">
            <Link
              to="/app/account"
              className="py-3 text-left text-foreground/80 hover:text-primary flex items-center text-base transition-colors"
              onClick={toggleMenu}
            >
              Account Settings
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
};

export default MobileNav;
