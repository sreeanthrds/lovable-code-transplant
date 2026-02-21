
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
import { useCallback, useState, useEffect } from 'react';

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

  // Local state for immediate UI feedback (avoids stale closure / deferred updateNodeData issues)
  const currentExitNodeData = (nodeData?.exitNodeData as ExitNodeData) || defaultExitNodeData;
  const currentOrderConfig = currentExitNodeData?.orderConfig || defaultExitNodeData.orderConfig;

  const [localTargetPositionVpi, setLocalTargetPositionVpi] = useState<string | undefined>(
    currentOrderConfig.targetPositionVpi
  );
  const [localQuantity, setLocalQuantity] = useState<string>(currentOrderConfig.quantity || 'all');
  const [localPartialQuantityPercentage, setLocalPartialQuantityPercentage] = useState<number>(
    currentOrderConfig.partialQuantityPercentage || 50
  );
  const [localSpecificQuantity, setLocalSpecificQuantity] = useState<number>(
    currentOrderConfig.specificQuantity || 1
  );

  // Sync local state from node data when it changes externally
  useEffect(() => {
    const exitData = (node.data?.exitNodeData as ExitNodeData | undefined);
    const orderCfg = exitData?.orderConfig;
    if (orderCfg?.targetPositionVpi !== undefined) {
      setLocalTargetPositionVpi(orderCfg.targetPositionVpi);
    }
    if (orderCfg?.quantity) {
      setLocalQuantity(orderCfg.quantity);
    }
    if (orderCfg?.partialQuantityPercentage !== undefined) {
      setLocalPartialQuantityPercentage(orderCfg.partialQuantityPercentage);
    }
    if (orderCfg?.specificQuantity !== undefined) {
      setLocalSpecificQuantity(orderCfg.specificQuantity);
    }
  }, [node.data]);
  
  // Handle target position selection
  const handleTargetPositionChange = useCallback((positionVpi: string) => {
    const resolvedVpi = positionVpi === '_any' ? undefined : positionVpi;
    setLocalTargetPositionVpi(resolvedVpi);

    const exitData = (node.data?.exitNodeData as ExitNodeData) || defaultExitNodeData;
    updateNodeData(node.id, {
      exitNodeData: {
        ...exitData,
        orderConfig: {
          ...exitData.orderConfig,
          targetPositionVpi: resolvedVpi
        }
      }
    });
  }, [node.id, node.data, updateNodeData, defaultExitNodeData]);
  
  // Handle quantity type selection
  const handleQuantityTypeChange = useCallback((quantityType: string) => {
    setLocalQuantity(quantityType);

    const exitData = (node.data?.exitNodeData as ExitNodeData) || defaultExitNodeData;
    updateNodeData(node.id, {
      exitNodeData: {
        ...exitData,
        orderConfig: {
          ...exitData.orderConfig,
          quantity: quantityType as QuantityType
        }
      }
    });
  }, [node.id, node.data, updateNodeData, defaultExitNodeData]);
  
  // Handle partial quantity percentage change
  const handlePartialQuantityChange = useCallback((percentage: number) => {
    setLocalPartialQuantityPercentage(percentage);

    const exitData = (node.data?.exitNodeData as ExitNodeData) || defaultExitNodeData;
    updateNodeData(node.id, {
      exitNodeData: {
        ...exitData,
        orderConfig: {
          ...exitData.orderConfig,
          partialQuantityPercentage: percentage
        }
      }
    });
  }, [node.id, node.data, updateNodeData, defaultExitNodeData]);

  // Handle specific quantity change
  const handleSpecificQuantityChange = useCallback((quantity: number) => {
    setLocalSpecificQuantity(quantity);

    const exitData = (node.data?.exitNodeData as ExitNodeData) || defaultExitNodeData;
    updateNodeData(node.id, {
      exitNodeData: {
        ...exitData,
        orderConfig: {
          ...exitData.orderConfig,
          specificQuantity: quantity
        }
      }
    });
  }, [node.id, node.data, updateNodeData, defaultExitNodeData]);
  
  return {
    orderType,
    limitPrice,
    targetPositionVpi: localTargetPositionVpi,
    quantity: localQuantity,
    partialQuantityPercentage: localPartialQuantityPercentage,
    specificQuantity: localSpecificQuantity,
    handleOrderTypeChange,
    handleLimitPriceChange,
    handleTargetPositionChange,
    handleQuantityTypeChange,
    handlePartialQuantityChange,
    handleSpecificQuantityChange
  };
};
