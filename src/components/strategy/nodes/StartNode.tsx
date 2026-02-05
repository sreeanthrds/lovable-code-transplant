
import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Settings, Calendar, Building, BarChart, LineChart } from 'lucide-react';

interface StartNodeProps {
  data: {
    label?: string;
    timeframe?: string;
    exchange?: string;
    symbol?: string;
    supportingInstrumentEnabled?: boolean;
    tradingInstrument?: {
      type: 'stock' | 'futures' | 'options';
      underlyingType?: 'index' | 'indexFuture' | 'stock';
    };
    tradingInstrumentConfig?: {
      symbol: string;
      contractMonth?: string;
      timeframes: any[];
      indicators: Record<string, any>;
    };
    supportingInstrumentConfig?: {
      symbol: string;
      contractMonth?: string;
      timeframes: any[];
      indicators: Record<string, any>;
    };
    indicators?: Record<string, {
      display_name: string;
      indicator_name: string;
      [key: string]: any;
    }>;
    runningVariables?: {
      variables: Record<string, any>;
    };
  };
  id: string;
  zIndex?: number;
  selected?: boolean;
}

const StartNode = ({ data, id, zIndex = 0, selected = false }: StartNodeProps) => {
  // Calculate opacity based on z-index (higher z-index = more transparent)
  const calculateOpacity = () => {
    const baseOpacity = 1;
    const opacityReduction = Math.min(zIndex * 0.05, 0.7);
    return Math.max(baseOpacity - opacityReduction, 0.3);
  };

  // Helper to generate instrument display text
  const getInstrumentDisplay = () => {
    if (!data.tradingInstrument) return null;
    
    const { type, underlyingType } = data.tradingInstrument;
    
    if (type === 'futures' && underlyingType) {
      return `${underlyingType.charAt(0).toUpperCase() + underlyingType.slice(1)} Futures`;
    }
    
    if (type === 'options' && underlyingType) {
      return `${underlyingType.charAt(0).toUpperCase() + underlyingType.slice(1)} Options`;
    }
    
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Check if there are any indicators
  const hasIndicators = data.indicators && Object.keys(data.indicators).length > 0;
  
  // Check if there are any running variables
  const hasRunningVariables = data.runningVariables && Object.keys(data.runningVariables.variables || {}).length > 0;

  const nodeColor = 'rgb(72, 187, 178)'; // teal

  return (
    <div 
      className="rounded-lg overflow-hidden transition-all duration-200"
      style={{ opacity: calculateOpacity(), border: `2px solid ${nodeColor}` }}
      data-id={id}
    >
      {/* Compact header */}
      <div className="flex items-center px-3 py-2 border-b border-primary/10">
        <Settings className="h-4 w-4 mr-2 shrink-0" style={{ color: 'hsl(var(--warning))' }} />
        <span className="font-medium text-sm text-warning">Strategy Controller</span>
      </div>
      
      {/* Content area with minimal padding */}
      <div className="px-3 py-2 space-y-2">
        
        {(data.tradingInstrumentConfig || data.exchange || data.tradingInstrument) && (
          <div className="border-t border-border pt-2 mt-2 space-y-1.5">
            {data.tradingInstrument && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <LineChart className="h-3 w-3" />
                <span>{getInstrumentDisplay()}</span>
              </div>
            )}
            
            {data.tradingInstrumentConfig?.timeframes && data.tradingInstrumentConfig.timeframes.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{data.tradingInstrumentConfig.timeframes.map(tf => tf.timeframe).join(', ')}</span>
              </div>
            )}
            
            {data.exchange && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Building className="h-3 w-3" />
                <span>{data.exchange}</span>
              </div>
            )}
            
            {data.tradingInstrumentConfig?.symbol && (
              <div className="text-xs font-medium text-foreground">
                {data.tradingInstrument?.type === 'futures' 
                  ? `${data.tradingInstrumentConfig.symbol}-FUT`
                  : data.tradingInstrumentConfig.symbol
                }
                {data.tradingInstrument?.type === 'futures' && data.tradingInstrumentConfig.contractMonth 
                  ? ` (${data.tradingInstrumentConfig.contractMonth})` 
                  : ''
                }
              </div>
            )}

            {data.supportingInstrumentConfig?.symbol && data.supportingInstrumentEnabled !== false && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <LineChart className="h-3 w-3" />
                <span>Supporting: {data.supportingInstrumentConfig.symbol}</span>
              </div>
            )}
          </div>
        )}
        
        {(
          (data.tradingInstrumentConfig?.timeframes && data.tradingInstrumentConfig.timeframes.some(tf => tf.indicators && Object.keys(tf.indicators).length > 0)) ||
          (data.supportingInstrumentConfig?.timeframes && data.supportingInstrumentConfig.timeframes.some(tf => tf.indicators && Object.keys(tf.indicators).length > 0))
        ) ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <BarChart className="h-3 w-3" />
              <span className="font-medium">Indicators</span>
            </div>
            <div className="space-y-1">
               {/* Trading Instrument indicators */}
               {data.tradingInstrumentConfig?.timeframes?.map(timeframe => {
                 const indicators = Object.entries(timeframe.indicators || {});
                 if (indicators.length === 0) return null;
                 
                 return (
                   <div key={`TI-${timeframe.id}`} className="space-y-1">
                     <div className="text-xs text-muted-foreground font-medium">
                       {data.tradingInstrumentConfig?.symbol}[{timeframe.timeframe}]
                     </div>
                     <div className="flex flex-wrap gap-1">
                       {indicators.map(([indicatorId, indicatorData]: [string, any]) => (
                         <span
                           key={`TI-${timeframe.id}-${indicatorId}`}
                           className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-secondary text-secondary-foreground font-medium border border-border"
                         >
                           {indicatorData.display_name || indicatorData.function_name}
                         </span>
                       ))}
                     </div>
                   </div>
                 );
               })}
               
               {/* Supporting Instrument indicators */}
               {data.supportingInstrumentConfig?.timeframes && data.supportingInstrumentEnabled !== false && 
                 data.supportingInstrumentConfig.timeframes.map(timeframe => {
                   const indicators = Object.entries(timeframe.indicators || {});
                   if (indicators.length === 0) return null;
                   
                   return (
                     <div key={`SI-${timeframe.id}`} className="space-y-1">
                       <div className="text-xs text-muted-foreground font-medium">
                         {data.supportingInstrumentConfig?.symbol}[{timeframe.timeframe}] (Supporting)
                       </div>
                       <div className="flex flex-wrap gap-1">
                         {indicators.map(([indicatorId, indicatorData]: [string, any]) => (
                           <span
                             key={`SI-${timeframe.id}-${indicatorId}`}
                             className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-accent text-accent-foreground font-medium border border-accent/50"
                           >
                             {indicatorData.display_name || indicatorData.function_name}
                           </span>
                         ))}
                       </div>
                     </div>
                   );
                 })
               }
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <BarChart className="h-3 w-3" />
            <span>No indicators</span>
          </div>
        )}
        
        {hasRunningVariables && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Settings className="h-3 w-3" />
            <span className="font-medium">Variables:</span>
            <div className="flex flex-wrap gap-1">
              {Object.entries(data.runningVariables.variables || {}).map(([variableId, variableData]) => (
                <span
                  key={variableId}
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-primary/10 text-primary font-medium"
                >
                  {variableData.name}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Compact ID display */}
        <div className="text-[10px] text-info/80 text-right">
          ID: {id}
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: 'rgb(72, 187, 178)' }}
      />
    </div>
  );
};

export default memo(StartNode);
