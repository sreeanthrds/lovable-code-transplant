import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, TrendingUp, Lock } from 'lucide-react';
import { useClerkUser } from '@/hooks/useClerkUser';
import { useToast } from '@/hooks/use-toast';
import { strategyService } from '@/lib/supabase/services/strategy-service';
import { cn } from '@/lib/utils';
interface BacktestConfig {
  strategyId: string;
  strategyName?: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  commission: number;
  slippage: number;
  maxPositionSize: number;
  riskPerTrade: number;
}

interface Strategy {
  id: string;
  name: string;
  description?: string;
  isTestStrategy?: boolean;
}

// Test strategy ID constant - used to identify test mode
export const TEST_STRATEGY_ID = '__test_strategy__';

interface BacktestFormProps {
  onSubmit: (config: BacktestConfig) => void;
  isLoading?: boolean;
}

const STORAGE_KEY = 'backtest-form-params';

const getDefaultConfig = (): BacktestConfig => ({
  strategyId: '',
  startDate: '2024-01-01',
  endDate: new Date().toISOString().split('T')[0],
  initialCapital: 100000,
  commission: 0.001,
  slippage: 0.0005,
  maxPositionSize: 0.1,
  riskPerTrade: 0.02
});

const loadSavedConfig = (): BacktestConfig => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...getDefaultConfig(), ...parsed };
    }
  } catch (e) {
    console.error('Error loading saved backtest config:', e);
  }
  return getDefaultConfig();
};

const BacktestForm: React.FC<BacktestFormProps> = ({ onSubmit, isLoading = false }) => {
  const [searchParams] = useSearchParams();
  const { userId, isAuthenticated } = useClerkUser();
  const { toast } = useToast();
  
  // Get strategy ID from URL params if launched from strategy card
  const preSelectedStrategyId = searchParams.get('strategyId');
  const isStrategySpecific = !!preSelectedStrategyId;
  
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loadingStrategies, setLoadingStrategies] = useState(false);
  
  // Load saved config, but URL param takes precedence for strategyId
  const [config, setConfig] = useState<BacktestConfig>(() => {
    const saved = loadSavedConfig();
    return {
      ...saved,
      strategyId: preSelectedStrategyId || saved.strategyId,
    };
  });

  // Load strategies for dropdown (only if not strategy-specific)
  useEffect(() => {
    if (!isStrategySpecific && isAuthenticated && userId) {
      loadStrategies();
    }
  }, [isStrategySpecific, isAuthenticated, userId]);

  // Load specific strategy name if pre-selected
  useEffect(() => {
    if (preSelectedStrategyId && isAuthenticated && userId) {
      loadStrategyName(preSelectedStrategyId);
    }
  }, [preSelectedStrategyId, isAuthenticated, userId]);

  const loadStrategies = async () => {
    setLoadingStrategies(true);
    try {
      let finalStrategies: Strategy[] = [];

      // Add test strategy first
      finalStrategies.push({
        id: TEST_STRATEGY_ID,
        name: '🧪 Test Strategy (Static Data)',
        description: 'Uses static JSON files for UI testing',
        isTestStrategy: true
      });

      // Load from database
      if (userId) {
        try {
          const supabaseData = await strategyService.getStrategies(userId);
          const dbStrategies = supabaseData.map(strategy => ({
            id: strategy.id,
            name: strategy.name,
            description: strategy.description || ''
          }));
          finalStrategies = [...finalStrategies, ...dbStrategies];
          console.log('Loaded from database:', dbStrategies.length);
        } catch (error) {
          console.error('Error loading from database:', error);
        }
      } else {
        console.warn('No user ID available');
      }

      setStrategies(finalStrategies);
    } catch (error) {
      console.error('Error loading strategies:', error);
      toast({
        title: "Error loading strategies",
        description: "Failed to load your strategies",
        variant: "destructive",
      });
    } finally {
      setLoadingStrategies(false);
    }
  };

  const loadStrategyName = async (strategyId: string) => {
    if (!userId) return;
    
    try {
      const strategyData = await strategyService.getStrategyById(strategyId, userId);
      if (strategyData) {
        setConfig(prev => ({ ...prev, strategyName: strategyData.name }));
      }
    } catch (error) {
      console.error('Error loading strategy name:', error);
    }
  };

  const MIN_YEAR = 2024;

  const validateDates = (): boolean => {
    const startDate = new Date(config.startDate);
    const endDate = new Date(config.endDate);
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();

    if (startYear < MIN_YEAR) {
      toast({
        title: "Invalid start date",
        description: `Start date cannot be earlier than ${MIN_YEAR}. Data is only available from ${MIN_YEAR} onwards.`,
        variant: "destructive",
      });
      return false;
    }

    if (endYear < MIN_YEAR) {
      toast({
        title: "Invalid end date",
        description: `End date cannot be earlier than ${MIN_YEAR}. Data is only available from ${MIN_YEAR} onwards.`,
        variant: "destructive",
      });
      return false;
    }

    if (endDate < startDate) {
      toast({
        title: "Invalid date range",
        description: "End date must be on or after start date.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!config.strategyId) {
      toast({
        title: "Strategy required",
        description: "Please select a strategy to backtest",
        variant: "destructive",
      });
      return;
    }

    // Skip date validation for test strategy
    if (config.strategyId !== TEST_STRATEGY_ID && !validateDates()) {
      return;
    }
    
    // Save config to localStorage for next time
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.error('Error saving backtest config:', e);
    }
    
    onSubmit(config);
  };

  const updateConfig = (field: keyof BacktestConfig, value: any) => {
    setConfig(prev => {
      const updated = { ...prev, [field]: value };
      // Auto-save on each change
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving backtest config:', e);
      }
      return updated;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Strategy Selection */}
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-4">
          <TrendingUp className="w-5 h-5 mr-2" />
          <CardTitle className="text-lg">Strategy Selection</CardTitle>
          {isStrategySpecific && (
            <Badge variant="secondary" className="ml-auto">
              <Lock className="w-3 h-3 mr-1" />
              Pre-selected
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {isStrategySpecific ? (
            <div className="space-y-2">
              <Label>Selected Strategy</Label>
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium">{config.strategyName || 'Loading...'}</p>
                <p className="text-sm text-muted-foreground">Strategy ID: {preSelectedStrategyId}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="strategy">Select Strategy</Label>
              <Select 
                value={config.strategyId} 
                onValueChange={(value) => updateConfig('strategyId', value)}
                disabled={loadingStrategies}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingStrategies ? "Loading strategies..." : "Choose a strategy"} />
                </SelectTrigger>
                <SelectContent>
                  {strategies.map((strategy) => (
                    <SelectItem key={strategy.id} value={strategy.id}>
                      {strategy.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Date Range */}
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-4">
          <CalendarIcon className="w-5 h-5 mr-2" />
          <CardTitle className="text-lg">Date Range</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Date</Label>
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
                  {config.startDate ? format(new Date(config.startDate), "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border border-border z-50" align="start">
                <Calendar
                  mode="single"
                  selected={config.startDate ? new Date(config.startDate) : undefined}
                  onSelect={(date) => date && updateConfig('startDate', format(date, 'yyyy-MM-dd'))}
                  disabled={(date) => date < new Date('2024-01-01') || date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">Min: Jan 2024</p>
          </div>
          <div className="space-y-2">
            <Label>End Date</Label>
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
                  {config.endDate ? format(new Date(config.endDate), "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border border-border z-50" align="start">
                <Calendar
                  mode="single"
                  selected={config.endDate ? new Date(config.endDate) : undefined}
                  onSelect={(date) => date && updateConfig('endDate', format(date, 'yyyy-MM-dd'))}
                  disabled={(date) => date < new Date('2024-01-01') || date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="md:col-span-2">
        <Button 
          type="submit" 
          className="w-full" 
          size="lg"
          disabled={isLoading || !config.strategyId}
        >
          {isLoading ? 'Running Backtest...' : 'Start Backtest'}
        </Button>
      </div>
    </form>
  );
};

export default BacktestForm;