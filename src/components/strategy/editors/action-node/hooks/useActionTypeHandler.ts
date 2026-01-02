
import { useCallback, useEffect } from 'react';
import { NodeData } from '../types';

interface UseActionTypeHandlerProps {
  nodeId: string;
  nodeData: NodeData;
  updateNodeData: (id: string, data: any) => void;
  createDefaultPosition: () => any;
}

export const useActionTypeHandler = ({
  nodeId,
  nodeData,
  updateNodeData,
  createDefaultPosition
}: UseActionTypeHandlerProps) => {
  // Handler for label changes
  const handleLabelChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData(nodeId, { label: e.target.value });
  }, [nodeId, updateNodeData]);

  // Handler for action type changes
  const handleActionTypeChange = useCallback((value: string) => {
    // If changing to 'alert' type, clear positions
    const updates = value === 'alert' ? { actionType: value, positions: [] } : { actionType: value };
    updateNodeData(nodeId, updates);
  }, [nodeId, updateNodeData]);

  // Only remove positions when switching to alert mode
  useEffect(() => {
    if (nodeData?.actionType === 'alert' && Array.isArray(nodeData?.positions) && nodeData?.positions?.length > 0) {
      // Reset positions when switching to alert
      updateNodeData(nodeId, { positions: [] });
    }
  }, [nodeData?.actionType, nodeData?.positions, nodeId, updateNodeData]);

  return {
    handleLabelChange,
    handleActionTypeChange
  };
};
