
import { Node } from '@xyflow/react';
import { 
  ExitOrderType, 
  ExitNodeData,
  ExitOrderConfig,
  QuantityType
} from './types';
import {
  useExitNodeBase,
  useExitNodeInitialization,
  useOrderSettings,
} from './hooks';
import { useCallback } from 'react';

interface UseExitOrderFormProps {
  node: Node;
  updateNodeData: (id: string, data: any) => void;
}

export const useExitOrderForm = ({ node, updateNodeData }: UseExitOrderFormProps) => {
  // Use base hook for state management
  const {
    nodeData,
    defaultExitNodeData,
    initializedRef,
    orderType,
    setOrderType,
    limitPrice,
    setLimitPrice,
  } = useExitNodeBase({ node, updateNodeData });
  
  // Use initialization hook
  useExitNodeInitialization({
    node,
    updateNodeData,
    initializedRef,
    defaultExitNodeData
  });
  
  // Use order settings hook
  const { handleOrderTypeChange, handleLimitPriceChange } = useOrderSettings({
    node,
    updateNodeData,
    setOrderType,
    setLimitPrice,
    defaultExitNodeData
  });
  
  // Handle target position selection
  const handleTargetPositionChange = useCallback((positionVpi: string) => {
    const currentExitNodeData = (node.data?.exitNodeData as ExitNodeData) || defaultExitNodeData;
    
    // Update order config with target position
    const updatedOrderConfig = {
      ...currentExitNodeData.orderConfig,
      targetPositionVpi: positionVpi === '_any' ? undefined : positionVpi
    };
    
    // Update node data
    updateNodeData(node.id, {
      ...node.data,
      exitNodeData: {
        ...currentExitNodeData,
        orderConfig: updatedOrderConfig
      }
    });
  }, [node, updateNodeData, defaultExitNodeData]);
  
  // Handle quantity type selection
  const handleQuantityTypeChange = useCallback((quantityType: string) => {
    const currentExitNodeData = (node.data?.exitNodeData as ExitNodeData) || defaultExitNodeData;
    
    // Update order config with quantity type
    const updatedOrderConfig = {
      ...currentExitNodeData.orderConfig,
      quantity: quantityType as QuantityType
    };
    
    // Update node data
    updateNodeData(node.id, {
      ...node.data,
      exitNodeData: {
        ...currentExitNodeData,
        orderConfig: updatedOrderConfig
      }
    });
  }, [node, updateNodeData, defaultExitNodeData]);
  
  // Handle partial quantity percentage change
  const handlePartialQuantityChange = useCallback((percentage: number) => {
    const currentExitNodeData = (node.data?.exitNodeData as ExitNodeData) || defaultExitNodeData;
    
    // Update order config with partial quantity percentage
    const updatedOrderConfig = {
      ...currentExitNodeData.orderConfig,
      partialQuantityPercentage: percentage
    };
    
    // Update node data
    updateNodeData(node.id, {
      ...node.data,
      exitNodeData: {
        ...currentExitNodeData,
        orderConfig: updatedOrderConfig
      }
    });
  }, [node, updateNodeData, defaultExitNodeData]);

  // Handle specific quantity change
  const handleSpecificQuantityChange = useCallback((quantity: number) => {
    const currentExitNodeData = (node.data?.exitNodeData as ExitNodeData) || defaultExitNodeData;
    
    // Update order config with specific quantity
    const updatedOrderConfig = {
      ...currentExitNodeData.orderConfig,
      specificQuantity: quantity
    };
    
    // Update node data
    updateNodeData(node.id, {
      ...node.data,
      exitNodeData: {
        ...currentExitNodeData,
        orderConfig: updatedOrderConfig
      }
    });
  }, [node, updateNodeData, defaultExitNodeData]);

  // Get current values from node data with proper type checking
  const currentExitNodeData = nodeData?.exitNodeData as ExitNodeData | undefined;
  const currentOrderConfig = currentExitNodeData?.orderConfig || defaultExitNodeData.orderConfig;
  
  // Now safely extract properties from the typed object
  const targetPositionVpi = currentOrderConfig.targetPositionVpi;
  const quantity = currentOrderConfig.quantity || 'all';
  const partialQuantityPercentage = currentOrderConfig.partialQuantityPercentage || 50;
  const specificQuantity = currentOrderConfig.specificQuantity || 1;
  
  return {
    orderType,
    limitPrice,
    targetPositionVpi,
    quantity,
    partialQuantityPercentage,
    specificQuantity,
    handleOrderTypeChange,
    handleLimitPriceChange,
    handleTargetPositionChange,
    handleQuantityTypeChange,
    handlePartialQuantityChange,
    handleSpecificQuantityChange
  };
};
