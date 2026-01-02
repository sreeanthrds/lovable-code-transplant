
import { useState, useEffect } from 'react';
import { Node } from '@xyflow/react';
import { toast } from "@/hooks/use-toast";
import { useStrategyStore } from '@/hooks/use-strategy-store';
import { useInitializeNodeData, useStartNodeData } from './hooks';
import { usePositionManagement } from './hooks/usePositionManagement';
import { usePositionHandlers } from './hooks/usePositionHandlers';
import { useVpiValidation } from './hooks/useVpiValidation';
import { useActionTypeHandler } from './hooks/useActionTypeHandler';

interface UseActionNodeFormProps {
  node: Node;
  updateNodeData: (id: string, data: any) => void;
}

export const useActionNodeForm = ({ node, updateNodeData }: UseActionNodeFormProps) => {
  // Convert node.data to NodeData type with positions array
  const nodeData = node.data as any;
  
  // Ensure positions exist
  if (!nodeData.positions) {
    nodeData.positions = [];
  }
  
  // Get all nodes for VPI validation
  const nodes = useStrategyStore(state => state.nodes);
  
  // Initialize node data with default values
  useInitializeNodeData({
    nodeData,
    updateNodeData,
    nodeId: node.id
  });
  
  // Handle start node data and options trading
  const { startNodeSymbol, startNodeExchange, hasOptionTrading } = useStartNodeData({
    nodeId: node.id,
    updateNodeData,
    initialInstrument: nodeData?.instrument
  });
  
  // Position management hooks
  const {
    selectedPosition,
    setSelectedPosition,
    handlePositionChange,
    handleAddPosition,
    handleDeletePosition,
    createDefaultPosition
  } = usePositionManagement({
    nodeData,
    nodeId: node.id,
    updateNodeData
  });
  
  // VPI validation hook
  const { validateVpiUniqueness } = useVpiValidation({ nodes });
  
  // Action type handlers
  const { handleLabelChange, handleActionTypeChange } = useActionTypeHandler({
    nodeId: node.id,
    nodeData,
    updateNodeData,
    createDefaultPosition
  });
  
  // Position-specific handlers
  const positionHandlers = usePositionHandlers({
    selectedPosition,
    handlePositionChange
  });

  return {
    nodeData,
    hasOptionTrading,
    startNodeSymbol,
    startNodeExchange,
    selectedPosition,
    setSelectedPosition,
    handleLabelChange,
    handleActionTypeChange,
    handlePositionChange,
    handleAddPosition,
    handleDeletePosition,
    validateVpiUniqueness,
    createDefaultPosition,
    ...positionHandlers
  };
};
