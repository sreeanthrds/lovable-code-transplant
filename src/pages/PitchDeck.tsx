import React from 'react';
import { motion } from 'framer-motion';
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
import WebsiteLayout from '@/layouts/WebsiteLayout';
import productScreenshot from '@/assets/pitch/product-screenshot.jpg';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

const PitchDeck = () => {
  return (
    <WebsiteLayout>
      <div className="min-h-screen bg-background">
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
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why <span className="gradient-text-primary">TradeLayout Wins</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                No such flexible platform exists worldwide. Competitors are too rigid, too limited, or code-heavy.
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              <motion.div 
                {...fadeInUp}
                className="glass-card rounded-2xl overflow-hidden"
              >
                <div className="grid grid-cols-3 bg-muted/50 p-4 font-semibold text-foreground">
                  <div>Feature</div>
                  <div className="text-center">Competitors</div>
                  <div className="text-center text-primary">TradeLayout</div>
                </div>
                
                {[
                  { feature: 'Visual Programming', competitors: false, tradelayout: true },
                  { feature: 'No Coding Required', competitors: false, tradelayout: true },
                  { feature: 'Tick-Level Accuracy', competitors: false, tradelayout: true },
                  { feature: 'Multi-Timeframe Support', competitors: 'Limited', tradelayout: true },
                  { feature: 'Strategy Marketplace', competitors: false, tradelayout: true },
                  { feature: 'Live Execution', competitors: true, tradelayout: true },
                  { feature: 'Custom Indicators', competitors: 'Code Only', tradelayout: true },
                ].map((row, index) => (
                  <div 
                    key={row.feature} 
                    className={`grid grid-cols-3 p-4 items-center ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}
                  >
                    <div className="text-foreground/90">{row.feature}</div>
                    <div className="flex justify-center">
                      {row.competitors === true ? (
                        <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
                      ) : row.competitors === false ? (
                        <XCircle className="w-5 h-5 text-destructive/70" />
                      ) : (
                        <span className="text-sm text-muted-foreground">{row.competitors}</span>
                      )}
                    </div>
                    <div className="flex justify-center">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                ))}
              </motion.div>

              <motion.p 
                {...fadeInUp}
                className="text-center mt-8 text-lg text-foreground/80 italic"
              >
                "TradingView showed the market. TradeLayout lets traders <span className="text-primary font-semibold">control</span> it."
              </motion.p>
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

            <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <motion.div 
                {...fadeInUp}
                className="glass-card p-8 rounded-2xl"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Subscription Revenue</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-primary mt-1 shrink-0" />
                    <span className="text-muted-foreground">Pro Plan: ₹499/month for serious traders</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-primary mt-1 shrink-0" />
                    <span className="text-muted-foreground">100 backtests + 50 live trades/month</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-primary mt-1 shrink-0" />
                    <span className="text-muted-foreground">Add-on packs for power users</span>
                  </li>
                </ul>
              </motion.div>

              <motion.div 
                {...fadeInUp}
                className="glass-card p-8 rounded-2xl"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Store className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Marketplace Revenue</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-accent mt-1 shrink-0" />
                    <span className="text-muted-foreground">Experts monetize strategies & indicators</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-accent mt-1 shrink-0" />
                    <span className="text-muted-foreground">Platform takes commission on sales</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-accent mt-1 shrink-0" />
                    <span className="text-muted-foreground">Network effect: More experts → richer marketplace</span>
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
    </WebsiteLayout>
  );
};

export default PitchDeck;
