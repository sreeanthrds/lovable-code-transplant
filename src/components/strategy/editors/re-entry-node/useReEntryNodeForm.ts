
import { useCallback, useState, useEffect } from 'react';
import { Node } from '@xyflow/react';

interface ReEntryConfig {
  groupNumber: number;
  maxEntries: number;
}

interface ReEntryNodeData {
  label?: string;
  actionType?: string;
  retryConfig?: ReEntryConfig;
  conditions?: any[];
  targetNodeId?: string;
  [key: string]: any;
}

interface UseReEntryNodeFormProps {
  node: Node;
  updateNodeData: (id: string, data: any) => void;
}

export const useReEntryNodeForm = ({ node, updateNodeData }: UseReEntryNodeFormProps) => {
  // Get the node data with proper typing
  const nodeData = node.data as ReEntryNodeData || {};
  const retryConfig = nodeData.retryConfig || { groupNumber: 1, maxEntries: 1 };
  
  // Initialize conditions if they don't exist
  const conditions = nodeData.conditions || [{
    id: 'root',
    groupLogic: 'AND',
    conditions: []
  }];
  
  // State
  const [label, setLabel] = useState<string>(nodeData.label || 'Re-entry');
  const [groupNumber, setGroupNumber] = useState<number>(retryConfig.groupNumber || 1);
  const [maxEntries, setMaxEntries] = useState<number>(retryConfig.maxEntries || 1);
  const [targetNodeId, setTargetNodeId] = useState<string | undefined>(nodeData.targetNodeId);
  
  // Update state when node data changes
  useEffect(() => {
    const data = node.data as ReEntryNodeData;
    setLabel(data?.label || 'Re-entry');
    
    const config = data?.retryConfig || { groupNumber: 1, maxEntries: 1 };
    setGroupNumber(config.groupNumber || 1);
    setMaxEntries(config.maxEntries || 1);
    setTargetNodeId(data?.targetNodeId);
  }, [node.data]);
  
  // Handler for label change
  const handleLabelChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newLabel = e.target.value;
    setLabel(newLabel);
    
    updateNodeData(node.id, {
      ...nodeData,
      label: newLabel,
      conditions, // Ensure conditions are preserved
      _lastUpdated: Date.now()
    });
  }, [node.id, nodeData, updateNodeData, conditions]);
  
  // Handler for group number change
  const handleGroupNumberChange = useCallback((value: number) => {
    const newGroupNumber = value || 1;
    setGroupNumber(newGroupNumber);
    
    updateNodeData(node.id, {
      ...nodeData,
      retryConfig: {
        ...(nodeData.retryConfig || {}),
        groupNumber: newGroupNumber
      },
      conditions, // Ensure conditions are preserved
      _lastUpdated: Date.now()
    });
  }, [node.id, nodeData, updateNodeData, conditions]);
  
  // Handler for max entries change
  const handleMaxEntriesChange = useCallback((value: number) => {
    const newMaxEntries = value || 1;
    setMaxEntries(newMaxEntries);
    
    updateNodeData(node.id, {
      ...nodeData,
      retryConfig: {
        ...(nodeData.retryConfig || {}),
        maxEntries: newMaxEntries
      },
      conditions, // Ensure conditions are preserved
      _lastUpdated: Date.now()
    });
  }, [node.id, nodeData, updateNodeData, conditions]);
  
  // Handler for target node change
  const handleTargetNodeChange = useCallback((newTargetNodeId: string | undefined) => {
    setTargetNodeId(newTargetNodeId);
    
    updateNodeData(node.id, {
      ...nodeData,
      targetNodeId: newTargetNodeId,
      conditions, // Ensure conditions are preserved
      _lastUpdated: Date.now()
    });
  }, [node.id, nodeData, updateNodeData, conditions]);
  
  return {
    label,
    groupNumber,
    maxEntries,
    targetNodeId,
    handleLabelChange,
    handleGroupNumberChange,
    handleMaxEntriesChange,
    handleTargetNodeChange
  };
};
