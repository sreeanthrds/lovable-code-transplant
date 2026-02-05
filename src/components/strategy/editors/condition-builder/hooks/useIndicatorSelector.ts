
import { useState, useEffect } from 'react';
import { Expression, IndicatorExpression } from '../../../utils/conditionTypes';
import { useStrategyStore } from '@/hooks/use-strategy-store';
import { flatIndicatorConfig } from '../../../utils/categorizedIndicatorConfig';
import { useTimeframeMigration } from '../../../utils/timeframe-migration/useTimeframeMigration';

interface UseIndicatorSelectorProps {
  expression: Expression;
  updateExpression: (expr: Expression) => void;
}

export const useIndicatorSelector = ({ expression, updateExpression }: UseIndicatorSelectorProps) => {
  // Initialize TimeframeResolver - MUST be at the top to follow Rules of Hooks
  useTimeframeMigration();
  
  const strategyStore = useStrategyStore();
  const [availableIndicators, setAvailableIndicators] = useState<Array<{id: string, displayName: string, source: string}>>([]);
  const [missingIndicator, setMissingIndicator] = useState(false);

  if (expression.type !== 'indicator') {
    throw new Error("useIndicatorSelector can only be used with indicator expressions");
  }

  const indicatorExpr = expression as IndicatorExpression;
  
  useEffect(() => {
    const startNode = strategyStore.nodes.find(node => node.type === 'startNode');
    
    if (startNode && startNode.data) {
      const allIndicators = new Map();
      
      // Get indicators from trading instrument config
      const tradingConfig = startNode.data.tradingInstrumentConfig as any;
      
      if (tradingConfig?.timeframes) {
        tradingConfig.timeframes.forEach((timeframe: any) => {
          if (timeframe.indicators && typeof timeframe.indicators === 'object') {
            Object.entries(timeframe.indicators).forEach(([id, data]: [string, any]) => {
              allIndicators.set(id, {
                id,
                displayName: data?.display_name || id,
                source: 'TI',
                timeframe: timeframe.id,
                timeframeDisplay: timeframe.timeframe
              });
            });
          }
        });
      }
      
      // Get indicators from supporting instrument config  
      const supportingConfig = startNode.data.supportingInstrumentConfig as any;
      
      if (supportingConfig?.timeframes) {
        supportingConfig.timeframes.forEach((timeframe: any) => {
          if (timeframe.indicators && typeof timeframe.indicators === 'object') {
            Object.entries(timeframe.indicators).forEach(([id, data]: [string, any]) => {
              allIndicators.set(id, {
                id,
                displayName: data?.display_name || id,
                source: 'SI',
                timeframe: timeframe.id,
                timeframeDisplay: timeframe.timeframe
              });
            });
          }
        });
      }
      
      const indicatorsList = Array.from(allIndicators.values());
      setAvailableIndicators(indicatorsList);
      
      // Check if the current indicator still exists
      if (indicatorExpr.name && !allIndicators.has(indicatorExpr.name)) {
        setMissingIndicator(true);
      } else {
        setMissingIndicator(false);
      }
    } else {
      setAvailableIndicators([]);
      if (indicatorExpr.name) {
        setMissingIndicator(true);
      }
    }
  }, [strategyStore.nodes, indicatorExpr.name]);
  
  const updateIndicatorName = (value: string) => {
    updateExpression({
      ...indicatorExpr,
      name: value,
      parameter: undefined
    });
  };
  
  const updateParameter = (value: string) => {
    updateExpression({
      ...indicatorExpr,
      parameter: value
    });
  };
  
  const findIndicatorData = (indicatorId: string) => {
    const startNode = strategyStore.nodes.find(node => node.type === 'startNode');
    if (!startNode?.data) return null;
    
    // Search in trading instrument config
    const tradingConfig = startNode.data.tradingInstrumentConfig as any;
    if (tradingConfig?.timeframes) {
      for (const timeframe of tradingConfig.timeframes) {
        if (timeframe.indicators && typeof timeframe.indicators === 'object') {
          const indicatorData = timeframe.indicators[indicatorId];
          if (indicatorData) return indicatorData;
        }
      }
    }
    
    // Search in supporting instrument config
    const supportingConfig = startNode.data.supportingInstrumentConfig as any;
    if (supportingConfig?.timeframes) {
      for (const timeframe of supportingConfig.timeframes) {
        if (timeframe.indicators && typeof timeframe.indicators === 'object') {
          const indicatorData = timeframe.indicators[indicatorId];
          if (indicatorData) return indicatorData;
        }
      }
    }
    
    return null;
  };

  const hasMultipleOutputs = (indicatorId: string): boolean => {
    if (!indicatorId) return false;
    
    const indicatorData = findIndicatorData(indicatorId);
    if (!indicatorData) return false;
    
    const baseIndicator = indicatorData.indicator_name;
    
    // Check if the indicator has multiple outputs by looking at the config
    const config = flatIndicatorConfig[baseIndicator];
    return config && config.outputs && config.outputs.length > 1;
  };

  const getParameterOptions = (indicatorId: string): string[] => {
    if (!indicatorId) return [];
    
    const indicatorData = findIndicatorData(indicatorId);
    if (!indicatorData) return [];
    
    const baseIndicator = indicatorData.indicator_name;
    
    // Get outputs from the indicator config
    const config = flatIndicatorConfig[baseIndicator];
    return config?.outputs || [];
  };
  
  // Get display name for an indicator by ID
  const getIndicatorDisplayName = (indicatorId: string) => {
    const indicatorData = findIndicatorData(indicatorId);
    if (indicatorData) {
      return indicatorData.display_name || indicatorId;
    }
    
    // Fallback: look up in flatIndicatorConfig using the indicator_name
    for (const [configKey, config] of Object.entries(flatIndicatorConfig)) {
      if (config.function_name === indicatorId || configKey === indicatorId) {
        return config.display_name;
      }
    }
    
    return indicatorId;
  };

  return {
    indicatorExpr,
    availableIndicators,
    missingIndicator,
    hasMultipleOutputs,
    getParameterOptions,
    getIndicatorDisplayName,
    updateIndicatorName,
    updateParameter
  };
};
