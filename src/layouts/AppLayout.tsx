
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useClerkUser } from '@/hooks/useClerkUser';
import { UserButton } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { useAdminRole } from '@/hooks/useAdminRole';
import logoImage from '@/assets/TL-logo-v4.png';


interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user } = useClerkUser();
  const { isAdmin } = useAdminRole();
  const [isOpen, setIsOpen] = useState(false);

  // Check if we're on the strategy builder page - SHOW navbar for all app routes
  const isStrategyBuilder = location.pathname.includes('/strategy-builder');

  console.log('AppLayout rendering - location:', location.pathname, 'user:', user);
  
  const closeSheet = () => setIsOpen(false);
  
  return (
    <div className="min-h-screen relative"
         style={{ minHeight: '100vh' }}>
      <header className="fixed top-0 left-0 right-0 z-50"
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(32px) saturate(120%)',
                WebkitBackdropFilter: 'blur(32px) saturate(120%)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)'
              }}>
        <div className="container flex items-center justify-between h-16 px-4 max-w-7xl mx-auto">
          {/* Mobile Layout */}
          <div className="flex md:hidden w-full items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <img 
                  src={logoImage}
                  alt="TradeLayout Logo" 
                  className="w-6 h-6 scale-y-[0.7] transition-transform group-hover:scale-110"
                />
              </div>
              <span className="font-semibold text-lg text-white/95">TradeLayout</span>
            </Link>
            
            {/* Mobile Hamburger Button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-3 py-2 rounded-xl hover:bg-muted"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0" 
                            style={{
                              background: 'rgba(255, 255, 255, 0.15)',
                              backdropFilter: 'blur(32px) saturate(120%)',
                              border: '1px solid rgba(255, 255, 255, 0.2)'
                            }}>
                <div className="flex flex-col h-full">
                  {/* Mobile Nav Header */}
                  <div className="p-6 border-b border-border">
                    <Link to="/" onClick={closeSheet} className="flex items-center space-x-3">
                      <img 
                        src={logoImage}
                        alt="TradeLayout Logo" 
                        className="w-7 h-7 scale-y-[0.7]"
                      />
                      <span className="font-semibold text-xl text-white/95">TradeLayout</span>
                    </Link>
                  </div>
                  
                   {/* Mobile Navigation Links */}
                   <nav className="flex-1 p-6 space-y-4">
                     <Link 
                       to="/app/dashboard" 
                       onClick={closeSheet}
                       className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                         location.pathname === '/app/dashboard' 
                           ? 'bg-primary/10 text-primary' 
                           : 'hover:bg-muted text-white/75'
                       }`}
                     >
                       <div className="text-2xl">📈</div>
                       <span className="font-medium">Dashboard</span>
                     </Link>
                     
                     <Link 
                       to="/app/strategies" 
                       onClick={closeSheet}
                       className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                         location.pathname === '/app/strategies' 
                           ? 'bg-primary/10 text-primary' 
                           : 'hover:bg-muted text-white/75'
                       }`}
                     >
                       <div className="text-2xl">📊</div>
                       <span className="font-medium">Strategies</span>
                     </Link>
                    
                     <Link 
                       to="/app/live-trading" 
                       onClick={closeSheet}
                       className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                         location.pathname === '/app/live-trading' 
                           ? 'bg-primary/10 text-primary' 
                           : 'hover:bg-muted text-white/75'
                       }`}
                     >
                       <div className="text-2xl">▶</div>
                       <span className="font-medium">Live Trade</span>
                     </Link>
                     
                     <Link 
                       to="/app/backtesting" 
                       onClick={closeSheet}
                       className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                         location.pathname.includes('/backtesting') 
                           ? 'bg-primary/10 text-primary' 
                           : 'hover:bg-muted text-white/75'
                       }`}
                     >
                       <div className="text-2xl">🧪</div>
                       <span className="font-medium">Backtesting</span>
                     </Link>
                    
                    {isAdmin && (
                      <Link 
                        to="/app/admin" 
                        onClick={closeSheet}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                          location.pathname === '/app/admin' 
                            ? 'bg-primary/10 text-primary' 
                            : 'hover:bg-muted text-white/75'
                        }`}
                      >
                        <div className="text-2xl">⚙️</div>
                        <span className="font-medium">Admin</span>
                      </Link>
                    )}
                  </nav>
                  
                   {/* Mobile User Section */}
                   <div className="p-6 border-t border-border">
                     <UserButton />
                   </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex w-full items-center justify-between">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <img 
                    src={logoImage}
                    alt="TradeLayout Logo" 
                    className="w-7 h-7 scale-y-[0.7] transition-transform group-hover:scale-110"
                  />
                </div>
                <span className="font-semibold text-xl text-white/95">TradeLayout</span>
              </Link>
              <nav className="flex items-center gap-6">
                <Link to="/app/dashboard" className={`relative flex items-center gap-2 text-sm font-medium transition-all ${location.pathname === '/app/dashboard' 
                  ? 'text-primary' 
                  : 'text-white/75 hover:text-primary'
                }`}>
                  <span>Dashboard</span>
                  {location.pathname === '/app/dashboard' && (
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"></div>
                  )}
                </Link>
                <Link to="/app/strategies" className={`relative flex items-center gap-2 text-sm font-medium transition-all ${location.pathname === '/app/strategies' 
                  ? 'text-primary' 
                  : 'text-white/75 hover:text-primary'
                }`}>
                  <span>Strategies</span>
                  {location.pathname === '/app/strategies' && (
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"></div>
                  )}
                </Link>
                <Link to="/app/live-trading" className={`relative flex items-center gap-2 text-sm font-medium transition-all ${location.pathname === '/app/live-trading' 
                  ? 'text-primary' 
                  : 'text-white/75 hover:text-primary'
                }`}>
                  <span>Live Trade</span>
                  {location.pathname === '/app/live-trading' && (
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"></div>
                  )}
                </Link>
                <Link to="/app/backtesting" className={`relative flex items-center gap-2 text-sm font-medium transition-all ${location.pathname.includes('/backtesting')
                  ? 'text-primary' 
                  : 'text-white/75 hover:text-primary'
                }`}>
                  <span>Backtesting</span>
                  {location.pathname.includes('/backtesting') && (
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"></div>
                  )}
                </Link>
                {isAdmin && (
                  <Link to="/app/admin" className={`relative flex items-center gap-2 text-sm font-medium transition-all ${location.pathname === '/app/admin' 
                    ? 'text-primary' 
                    : 'text-white/75 hover:text-primary'
                  }`}>
                    <span>Admin</span>
                    {location.pathname === '/app/admin' && (
                      <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"></div>
                    )}
                  </Link>
                )}
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              <UserButton />
            </div>
          </div>
        </div>
        </header>
      
      <main className="pt-16 relative">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
