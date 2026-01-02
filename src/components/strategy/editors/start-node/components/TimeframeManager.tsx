import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, X, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { TimeframeConfig } from '../../action-node/types';
import IndicatorSelector from '../../indicators/IndicatorSelector';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { createTimeframeId, parseTimeframe } from '../utils/timeframeUtils';

const TIMEFRAME_OPTIONS = [
  { value: '1m', label: '1m' },
  { value: '3m', label: '3m' },
  { value: '5m', label: '5m' },
  { value: '10m', label: '10m' },
  { value: '15m', label: '15m' },
  { value: '30m', label: '30m' },
  { value: '1h', label: '1h' },
  { value: '1d', label: '1d' }
] as const;

interface TimeframeManagerProps {
  timeframes: TimeframeConfig[];
  onChange: (timeframes: TimeframeConfig[]) => void;
  maxTimeframes: number;
}

const TimeframeManager: React.FC<TimeframeManagerProps> = ({
  timeframes,
  onChange,
  maxTimeframes
}) => {
  
  const [error, setError] = useState<string | null>(null);
  const [expandedIndicators, setExpandedIndicators] = useState<Record<string, boolean>>({});


  const getTimeframeDisplay = (tf: TimeframeConfig): string => {
    return tf.timeframe;
  };

  const addTimeframe = () => {
    setError(null);
    
    // Check max limit
    if (timeframes.length >= maxTimeframes) {
      setError(`Maximum ${maxTimeframes} timeframes allowed`);
      return;
    }
    
    // Find the first available timeframe option
    const availableOption = TIMEFRAME_OPTIONS.find(option => 
      !timeframes.some(tf => tf.timeframe === option.value)
    );
    
    if (!availableOption) {
      setError('All timeframes have been added');
      return;
    }
    
    const { unit, number } = parseTimeframe(availableOption.value);
    const newTf: TimeframeConfig = {
      timeframe: availableOption.value,
      id: createTimeframeId(availableOption.value),
      indicators: {},
      unit,
      number
    };
    
    onChange([...timeframes, newTf]);
  };

  const removeTimeframe = (id: string) => {
    onChange(timeframes.filter(tf => tf.id !== id));
  };

  const updateTimeframe = (id: string, newValue: string) => {
    const option = TIMEFRAME_OPTIONS.find(opt => opt.value === newValue);
    if (!option) return;
    
    // Check for duplicates (excluding current item)
    const isDuplicate = timeframes.some(tf => 
      tf.id !== id && tf.timeframe === option.value
    );
    
    if (isDuplicate) {
      setError('This timeframe already exists');
      return;
    }
    
    const { unit, number } = parseTimeframe(option.value);
    const updatedTimeframes = timeframes.map(tf => 
      tf.id === id 
        ? { 
            ...tf,
            timeframe: option.value,
            unit,
            number
          }
        : tf
    );
    
    onChange(updatedTimeframes);
    setError(null);
  };

  const getTimeframeIndicators = (timeframeId: string) => {
    const timeframe = timeframes.find(tf => tf.id === timeframeId);
    return timeframe?.indicators || {};
  };

  const handleTimeframeIndicatorsChange = (timeframeId: string, newIndicators: Record<string, any>) => {
    const updatedTimeframes = timeframes.map(tf => 
      tf.id === timeframeId 
        ? { ...tf, indicators: newIndicators }
        : tf
    );
    onChange(updatedTimeframes);
  };

  const toggleIndicatorExpansion = (timeframeId: string) => {
    setExpandedIndicators(prev => ({
      ...prev,
      [timeframeId]: !prev[timeframeId]
    }));
  };

  return (
    <div className="space-y-4">
      {/* Timeframes section */}
      <div className="space-y-2">
        <label className="text-base font-medium">Timeframes</label>
        
        {/* Display existing timeframes */}
        {timeframes.length > 0 && (
          <div className="space-y-4">
            {timeframes.map((tf) => {
              const timeframeIndicators = getTimeframeIndicators(tf.id);
              const indicatorCount = Object.keys(timeframeIndicators).length;
              const isExpanded = expandedIndicators[tf.id];
              const hasIndicators = indicatorCount > 0;
              
              return (
                <Card 
                  key={tf.id} 
                  className="transition-all duration-200"
                >
                  <CardHeader className="pb-1 pt-1 px-2">
                    <div className="flex flex-col gap-1">
                      {/* First row - Status, Timeframe, and Actions */}
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1 min-w-0 flex-1">
                          {/* Status Indicator */}
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            hasIndicators ? 'bg-blue-500' : 'bg-muted-foreground/50'
                          }`} />
                          
                          {/* Timeframe Selector */}
                          <Select
                            value={getTimeframeDisplay(tf)}
                            onValueChange={(value) => updateTimeframe(tf.id, value)}
                          >
                            <SelectTrigger className="w-20 h-6 text-sm flex-shrink-0">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-h-40 overflow-y-auto">
                              {TIMEFRAME_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value} className="text-sm">
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTimeframe(tf.id)}
                              className="h-5 w-5 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                              title="Remove timeframe"
                            >
                            <X className="h-2 w-2" />
                          </Button>
                        </div>
                      </div>

                      {/* Second row - Collapsible Header */}
                      <button
                        onClick={() => toggleIndicatorExpansion(tf.id)}
                        className="w-full flex items-center justify-between px-2 py-1.5 rounded-md border border-white/20 bg-white/[0.02] hover:bg-white/10 hover:border-white/30 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-2">
                          <div className={`transition-transform ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
                            <ChevronDown className="h-4 w-4 text-foreground/70" />
                          </div>
                          <span className="text-sm font-medium">
                            {indicatorCount} indicator{indicatorCount !== 1 ? 's' : ''}
                          </span>
                          
                          {/* Warning icon when no indicators */}
                          {!hasIndicators && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="cursor-help" onClick={(e) => e.stopPropagation()}>
                                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-60">
                                  <p className="text-sm">No indicators have been added. Use the dropdown below to add technical indicators to your strategy.</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </button>
                    </div>

                    {/* Indicator Pills - Show when collapsed */}
                    {!isExpanded && hasIndicators && (
                      <div className="flex flex-wrap gap-1 mt-1 overflow-hidden">
                        {Object.entries(timeframeIndicators).map(([indicatorId, indicator]) => (
                          <div
                            key={indicatorId}
                            className="inline-flex items-center gap-1 px-1 py-0.5 bg-primary/10 text-primary rounded-full text-sm border border-primary/20 min-w-0 max-w-full"
                          >
                            <span className="truncate whitespace-nowrap max-w-20">
                              {indicator.display_name || indicator.indicator_name || indicatorId}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const updatedIndicators = { ...timeframeIndicators };
                                delete updatedIndicators[indicatorId];
                                handleTimeframeIndicatorsChange(tf.id, updatedIndicators);
                              }}
                              className="hover:bg-primary/30 rounded-full p-0.5 transition-colors flex-shrink-0"
                              title="Remove indicator"
                            >
                              <X className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                  </CardHeader>

                  {/* Expanded Indicators Section */}
                  {isExpanded && (
                    <CardContent className="pt-0 px-1 pb-1">
                      
                      <IndicatorSelector
                        selectedIndicators={timeframeIndicators}
                        onChange={(newIndicators) => handleTimeframeIndicatorsChange(tf.id, newIndicators)}
                      />
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
        
        {/* Add new timeframe button */}
        <Button 
          onClick={addTimeframe}
          disabled={timeframes.length >= maxTimeframes}
          size="sm"
          className="self-start bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
          title={error || (timeframes.length >= maxTimeframes ? `Maximum ${maxTimeframes} timeframes allowed` : 'Add a new timeframe')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Timeframe
        </Button>
      </div>
      
    </div>
  );
};

export default TimeframeManager;
