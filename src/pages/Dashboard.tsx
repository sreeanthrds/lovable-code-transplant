import React from 'react';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, PieChart } from 'lucide-react';

const Dashboard = () => {
  // Mock performance data
  const metrics = [
    { label: 'Total P&L', value: '+$12,450', change: '+23.5%', icon: DollarSign, trend: 'up' },
    { label: 'Win Rate', value: '68.2%', change: '+5.3%', icon: TrendingUp, trend: 'up' },
    { label: 'Active Strategies', value: '7', change: '+2', icon: Activity, trend: 'up' },
    { label: 'Avg Return', value: '8.4%', change: '-1.2%', icon: BarChart3, trend: 'down' },
  ];

  const openPositions = [
    { symbol: 'NIFTY 22000 CE', entry: '150.50', current: '165.25', pnl: '+$1,475', pnlPercent: '+9.8%' },
    { symbol: 'BANKNIFTY 45500 PE', entry: '220.00', current: '205.50', pnl: '-$725', pnlPercent: '-6.6%' },
    { symbol: 'NIFTY 22500 CE', entry: '85.25', current: '92.00', pnl: '+$337.50', pnlPercent: '+7.9%' },
  ];

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-4rem)] w-full relative overflow-auto"
           style={{
             background: 'linear-gradient(135deg, hsl(var(--glass-gradient-start)) 0%, hsl(var(--glass-gradient-end)) 100%)'
           }}>
        
        {/* Main Content Container */}
        <div className="container max-w-7xl mx-auto p-6 space-y-6">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-semibold mb-2" style={{ color: 'hsl(var(--hero-text))' }}>
              Trading Dashboard
            </h1>
            <p className="text-base" style={{ color: 'hsl(var(--hero-text-muted))' }}>
              Monitor your strategy performance in real-time
            </p>
          </div>

          {/* Performance Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric, index) => (
              <div
                key={index}
                className="rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--glass-bg) / 0.6) 0%, hsl(var(--glass-bg) / 0.4) 100%)',
                  backdropFilter: 'blur(48px) saturate(200%)',
                  WebkitBackdropFilter: 'blur(48px) saturate(200%)',
                  border: '1px solid hsl(var(--glass-border) / 0.3)',
                  boxShadow: '0 12px 48px -12px hsl(var(--glass-shadow) / 0.6), 0 1px 3px 0 hsl(var(--glass-highlight) / 0.1) inset, 0 0 0 1px hsl(var(--glass-highlight) / 0.05) inset'
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-2xl" style={{ 
                    background: 'hsl(var(--accent) / 0.1)',
                    boxShadow: '0 0 20px hsl(var(--accent) / 0.2)'
                  }}>
                    <metric.icon className="h-6 w-6" style={{ color: 'hsl(var(--accent))' }} />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    metric.trend === 'up' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {metric.trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {metric.change}
                  </div>
                </div>
                <div>
                  <p className="text-sm mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    {metric.label}
                  </p>
                  <p className="text-3xl font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                    {metric.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Open Positions Table */}
          <div className="rounded-3xl overflow-hidden"
               style={{
                 background: 'linear-gradient(135deg, hsl(var(--glass-bg) / 0.6) 0%, hsl(var(--glass-bg) / 0.4) 100%)',
                 backdropFilter: 'blur(48px) saturate(200%)',
                 WebkitBackdropFilter: 'blur(48px) saturate(200%)',
                 border: '1px solid hsl(var(--glass-border) / 0.3)',
                 boxShadow: '0 12px 48px -12px hsl(var(--glass-shadow) / 0.6), 0 1px 3px 0 hsl(var(--glass-highlight) / 0.1) inset'
               }}>
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-6" style={{ color: 'hsl(var(--foreground))' }}>
                Open Positions
              </h2>
              <div className="space-y-3">
                {openPositions.map((position, index) => (
                  <div
                    key={index}
                    className="rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5"
                    style={{
                      background: 'linear-gradient(135deg, hsl(var(--card) / 0.5) 0%, hsl(var(--card) / 0.3) 100%)',
                      backdropFilter: 'blur(24px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                      border: '1px solid hsl(var(--glass-border) / 0.2)',
                      boxShadow: '0 4px 16px -4px hsl(var(--glass-shadow) / 0.3)'
                    }}
                  >
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-sm mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>Symbol</p>
                        <p className="font-semibold" style={{ color: 'hsl(var(--foreground))' }}>{position.symbol}</p>
                      </div>
                      <div>
                        <p className="text-sm mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>Entry</p>
                        <p className="font-medium" style={{ color: 'hsl(var(--foreground))' }}>₹{position.entry}</p>
                      </div>
                      <div>
                        <p className="text-sm mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>Current</p>
                        <p className="font-medium" style={{ color: 'hsl(var(--foreground))' }}>₹{position.current}</p>
                      </div>
                      <div>
                        <p className="text-sm mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>P&L</p>
                        <p className="font-medium" style={{ color: 'hsl(var(--foreground))' }}>{position.pnl}</p>
                      </div>
                      <div>
                        <p className="text-sm mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>Return</p>
                        <p className={`font-semibold ${position.pnlPercent.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                          {position.pnlPercent}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chart Placeholder */}
          <div className="rounded-3xl p-6"
               style={{
                 background: 'linear-gradient(135deg, hsl(var(--glass-bg) / 0.6) 0%, hsl(var(--glass-bg) / 0.4) 100%)',
                 backdropFilter: 'blur(48px) saturate(200%)',
                 WebkitBackdropFilter: 'blur(48px) saturate(200%)',
                 border: '1px solid hsl(var(--glass-border) / 0.3)',
                 boxShadow: '0 12px 48px -12px hsl(var(--glass-shadow) / 0.6), 0 1px 3px 0 hsl(var(--glass-highlight) / 0.1) inset'
               }}>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'hsl(var(--foreground))' }}>
              Performance Chart
            </h2>
            <div className="h-64 flex items-center justify-center rounded-2xl"
                 style={{
                   background: 'hsl(var(--muted) / 0.3)',
                   border: '1px dashed hsl(var(--muted-foreground) / 0.2)'
                 }}>
              <PieChart className="h-12 w-12" style={{ color: 'hsl(var(--muted-foreground))' }} />
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
