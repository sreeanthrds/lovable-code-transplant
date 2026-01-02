
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogIn, User } from 'lucide-react';
import { Button } from './button';
import { useAdminRole } from '@/hooks/useAdminRole';

const DesktopNav: React.FC = () => {
  const { isAdmin } = useAdminRole();
  const location = useLocation();
  
  // Check if current route is active
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <>
      {/* Navigation Links - Dark mode aware */}
      <nav className="flex items-center space-x-8">
        <Link 
          to="/" 
          className={`text-sm font-medium transition-colors ${isActive('/') 
            ? 'text-green-600 dark:text-green-400' 
            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'}`}
        >
          Home
        </Link>
        <Link
          to="/app/strategies"
          className={`text-sm font-medium transition-colors ${location.pathname.startsWith('/app') 
            ? 'text-green-600 dark:text-green-400' 
            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'} whitespace-nowrap`}
        >
          Strategies
        </Link>
        <Link
          to="/app/multi-strategy-backtest"
          className={`text-sm font-medium transition-colors ${isActive('/app/multi-strategy-backtest') 
            ? 'text-green-600 dark:text-green-400' 
            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'} whitespace-nowrap`}
        >
          Multi-Strategy
        </Link>
        {isAdmin && (
          <Link
            to="/app/admin"
            className={`text-sm font-medium transition-colors ${location.pathname.includes('/admin') 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'} whitespace-nowrap`}
          >
            Admin
          </Link>
        )}
        <Link 
          to="/features" 
          className={`text-sm font-medium transition-colors ${isActive('/features') 
            ? 'text-green-600 dark:text-green-400' 
            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'}`}
        >
          Features
        </Link>
        <Link 
          to="/pricing" 
          className={`text-sm font-medium transition-colors ${isActive('/pricing') 
            ? 'text-green-600 dark:text-green-400' 
            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'}`}
        >
          Pricing
        </Link>
        <Link 
          to="/blog" 
          className={`text-sm font-medium transition-colors ${isActive('/blog') 
            ? 'text-green-600 dark:text-green-400' 
            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'}`}
        >
          Blog
        </Link>
      </nav>

      {/* Auth section - positioned to the right */}
      <div className="flex items-center space-x-4 ml-auto">
        <Button asChild>
          <Link to="/app/strategies">Dashboard</Link>
        </Button>
      </div>
    </>
  );
};

export default DesktopNav;
