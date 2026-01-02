
import { Node } from '@xyflow/react';
import { ExitOrderType, ExitNodeData } from './types';
import {
  useExitNodeBase,
  useExitNodeInitialization,
  useOrderSettings
} from './hooks';

interface UseExitNodeFormProps {
  node: Node;
  updateNodeData: (id: string, data: any) => void;
}

export const useExitNodeForm = ({ node, updateNodeData }: UseExitNodeFormProps) => {
  // Use base hook for state management
  const {
    nodeData,
    defaultExitNodeData,
    initializedRef,
    orderType,
    setOrderType,
    limitPrice,
    setLimitPrice
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
  
  return {
    orderType,
    limitPrice,
    handleOrderTypeChange,
    handleLimitPriceChange
  };
};
