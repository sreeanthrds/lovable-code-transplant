import React, { useState } from 'react';
import AppLayout from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown } from 'lucide-react';

const OptionChain = () => {
  const [activeExpiry, setActiveExpiry] = useState('Weekly');
  const [selectedStrike, setSelectedStrike] = useState<number | null>(null);
  
  const expiryOptions = ['Weekly', 'Monthly', 'Quarterly'];
  
  // Mock option chain data
  const strikeData = [
    { strike: 21800, callOI: 45000, callLTP: 185.50, putLTP: 12.30, putOI: 12000 },
    { strike: 21900, callOI: 52000, callLTP: 125.75, putLTP: 18.40, putOI: 18500 },
    { strike: 22000, callOI: 78000, callLTP: 85.25, putLTP: 32.50, putOI: 45000 },
    { strike: 22100, callOI: 45000, callLTP: 52.00, putLTP: 65.75, putOI: 65000 },
    { strike: 22200, callOI: 28000, callLTP: 28.50, putLTP: 115.25, putOI: 48000 },
  ];
  
  const atmStrike = 22000; // At-the-money strike
  
  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-4rem)] w-full relative overflow-auto"
           style={{
             background: 'linear-gradient(135deg, hsl(var(--glass-gradient-start)) 0%, hsl(var(--glass-gradient-end)) 100%)'
           }}>
        
        <div className="container max-w-7xl mx-auto p-6 space-y-6">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-semibold mb-2" style={{ color: 'hsl(var(--hero-text))' }}>
              Option Chain
            </h1>
            <p className="text-base" style={{ color: 'hsl(var(--hero-text-muted))' }}>
              Real-time option chain analysis for NIFTY
            </p>
          </div>
          
          {/* Filters & Controls */}
          <div className="flex flex-wrap gap-3 mb-6">
            {expiryOptions.map((expiry) => (
              <Button
                key={expiry}
                onClick={() => setActiveExpiry(expiry)}
                variant={activeExpiry === expiry ? 'default' : 'outline'}
                className="rounded-2xl px-6 transition-all duration-300"
                style={activeExpiry === expiry ? {
                  background: 'hsl(var(--primary))',
                  color: 'hsl(var(--primary-foreground))',
                  boxShadow: '0 0 20px hsl(var(--primary) / 0.4)'
                } : {}}
              >
                {expiry}
              </Button>
            ))}
          </div>
          
          {/* Real-time Price Widget */}
          <div className="rounded-3xl p-6 mb-6"
               style={{
                 background: 'linear-gradient(135deg, hsl(var(--glass-bg) / 0.6) 0%, hsl(var(--glass-bg) / 0.4) 100%)',
                 backdropFilter: 'blur(48px) saturate(200%)',
                 WebkitBackdropFilter: 'blur(48px) saturate(200%)',
                 border: '1px solid hsl(var(--glass-border) / 0.3)',
                 boxShadow: '0 12px 48px -12px hsl(var(--glass-shadow) / 0.6), 0 1px 3px 0 hsl(var(--glass-highlight) / 0.1) inset'
               }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>NIFTY 50</p>
                <p className="text-4xl font-semibold" style={{ color: 'hsl(var(--foreground))' }}>22,045.50</p>
              </div>
              <div className="flex items-center gap-2 text-green-500">
                <TrendingUp className="h-6 w-6" />
                <div className="text-right">
                  <p className="text-2xl font-semibold">+125.25</p>
                  <p className="text-sm">+0.57%</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Option Chain Table */}
          <div className="rounded-3xl overflow-hidden"
               style={{
                 background: 'linear-gradient(135deg, hsl(var(--glass-bg) / 0.6) 0%, hsl(var(--glass-bg) / 0.4) 100%)',
                 backdropFilter: 'blur(48px) saturate(200%)',
                 WebkitBackdropFilter: 'blur(48px) saturate(200%)',
                 border: '1px solid hsl(var(--glass-border) / 0.3)',
                 boxShadow: '0 12px 48px -12px hsl(var(--glass-shadow) / 0.6), 0 1px 3px 0 hsl(var(--glass-highlight) / 0.1) inset'
               }}>
            
            {/* Table Header */}
            <div className="p-6 border-b" style={{ borderColor: 'hsl(var(--glass-border) / 0.3)' }}>
              <div className="grid grid-cols-5 gap-4 text-center font-semibold"
                   style={{ color: 'hsl(var(--foreground))' }}>
                <div>Call OI</div>
                <div>Call LTP</div>
                <div>Strike</div>
                <div>Put LTP</div>
                <div>Put OI</div>
              </div>
            </div>
            
            {/* Table Body */}
            <div className="p-4 space-y-2">
              {strikeData.map((row, index) => {
                const isATM = row.strike === atmStrike;
                const isSelected = selectedStrike === row.strike;
                
                return (
                  <div
                    key={index}
                    onClick={() => setSelectedStrike(row.strike)}
                    className="grid grid-cols-5 gap-4 text-center py-3 px-4 rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-0.5"
                    style={{
                      background: isATM 
                        ? 'linear-gradient(135deg, hsl(var(--accent) / 0.2) 0%, hsl(var(--accent) / 0.1) 100%)'
                        : isSelected
                        ? 'linear-gradient(135deg, hsl(var(--card) / 0.6) 0%, hsl(var(--card) / 0.4) 100%)'
                        : 'linear-gradient(135deg, hsl(var(--card) / 0.4) 0%, hsl(var(--card) / 0.2) 100%)',
                      backdropFilter: 'blur(24px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                      border: isATM 
                        ? '1px solid hsl(var(--accent) / 0.4)'
                        : '1px solid hsl(var(--glass-border) / 0.2)',
                      boxShadow: isATM
                        ? '0 0 20px hsl(var(--accent) / 0.3), 0 4px 16px -4px hsl(var(--glass-shadow) / 0.3)'
                        : '0 4px 16px -4px hsl(var(--glass-shadow) / 0.3)'
                    }}
                  >
                    <div style={{ color: 'hsl(var(--foreground))' }}>
                      {row.callOI.toLocaleString()}
                    </div>
                    <div className="font-semibold text-green-500">
                      ₹{row.callLTP}
                    </div>
                    <div className="font-bold" style={{ 
                      color: isATM ? 'hsl(var(--accent))' : 'hsl(var(--foreground))',
                      fontSize: isATM ? '1.1em' : '1em'
                    }}>
                      {row.strike}
                      {isATM && <span className="ml-2 text-xs">(ATM)</span>}
                    </div>
                    <div className="font-semibold text-red-500">
                      ₹{row.putLTP}
                    </div>
                    <div style={{ color: 'hsl(var(--foreground))' }}>
                      {row.putOI.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
        </div>
      </div>
    </AppLayout>
  );
};

export default OptionChain;
