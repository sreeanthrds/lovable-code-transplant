
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Play, Settings, BarChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBacktestingStore } from './useBacktestingStore';
import EnhancedNumberInput from '@/components/ui/form/enhanced/EnhancedNumberInput';

const BacktestConfigPanel = () => {
  const [activeTab, setActiveTab] = useState('settings');
  const navigate = useNavigate();
  const { config, updateConfig, startBacktest, isRunning, results, resetResults } = useBacktestingStore();

  const timeframeOptions = [
    { value: '1m', label: '1 Minute' },
    { value: '3m', label: '3 Minutes' },
    { value: '5m', label: '5 Minutes' },
    { value: '10m', label: '10 Minutes' },
    { value: '15m', label: '15 Minutes' },
    { value: '30m', label: '30 Minutes' },
    { value: '1h', label: '1 Hour' },
    { value: '1d', label: 'Daily' },
  ];

  const handleStartBacktest = () => {
    resetResults();
    startBacktest(navigate);
  };

  return (
    <div className="p-4 border-t border-border">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Backtest Configuration</h3>
          <TabsList>
            <TabsTrigger value="settings" className="flex items-center gap-1">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-1">
              <BarChart className="h-4 w-4" />
              <span className="hidden sm:inline">Results</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Time Period</CardTitle>
              <CardDescription>Set the time range for backtesting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !config.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {config.startDate ? format(config.startDate, "PPP") : "Select start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={config.startDate || undefined}
                        onSelect={(date) => updateConfig({ startDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <FormLabel>End Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !config.endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {config.endDate ? format(config.endDate, "PPP") : "Select end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={config.endDate || undefined}
                        onSelect={(date) => updateConfig({ endDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <FormLabel>Timeframe</FormLabel>
                <Select
                  value={config.timeframe}
                  onValueChange={(value) => updateConfig({ timeframe: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeframeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Capital & Risk</CardTitle>
              <CardDescription>Configure capital and risk parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FormLabel>Initial Capital</FormLabel>
                  <EnhancedNumberInput
                    value={config.initialCapital}
                    onChange={(value) => updateConfig({ initialCapital: value || 10000 })}
                    min={1000}
                    step={1000}
                  />
                </div>
                
                <div className="space-y-2">
                  <FormLabel>Risk Per Trade (%)</FormLabel>
                  <EnhancedNumberInput
                    value={config.riskPerTrade}
                    onChange={(value) => updateConfig({ riskPerTrade: value || 1 })}
                    min={0.1}
                    max={100}
                    step={0.1}
                  />
                </div>
                
                <div className="space-y-2">
                  <FormLabel>Max Open Positions</FormLabel>
                  <EnhancedNumberInput
                    value={config.maxOpenPositions}
                    onChange={(value) => updateConfig({ maxOpenPositions: value || 1 })}
                    min={1}
                    max={100}
                    step={1}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Execution Settings</CardTitle>
              <CardDescription>Configure execution parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FormLabel>Slippage (%)</FormLabel>
                  <EnhancedNumberInput
                    value={config.slippagePercentage}
                    onChange={(value) => updateConfig({ slippagePercentage: value || 0 })}
                    min={0}
                    max={10}
                    step={0.01}
                  />
                </div>
                
                <div className="space-y-2">
                  <FormLabel>Commission (%)</FormLabel>
                  <EnhancedNumberInput
                    value={config.commissionPercentage}
                    onChange={(value) => updateConfig({ commissionPercentage: value || 0 })}
                    min={0}
                    max={10}
                    step={0.01}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="optimization"
                  checked={config.enableOptimization}
                  onCheckedChange={(checked) => updateConfig({ enableOptimization: checked })}
                />
                <FormLabel htmlFor="optimization" className="cursor-pointer">
                  Enable Parameter Optimization
                </FormLabel>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handleStartBacktest}
                disabled={isRunning}
              >
                {isRunning ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Running Backtest
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run Backtest
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          {results ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Performance Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Total Return</p>
                      <p className="text-xl font-bold text-green-600">+{results.totalReturn.toFixed(2)}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Win Rate</p>
                      <p className="text-xl font-bold">{results.winRate.toFixed(1)}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Sharpe Ratio</p>
                      <p className="text-xl font-bold">{results.sharpeRatio.toFixed(2)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Max Drawdown</p>
                      <p className="text-xl font-bold text-red-500">-{results.maxDrawdown.toFixed(2)}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Trades</p>
                      <p className="text-xl font-bold">{results.tradesCount}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Profit Factor</p>
                      <p className="text-xl font-bold">{results.profitFactor.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Equity Curve</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 w-full relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-muted-foreground text-sm">
                        Equity chart visualization would be displayed here
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button 
                variant="outline" 
                className="w-full" 
                onClick={resetResults}
              >
                Configure New Backtest
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BarChart className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Backtest Results</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Configure your backtest parameters and run a test to see results
              </p>
              <Button onClick={() => setActiveTab('settings')}>
                Go to Settings
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BacktestConfigPanel;
