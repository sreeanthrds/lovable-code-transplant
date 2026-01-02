import { useState, useEffect } from 'react';
import { Node } from '@xyflow/react';
import { RunningVariablesData } from './types/runningVariableTypes';
import { StartNodeData } from '../action-node/types';

interface NodeData extends StartNodeData {
  supportingInstrumentEnabled?: boolean;
  runningVariables?: RunningVariablesData;
}

interface UseStartNodeFormProps {
  node: Node;
  updateNodeData: (id: string, data: any) => void;
}

export const useStartNodeForm = ({ node, updateNodeData }: UseStartNodeFormProps) => {
  const nodeData = node.data as NodeData | undefined;
  
  const [formData, setFormData] = useState<NodeData>(() => {
    // Helper to clean config and remove indicators field
    const cleanConfig = (config: any) => {
      if (!config) return { symbol: '', type: 'stock', timeframes: [] };
      const { indicators, ...rest } = config; // Remove indicators from root
      return rest;
    };
    
    // Initialize with proper structure
    const initialData = {
      label: nodeData?.label || 'Controller',
      exchange: nodeData?.exchange || 'NSE',
      tradingInstrument: nodeData?.tradingInstrument || { type: 'options', underlyingType: 'index' },
      tradingInstrumentConfig: nodeData?.tradingInstrumentConfig ? cleanConfig(nodeData?.tradingInstrumentConfig) : { symbol: 'NIFTY', type: 'options', timeframes: [] },
      supportingInstrumentConfig: cleanConfig(nodeData?.supportingInstrumentConfig),
      supportingInstrumentEnabled: nodeData?.supportingInstrumentEnabled ?? false,
      runningVariables: nodeData?.runningVariables || { variables: {} }
    };
    
    // Update node data immediately with new structure
    setTimeout(() => {
      updateNodeData(node.id, initialData);
    }, 0);
    
    return initialData;
  });
  
  // Load initial data from node - run only once when node changes
  useEffect(() => {
    // Helper to clean config and remove indicators field
    const cleanConfig = (config: any) => {
      if (!config) return { symbol: '', type: 'stock', timeframes: [] };
      const { indicators, ...rest } = config; // Remove indicators from root
      return rest;
    };
    
    const newFormData = {
      label: nodeData?.label || 'Controller',
      exchange: nodeData?.exchange || 'NSE',
      tradingInstrument: nodeData?.tradingInstrument || { type: 'options', underlyingType: 'index' },
      tradingInstrumentConfig: nodeData?.tradingInstrumentConfig ? cleanConfig(nodeData?.tradingInstrumentConfig) : { symbol: 'NIFTY', type: 'options', timeframes: [] },
      supportingInstrumentConfig: cleanConfig(nodeData?.supportingInstrumentConfig),
      supportingInstrumentEnabled: nodeData?.supportingInstrumentEnabled ?? false,
      runningVariables: nodeData?.runningVariables || { variables: {} }
    };
    
    setFormData(newFormData);
  }, [node.id]); // Only when node.id changes, not when nodeData changes
  
  const handleInputChange = (field: keyof NodeData, value: any) => {
    // Special handling for exchange change - clear all instrument configs
    if (field === 'exchange') {
      const updatedFormData = {
        label: formData.label,
        exchange: value,
        tradingInstrument: { type: 'stock' as const },
        tradingInstrumentConfig: { symbol: '', type: 'stock' as const, timeframes: [] },
        supportingInstrumentConfig: { symbol: '', type: 'stock' as const, timeframes: [] },
        supportingInstrumentEnabled: false,
        runningVariables: formData.runningVariables
      };
      
      setFormData(updatedFormData);
      
      setTimeout(() => {
        updateNodeData(node.id, updatedFormData);
      }, 100);
      return;
    }
    
    // Create clean data object with only valid fields - use new value for the field being updated
    const cleanData: any = {
      label: formData.label,
      exchange: formData.exchange,
      tradingInstrument: formData.tradingInstrument,
      tradingInstrumentConfig: formData.tradingInstrumentConfig,
      supportingInstrumentConfig: formData.supportingInstrumentConfig,
      supportingInstrumentEnabled: formData.supportingInstrumentEnabled,
      runningVariables: formData.runningVariables
    };
    
    // Update the specific field with the new value
    cleanData[field] = value;
    
    setFormData(cleanData as NodeData);
    
    // Use a timeout to avoid multiple rapid updates
    setTimeout(() => {
      updateNodeData(node.id, cleanData);
    }, 100);
  };

  const handleTradingInstrumentChange = (type: 'stock' | 'futures' | 'options') => {
    const updatedInstrument = { 
      type,
      ...(type === 'stock' ? {} : { underlyingType: undefined })
    };
    
    const updatedFormData = {
      label: formData.label,
      exchange: formData.exchange,
      tradingInstrument: updatedInstrument,
      tradingInstrumentConfig: { symbol: '', type: 'stock' as const, timeframes: [] },
      supportingInstrumentConfig: { symbol: '', type: 'stock' as const, timeframes: [] },
      supportingInstrumentEnabled: formData.supportingInstrumentEnabled,
      runningVariables: formData.runningVariables
    };
    
    setFormData(updatedFormData);
    
    setTimeout(() => {
      updateNodeData(node.id, updatedFormData);
    }, 100);
  };

  const handleUnderlyingTypeChange = (underlyingType: 'index' | 'indexFuture' | 'stock') => {
    if (!formData.tradingInstrument) return;
    
    const updatedInstrument = { 
      ...formData.tradingInstrument,
      underlyingType
    };
    
    const updatedFormData = {
      label: formData.label,
      exchange: formData.exchange,
      tradingInstrument: updatedInstrument,
      tradingInstrumentConfig: { symbol: '', type: 'stock' as const, timeframes: [] },
      supportingInstrumentConfig: { symbol: '', type: 'stock' as const, timeframes: [] },
      supportingInstrumentEnabled: formData.supportingInstrumentEnabled,
      runningVariables: formData.runningVariables
    };
    
    setFormData(updatedFormData);
    
    setTimeout(() => {
      updateNodeData(node.id, updatedFormData);
    }, 100);
  };
  
  const handleIndicatorsChange = (indicators: Record<string, Record<string, any>>) => {
    const updatedFormData = {
      label: formData.label,
      exchange: formData.exchange,
      tradingInstrument: formData.tradingInstrument,
      tradingInstrumentConfig: formData.tradingInstrumentConfig,
      supportingInstrumentConfig: formData.supportingInstrumentConfig,
      supportingInstrumentEnabled: formData.supportingInstrumentEnabled,
      runningVariables: formData.runningVariables,
      indicators
    };
    
    setFormData(updatedFormData as NodeData);
    
    setTimeout(() => {
      updateNodeData(node.id, updatedFormData);
    }, 100);
  };

  const handleRunningVariablesChange = (runningVariables: RunningVariablesData) => {
    const updatedFormData = {
      label: formData.label,
      exchange: formData.exchange,
      tradingInstrument: formData.tradingInstrument,
      tradingInstrumentConfig: formData.tradingInstrumentConfig,
      supportingInstrumentConfig: formData.supportingInstrumentConfig,
      supportingInstrumentEnabled: formData.supportingInstrumentEnabled,
      runningVariables
    };
    
    setFormData(updatedFormData);
    
    setTimeout(() => {
      updateNodeData(node.id, updatedFormData);
    }, 100);
  };
  
  return {
    formData,
    handleInputChange,
    handleTradingInstrumentChange,
    handleUnderlyingTypeChange,
    handleIndicatorsChange,
    handleRunningVariablesChange
  };
};
