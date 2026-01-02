
import { useCallback } from 'react';
import { Node } from '@xyflow/react';
import { 
  ExitOrderType,
  ExitNodeData,
  ExitOrderConfig
} from '../types';

interface UseOrderSettingsProps {
  node: Node;
  updateNodeData: (id: string, data: any) => void;
  setOrderType: (type: ExitOrderType) => void;
  setLimitPrice: (price: number | undefined) => void;
  defaultExitNodeData: ExitNodeData;
}

export const useOrderSettings = ({
  node,
  updateNodeData,
  setOrderType,
  setLimitPrice,
  defaultExitNodeData
}: UseOrderSettingsProps) => {
  // Update order type
  const handleOrderTypeChange = useCallback((type: string) => {
    setOrderType(type as ExitOrderType);
    
    const nodeData = node.data || {};
    // Get current exit node data safely
    const currentExitNodeData = (nodeData.exitNodeData as ExitNodeData) || defaultExitNodeData;
    
    // Create updated order config
    const updatedOrderConfig: ExitOrderConfig = {
      ...currentExitNodeData.orderConfig,
      orderType: type as ExitOrderType
    };
    
    // Create updated exit node data, maintaining both orderConfig
    const updatedExitNodeData: ExitNodeData = {
      ...currentExitNodeData,
      orderConfig: updatedOrderConfig
    };
    
    // Update node data
    updateNodeData(node.id, {
      ...nodeData,
      exitNodeData: updatedExitNodeData
    });
  }, [node.id, node.data, updateNodeData, defaultExitNodeData, setOrderType]);
  
  // Update limit price - now accepts a number directly
  const handleLimitPriceChange = useCallback((price: number | undefined) => {
    setLimitPrice(price);
    
    // Skip updating if price is undefined
    if (price === undefined) return;
    
    const nodeData = node.data || {};
    // Get current exit node data safely
    const currentExitNodeData = (nodeData.exitNodeData as ExitNodeData) || defaultExitNodeData;
    
    // Create updated order config
    const updatedOrderConfig: ExitOrderConfig = {
      ...currentExitNodeData.orderConfig,
      limitPrice: price
    };
    
    // Create updated exit node data
    const updatedExitNodeData: ExitNodeData = {
      ...currentExitNodeData,
      orderConfig: updatedOrderConfig
    };
    
    // Update node data
    updateNodeData(node.id, {
      ...nodeData,
      exitNodeData: updatedExitNodeData
    });
  }, [node.id, node.data, updateNodeData, defaultExitNodeData, setLimitPrice]);
  
  return {
    handleOrderTypeChange,
    handleLimitPriceChange
  };
};
