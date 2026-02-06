
import React, { useState, useEffect, useId } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RotateCcw, Clock, Hash } from 'lucide-react';
import { EnhancedNumberInput } from '@/components/ui/form/enhanced';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';

export type CandleSelectionMode = 'offset' | 'by_time' | 'by_number';

interface CandleOffsetSelectorProps {
  offset: number;
  onOffsetChange: (value: number) => void;
  label?: string;
  // Enhanced props for new modes
  selectionMode?: CandleSelectionMode;
  onSelectionModeChange?: (mode: CandleSelectionMode) => void;
  candleTime?: string;
  onCandleTimeChange?: (time: string) => void;
  candleNumber?: number;
  onCandleNumberChange?: (num: number) => void;
}

const CandleOffsetSelector: React.FC<CandleOffsetSelectorProps> = ({
  offset,
  onOffsetChange,
  label = "Look back:",
  selectionMode = 'offset',
  onSelectionModeChange,
  candleTime = '',
  onCandleTimeChange,
  candleNumber = 1,
  onCandleNumberChange
}) => {
  // Generate unique IDs for this component instance to avoid conflicts
  const instanceId = useId();
  const [inputMode, setInputMode] = useState<'preset' | 'custom'>('preset');
  const isEnhancedMode = !!onSelectionModeChange;
  
  // Set default to -1 (previous candle) if offset is 0 and in offset mode
  useEffect(() => {
    if (offset === 0 && selectionMode === 'offset') {
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

  const handleModeChange = (mode: CandleSelectionMode) => {
    // Set default values for each mode
    if (mode === 'offset') {
      onOffsetChange(-1);
    } else if (mode === 'by_time') {
      onCandleTimeChange?.('09:15');
    } else if (mode === 'by_number') {
      onCandleNumberChange?.(1);
    }
    // Update mode after setting values to avoid state conflicts
    onSelectionModeChange?.(mode);
  };

  // Render offset selector content
  const renderOffsetContent = () => (
    <>
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
    </>
  );

  // Render time-based selector
  const renderTimeContent = () => (
    <div className="flex items-center gap-3 p-2 bg-orange-100/50 dark:bg-orange-900/20 rounded-md border border-orange-200/50 dark:border-orange-700/50">
      <Label className="text-sm font-medium text-orange-700 dark:text-orange-400 whitespace-nowrap">
        Candle at time:
      </Label>
      <Input
        type="time"
        value={candleTime}
        onChange={(e) => onCandleTimeChange?.(e.target.value)}
        className="w-32 h-9 border-orange-300 dark:border-orange-700 focus:border-orange-500 dark:focus:border-orange-500 focus:ring-orange-500/20"
      />
      <span className="text-xs text-muted-foreground">(e.g., 09:15)</span>
    </div>
  );

  // Render number-based selector
  const renderNumberContent = () => (
    <div className="flex items-center gap-3 p-2 bg-orange-100/50 dark:bg-orange-900/20 rounded-md border border-orange-200/50 dark:border-orange-700/50">
      <Label className="text-sm font-medium text-orange-700 dark:text-orange-400 whitespace-nowrap">
        Candle number:
      </Label>
      <EnhancedNumberInput 
        value={candleNumber}
        onChange={(value) => onCandleNumberChange?.(value || 1)}
        className="w-24 h-9 border-orange-300 dark:border-orange-700 focus:border-orange-500 dark:focus:border-orange-500 focus:ring-orange-500/20"
        min={1}
        max={500}
        step={1}
        placeholder="1"
      />
      <span className="text-xs text-muted-foreground">(from day start)</span>
    </div>
  );

  // If not in enhanced mode, render simple offset selector
  if (!isEnhancedMode) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-orange-100 dark:bg-orange-900/50 border border-orange-200 dark:border-orange-700 flex items-center justify-center">
            <RotateCcw className="h-3 w-3 text-orange-600 dark:text-orange-400" />
          </div>
          <Label className="text-sm font-medium text-orange-700 dark:text-orange-400">
            {label}
          </Label>
        </div>
        {renderOffsetContent()}
      </div>
    );
  }

  // Enhanced mode with mode selection
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-orange-100 dark:bg-orange-900/50 border border-orange-200 dark:border-orange-700 flex items-center justify-center">
          <RotateCcw className="h-3 w-3 text-orange-600 dark:text-orange-400" />
        </div>
        <Label className="text-sm font-medium text-orange-700 dark:text-orange-400">
          {label}
        </Label>
      </div>

      {/* Mode Selection */}
      <RadioGroup
        value={selectionMode}
        onValueChange={(v) => handleModeChange(v as CandleSelectionMode)}
        className="flex flex-wrap gap-2"
      >
        <div className="flex items-center">
          <RadioGroupItem value="offset" id={`${instanceId}-mode-offset`} className="peer sr-only" />
          <Label
            htmlFor={`${instanceId}-mode-offset`}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md border cursor-pointer transition-colors text-sm",
              selectionMode === 'offset'
                ? "bg-orange-100 dark:bg-orange-900/50 border-orange-400 dark:border-orange-600 text-orange-700 dark:text-orange-300"
                : "bg-background border-border hover:bg-muted"
            )}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            From Current
          </Label>
        </div>

        <div className="flex items-center">
          <RadioGroupItem value="by_time" id={`${instanceId}-mode-time`} className="peer sr-only" />
          <Label
            htmlFor={`${instanceId}-mode-time`}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md border cursor-pointer transition-colors text-sm",
              selectionMode === 'by_time'
                ? "bg-orange-100 dark:bg-orange-900/50 border-orange-400 dark:border-orange-600 text-orange-700 dark:text-orange-300"
                : "bg-background border-border hover:bg-muted"
            )}
          >
            <Clock className="h-3.5 w-3.5" />
            By Time
          </Label>
        </div>

        <div className="flex items-center">
          <RadioGroupItem value="by_number" id={`${instanceId}-mode-number`} className="peer sr-only" />
          <Label
            htmlFor={`${instanceId}-mode-number`}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md border cursor-pointer transition-colors text-sm",
              selectionMode === 'by_number'
                ? "bg-orange-100 dark:bg-orange-900/50 border-orange-400 dark:border-orange-600 text-orange-700 dark:text-orange-300"
                : "bg-background border-border hover:bg-muted"
            )}
          >
            <Hash className="h-3.5 w-3.5" />
            By Number
          </Label>
        </div>
      </RadioGroup>

      {/* Mode-specific content */}
      {selectionMode === 'offset' && renderOffsetContent()}
      {selectionMode === 'by_time' && renderTimeContent()}
      {selectionMode === 'by_number' && renderNumberContent()}
    </div>
  );
};

export default CandleOffsetSelector;
