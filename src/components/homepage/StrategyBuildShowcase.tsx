import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Play, RotateCcw } from 'lucide-react';

const buildSteps = [
  {
    step: 1,
    title: 'Trading Hypothesis',
    label: 'Your trading thought — in plain logic',
    content: (
      <div className="code-block">
        <div className="text-muted-foreground text-xs mb-2">// Trading concept</div>
        <pre className="text-sm text-primary/90 whitespace-pre-wrap">{`WHEN market opens
AND volatility is stable  
AND price shows momentum signal
THEN look for entry opportunity
WITH proper risk management`}</pre>
      </div>
    ),
  },
  {
    step: 2,
    title: 'Start Strategy (Start Node)',
    label: 'Define what you\'re trading, timeframe, and indicators',
    content: (
      <div className="node-card node-start">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-4 h-4 rounded-full bg-success" />
          <span className="font-semibold text-foreground">Start Strategy</span>
          <span className="text-xs text-muted-foreground px-2 py-0.5 rounded bg-muted">(Start Node)</span>
        </div>
        <div className="space-y-3 bg-muted/30 rounded-lg p-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Exchange</span>
            <span className="bg-card px-3 py-1 rounded border border-border text-foreground">NSE</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Instrument Type</span>
            <span className="bg-card px-3 py-1 rounded border border-border text-foreground">Futures</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Symbol</span>
            <span className="bg-card px-3 py-1 rounded border border-border text-foreground">NIFTY</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Timeframe</span>
            <span className="bg-card px-3 py-1 rounded border border-border text-foreground">5 minutes</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground block mb-2">Indicators</span>
            <div className="flex flex-wrap gap-2">
              <span className="bg-primary/10 border border-primary/30 px-2 py-1 rounded text-primary text-xs">RSI(14)</span>
              <span className="bg-primary/10 border border-primary/30 px-2 py-1 rounded text-primary text-xs">SuperTrend(10,3)</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    step: 3,
    title: 'Entry Watcher (Entry Signal Node)',
    label: 'Set the conditions that trigger your logic',
    content: (
      <div className="node-card node-entry-signal">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-4 h-4 rounded-full bg-primary" />
          <span className="font-semibold text-foreground">Entry Watcher</span>
          <span className="text-xs text-muted-foreground px-2 py-0.5 rounded bg-muted">(Entry Signal Node)</span>
        </div>
        <div className="space-y-3 bg-muted/30 rounded-lg p-4">
          <div className="text-sm">
            <span className="text-muted-foreground block mb-2">Conditions</span>
            <div className="space-y-2">
              <div className="bg-primary/10 border border-primary/30 px-3 py-2 rounded text-primary text-xs">
                RSI(14) crosses above 30
              </div>
              <div className="text-center text-muted-foreground text-xs">AND</div>
              <div className="bg-primary/10 border border-primary/30 px-3 py-2 rounded text-primary text-xs">
                SuperTrend is bullish
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    step: 4,
    title: 'Execute Entry (Entry Node)',
    label: 'Define exactly what happens when conditions are met',
    content: (
      <div className="node-card node-entry">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-4 h-4 rounded-full bg-info" />
          <span className="font-semibold text-foreground">Execute Entry</span>
          <span className="text-xs text-muted-foreground px-2 py-0.5 rounded bg-muted">(Entry Node)</span>
        </div>
        <div className="space-y-3 bg-muted/30 rounded-lg p-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Position Type</span>
            <span className="bg-success/20 text-success px-3 py-1 rounded border border-success/30">BUY</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Order Type</span>
            <span className="bg-card px-3 py-1 rounded border border-border text-foreground">Market</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Quantity</span>
            <span className="bg-card px-3 py-1 rounded border border-border text-foreground">50</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Product Type</span>
            <span className="bg-card px-3 py-1 rounded border border-border text-foreground">Intraday</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    step: 5,
    title: 'Exit Watcher (Exit Signal Node)',
    label: 'Multiple exit conditions, one visual flow',
    content: (
      <div className="node-card node-exit-signal">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-4 h-4 rounded-full bg-accent" />
          <span className="font-semibold text-foreground">Exit Watcher</span>
          <span className="text-xs text-muted-foreground px-2 py-0.5 rounded bg-muted">(Exit Signal Node)</span>
        </div>
        <div className="space-y-3 bg-muted/30 rounded-lg p-4">
          <div className="text-sm">
            <span className="text-muted-foreground block mb-2">Exit Conditions</span>
            <div className="space-y-2">
              <div className="bg-accent/10 border border-accent/30 px-3 py-2 rounded text-accent text-xs">
                Price hits target (1.5%)
              </div>
              <div className="text-center text-muted-foreground text-xs">OR</div>
              <div className="bg-accent/10 border border-accent/30 px-3 py-2 rounded text-accent text-xs">
                RSI crosses below 70
              </div>
              <div className="text-center text-muted-foreground text-xs">OR</div>
              <div className="bg-accent/10 border border-accent/30 px-3 py-2 rounded text-accent text-xs">
                Time reaches 15:15
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    step: 6,
    title: 'Execute Exit (Exit Node)',
    label: 'Exit logic as part of the same program',
    content: (
      <div className="node-card node-exit">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-4 h-4 rounded-full bg-destructive" />
          <span className="font-semibold text-foreground">Execute Exit</span>
          <span className="text-xs text-muted-foreground px-2 py-0.5 rounded bg-muted">(Exit Node)</span>
        </div>
        <div className="space-y-3 bg-muted/30 rounded-lg p-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Action</span>
            <span className="bg-destructive/20 text-destructive px-3 py-1 rounded border border-destructive/30">Close All Positions</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Order Type</span>
            <span className="bg-card px-3 py-1 rounded border border-border text-foreground">Market</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    step: 7,
    title: 'Test & Deploy',
    label: 'The same visual program runs everywhere. No rewrite.',
    content: (
      <div className="glass-card p-6 rounded-xl">
        <div className="text-center mb-6">
          <h4 className="font-semibold text-foreground mb-2">Execution Mode</h4>
          <p className="text-xs text-muted-foreground">Same strategy, different contexts</p>
        </div>
        <div className="flex gap-3 justify-center">
          <div className="px-4 py-3 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-all cursor-pointer">
            Backtest
          </div>
          <div className="px-4 py-3 rounded-lg bg-warning/10 border border-warning/30 text-sm text-warning">
            Paper Trade
          </div>
          <div className="px-4 py-3 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground hover:border-success/50 hover:text-success transition-all cursor-pointer">
            Live
          </div>
        </div>
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/30 text-success text-sm">
            <Play className="w-4 h-4" />
            Strategy Ready to Execute
          </div>
        </div>
      </div>
    ),
  },
];

const StrategyBuildShowcase = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, buildSteps.length - 1));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const resetSteps = () => {
    setCurrentStep(0);
  };

  return (
    <section id="build-strategy" className="section-padding">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Build Your Strategy{' '}
            <span className="gradient-text-primary">Step by Step</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every strategy starts as a hypothesis. TradeLayout turns that hypothesis into a visual program you can test and execute.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {/* Progress indicator */}
          <div className="flex justify-center gap-2 mb-8">
            {buildSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentStep 
                    ? 'bg-primary w-8' 
                    : index < currentStep 
                      ? 'bg-primary/50' 
                      : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Step content */}
          <div className="relative min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="glass-card p-8 rounded-2xl"
              >
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    {buildSteps[currentStep].step}
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">
                      {buildSteps[currentStep].title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {buildSteps[currentStep].label}
                    </p>
                  </div>
                </div>
                
                {buildSteps[currentStep].content}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="btn-ghost px-4 py-2 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            {currentStep === buildSteps.length - 1 ? (
              <button onClick={resetSteps} className="btn-primary-glow px-6 py-2 inline-flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Start Over
              </button>
            ) : (
              <button onClick={nextStep} className="btn-primary-glow px-6 py-2 inline-flex items-center gap-2">
                Next Step
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
            
            <button
              onClick={nextStep}
              disabled={currentStep === buildSteps.length - 1}
              className="btn-ghost px-4 py-2 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StrategyBuildShowcase;
