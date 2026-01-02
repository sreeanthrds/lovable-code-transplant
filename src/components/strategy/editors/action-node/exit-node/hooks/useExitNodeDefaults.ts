
import { useCallback } from 'react';
import { 
  ExitNodeData, 
  ExitOrderConfig, 
  ReEntryConfig, 
  StopLossConfig, 
  TrailingStopConfig, 
  TakeProfitConfig, 
  PostExecutionConfig,
  TimeUnit
} from '../types';

/**
 * Default values for Exit Node
 */
export const useExitNodeDefaults = () => {
  // Default configuration for the order
  const defaultOrderConfig: ExitOrderConfig = {
    orderType: 'market'
  };
  
  // Default re-entry configuration
  const defaultReEntryConfig: ReEntryConfig = {
    enabled: false,
    maxEntries: 1
  };
  
  // Default stop loss configuration
  const defaultStopLossConfig: StopLossConfig = {
    enabled: false,
    triggerType: 'percentage',
    stopPercentage: 2,
    waitForMarket: false,
    waitTime: 5,
    waitTimeUnit: 'seconds' as TimeUnit,
    limitBuffer: 0.5
  };
  
  // Default trailing stop configuration
  const defaultTrailingStopConfig: TrailingStopConfig = {
    enabled: false,
    triggerType: 'percentage',
    initialDistance: 2,
    stepSize: 0.5,
    waitForMarket: false,
    waitTime: 5,
    waitTimeUnit: 'seconds' as TimeUnit,
    limitBuffer: 0.5
  };
  
  // Default take profit configuration
  const defaultTakeProfitConfig: TakeProfitConfig = {
    enabled: false,
    triggerType: 'percentage',
    targetPercentage: 5,
    waitForMarket: false,
    waitTime: 5,
    waitTimeUnit: 'seconds' as TimeUnit,
    limitBuffer: 0.5
  };
  
  // Default post execution configuration
  const defaultPostExecutionConfig: PostExecutionConfig = {
    stopLoss: defaultStopLossConfig,
    trailingStop: defaultTrailingStopConfig,
    takeProfit: defaultTakeProfitConfig
  };
  
  // Default exit node data
  const defaultExitNodeData: ExitNodeData = {
    orderConfig: defaultOrderConfig,
    reEntryConfig: defaultReEntryConfig,
    postExecutionConfig: defaultPostExecutionConfig,
    _initialized: true
  };
  
  // Create function to get a fresh copy of the default data
  const getDefaultExitNodeData = useCallback((): ExitNodeData => {
    return JSON.parse(JSON.stringify(defaultExitNodeData));
  }, []);
  
  return {
    defaultExitNodeData,
    getDefaultExitNodeData,
    defaultOrderConfig,
    defaultReEntryConfig,
    defaultStopLossConfig,
    defaultTrailingStopConfig,
    defaultTakeProfitConfig,
    defaultPostExecutionConfig
  };
};
