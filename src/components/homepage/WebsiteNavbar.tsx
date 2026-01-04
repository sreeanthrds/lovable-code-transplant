import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAppAuth } from '@/contexts/AuthContext';
import { UserButton } from '@clerk/clerk-react';
import AuthModal from '../auth/AuthModal';
import logoImage from '@/assets/TL-logo-v4.png';

const navItems = [
  { label: 'Features', href: '#features', isScroll: true },
  { label: 'How It Works', href: '#how-it-works', isScroll: true },
  { label: 'Build Strategy', href: '#build-strategy', isScroll: true },
  { label: 'Why Visual', href: '#why-visual', isScroll: true },
  { label: 'Pricing', href: '#pricing', isScroll: true },
  { label: 'Blog', href: '/blog' },
];

const WebsiteNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAppAuth();
  const navigate = useNavigate();
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'signin' | 'signup' }>({
    isOpen: false,
    mode: 'signin'
  });

  const handleSignIn = () => {
    if (isAuthenticated) {
      navigate('/app/strategies');
    } else {
      setAuthModal({ isOpen: true, mode: 'signin' });
    }
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/app/strategies');
    } else {
      setAuthModal({ isOpen: true, mode: 'signup' });
    }
  };

  const switchAuthMode = (mode: 'signin' | 'signup') => {
    setAuthModal({ isOpen: true, mode });
  };

  const handleNavClick = (item: typeof navItems[0], e: React.MouseEvent) => {
    if (item.isScroll) {
      e.preventDefault();
      const element = document.querySelector(item.href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <nav className="bg-background/80 backdrop-blur-xl border-b border-border/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 lg:h-20">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2">
                <img 
                  src={logoImage}
                  alt="TradeLayout Logo" 
                  className="w-8 h-8 scale-y-[0.7]"
                />
                <span className="text-xl font-bold text-foreground">TradeLayout</span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-8">
                {navItems.map((item) => (
                  item.isScroll ? (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={(e) => handleNavClick(item, e)}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      key={item.label}
                      to={item.href}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </Link>
                  )
                ))}
              </div>

              {/* Desktop CTAs */}
              <div className="hidden lg:flex items-center gap-4">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/app/strategies"
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Dashboard
                    </Link>
                    <UserButton 
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          avatarBox: "w-9 h-9",
                        }
                      }}
                    />
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleSignIn}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Sign In
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleGetStarted}
                      className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      Start Free
                    </motion.button>
                  </>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-border/30"
            >
              <div className="container mx-auto px-4 py-4 space-y-4">
                {navItems.map((item) => (
                  item.isScroll ? (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={(e) => {
                        handleNavClick(item, e);
                        setIsMobileMenuOpen(false);
                      }}
                      className="block text-base font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      key={item.label}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </Link>
                  )
                ))}
                <div className="pt-4 border-t border-border/30 space-y-3">
                  {isAuthenticated ? (
                    <div className="flex items-center justify-between">
                      <Link
                        to="/app/strategies"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Dashboard
                      </Link>
                      <UserButton 
                        afterSignOutUrl="/"
                        appearance={{
                          elements: {
                            avatarBox: "w-9 h-9",
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          handleSignIn();
                        }}
                        className="block w-full text-left text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          handleGetStarted();
                        }}
                        className="w-full px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        Start Free
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </nav>
      </motion.header>

      <AuthModal 
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ isOpen: false, mode: 'signin' })}
        mode={authModal.mode}
        onModeSwitch={switchAuthMode}
      />
    </>
  );
};

export default WebsiteNavbar;
