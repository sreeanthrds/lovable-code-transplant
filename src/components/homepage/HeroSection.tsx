import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import { useAppAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AuthModal from '../auth/AuthModal';

const HeroSection = () => {
  const { isAuthenticated } = useAppAuth();
  const navigate = useNavigate();
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'signin' | 'signup' }>({
    isOpen: false,
    mode: 'signin'
  });

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/app/strategies');
    } else {
      setAuthModal({ isOpen: true, mode: 'signup' });
    }
  };

  const handleLaunchOffer = () => {
    if (isAuthenticated) {
      navigate('/app/strategies');
    } else {
      setAuthModal({ isOpen: true, mode: 'signup' });
    }
  };

  const switchAuthMode = (mode: 'signin' | 'signup') => {
    setAuthModal({ isOpen: true, mode });
  };


  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Ambient glow effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px] opacity-30"
               style={{ background: 'hsl(var(--primary))' }} />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] opacity-20"
               style={{ background: 'hsl(var(--accent))' }} />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left side - Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              {/* Badge */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center px-4 py-2 mb-6 rounded-full border border-primary/30 bg-primary/10"
              >
                <Sparkles className="w-4 h-4 mr-2 text-primary" />
                <span className="text-sm font-medium text-primary">Visual Programming Language for Algo Trading</span>
              </motion.div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                <span className="text-foreground">Build Trading Logic</span>
                <br />
                <span className="gradient-text-primary">That Executes Exactly</span>
                <br />
                <span className="text-foreground">As You Think</span>
              </h1>

              {/* Sub-headline */}
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
                Encode complex strategies visually. Test on historical data. Execute continuously without fatigue.
              </p>

              {/* Triple CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGetStarted}
                  className="btn-primary-glow inline-flex items-center justify-center"
                >
                  <span>{isAuthenticated ? 'Go to Strategies' : 'Start Building Free'}</span>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLaunchOffer}
                  className="btn-accent-glow inline-flex items-center justify-center"
                >
                  <span className="font-bold">₹500 Launch Offer</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-ghost inline-flex items-center justify-center"
                >
                  <Play className="mr-2 h-5 w-5" />
                  <span>Watch Demo</span>
                </motion.button>
              </div>

              {/* Trust strip */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success" />
                  Equity & FnO Supported
                </span>
                <span className="text-border">•</span>
                <span>NSE/BSE</span>
                <span className="text-border">•</span>
                <span>Zero Infrastructure Required</span>
              </div>
            </motion.div>

            {/* Right side - Code to Nodes visualization */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative hidden lg:block"
            >
              <div className="glass-card p-6 rounded-2xl">
                <div className="space-y-4">
                  {/* Start Node */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="node-card node-start"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-success" />
                      <span className="font-medium text-foreground">Start Strategy</span>
                      <span className="text-xs text-muted-foreground">(Start Node)</span>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      NIFTY • Futures • NSE
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">Timeframe:</span>
                      <span className="bg-muted/50 rounded px-2 py-1">5 min</span>
                    </div>
                    <div className="mt-2 text-xs">
                      <span className="text-muted-foreground">Indicators:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <span className="bg-primary/20 text-primary rounded px-2 py-0.5">RSI(14)</span>
                        <span className="bg-primary/20 text-primary rounded px-2 py-0.5">SuperTrend(10,3)</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Connection line */}
                  <motion.div 
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: 0.7, duration: 0.3 }}
                    className="flex justify-center origin-top"
                  >
                    <div className="w-0.5 h-6 bg-gradient-to-b from-success to-primary" />
                  </motion.div>

                  {/* Entry Signal Node */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="node-card node-entry-signal"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span className="font-medium text-foreground">Entry Watcher</span>
                      <span className="text-xs text-muted-foreground">(Entry Signal Node)</span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-muted/50 rounded px-2 py-1">RSI(14) &lt; 30</div>
                      <div className="bg-muted/50 rounded px-2 py-1">SuperTrend Bullish</div>
                    </div>
                  </motion.div>

                  {/* Connection line */}
                  <motion.div 
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: 1.0, duration: 0.3 }}
                    className="flex justify-center origin-top"
                  >
                    <div className="w-0.5 h-6 bg-gradient-to-b from-primary to-info" />
                  </motion.div>

                  {/* Entry Node */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 }}
                    className="node-card node-entry"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-info" />
                      <span className="font-medium text-foreground">Execute Entry</span>
                      <span className="text-xs text-muted-foreground">(Entry Node)</span>
                    </div>
                    <div className="mt-2 flex gap-2 text-xs">
                      <div className="bg-success/20 text-success rounded px-2 py-1">BUY</div>
                      <div className="bg-muted/50 rounded px-2 py-1">Market Order</div>
                      <div className="bg-muted/50 rounded px-2 py-1">Qty: 50</div>
                    </div>
                  </motion.div>

                  {/* Connection lines to exit */}
                  <motion.div 
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: 1.3, duration: 0.3 }}
                    className="flex justify-center origin-top"
                  >
                    <div className="w-0.5 h-6 bg-gradient-to-b from-info to-accent" />
                  </motion.div>

                  {/* Exit Signal Node */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 }}
                    className="node-card node-exit-signal"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-accent" />
                      <span className="font-medium text-foreground">Exit Watcher</span>
                      <span className="text-xs text-muted-foreground">(Exit Signal Node)</span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-muted/50 rounded px-2 py-1">Target: 1.5%</div>
                      <div className="bg-muted/50 rounded px-2 py-1">SL: 1%</div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
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

export default HeroSection;
