
import { useCallback } from 'react';
import { Node } from '@xyflow/react';
import { 
  ExitNodeData, 
  StopLossConfig, 
  TrailingStopConfig, 
  TakeProfitConfig,
  ReEntryConfig,
  PostExecutionConfig
} from '../types';

interface UsePostExecutionSettingsProps {
  node: Node;
  updateNodeData: (id: string, data: any) => void;
  defaultExitNodeData: ExitNodeData;
}

export const usePostExecutionSettings = ({
  node,
  updateNodeData,
  defaultExitNodeData
}: UsePostExecutionSettingsProps) => {
  // Get current exit node data or use default
  const getCurrentExitNodeData = useCallback(() => {
    return (node.data?.exitNodeData as ExitNodeData) || defaultExitNodeData;
  }, [node.data, defaultExitNodeData]);

  // Generic toggle handler for any post-execution feature
  const handleToggle = useCallback((feature: 'stopLoss' | 'trailingStop' | 'takeProfit', enabled: boolean) => {
    const currentExitNodeData = getCurrentExitNodeData();
    const postExecutionConfig = currentExitNodeData.postExecutionConfig || defaultExitNodeData.postExecutionConfig || {};
    
    // Create updated config
    const updatedPostExecutionConfig = {
      ...postExecutionConfig,
      [feature]: {
        ...(postExecutionConfig?.[feature] || {}),
        enabled
      }
    };
    
    // Update node data
    updateNodeData(node.id, {
      ...node.data,
      exitNodeData: {
        ...currentExitNodeData,
        postExecutionConfig: updatedPostExecutionConfig
      }
    });
  }, [node, updateNodeData, getCurrentExitNodeData, defaultExitNodeData]);

  // Handle stop loss toggle
  const handleStopLossToggle = useCallback((enabled: boolean) => {
    handleToggle('stopLoss', enabled);
  }, [handleToggle]);

  // Handle trailing stop toggle
  const handleTrailingStopToggle = useCallback((enabled: boolean) => {
    handleToggle('trailingStop', enabled);
  }, [handleToggle]);

  // Handle take profit toggle
  const handleTakeProfitToggle = useCallback((enabled: boolean) => {
    handleToggle('takeProfit', enabled);
  }, [handleToggle]);

  // Generic update handler for any post-execution feature
  const handleUpdateFeature = useCallback((
    feature: 'stopLoss' | 'trailingStop' | 'takeProfit', 
    updates: Partial<StopLossConfig | TrailingStopConfig | TakeProfitConfig>
  ) => {
    const currentExitNodeData = getCurrentExitNodeData();
    const postExecutionConfig = currentExitNodeData.postExecutionConfig || defaultExitNodeData.postExecutionConfig;
    
    // Create updated config
    const updatedPostExecutionConfig = {
      ...postExecutionConfig,
      [feature]: {
        ...(postExecutionConfig?.[feature] || {}),
        ...updates
      }
    };
    
    // Update node data
    updateNodeData(node.id, {
      ...node.data,
      exitNodeData: {
        ...currentExitNodeData,
        postExecutionConfig: updatedPostExecutionConfig
      }
    });
  }, [node, updateNodeData, getCurrentExitNodeData, defaultExitNodeData]);

  // Handle updates to re-entry settings for a feature
  const handleReEntryUpdates = useCallback((
    feature: 'stopLoss' | 'trailingStop' | 'takeProfit',
    updates: Partial<ReEntryConfig>
  ) => {
    const currentExitNodeData = getCurrentExitNodeData();
    const postExecutionConfig = currentExitNodeData.postExecutionConfig || defaultExitNodeData.postExecutionConfig;
    const featureConfig = postExecutionConfig?.[feature] || { enabled: false };
    
    // Initialize reEntry if it doesn't exist
    const currentReEntry = featureConfig.reEntry || { enabled: false, maxEntries: 1 };
    
    // Update the re-entry config
    const updatedFeatureConfig = {
      ...featureConfig,
      reEntry: {
        ...currentReEntry,
        ...updates
      }
    };
    
    // Update the feature config
    handleUpdateFeature(feature, updatedFeatureConfig);
  }, [handleUpdateFeature, getCurrentExitNodeData, defaultExitNodeData]);

  // Handle stop loss re-entry toggle
  const handleStopLossReEntryToggle = useCallback((enabled: boolean) => {
    handleReEntryUpdates('stopLoss', { enabled });
  }, [handleReEntryUpdates]);

  // Handle trailing stop re-entry toggle
  const handleTrailingStopReEntryToggle = useCallback((enabled: boolean) => {
    handleReEntryUpdates('trailingStop', { enabled });
  }, [handleReEntryUpdates]);

  // Handle take profit re-entry toggle
  const handleTakeProfitReEntryToggle = useCallback((enabled: boolean) => {
    handleReEntryUpdates('takeProfit', { enabled });
  }, [handleReEntryUpdates]);

  // Update specific parameters for stop loss
  const handleStopLossParamChange = useCallback((updates: Partial<StopLossConfig>) => {
    handleUpdateFeature('stopLoss', updates);
  }, [handleUpdateFeature]);

  // Update specific parameters for trailing stop
  const handleTrailingStopParamChange = useCallback((updates: Partial<TrailingStopConfig>) => {
    handleUpdateFeature('trailingStop', updates);
  }, [handleUpdateFeature]);

  // Update specific parameters for take profit
  const handleTakeProfitParamChange = useCallback((updates: Partial<TakeProfitConfig>) => {
    handleUpdateFeature('takeProfit', updates);
  }, [handleUpdateFeature]);

  // Get current values
  const currentExitNodeData = getCurrentExitNodeData();
  const postExecutionConfig = currentExitNodeData.postExecutionConfig || defaultExitNodeData.postExecutionConfig || {};
  
  const stopLoss = postExecutionConfig.stopLoss || { enabled: false };
  const trailingStop = postExecutionConfig.trailingStop || { enabled: false };
  const takeProfit = postExecutionConfig.takeProfit || { enabled: false };

  return {
    // Current config
    stopLoss,
    trailingStop,
    takeProfit,
    
    // Toggle handlers
    handleStopLossToggle,
    handleTrailingStopToggle,
    handleTakeProfitToggle,
    
    // Re-entry toggle handlers
    handleStopLossReEntryToggle,
    handleTrailingStopReEntryToggle,
    handleTakeProfitReEntryToggle,
    
    // Parameter update handlers
    handleStopLossParamChange,
    handleTrailingStopParamChange,
    handleTakeProfitParamChange
  };
};
