
import { useCallback } from 'react';

interface UseActionNodeHandlersProps {
  nodeId: string;
  updateNodeData: (id: string, data: any) => void;
  nodeData: any;
}

export const useActionNodeHandlers = ({
  nodeId,
  updateNodeData,
  nodeData
}: UseActionNodeHandlersProps) => {
  // Create memoized handler functions that will remain stable across renders
  const handleLabelChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData(nodeId, { label: e.target.value });
  }, [nodeId, updateNodeData]);

  const handleActionTypeChange = useCallback((value: string) => {
    updateNodeData(nodeId, { 
      actionType: value,
      // Reset position type if changing to alert
      ...(value === 'alert' && { positionType: undefined })
    });
  }, [nodeId, updateNodeData]);
  
  const handlePositionTypeChange = useCallback((value: string) => {
    updateNodeData(nodeId, { positionType: value });
  }, [nodeId, updateNodeData]);
  
  const handleOrderTypeChange = useCallback((value: string) => {
    updateNodeData(nodeId, { 
      orderType: value,
      // Reset limit price if changing to market
      ...(value === 'market' && { limitPrice: undefined })
    });
  }, [nodeId, updateNodeData]);
  
  const handleLimitPriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? '' : parseFloat(e.target.value);
    // Allow empty string or valid numbers. Empty string allows clearing the field
    if (value === '' || !isNaN(value)) {
      updateNodeData(nodeId, { limitPrice: value });
    }
  }, [nodeId, updateNodeData]);
  
  const handleLotsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      updateNodeData(nodeId, { lots: value });
    }
  }, [nodeId, updateNodeData]);
  
  const handleProductTypeChange = useCallback((value: string) => {
    updateNodeData(nodeId, { productType: value });
  }, [nodeId, updateNodeData]);
  
  return {
    handleLabelChange,
    handleActionTypeChange,
    handlePositionTypeChange,
    handleOrderTypeChange,
    handleLimitPriceChange,
    handleLotsChange,
    handleProductTypeChange
  };
};
