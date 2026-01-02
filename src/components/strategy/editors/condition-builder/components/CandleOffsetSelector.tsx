
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RotateCcw } from 'lucide-react';
import { EnhancedNumberInput } from '@/components/ui/form/enhanced';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface CandleOffsetSelectorProps {
  offset: number;
  onOffsetChange: (value: number) => void;
  label?: string;
}

const CandleOffsetSelector: React.FC<CandleOffsetSelectorProps> = ({
  offset,
  onOffsetChange,
  label = "Candle Time:"
}) => {
  const [inputMode, setInputMode] = useState<'preset' | 'custom'>('preset');
  
  // Set default to -1 (previous candle) if offset is 0
  useEffect(() => {
    if (offset === 0) {
      onOffsetChange(-1);
    }
  }, []);
  
  useEffect(() => {
    if (offset < -5 || offset > 0) {
      setInputMode('custom');
    } else {
      setInputMode('preset');
    }
  }, []);

  const handlePresetChange = (value: string) => {
    if (value === 'custom') {
      setInputMode('custom');
    } else {
      onOffsetChange(parseInt(value));
      setInputMode('preset');
    }
  };
  
  const handleCustomChange = (value: number | undefined) => {
    if (value !== undefined) {
      const finalValue = value > 0 ? -value : value;
      onOffsetChange(finalValue);
    }
  };

  const getCurrentPresetValue = () => {
    if (inputMode === 'custom' || offset < -5 || offset > 0) {
      return 'custom';
    }
    return String(offset);
  };

  return (
    <div className="p-3 border border-orange-200 rounded-lg bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/30">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-orange-100 dark:bg-orange-900/50 border border-orange-200 dark:border-orange-700 flex items-center justify-center">
            <RotateCcw className="h-3 w-3 text-orange-600 dark:text-orange-400" />
          </div>
          <Label className="text-sm font-medium text-orange-700 dark:text-orange-400">
            {label}
          </Label>
        </div>
        
        <div className="flex items-center gap-3">
          <Select 
            value={getCurrentPresetValue()} 
            onValueChange={handlePresetChange}
          >
            <SelectTrigger className="h-9 border-orange-300 dark:border-orange-700 focus:border-orange-500 dark:focus:border-orange-500 focus:ring-orange-500/20">
              <SelectValue placeholder="Select lookback period..." />
            </SelectTrigger>
            <SelectContent>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative flex cursor-not-allowed select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none text-muted-foreground opacity-50">
                      Current candle
                      <span className="ml-2 text-xs bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded">
                        Coming soon
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[200px]">
                    <p>Indicator values on the current candle are not available yet as the candle is still forming.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <SelectItem value="-1">Previous candle</SelectItem>
              <SelectItem value="-2">2 candles ago</SelectItem>
              <SelectItem value="-3">3 candles ago</SelectItem>
              <SelectItem value="-4">4 candles ago</SelectItem>
              <SelectItem value="-5">5 candles ago</SelectItem>
              <SelectItem value="custom">Custom lookback...</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {inputMode === 'custom' && (
          <div className={cn("flex items-center gap-3 p-2 bg-orange-100/50 dark:bg-orange-900/20 rounded-md border border-orange-200/50 dark:border-orange-700/50", inputMode === 'custom' ? 'animate-in fade-in-0 slide-in-from-top-1' : '')}>
            <Label className="text-sm font-medium text-orange-700 dark:text-orange-400 whitespace-nowrap">
              Candles ago:
            </Label>
            <EnhancedNumberInput 
              value={Math.abs(offset)}
              onChange={(value) => handleCustomChange(value ? -Math.abs(value) : 0)}
              className="w-24 h-9 border-orange-300 dark:border-orange-700 focus:border-orange-500 dark:focus:border-orange-500 focus:ring-orange-500/20"
              min={1}
              max={100}
              step={1}
              placeholder="1"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CandleOffsetSelector;
