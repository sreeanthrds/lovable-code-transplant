import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import { TimeframeConfig } from '../../action-node/types';
import { formatTimeframeDisplay } from '../utils/timeframeUtils';
import IndicatorSelector from '../../indicators/IndicatorSelector';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface IndicatorManagerProps {
  symbol: string;
  timeframes: TimeframeConfig[];
  onChange: (timeframes: TimeframeConfig[]) => void;
}

const IndicatorManager: React.FC<IndicatorManagerProps> = ({
  symbol,
  timeframes,
  onChange
}) => {
  const [openTimeframes, setOpenTimeframes] = useState<Record<string, boolean>>({});

  const toggleTimeframe = (timeframeId: string) => {
    setOpenTimeframes(prev => ({
      ...prev,
      [timeframeId]: !prev[timeframeId]
    }));
  };

  const handleTimeframeIndicatorsChange = (timeframeId: string, newIndicators: Record<string, any>) => {
    const updatedTimeframes = timeframes.map(tf => 
      tf.id === timeframeId 
        ? { ...tf, indicators: newIndicators }
        : tf
    );
    onChange(updatedTimeframes);
  };

  if (timeframes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Add timeframes in the "Timeframes" tab first to configure indicators</p>
        <p className="text-xs mt-2">Each timeframe will have its own indicator section</p>
      </div>
    );
  }

  if (!symbol) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Select a symbol first to configure indicators</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {timeframes.map((timeframe) => {
        const timeframeIndicators = timeframe.indicators || {};
        const indicatorCount = Object.keys(timeframeIndicators).length;
        const isOpen = openTimeframes[timeframe.id] ?? true;
        
        return (
          <Collapsible
            key={timeframe.id}
            open={isOpen}
            onOpenChange={() => toggleTimeframe(timeframe.id)}
          >
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden transition-all hover:border-border">
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-sm flex items-center gap-2">
                        {symbol}
                        <span className="text-muted-foreground font-normal">
                          [{formatTimeframeDisplay(timeframe)}]
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {indicatorCount === 0 ? 'No indicators configured' : `${indicatorCount} indicator${indicatorCount !== 1 ? 's' : ''} active`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={indicatorCount > 0 ? "default" : "secondary"} 
                      className="text-xs font-medium"
                    >
                      {indicatorCount}
                    </Badge>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="px-4 pb-4 pt-0 border-t border-border/40">
                  <div className="mt-3">
                    <IndicatorSelector
                      selectedIndicators={timeframeIndicators}
                      onChange={(newIndicators) => handleTimeframeIndicatorsChange(timeframe.id, newIndicators)}
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        );
      })}
    </div>
  );
};

export default IndicatorManager;