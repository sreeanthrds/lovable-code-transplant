
import React from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  Target, 
  Zap,
  GitBranch,
  ArrowRight,
  Play,
  Edit,
  LogOut,
  AlertTriangle,
  ChevronDown,
  Activity,
  PieChart,
  LineChart
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StrategyShowcase = () => {
  const strategies = [
    {
      name: "EMA Crossover Strategy",
      description: "Complete node-based strategy showing entry signals, position management, and risk controls",
      nodes: [
        { 
          type: "start", 
          label: "Start Node",
          details: "RELIANCE • 15m • EMA(9,21)",
          icon: Play, 
          color: "bg-emerald-500",
          cardColor: "border-emerald-500"
        },
        { 
          type: "entrySignal", 
          label: "Entry Signal",
          details: "EMA(9) crosses above EMA(21)",
          icon: TrendingUp, 
          color: "bg-green-600",
          cardColor: "border-green-600"
        },
        { 
          type: "entry", 
          label: "Buy Order",
          details: "BUY • 100 qty • MARKET • VPI: E001",
          icon: ArrowRight, 
          color: "bg-blue-600",
          cardColor: "border-blue-600"
        },
        { 
          type: "exitSignal", 
          label: "Exit Conditions",
          details: "Stop Loss: -2% • Take Profit: +3%",
          icon: AlertTriangle, 
          color: "bg-amber-600",
          cardColor: "border-amber-600"
        },
        { 
          type: "exit", 
          label: "Sell Order",
          details: "SELL • Target: E001 • MARKET",
          icon: LogOut, 
          color: "bg-red-600",
          cardColor: "border-red-600"
        }
      ],
      performance: "+₹2,45,600",
      winRate: "73.2%",
      trades: "142",
      maxDrawdown: "8.2%",
      color: "from-green-500 to-emerald-600"
    },
    {
      name: "RSI Mean Reversion", 
      description: "Dynamic position sizing with RSI oversold/overbought conditions and position modification",
      nodes: [
        { 
          type: "start", 
          label: "Start Node",
          details: "NIFTY50 • 5m • RSI(14)",
          icon: Play, 
          color: "bg-emerald-500",
          cardColor: "border-emerald-500"
        },
        { 
          type: "entrySignal", 
          label: "RSI Signal",
          details: "RSI &lt; 30 (Oversold condition)",
          icon: TrendingUp, 
          color: "bg-blue-600",
          cardColor: "border-blue-600"
        },
        { 
          type: "entry", 
          label: "Buy Order",
          details: "BUY • Dynamic qty • LIMIT",
          icon: ArrowRight, 
          color: "bg-green-600",
          cardColor: "border-green-600"
        },
        { 
          type: "modify", 
          label: "Position Modify",
          details: "Trail SL • Partial booking",
          icon: Edit, 
          color: "bg-orange-600",
          cardColor: "border-orange-600"
        },
        { 
          type: "exit", 
          label: "Exit Strategy",
          details: "RSI &gt; 70 or Stop triggered",
          icon: Target, 
          color: "bg-rose-600",
          cardColor: "border-rose-600"
        }
      ],
      performance: "+₹1,89,400",
      winRate: "68.5%",
      trades: "89",
      maxDrawdown: "12.1%",
      color: "from-blue-500 to-blue-600"
    },
    {
      name: "Options Straddle Strategy",
      description: "Complex options strategy with volatility signals and multi-leg position management",
      nodes: [
        { 
          type: "start", 
          label: "Start Node",
          details: "BANKNIFTY • 1m • IV Rank",
          icon: Play, 
          color: "bg-emerald-500",
          cardColor: "border-emerald-500"
        },
        { 
          type: "entrySignal", 
          label: "Volatility Signal",
          details: "Low IV + Event proximity",
          icon: Activity, 
          color: "bg-purple-600",
          cardColor: "border-purple-600"
        },
        { 
          type: "entry", 
          label: "Straddle Entry",
          details: "BUY CE+PE • ATM • Same expiry",
          icon: ArrowRight, 
          color: "bg-green-600",
          cardColor: "border-green-600"
        },
        { 
          type: "modify", 
          label: "Leg Management",
          details: "Roll strikes • Adjust delta",
          icon: Edit, 
          color: "bg-orange-600",
          cardColor: "border-orange-600"
        },
        { 
          type: "exit", 
          label: "Exit Rules",
          details: "50% profit • Expiry - 2 days",
          icon: Target, 
          color: "bg-rose-600",
          cardColor: "border-rose-600"
        }
      ],
      performance: "+₹3,12,800",
      winRate: "71.8%",
      trades: "67",
      maxDrawdown: "15.3%",
      color: "from-purple-500 to-purple-600"
    }
  ];

  return (
    <section className="py-20 md:py-28 relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Decorative elements */}
      <div className="absolute top-40 right-20 w-64 h-64 bg-green-500/10 dark:bg-green-500/10 rounded-full blur-3xl opacity-40"></div>
      <div className="absolute bottom-40 left-20 w-80 h-80 bg-blue-500/10 dark:bg-blue-500/10 rounded-full blur-3xl opacity-30"></div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center px-6 py-3 mb-6 rounded-full bg-blue-100/80 dark:bg-blue-500/20 border border-blue-300/60 dark:border-blue-500/30 text-blue-700 dark:text-blue-400 text-sm font-medium">
            <BarChart3 className="w-4 h-4 mr-2" />
            <span>Visual Strategy Logic Examples</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-br from-gray-900 via-gray-700 to-gray-600 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
            See How Trading Logic Actually Works
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Unlike traditional coding platforms, our visual approach lets you see exactly how each 
            trading decision flows through your strategy - no programming knowledge required.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {strategies.map((strategy, index) => (
            <div 
              key={index}
              className="group bg-white/90 dark:bg-white/10 border border-white/40 dark:border-white/20 rounded-2xl p-6 hover:border-primary/60 dark:hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl backdrop-blur-xl"
            >
              {/* Strategy Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  {strategy.name}
                </h3>
                <div className={`h-3 w-3 rounded-full bg-gradient-to-r ${strategy.color}`}></div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">{strategy.description}</p>
              
              {/* Actual Node Cards Flow */}
              <div className="bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-lg p-4 mb-6 border border-white/40 dark:border-white/20 relative overflow-hidden space-y-3">
                {strategy.nodes.map((node, nodeIndex) => (
                  <div key={nodeIndex} className={`bg-white/80 dark:bg-white/10 backdrop-blur-sm border ${node.cardColor} rounded-md p-2 transition-all duration-300 hover:bg-white/90 dark:hover:bg-white/15`}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`flex items-center justify-center w-6 h-6 rounded-full ${node.color} shadow-sm`}>
                        <node.icon className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-xs font-medium text-gray-900 dark:text-white">{node.label}</span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 ml-8" dangerouslySetInnerHTML={{ __html: node.details }}></div>
                    {nodeIndex < strategy.nodes.length - 1 && (
                      <div className="flex justify-center mt-1">
                        <ChevronDown className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Real Performance Metrics */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="text-center bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-lg p-2">
                  <div className="text-green-600 dark:text-green-400 font-bold text-lg">{strategy.performance}</div>
                  <div className="text-gray-500 dark:text-gray-500 text-xs">Total P&L</div>
                </div>
                <div className="text-center bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-lg p-2">
                  <div className="text-blue-600 dark:text-blue-400 font-bold text-lg">{strategy.winRate}</div>
                  <div className="text-gray-500 dark:text-gray-500 text-xs">Win Rate</div>
                </div>
                <div className="text-center bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-lg p-2">
                  <div className="text-purple-600 dark:text-purple-400 font-bold text-lg">{strategy.trades}</div>
                  <div className="text-gray-500 dark:text-gray-500 text-xs">Total Trades</div>
                </div>
                <div className="text-center bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-lg p-2">
                  <div className="text-orange-600 dark:text-orange-400 font-bold text-lg">{strategy.maxDrawdown}</div>
                  <div className="text-gray-500 dark:text-gray-500 text-xs">Max DD</div>
                </div>
              </div>
              
              {/* Action Button */}
              <Link 
                to="/app"
                className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center group-hover:bg-green-500 dark:group-hover:bg-green-600 group-hover:text-white"
              >
                <GitBranch className="mr-2 h-4 w-4" />
                <span>Build Similar Strategy</span>
              </Link>
            </div>
          ))}
        </div>

        {/* Backtesting Benefits Section */}
        <div className="bg-white/90 dark:bg-white/10 rounded-2xl border border-white/40 dark:border-white/20 p-8 mb-16 backdrop-blur-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 mb-4 rounded-full bg-purple-100/80 dark:bg-purple-500/20 border border-purple-300/60 dark:border-purple-500/30 text-purple-700 dark:text-purple-400 text-sm font-medium">
                <PieChart className="w-4 h-4 mr-2" />
                <span>Advanced Backtesting Engine</span>
              </div>
              
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Test Before You Trade
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                Our backtesting engine runs your strategies against years of historical Indian market data. 
                See exactly how your strategy would have performed with realistic slippage, brokerage, and market conditions.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                  <span><strong>Risk Analysis:</strong> Drawdown, VaR, and volatility metrics</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <span><strong>Performance Metrics:</strong> Sharpe ratio, profit factor, win rate</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span><strong>Trade Analysis:</strong> Entry/exit quality, holding periods</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
                  <span><strong>Market Conditions:</strong> Performance across bull/bear/sideways markets</span>
                </div>
              </div>
            </div>
            
            {/* Backtesting Metrics Visualization */}
            <div className="relative">
              <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-lg border border-white/40 dark:border-white/20 overflow-hidden shadow-2xl">
                <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md p-3 border-b border-white/40 dark:border-white/20 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Backtest Report</span>
                  <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <LineChart className="w-3 h-3" />
                    Live Results
                  </div>
                </div>
                
                <div className="p-4 space-y-4">
                  {/* Performance Summary */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/70 dark:bg-white/5 backdrop-blur-sm p-3 rounded text-center">
                      <div className="text-green-600 dark:text-green-400 font-bold text-lg">+47.8%</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Annual Return</div>
                    </div>
                    <div className="bg-white/70 dark:bg-white/5 backdrop-blur-sm p-3 rounded text-center">
                      <div className="text-blue-600 dark:text-blue-400 font-bold text-lg">2.34</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Sharpe Ratio</div>
                    </div>
                    <div className="bg-white/70 dark:bg-white/5 backdrop-blur-sm p-3 rounded text-center">
                      <div className="text-purple-600 dark:text-purple-400 font-bold text-lg">68.7%</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Win Rate</div>
                    </div>
                    <div className="bg-white/70 dark:bg-white/5 backdrop-blur-sm p-3 rounded text-center">
                      <div className="text-orange-600 dark:text-orange-400 font-bold text-lg">-12.3%</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Max Drawdown</div>
                    </div>
                  </div>
                  
                  {/* Risk Metrics */}
                  <div className="border-t border-white/40 dark:border-white/20 pt-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Risk-Adjusted Performance</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-300">Profit Factor</span>
                        <span className="text-green-600 dark:text-green-400">1.87</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-300">Calmar Ratio</span>
                        <span className="text-blue-600 dark:text-blue-400">3.89</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-300">Total Trades</span>
                        <span className="text-purple-600 dark:text-purple-400">1,247</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What Makes Us Unique Section */}
        <div className="bg-white/90 dark:bg-white/10 rounded-2xl border border-white/40 dark:border-white/20 p-8 backdrop-blur-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 mb-4 rounded-full bg-green-100/80 dark:bg-green-500/20 border border-green-300/60 dark:border-green-500/30 text-green-700 dark:text-green-400 text-sm font-medium">
                <Zap className="w-4 h-4 mr-2" />
                <span>What Makes Us Different</span>
              </div>
              
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Beyond Traditional Coding Platforms
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                While others require you to write complex Python or JavaScript code, we let you build 
                strategies by connecting visual nodes. See your trading logic flow in real-time.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <span><strong>Visual Logic:</strong> See how decisions flow through your strategy</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span><strong>Indian Markets:</strong> NSE/BSE data with corporate actions</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                  <span><strong>Position Tracking:</strong> VPI system for complex multi-leg strategies</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
                  <span><strong>Real-time Validation:</strong> Instant feedback as you build</span>
                </div>
              </div>
              
              <Link 
                to="/app"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-300"
              >
                <span>Experience the Difference</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
            
            {/* Comparison: Traditional vs Visual */}
            <div className="relative">
              <div className="bg-gray-900 rounded-lg border border-gray-600 overflow-hidden shadow-2xl">
                {/* Traditional Coding vs Visual Comparison */}
                <div className="grid grid-cols-1 divide-y divide-gray-700">
                  {/* Traditional Way */}
                  <div className="p-4">
                    <div className="text-sm font-medium text-red-400 mb-2">Traditional Platforms</div>
                    <div className="bg-gray-950 p-3 rounded text-xs text-gray-300 font-mono">
                      <div className="text-red-300">if ema_9[-1] &gt; ema_21[-1] and \</div>
                      <div className="text-red-300">   ema_9[-2] &lt;= ema_21[-2]:</div>
                      <div className="text-gray-400">    # Buy signal detected</div>
                      <div className="text-red-300">    position = buy(qty=100)</div>
                      <div className="text-gray-400">    # Set stop loss...</div>
                    </div>
                  </div>
                  
                  {/* Our Visual Way */}
                  <div className="p-4">
                    <div className="text-sm font-medium text-green-400 mb-2">Our Visual Approach</div>
                    <div className="flex items-center justify-between bg-gray-800 p-2 rounded text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                          <TrendingUp className="h-2 w-2 text-white" />
                        </div>
                        <span className="text-white">EMA Crossover</span>
                      </div>
                      <ArrowRight className="h-3 w-3 text-gray-400" />
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                          <ArrowRight className="h-2 w-2 text-white" />
                        </div>
                        <span className="text-white">Buy Order</span>
                      </div>
                    </div>
                    <div className="text-xs text-green-400 mt-1">✓ No coding required</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StrategyShowcase;
