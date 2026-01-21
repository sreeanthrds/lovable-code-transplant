
import React, { useEffect } from 'react';
import Navbar from '@/components/ui/navbar';
import Footer from '@/components/ui/footer';
import InteractiveStrategyPreview from '@/components/home/InteractiveStrategyPreview';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  GitBranch, 
  Database, 
  BarChart, 
  Zap, 
  Target,
  CheckCircle2,
  Activity,
  TrendingUp,
  Shield,
  Play,
  Rocket,
  Globe,
  Youtube,
  LineChart,
  Briefcase,
  Wifi,
  Brain,
  Eye,
  Code2,
  TestTube2,
  RadioIcon as LiveIcon,
  DollarSign,
  Timer,
  ChartCandlestick,
  TrendingDown,
  Settings,
  Sparkles
} from 'lucide-react';

interface FeatureCardProps { 
  title: string; 
  description: string; 
  icon: React.ReactNode; 
}

const FeatureCard = ({ title, description, icon }: FeatureCardProps) => (
  <div className="flex flex-col p-6 rounded-xl bg-gray-800 shadow-md border border-gray-700 h-full hover:border-gray-600 transition-colors">
    <div className="h-12 w-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-5">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-3 text-white">{title}</h3>
    <p className="text-gray-300 mt-auto">{description}</p>
  </div>
);

const FeaturePoint = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-start gap-3 mb-4">
    <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
    <p className="text-gray-300">{children}</p>
  </div>
);

const FeatureSection = ({ 
  title, 
  description, 
  image, 
  points,
  reversed = false 
}: { 
  title: string; 
  description: string; 
  image: React.ReactNode;
  points: string[];
  reversed?: boolean;
}) => {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16 md:py-24`}>
      <div className={`${reversed ? 'lg:order-2' : ''} animate-fade-in`}>
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">{title}</h2>
        <p className="text-lg text-gray-300 mb-6">{description}</p>
        
        <div className="mb-8">
          {points.map((point, index) => (
            <FeaturePoint key={index}>{point}</FeaturePoint>
          ))}
        </div>
        
        <Link to="/app" className="bg-green-500 hover:bg-green-600 text-white font-medium px-6 py-3 rounded-lg inline-flex items-center group transition-all">
          Get Started
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      <div className={`${reversed ? 'lg:order-1' : ''}`}>
        {image}
      </div>
    </div>
  );
};

const Features = () => {
  useEffect(() => {
    // Reset scroll position when component mounts
    window.scrollTo(0, 0);
  }, []);

  const coreFeatures = [
    {
      icon: <GitBranch className="h-6 w-6 text-green-400" />,
      title: "Visual Strategy Builder",
      description: "Create complex trading strategies using drag-and-drop nodes. No coding required - just connect the logic visually."
    },
    {
      icon: <Database className="h-6 w-6 text-blue-400" />,
      title: "Indian Market Data",
      description: "Access real-time and historical data from NSE, BSE, and MCX with minute-level precision for accurate backtesting."
    },
    {
      icon: <BarChart className="h-6 w-6 text-purple-400" />,
      title: "Advanced Backtesting",
      description: "Test your strategies against years of historical data with detailed performance metrics and risk analysis."
    },
    {
      icon: <Zap className="h-6 w-6 text-orange-400" />,
      title: "Real-time Simulation",
      description: "Experience live market conditions with our real-time simulation engine for realistic strategy testing."
    },
  ];

  const revolutionaryFeatures = [
    {
      icon: <ChartCandlestick className="h-6 w-6 text-green-400" />,
      title: "Futures & Options Mastery",
      description: "Build sophisticated F&O strategies with multi-leg positions, volatility trading, and complex spreads - all visually!"
    },
    {
      icon: <Wifi className="h-6 w-6 text-blue-400" />,
      title: "Live Trading Integration",
      description: "Deploy strategies instantly to live markets with seamless broker connectivity. From backtest to live trading in one click!"
    },
    {
      icon: <Youtube className="h-6 w-6 text-red-400" />,
      title: "YouTube Strategy Validation",
      description: "Heard a strategy on YouTube? Implement it in minutes, backtest with real data, and verify claims before risking capital!"
    },
    {
      icon: <Brain className="h-6 w-6 text-purple-400" />,
      title: "Any Strategy, Any Complexity",
      description: "From simple moving averages to complex algorithmic trading systems - build anything without limitations!"
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <Navbar />
      <main className="flex-grow pt-24">
        {/* Hero Section with SEO optimized content */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-gray-900 to-gray-800">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <div className="inline-flex items-center px-6 py-3 mb-6 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-medium">
              <Rocket className="w-4 h-4 mr-2" />
              <span>Revolutionary Trading Platform for Indian Markets</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold mb-6 animate-fade-in bg-gradient-to-br from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Build. Backtest. Deploy. <span className="text-green-400">Dominate.</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto mb-8 animate-fade-in leading-relaxed">
              The world's first <strong>visual algorithmic trading platform</strong> for Indian markets. 
              Transform any YouTube strategy into profitable algorithms. No coding needed - just pure trading genius!
            </p>
            
            {/* Revolutionary claims */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <div className="bg-green-500/10 border border-green-500/30 rounded-full px-4 py-2 text-green-400 text-sm">
                <Sparkles className="w-4 h-4 inline mr-2" />
                YouTube to Live Trading in Minutes
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-2 text-blue-400 text-sm">
                <Globe className="w-4 h-4 inline mr-2" />
                Indian F&O Market Leader
              </div>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-2 text-purple-400 text-sm">
                <Eye className="w-4 h-4 inline mr-2" />
                Visual Strategy Building
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
              {coreFeatures.map((feature, index) => (
                <FeatureCard 
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Revolutionary Features Showcase */}
        <section className="py-20 md:py-28 bg-gray-800">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-6 py-3 mb-6 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-sm font-medium">
                <Rocket className="w-4 h-4 mr-2" />
                <span>Revolutionary Trading Innovation</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-br from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                The Future of Algorithmic Trading is Here
              </h2>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                Stop watching YouTube strategies and start <strong>implementing them</strong>! 
                Our revolutionary platform turns any trading idea into a profitable, backtested algorithm in minutes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {revolutionaryFeatures.map((feature, index) => (
                <div key={index} className="bg-gray-900 border border-gray-700 rounded-2xl p-8 hover:border-gray-600 transition-all duration-300 hover:-translate-y-2">
                  <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center mb-6 shadow-lg">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed text-lg">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Interactive Visual Strategy Builder Section */}
        <FeatureSection
          title="Visual Strategy Builder That Changes Everything"
          description="Forget complex coding and confusing scripts! Our revolutionary visual approach lets you see exactly how your trading logic flows. Connect nodes, set conditions, and watch your strategy come to life - no programming degree required!"
          image={<InteractiveStrategyPreview />}
          points={[
            "Drag-and-drop interface that makes strategy building as easy as drawing",
            "Pre-built nodes for every trading scenario - from simple signals to complex algorithms",
            "Real-time validation ensures your strategy logic is always correct",
            "Visual flow makes strategy debugging and optimization incredibly intuitive",
            "Copy and modify proven strategies from our community marketplace"
          ]}
        />
        
        {/* Advanced Backtesting Engine */}
        <FeatureSection
          title="Backtesting That Reveals the Truth"
          description="Stop falling for fake YouTube claims! Our advanced backtesting engine uses real Indian market data with corporate actions, dividends, and realistic slippage. See exactly how any strategy would have performed - no more guesswork!"
          image={
            <div className="rounded-xl overflow-hidden shadow-xl border border-gray-700 bg-gray-900">
              <div className="bg-gray-800 p-4 border-b border-gray-700 flex items-center justify-between">
                <div className="text-sm font-medium text-gray-300">Comprehensive Backtest Analysis</div>
                <div className="flex items-center gap-2 text-xs text-green-400">
                  <TestTube2 className="w-3 h-3" />
                  Real Market Data
                </div>
              </div>
              <div className="p-6">
                {/* Performance Summary */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                    <div className="text-green-400 text-3xl font-bold">₹8,47,500</div>
                    <div className="text-gray-400 text-sm">Total Profit (2 Years)</div>
                    <div className="text-green-300 text-xs mt-1">+127% Returns</div>
                  </div>
                  <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                    <div className="text-blue-400 text-3xl font-bold">78.9%</div>
                    <div className="text-gray-400 text-sm">Win Rate</div>
                    <div className="text-blue-300 text-xs mt-1">456 Winning Trades</div>
                  </div>
                  <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20">
                    <div className="text-purple-400 text-3xl font-bold">2.8</div>
                    <div className="text-gray-400 text-sm">Sharpe Ratio</div>
                    <div className="text-purple-300 text-xs mt-1">Excellent Risk-Adjusted</div>
                  </div>
                  <div className="bg-orange-500/10 p-4 rounded-lg border border-orange-500/20">
                    <div className="text-orange-400 text-3xl font-bold">-6.2%</div>
                    <div className="text-gray-400 text-sm">Max Drawdown</div>
                    <div className="text-orange-300 text-xs mt-1">Low Risk Profile</div>
                  </div>
                </div>
                
                {/* Advanced Metrics */}
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="text-gray-300 text-sm mb-3 font-medium">Advanced Risk Metrics</div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Profit Factor</span>
                      <span className="text-green-400 font-bold">2.34</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Calmar Ratio</span>
                      <span className="text-blue-400 font-bold">4.12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Trades</span>
                      <span className="text-purple-400 font-bold">1,847</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Avg Trade Duration</span>
                      <span className="text-orange-400 font-bold">2.3 Days</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
          points={[
            "Test against 10+ years of NSE, BSE, and MCX historical data with corporate actions",
            "Real slippage, brokerage, and market impact modeling for accurate results",
            "Monte Carlo simulation validates strategy robustness across market conditions",
            "Detailed trade-by-trade analysis reveals exactly why strategies succeed or fail",
            "Compare multiple strategies side-by-side to find your trading edge"
          ]}
          reversed
        />

        {/* Futures & Options Revolutionary Section */}
        <section className="py-20 md:py-28 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-6 py-3 mb-6 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm font-medium">
                <ChartCandlestick className="w-4 h-4 mr-2" />
                <span>F&O Trading Revolution</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-br from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                Master Futures & Options Like Never Before
              </h2>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8">
                Build sophisticated F&O strategies that were previously only available to institutional traders. 
                From iron condors to calendar spreads - create any options strategy visually!
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h3 className="text-3xl font-bold text-white mb-6">Options Strategies Made Simple</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Target className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Multi-Leg Options</h4>
                      <p className="text-gray-300">Build complex spreads, straddles, and iron condors with visual position tracking</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-6 w-6 text-blue-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Volatility Trading</h4>
                      <p className="text-gray-300">Capitalize on IV changes with automated volatility-based entry and exit signals</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Settings className="h-6 w-6 text-purple-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Greeks Management</h4>
                      <p className="text-gray-300">Monitor delta, gamma, theta, and vega in real-time with automated adjustments</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
                <div className="text-center mb-4">
                  <h4 className="text-lg font-semibold text-white">Live F&O Strategy Performance</h4>
                  <p className="text-gray-400 text-sm">Bank Nifty Iron Condor - This Week</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-500/10 p-3 rounded text-center">
                    <div className="text-green-400 font-bold text-xl">₹24,500</div>
                    <div className="text-gray-400 text-xs">Weekly Profit</div>
                  </div>
                  <div className="bg-blue-500/10 p-3 rounded text-center">
                    <div className="text-blue-400 font-bold text-xl">0.23</div>
                    <div className="text-gray-400 text-xs">Portfolio Delta</div>
                  </div>
                  <div className="bg-purple-500/10 p-3 rounded text-center">
                    <div className="text-purple-400 font-bold text-xl">-142</div>
                    <div className="text-gray-400 text-xs">Theta Decay</div>
                  </div>
                  <div className="bg-orange-500/10 p-3 rounded text-center">
                    <div className="text-orange-400 font-bold text-xl">18.5%</div>
                    <div className="text-gray-400 text-xs">IV Rank</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Trading Integration */}
        <section className="py-20 md:py-28 bg-gray-800">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center px-4 py-2 mb-6 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-medium">
                  <LiveIcon className="w-4 h-4 mr-2" />
                  <span>Live Trading Revolution</span>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  From Backtest to Live Trading in Seconds
                </h2>
                <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                  The world's most seamless transition from strategy testing to live trading. 
                  No code exports, no manual setup - just one click deployment to live markets!
                </p>
                
                <div className="space-y-6 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">1</div>
                    <div>
                      <h4 className="font-semibold text-white">Build & Backtest</h4>
                      <p className="text-gray-300">Create your strategy visually and validate with historical data</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">2</div>
                    <div>
                      <h4 className="font-semibold text-white">Connect Broker</h4>
                      <p className="text-gray-300">One-click integration with Zerodha, Upstox, and other major brokers</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">3</div>
                    <div>
                      <h4 className="font-semibold text-white">Deploy Live</h4>
                      <p className="text-gray-300">Your strategy goes live instantly with real-time monitoring</p>
                    </div>
                  </div>
                </div>

                <Link to="/app" className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold px-8 py-4 rounded-xl inline-flex items-center group transition-all shadow-lg">
                  <span>Start Live Trading Now</span>
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              
              <div className="relative">
                <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden shadow-2xl">
                  <div className="bg-gray-800 p-4 border-b border-gray-700 flex items-center justify-between">
                    <span className="text-sm font-medium text-white">Live Trading Dashboard</span>
                    <div className="flex items-center gap-2 text-xs text-green-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      Connected
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center bg-gray-800 p-3 rounded">
                      <span className="text-gray-300">EMA Crossover Strategy</span>
                      <span className="text-green-400 font-bold">RUNNING</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-800 p-3 rounded">
                      <span className="text-gray-300">RSI Divergence</span>
                      <span className="text-blue-400 font-bold">WAITING</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-800 p-3 rounded">
                      <span className="text-gray-300">Options Straddle</span>
                      <span className="text-purple-400 font-bold">ACTIVE</span>
                    </div>
                    
                    <div className="border-t border-gray-700 pt-4">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-green-400 font-bold text-lg">₹45,230</div>
                          <div className="text-gray-400 text-xs">Today's P&L</div>
                        </div>
                        <div>
                          <div className="text-blue-400 font-bold text-lg">12</div>
                          <div className="text-gray-400 text-xs">Active Positions</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* YouTube Strategy Validation */}
        <section className="py-20 md:py-28 bg-gradient-to-r from-red-900/20 to-orange-900/20">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <div className="inline-flex items-center px-6 py-3 mb-6 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium">
              <Youtube className="w-4 h-4 mr-2" />
              <span>YouTube Strategy Validation</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-br from-white via-red-100 to-orange-200 bg-clip-text text-transparent">
              Stop Getting Fooled by YouTube Strategies!
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed">
              Watched a "guaranteed profit" strategy on YouTube? Don't risk your money blindly! 
              Implement it here, backtest with real data, and see the truth before you trade.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                <Youtube className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Watch Strategy</h3>
                <p className="text-gray-300">Found an interesting strategy on YouTube? Note down the rules and conditions.</p>
              </div>
              
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                <Code2 className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Build in Minutes</h3>
                <p className="text-gray-300">Use our visual builder to implement the exact strategy - no coding required!</p>
              </div>
              
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                <TestTube2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Validate with Real Data</h3>
                <p className="text-gray-300">Backtest with years of real market data and see if claims hold up!</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-gradient-to-r from-gray-800 to-gray-700">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 animate-fade-in text-white">
              Join the Algorithmic Trading Revolution
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-8 animate-fade-in">
              Stop being a passive trader watching YouTube videos. Start being an algorithmic trader who builds, 
              tests, and deploys winning strategies. The future of trading is visual, and it starts today!
            </p>
            <Link to="/app" className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold px-10 py-4 rounded-xl inline-flex items-center animate-fade-in group transition-all text-lg shadow-xl">
              <Rocket className="mr-3 h-6 w-6" />
              Start Your Trading Revolution
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Features;
