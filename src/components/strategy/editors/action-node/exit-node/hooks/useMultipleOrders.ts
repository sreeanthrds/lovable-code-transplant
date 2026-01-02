
import { useCallback } from 'react';
import { Node } from '@xyflow/react';
import { ExitNodeData } from '../types';

interface UseMultipleOrdersProps {
  node: Node;
  updateNodeData: (id: string, data: any) => void;
  multipleOrders: boolean;
  setMultipleOrders: (enabled: boolean) => void;
  defaultExitNodeData: ExitNodeData;
}

// This hook is maintained for backward compatibility
// but its functionality is disabled
export const useMultipleOrders = ({
  node,
  updateNodeData,
  multipleOrders,
  setMultipleOrders,
  defaultExitNodeData
}: UseMultipleOrdersProps) => {
  // Multiple orders is now disabled by default
  const handleMultipleOrdersToggle = useCallback((enabled: boolean) => {
    // No-op - multiple orders functionality is removed
    console.log("Multiple orders functionality has been removed");
  }, []);
  
  return {
    handleMultipleOrdersToggle
  };
};
