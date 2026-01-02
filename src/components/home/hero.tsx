import React, { useState } from 'react';
import { ArrowRight, Play, Sparkles, TrendingUp, BarChart3, Zap, LogIn, Star, Shield } from 'lucide-react';
import { useAppAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AuthModal from '../auth/AuthModal';

const Hero = () => {
  const { isAuthenticated } = useAppAuth();
  const navigate = useNavigate();
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'signin' | 'signup' }>({
    isOpen: false,
    mode: 'signin'
  });

  const handleGetStarted = () => {
    console.log('Get Started clicked, isAuthenticated:', isAuthenticated);
    if (isAuthenticated) {
      navigate('/app/strategies');
    } else {
      setAuthModal({ isOpen: true, mode: 'signin' });
    }
  };

  const handleSignIn = () => {
    console.log('Sign In clicked, isAuthenticated:', isAuthenticated);
    if (isAuthenticated) {
      navigate('/app/strategies');
    } else {
      setAuthModal({ isOpen: true, mode: 'signin' });
    }
  };

  const switchAuthMode = (mode: 'signin' | 'signup') => {
    setAuthModal({ isOpen: true, mode });
  };

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden"
               style={{
                 background: 'linear-gradient(135deg, hsl(var(--glass-gradient-start)) 0%, hsl(var(--glass-gradient-end)) 100%)'
               }}>
        {/* Ambient Lighting Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-float"
               style={{ background: 'hsl(var(--primary) / 0.15)' }}></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse-subtle"
               style={{ background: 'hsl(var(--accent) / 0.15)' }}></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-6xl mx-auto">
            {/* Premium badge */}
            <div className="mb-8 animate-fade-in">
              <div className="inline-flex items-center px-8 py-4 mb-8 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-cyan-500/20 backdrop-blur-xl border border-blue-300/30 dark:border-blue-400/30 text-blue-700 dark:text-blue-300 text-sm font-medium shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 hover:scale-105">
                <Sparkles className="w-5 h-5 mr-3 animate-pulse text-yellow-500" />
                <span className="bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-300 dark:to-purple-300 bg-clip-text text-transparent font-semibold">Professional Trading Platform</span>
                <Star className="w-4 h-4 ml-3 text-yellow-500 fill-current" />
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold mb-8 leading-tight">
                <span className="bg-gradient-to-br from-gray-900 via-blue-800 to-gray-700 dark:from-white dark:via-blue-100 dark:to-gray-200 bg-clip-text text-transparent">
                  Build Trading Strategies
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 dark:from-blue-400 dark:via-purple-400 dark:to-cyan-400 bg-clip-text text-transparent animate-pulse">
                  Visually
                </span>
              </h1>
              
              <p className="text-xl sm:text-2xl lg:text-3xl text-gray-700 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
                Create sophisticated trading algorithms by connecting visual nodes.
                <br />
                <span className="bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent font-semibold">No coding required.</span>
              </p>
            </div>

            {/* Liquid Glass CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20 animate-fade-in">
              <button 
                onClick={handleGetStarted}
                className="group relative inline-flex items-center px-12 sm:px-16 py-6 sm:py-7 font-bold rounded-3xl transform hover:-translate-y-2 hover:scale-105 transition-all duration-500 text-lg overflow-hidden"
                style={{
                  background: 'hsl(var(--primary))',
                  color: 'hsl(var(--primary-foreground))',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  boxShadow: '0 8px 32px -8px hsl(var(--primary) / 0.5), 0 2px 8px 0 hsl(var(--primary) / 0.3), 0 0 0 1px hsl(var(--glass-highlight) / 0.2) inset'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 16px 48px -12px hsl(var(--primary) / 0.6), 0 4px 12px 0 hsl(var(--primary) / 0.4), 0 0 0 1px hsl(var(--glass-highlight) / 0.3) inset, 0 0 20px 0 hsl(var(--primary) / 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 32px -8px hsl(var(--primary) / 0.5), 0 2px 8px 0 hsl(var(--primary) / 0.3), 0 0 0 1px hsl(var(--glass-highlight) / 0.2) inset';
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                {!isAuthenticated && <LogIn className="mr-3 h-6 w-6 relative z-10" />}
                <span className="relative z-10">{isAuthenticated ? 'Go to Strategies' : 'Start Building Free'}</span>
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform relative z-10" />
              </button>
              
              <button 
                onClick={handleSignIn}
                className="group inline-flex items-center px-12 sm:px-16 py-6 sm:py-7 font-bold rounded-3xl transition-all duration-500 text-lg transform hover:-translate-y-2 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--background) / 0.6) 0%, hsl(var(--background) / 0.4) 100%)',
                  backdropFilter: 'blur(32px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(32px) saturate(180%)',
                  border: '2px solid hsl(var(--glass-border) / 0.3)',
                  color: 'hsl(var(--foreground))',
                  boxShadow: '0 8px 32px -8px hsl(var(--glass-shadow) / 0.3), 0 1px 2px 0 hsl(var(--glass-highlight) / 0.15) inset'
                }}
              >
                <Play className="mr-3 h-6 w-6" />
                <span>{isAuthenticated ? 'Go to Strategies' : 'Watch Demo'}</span>
              </button>
            </div>

            {/* Liquid Glass Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-6xl mx-auto animate-fade-in">
              <div className="group relative flex flex-col items-center p-8 rounded-3xl transition-all duration-700 hover:scale-105 hover:-translate-y-4 transform-gpu"
                   style={{
                     background: 'linear-gradient(135deg, hsl(var(--glass-bg) / 0.6) 0%, hsl(var(--glass-bg) / 0.4) 100%)',
                     backdropFilter: 'blur(32px) saturate(180%)',
                     WebkitBackdropFilter: 'blur(32px) saturate(180%)',
                     border: '1px solid hsl(var(--glass-border) / 0.3)',
                     boxShadow: '0 8px 32px -8px hsl(var(--glass-shadow) / 0.3), 0 1px 2px 0 hsl(var(--glass-highlight) / 0.15) inset'
                   }}>
                <div className="h-20 w-20 rounded-2xl p-4 mb-6 transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 relative z-10 flex items-center justify-center"
                     style={{
                       background: 'hsl(var(--primary) / 0.2)',
                       boxShadow: '0 0 20px hsl(var(--primary) / 0.3)'
                     }}>
                  <BarChart3 className="w-10 h-10" style={{ color: 'hsl(var(--primary))' }} />
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors relative z-10" style={{ color: 'hsl(var(--foreground))' }}>Visual Builder</h3>
                <p className="text-center leading-relaxed relative z-10" style={{ color: 'hsl(var(--muted-foreground))' }}>Drag & drop interface makes strategy creation intuitive and powerful</p>
              </div>
              
              <div className="group relative flex flex-col items-center p-8 rounded-3xl transition-all duration-700 hover:scale-105 hover:-translate-y-4 transform-gpu"
                   style={{
                     background: 'linear-gradient(135deg, hsl(var(--glass-bg) / 0.6) 0%, hsl(var(--glass-bg) / 0.4) 100%)',
                     backdropFilter: 'blur(32px) saturate(180%)',
                     WebkitBackdropFilter: 'blur(32px) saturate(180%)',
                     border: '1px solid hsl(var(--glass-border) / 0.3)',
                     boxShadow: '0 8px 32px -8px hsl(var(--glass-shadow) / 0.3), 0 1px 2px 0 hsl(var(--glass-highlight) / 0.15) inset'
                   }}>
                <div className="h-20 w-20 rounded-2xl p-4 mb-6 transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 relative z-10 flex items-center justify-center"
                     style={{
                       background: 'hsl(var(--accent) / 0.2)',
                       boxShadow: '0 0 20px hsl(var(--accent) / 0.3)'
                     }}>
                  <TrendingUp className="w-10 h-10" style={{ color: 'hsl(var(--accent))' }} />
                </div>
                <h3 className="text-2xl font-bold mb-4 transition-colors relative z-10" style={{ color: 'hsl(var(--foreground))' }}>Backtesting</h3>
                <p className="text-center leading-relaxed relative z-10" style={{ color: 'hsl(var(--muted-foreground))' }}>Test strategies with historical data before going live</p>
              </div>
              
              <div className="group relative flex flex-col items-center p-8 rounded-3xl transition-all duration-700 hover:scale-105 hover:-translate-y-4 transform-gpu"
                   style={{
                     background: 'linear-gradient(135deg, hsl(var(--glass-bg) / 0.6) 0%, hsl(var(--glass-bg) / 0.4) 100%)',
                     backdropFilter: 'blur(32px) saturate(180%)',
                     WebkitBackdropFilter: 'blur(32px) saturate(180%)',
                     border: '1px solid hsl(var(--glass-border) / 0.3)',
                     boxShadow: '0 8px 32px -8px hsl(var(--glass-shadow) / 0.3), 0 1px 2px 0 hsl(var(--glass-highlight) / 0.15) inset'
                   }}>
                <div className="h-20 w-20 rounded-2xl p-4 mb-6 transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 relative z-10 flex items-center justify-center"
                     style={{
                       background: 'hsl(var(--primary) / 0.2)',
                       boxShadow: '0 0 20px hsl(var(--primary) / 0.3)'
                     }}>
                  <Shield className="w-10 h-10" style={{ color: 'hsl(var(--primary))' }} />
                </div>
                <h3 className="text-2xl font-bold mb-4 transition-colors relative z-10" style={{ color: 'hsl(var(--foreground))' }}>Live Trading</h3>
                <p className="text-center leading-relaxed relative z-10" style={{ color: 'hsl(var(--muted-foreground))' }}>Deploy strategies to live markets with confidence</p>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="mt-20 animate-fade-in">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Trusted by 15,000+ traders worldwide</p>
              <div className="flex justify-center items-center space-x-8 opacity-60">
                <div className="flex items-center space-x-1">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">4.9/5 rating</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">NSE • BSE • MCX</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Real-time data</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AuthModal 
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ isOpen: false, mode: 'signin' })}
        mode={authModal.mode}
        onModeSwitch={switchAuthMode}
      />
    </>
  );
};

export default Hero;