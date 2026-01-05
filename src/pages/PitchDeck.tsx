import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Workflow, 
  TrendingUp, 
  Shield, 
  Zap, 
  Code2, 
  Database, 
  Server, 
  BarChart3,
  Users,
  Globe,
  Store,
  Target,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Rocket
} from 'lucide-react';
import productScreenshot from '@/assets/pitch/product-screenshot.jpg';
import logoImage from '@/assets/TL-logo-v4.png';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

const PitchDeck = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Minimal Header with Logo Only */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/90 dark:bg-white/10 border-white/40 dark:border-white/20 shadow-sm backdrop-blur-xl">
        <div className="container flex h-16 items-center px-4 max-w-7xl mx-auto">
          <Link to="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
            <img 
              src={logoImage}
              alt="TradeLayout Logo" 
              className="w-8 h-8 scale-y-[0.7]"
            />
            <span className="text-xl md:text-2xl font-serif font-bold text-foreground">
              TradeLayout
            </span>
          </Link>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div 
              {...fadeInUp}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Rocket className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Investor Pitch</span>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
                <span className="gradient-text-primary">TradeLayout</span>
              </h1>
              <p className="text-2xl md:text-3xl text-foreground/80 font-medium mb-4">
                The Visual Programming Platform for Traders
              </p>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Create Your Trading Flow, Trade with Confidence
              </p>
            </motion.div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div {...fadeInUp} className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                The <span className="text-destructive">Problem</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Trading automation is broken. Here's why traders struggle:
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                {
                  icon: Zap,
                  title: 'Slow & Inefficient',
                  description: 'Building an algorithm and backtesting it takes at least a week, even for experts.',
                  color: 'destructive'
                },
                {
                  icon: Code2,
                  title: 'Coding Barrier',
                  description: 'Traders must learn programming just to automate their strategies.',
                  color: 'destructive'
                },
                {
                  icon: Database,
                  title: 'Data Costs',
                  description: 'Tick/historical data is expensive, heavy to process, and resource-hungry.',
                  color: 'destructive'
                },
                {
                  icon: Server,
                  title: 'Server Challenges',
                  description: 'Live trading requires costly, complex server setups and maintenance.',
                  color: 'destructive'
                },
                {
                  icon: BarChart3,
                  title: 'F&O Complexity',
                  description: 'Futures & Options trading demands precision and deep expertise.',
                  color: 'destructive'
                }
              ].map((problem, index) => (
                <motion.div
                  key={problem.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="glass-card p-6 rounded-2xl border border-destructive/20 bg-destructive/5"
                >
                  <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-4">
                    <problem.icon className="w-6 h-6 text-destructive" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">{problem.title}</h3>
                  <p className="text-muted-foreground text-sm">{problem.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div {...fadeInUp} className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                The <span className="text-primary">Solution</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                TradeLayout is a visual programming platform empowering traders to build, validate, and execute strategies without writing a single line of code.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
              {[
                {
                  icon: Workflow,
                  title: 'Create Your Trading Flow',
                  description: 'Build any strategy with drag-and-drop nodes—no coding needed.',
                  color: 'primary'
                },
                {
                  icon: Shield,
                  title: 'Quantify Your Confidence',
                  description: 'Validate strategies using tick-level data to assess performance before going live.',
                  color: 'accent'
                },
                {
                  icon: TrendingUp,
                  title: 'Trade with Confidence',
                  description: 'Execute strategies with reduced risk, backed by validated insights.',
                  color: 'success'
                }
              ].map((solution, index) => (
                <motion.div
                  key={solution.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="glass-card-hover p-8 rounded-2xl text-center"
                >
                  <div 
                    className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                    style={{ 
                      background: `hsl(var(--${solution.color}) / 0.15)`,
                      boxShadow: `0 0 30px hsl(var(--${solution.color}) / 0.2)`
                    }}
                  >
                    <solution.icon 
                      className="w-8 h-8" 
                      style={{ color: `hsl(var(--${solution.color}))` }} 
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">{solution.title}</h3>
                  <p className="text-muted-foreground">{solution.description}</p>
                </motion.div>
              ))}
            </div>

            {/* Why It Works */}
            <motion.div 
              {...fadeInUp}
              className="max-w-3xl mx-auto bg-primary/5 border border-primary/20 rounded-2xl p-8"
            >
              <h3 className="text-xl font-semibold mb-6 text-center text-foreground">Why It Works</h3>
              <div className="space-y-4">
                {[
                  'Eliminates coding barriers for all traders (including professional programmers)',
                  'Reduces financial risks by quantifying confidence through backtesting',
                  'Enables confident trading with validated strategies'
                ].map((point, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-foreground/90">{point}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Product Screenshot */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div {...fadeInUp} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Product <span className="gradient-text-primary">Overview</span>
              </h2>
            </motion.div>
            
            <motion.div 
              {...fadeInUp}
              className="max-w-5xl mx-auto"
            >
              <div className="relative rounded-2xl overflow-hidden border border-border shadow-2xl">
                <img 
                  src={productScreenshot} 
                  alt="TradeLayout Visual Strategy Builder" 
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-background/90 backdrop-blur-sm rounded-xl p-4 border border-border">
                      <h4 className="font-semibold text-foreground mb-1">Visual Programming</h4>
                      <p className="text-sm text-muted-foreground">Drag-and-drop nodes for entry, exit, alerts</p>
                    </div>
                    <div className="bg-background/90 backdrop-blur-sm rounded-xl p-4 border border-border">
                      <h4 className="font-semibold text-foreground mb-1">Powerful Backtesting</h4>
                      <p className="text-sm text-muted-foreground">Tick-level precision with NFO/NSE/BSE data</p>
                    </div>
                    <div className="bg-background/90 backdrop-blur-sm rounded-xl p-4 border border-border">
                      <h4 className="font-semibold text-foreground mb-1">Live Trading</h4>
                      <p className="text-sm text-muted-foreground">Connect to brokers via API (Zerodha, Upstox)</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Market Opportunity */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div {...fadeInUp} className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Market <span className="gradient-text-primary">Opportunity</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                The World's First Visual Programming Platform for All Asset Classes
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* India Market */}
              <motion.div 
                {...fadeInUp}
                className="glass-card p-8 rounded-2xl"
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-4xl">🇮🇳</span>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">India: Base Market</h3>
                    <p className="text-sm text-muted-foreground">The Fastest Growing Trading Market</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">100M+ Demat Accounts</p>
                      <p className="text-sm text-muted-foreground">10M daily active traders (SEBI data)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <Target className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Unmet Need</p>
                      <p className="text-sm text-muted-foreground">No platform offers visual programming for custom strategies</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Revenue Target (Year 2)</p>
                      <p className="text-sm text-muted-foreground">5,000 subscribers × ₹2,000/mo = ₹120M/year ($1.4M)</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Global Expansion */}
              <motion.div 
                {...fadeInUp}
                className="glass-card p-8 rounded-2xl"
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-4xl">🌍</span>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Global Expansion</h3>
                    <p className="text-sm text-muted-foreground">3-Year Vision</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Globe className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Major Markets</p>
                      <p className="text-sm text-muted-foreground">US, Europe, Japan, China expansion planned</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <BarChart3 className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">All Asset Classes</p>
                      <p className="text-sm text-muted-foreground">Equities, derivatives, forex, crypto, commodities</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                      <Store className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Strategy Marketplace</p>
                      <p className="text-sm text-muted-foreground">Traders share & monetize proven strategies</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Competitive Advantage */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div {...fadeInUp} className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Shield className="w-4 h-4" />
                Patent Applied • First of Its Kind
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Not a Tool. A <span className="gradient-text-primary">New Programming Language</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                TradeLayout is the world's first visual programming language designed specifically for algorithmic trading. 
                We've applied for patents on this revolutionary approach.
              </p>
            </motion.div>

            {/* Competitor Breakdown */}
            <div className="max-w-5xl mx-auto mb-16">
              <motion.div {...fadeInUp} className="grid md:grid-cols-3 gap-6 mb-8">
                {/* TradingView */}
                <div className="glass-card p-6 rounded-2xl border-l-4 border-yellow-500">
                  <h4 className="font-bold text-lg text-foreground mb-2">📊 TradingView</h4>
                  <p className="text-sm text-muted-foreground mb-3">Great for analysis, but...</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      <span className="text-foreground/80">No live trading execution</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      <span className="text-foreground/80">Requires Pine Script (painful to learn)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      <span className="text-foreground/80">Limited backtesting accuracy</span>
                    </li>
                  </ul>
                </div>

                {/* Other Platforms */}
                <div className="glass-card p-6 rounded-2xl border-l-4 border-orange-500">
                  <h4 className="font-bold text-lg text-foreground mb-2">🔧 Streak, Tradetron, etc.</h4>
                  <p className="text-sm text-muted-foreground mb-3">Simple but severely limited...</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      <span className="text-foreground/80">Rigid, pre-built templates only</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      <span className="text-foreground/80">Very basic algorithms, tiny adjustments</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      <span className="text-foreground/80">Poor accuracy in backtesting results</span>
                    </li>
                  </ul>
                </div>

                {/* TradeLayout */}
                <div className="glass-card p-6 rounded-2xl border-l-4 border-primary bg-primary/5">
                  <h4 className="font-bold text-lg text-primary mb-2">🚀 TradeLayout</h4>
                  <p className="text-sm text-muted-foreground mb-3">The complete solution...</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-foreground/80">Visual programming - no coding needed</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-foreground/80">Build ANY complexity with ease</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-foreground/80">Tick-level accurate backtesting</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-foreground/80">Live execution with broker APIs</span>
                    </li>
                  </ul>
                </div>
              </motion.div>
            </div>

            {/* Feature Comparison Table */}
            <div className="max-w-4xl mx-auto">
              <motion.div 
                {...fadeInUp}
                className="glass-card rounded-2xl overflow-hidden"
              >
                <div className="grid grid-cols-4 bg-muted/50 p-4 font-semibold text-foreground text-sm">
                  <div>Capability</div>
                  <div className="text-center">TradingView</div>
                  <div className="text-center">Others</div>
                  <div className="text-center text-primary">TradeLayout</div>
                </div>
                
                {[
                  { feature: 'Complexity Level', tv: 'High (Pine)', others: 'Very Low', tl: 'Unlimited' },
                  { feature: 'Learning Curve', tv: 'Steep', others: 'Easy', tl: 'Intuitive' },
                  { feature: 'Custom Logic', tv: 'Code Only', others: '❌', tl: '✅ Visual' },
                  { feature: 'Live Trading', tv: '❌', others: '✅ Limited', tl: '✅ Full' },
                  { feature: 'Backtest Accuracy', tv: 'Low', others: 'Very Low', tl: 'Tick-Level' },
                  { feature: 'Multi-Timeframe', tv: 'Limited', others: '❌', tl: '✅ Native' },
                  { feature: 'Strategy Marketplace', tv: '❌', others: '❌', tl: '✅ Built-in' },
                ].map((row, index) => (
                  <div 
                    key={row.feature} 
                    className={`grid grid-cols-4 p-4 items-center text-sm ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}
                  >
                    <div className="text-foreground/90 font-medium">{row.feature}</div>
                    <div className="text-center text-muted-foreground">{row.tv}</div>
                    <div className="text-center text-muted-foreground">{row.others}</div>
                    <div className="text-center text-primary font-medium">{row.tl}</div>
                  </div>
                ))}
              </motion.div>

              <motion.div 
                {...fadeInUp}
                className="mt-10 text-center"
              >
                <div className="inline-block glass-card px-8 py-4 rounded-2xl">
                  <p className="text-lg text-foreground/80 italic">
                    "TradingView showed the market. Other tools gave templates.<br/>
                    <span className="text-primary font-bold text-xl">TradeLayout gives you the power to create anything.</span>"
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Business Model */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div {...fadeInUp} className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Business <span className="gradient-text-primary">Model</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Built for Professionals. Not Beginners.
              </p>
            </motion.div>

            {/* Pricing Tiers */}
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
              {/* Launch Offer */}
              <motion.div 
                {...fadeInUp}
                className="glass-card p-6 rounded-2xl border-2 border-accent relative overflow-hidden"
              >
                <div className="absolute top-3 right-3 px-3 py-1 bg-accent text-accent-foreground text-xs font-bold rounded-full">
                  LAUNCH OFFER
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">₹500</h3>
                <p className="text-muted-foreground mb-4">for 2 months</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                    <span className="text-foreground/90">Unlimited backtests</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                    <span className="text-foreground/90">Unlimited live trades</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                    <span className="text-foreground/90">Full platform access</span>
                  </li>
                </ul>
                <p className="mt-4 text-xs text-muted-foreground italic">Early adopter pricing (MVP phase)</p>
              </motion.div>

              {/* Pro Plan */}
              <motion.div 
                {...fadeInUp}
                className="glass-card p-6 rounded-2xl border border-primary/30"
              >
                <div className="flex items-baseline gap-2 mb-2">
                  <h3 className="text-2xl font-bold text-foreground">₹2,999</h3>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-primary font-medium mb-4">or ₹29,999/year (2 months free)</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-foreground/90">100 backtests/month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-foreground/90">50 live trades/month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-foreground/90">2 paper trading sessions/day</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-foreground/90">Add-ons available for more</span>
                  </li>
                </ul>
                <p className="mt-4 text-xs text-muted-foreground italic">Post-MVP full version pricing</p>
              </motion.div>
            </div>

            {/* Revenue Streams */}
            <div className="grid lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <motion.div 
                {...fadeInUp}
                className="glass-card p-6 rounded-2xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Subscriptions</h3>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">Monthly & annual plans</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">Add-on packs for power users</span>
                  </li>
                </ul>
              </motion.div>

              <motion.div 
                {...fadeInUp}
                className="glass-card p-6 rounded-2xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Store className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Marketplace</h3>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">Experts sell strategies & indicators</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">Platform commission on sales</span>
                  </li>
                </ul>
              </motion.div>

              <motion.div 
                {...fadeInUp}
                className="glass-card p-6 rounded-2xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-success" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Broker Partnerships</h3>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-success mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">Revenue share on brokerage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-success mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">Zerodha, Upstox, Angel integrations</span>
                  </li>
                </ul>
              </motion.div>
            </div>

            <motion.div 
              {...fadeInUp}
              className="max-w-3xl mx-auto mt-12 text-center"
            >
              <div className="glass-card p-6 rounded-2xl border border-primary/20">
                <Lightbulb className="w-8 h-8 text-primary mx-auto mb-4" />
                <p className="text-lg text-foreground/90">
                  <strong>Experts create. Beginners follow. Everyone trades.</strong>
                </p>
                <p className="text-muted-foreground mt-2">
                  The App Store for Trading Strategies
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="container mx-auto px-4">
            <motion.div 
              {...fadeInUp}
              className="text-center max-w-3xl mx-auto"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                Ready to Revolutionize Trading?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join us in building the future of algorithmic trading—accessible to everyone, powered by visual programming.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a 
                  href="/app/strategies"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
                >
                  Try TradeLayout
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a 
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-muted text-foreground rounded-xl font-medium hover:bg-muted/80 transition-colors border border-border"
                >
                  View Pricing
                </a>
              </div>
            </motion.div>
          </div>
        </section>
    </div>
  );
};

export default PitchDeck;
