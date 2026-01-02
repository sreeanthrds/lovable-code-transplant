
import { Node } from '@xyflow/react';
import { useExitNodeDefaults } from './useExitNodeDefaults';
import { useExitNodeState } from './useExitNodeState';

interface UseExitNodeBaseProps {
  node: Node;
  updateNodeData: (id: string, data: any) => void;
}

/**
 * Base hook for exit node functionality
 * This orchestrates the other smaller hooks for a complete solution
 */
export const useExitNodeBase = ({ node, updateNodeData }: UseExitNodeBaseProps) => {
  // Get the node data
  const nodeData = node.data || {};
  
  // Get default exit node data
  const { defaultExitNodeData } = useExitNodeDefaults();
  
  // Get state management
  const exitNodeState = useExitNodeState({ nodeData });

  return {
    nodeData,
    defaultExitNodeData,
    ...exitNodeState
  };
};
