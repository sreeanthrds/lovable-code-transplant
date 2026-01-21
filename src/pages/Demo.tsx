
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, BarChart3, Target, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Demo = () => {
  const sampleStrategies = [
    {
      name: "Momentum Breakout",
      description: "Captures upward momentum when price breaks above resistance",
      returns: "+24.5%",
      winRate: "68%",
      trades: 142,
      status: "active"
    },
    {
      name: "Mean Reversion",
      description: "Profits from price returning to average after extreme moves",
      returns: "+18.2%",
      winRate: "72%",
      trades: 89,
      status: "paused"
    },
    {
      name: "Options Straddle",
      description: "Benefits from high volatility regardless of direction",
      returns: "+31.8%",
      winRate: "58%",
      trades: 67,
      status: "active"
    }
  ];

  const performanceMetrics = [
    { label: "Total Return", value: "₹2,84,560", change: "+15.2%" },
    { label: "Max Drawdown", value: "8.4%", change: "-2.1%" },
    { label: "Sharpe Ratio", value: "1.86", change: "+0.3" },
    { label: "Win Rate", value: "66.7%", change: "+4.2%" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="pt-24 pb-12 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-4" variant="secondary">Live Demo</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              See TradeLayout in Action
            </h1>
            <p className="text-lg text-foreground/70 mb-8">
              Explore real trading strategies, backtest results, and portfolio performance. 
              All data shown is from actual backtested strategies on Indian markets.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/app" className="btn-primary inline-flex items-center">
                Try It Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link to="/features" className="btn-outlined">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Strategies */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Sample Trading Strategies</h2>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              These are real strategies built using our visual editor. Each has been backtested 
              over 2+ years of historical data.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sampleStrategies.map((strategy, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{strategy.name}</CardTitle>
                    <Badge variant={strategy.status === 'active' ? 'default' : 'secondary'}>
                      {strategy.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-foreground/70">{strategy.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{strategy.returns}</div>
                      <div className="text-xs text-foreground/60">Total Return</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{strategy.winRate}</div>
                      <div className="text-xs text-foreground/60">Win Rate</div>
                    </div>
                  </div>
                  <div className="text-sm text-foreground/60">
                    {strategy.trades} trades executed
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Performance Dashboard */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Portfolio Performance</h2>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              Track your strategies' performance with detailed analytics and risk metrics.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {performanceMetrics.map((metric, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="text-sm text-foreground/60 mb-2">{metric.label}</div>
                  <div className={`text-xs font-medium ${
                    metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.change} vs last month
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Mock Chart */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Portfolio Equity Curve
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 rounded-lg flex items-end p-4">
                {/* Simple bar chart representation */}
                <div className="flex items-end space-x-2 w-full h-full">
                  {Array.from({ length: 12 }, (_, i) => (
                    <div
                      key={i}
                      className="bg-primary/60 rounded-t flex-1"
                      style={{
                        height: `${Math.random() * 80 + 20}%`
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="mt-4 text-sm text-foreground/60">
                Monthly returns over the past year. Strategy combinations have consistently 
                outperformed market benchmarks.
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Platform Features</h2>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              Everything you need to build, test, and deploy successful trading strategies.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Visual Strategy Builder</h3>
                <p className="text-sm text-foreground/60">
                  Drag-and-drop interface for creating complex trading strategies
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Advanced Backtesting</h3>
                <p className="text-sm text-foreground/60">
                  Test strategies on years of historical data with realistic costs
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Real-time Analytics</h3>
                <p className="text-sm text-foreground/60">
                  Monitor performance with detailed metrics and risk analysis
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Risk Management</h3>
                <p className="text-sm text-foreground/60">
                  Built-in position sizing and risk controls for safer trading
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Building?</h2>
          <p className="text-lg text-foreground/70 mb-8 max-w-2xl mx-auto">
            Join thousands of traders who use TradeLayout to develop and test their strategies 
            before risking real capital.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/app" className="btn-primary inline-flex items-center">
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link to="/pricing" className="btn-outlined">
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Demo;
