
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, X, TrendingUp, DollarSign, Target, AlertTriangle, Plus, Settings } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

interface InteractiveDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InteractiveDemoModal = ({ isOpen, onClose }: InteractiveDemoModalProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showingResults, setShowingResults] = useState(false);

  // Demo steps for strategy building
  const demoSteps = [
    { title: 'Welcome to Strategy Builder', description: 'Let\'s build a momentum breakout strategy step by step' },
    { title: 'Add Start Node', description: 'Setting up NIFTY 50 as our trading instrument' },
    { title: 'Add Entry Signal', description: 'Creating a condition: RSI > 70 AND Price breaks 20-day high' },
    { title: 'Add Entry Action', description: 'Configure buy order with 2% position size' },
    { title: 'Add Exit Conditions', description: 'Setting stop loss at 3% and take profit at 6%' },
    { title: 'Strategy Complete', description: 'Ready for backtesting! Let\'s see the results...' },
  ];

  // Mock nodes for visual representation
  const [visibleNodes, setVisibleNodes] = useState<string[]>([]);

  const strategyNodes = [
    { id: 'start', type: 'Start', x: 100, y: 100, label: 'NIFTY 50', color: 'bg-green-100 border-green-300' },
    { id: 'signal', type: 'Entry Signal', x: 300, y: 100, label: 'RSI > 70 + Breakout', color: 'bg-blue-100 border-blue-300' },
    { id: 'entry', type: 'Entry Action', x: 500, y: 100, label: 'Buy 2%', color: 'bg-purple-100 border-purple-300' },
    { id: 'stop', type: 'Stop Loss', x: 400, y: 200, label: 'SL: -3%', color: 'bg-red-100 border-red-300' },
    { id: 'target', type: 'Take Profit', x: 600, y: 200, label: 'TP: +6%', color: 'bg-green-100 border-green-300' },
  ];

  // Results data
  const equityData = [
    { day: 1, value: 100000 },
    { day: 2, value: 102500 },
    { day: 3, value: 98000 },
    { day: 4, value: 105000 },
    { day: 5, value: 108500 },
    { day: 6, value: 107200 },
    { day: 7, value: 112800 },
  ];

  const dailyPnLData = equityData.map((d, i) => ({ 
    day: d.day, 
    pnl: i > 0 ? d.value - equityData[i-1].value : 0 
  }));

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentStep < demoSteps.length - 1) {
      interval = setInterval(() => {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        
        // Add nodes progressively
        if (nextStep === 1) setVisibleNodes(['start']);
        if (nextStep === 2) setVisibleNodes(['start', 'signal']);
        if (nextStep === 3) setVisibleNodes(['start', 'signal', 'entry']);
        if (nextStep === 4) setVisibleNodes(['start', 'signal', 'entry', 'stop', 'target']);
        if (nextStep === 5) {
          setShowingResults(true);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep]);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setVisibleNodes([]);
    setShowingResults(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">Interactive Strategy Builder Demo</DialogTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
              <Button size="sm" onClick={handlePlay}>
                {isPlaying ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Step Indicator */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-4">
              <div className="flex items-center space-x-3">
                <div className="h-3 w-3 rounded-full bg-primary animate-pulse"></div>
                <div>
                  <h3 className="font-semibold">{demoSteps[currentStep]?.title}</h3>
                  <p className="text-sm text-foreground/70">{demoSteps[currentStep]?.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {!showingResults ? (
            /* Strategy Builder View */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Strategy Canvas */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Strategy Canvas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative h-80 bg-muted/20 rounded-lg overflow-hidden">
                    {/* Grid background */}
                    <div className="absolute inset-0 opacity-30">
                      <svg width="100%" height="100%">
                        <defs>
                          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1"/>
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                      </svg>
                    </div>
                    
                    {/* Strategy Nodes */}
                    {strategyNodes.map((node, index) => (
                      visibleNodes.includes(node.id) && (
                        <div
                          key={node.id}
                          className={`absolute rounded-lg border-2 p-3 shadow-sm transition-all duration-500 ${node.color}`}
                          style={{
                            left: `${node.x}px`,
                            top: `${node.y}px`,
                            transform: 'scale(0.8)',
                          }}
                        >
                          <div className="text-xs font-medium">{node.type}</div>
                          <div className="text-sm">{node.label}</div>
                        </div>
                      )
                    ))}
                    
                    {/* Connections between nodes */}
                    {visibleNodes.length > 1 && (
                      <svg className="absolute inset-0 pointer-events-none">
                        {visibleNodes.includes('start') && visibleNodes.includes('signal') && (
                          <line x1="180" y1="120" x2="240" y2="120" stroke="#3B82F6" strokeWidth="2" />
                        )}
                        {visibleNodes.includes('signal') && visibleNodes.includes('entry') && (
                          <line x1="380" y1="120" x2="400" y2="120" stroke="#3B82F6" strokeWidth="2" />
                        )}
                        {visibleNodes.includes('entry') && visibleNodes.includes('stop') && (
                          <line x1="520" y1="140" x2="420" y2="180" stroke="#EF4444" strokeWidth="2" />
                        )}
                        {visibleNodes.includes('entry') && visibleNodes.includes('target') && (
                          <line x1="580" y1="140" x2="620" y2="180" stroke="#22C55E" strokeWidth="2" />
                        )}
                      </svg>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Node Palette */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add Nodes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {['Entry Signal', 'Exit Signal', 'Entry Action', 'Exit Action', 'Modify Position'].map((nodeType) => (
                      <div key={nodeType} className="p-2 rounded border bg-muted/50 text-sm cursor-pointer hover:bg-muted transition-colors">
                        {nodeType}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-2">Current Strategy:</h4>
                    <div className="text-xs text-foreground/70 space-y-1">
                      <div>• Instrument: NIFTY 50</div>
                      <div>• Entry: RSI &gt; 70 + Breakout</div>
                      <div>• Position Size: 2%</div>
                      <div>• Stop Loss: 3%</div>
                      <div>• Take Profit: 6%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Results View */
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm text-foreground/70">Net Profit</p>
                        <p className="text-lg font-bold text-green-600">+₹12,800</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-foreground/70">Total Return</p>
                        <p className="text-lg font-bold text-green-600">+12.8%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="text-sm text-foreground/70">Win Rate</p>
                        <p className="text-lg font-bold">68.5%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="text-sm text-foreground/70">Max Drawdown</p>
                        <p className="text-lg font-bold text-red-600">-5.2%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Equity Curve</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={equityData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Portfolio Value']} />
                          <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Daily P&L</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dailyPnLData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip formatter={(value: any) => [`₹${value.toLocaleString()}`, 'P&L']} />
                          <Bar dataKey="pnl">
                            {dailyPnLData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? "#22C55E" : "#EF4444"} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Demo Notice */}
          <Card className="bg-muted/30">
            <CardContent className="pt-4">
              <p className="text-sm text-foreground/70 text-center">
                This is a simulated demo showing how to build strategies visually. 
                <span className="font-medium"> Start building your own strategy for free!</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InteractiveDemoModal;
