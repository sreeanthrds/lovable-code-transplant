
import { useCallback } from 'react';
import { Node } from '@xyflow/react';

interface UseVpiValidationProps {
  nodes: Node[];
}

export const useVpiValidation = ({ nodes }: UseVpiValidationProps) => {
  // Validate that a VPI is unique across the entire strategy
  const validateVpiUniqueness = useCallback((vpi: string, currentPositionVpi: string) => {
    // Empty VPI is always valid
    if (!vpi.trim()) return true;
    
    // Check all nodes in the strategy
    for (const checkNode of nodes) {
      // Skip non-action nodes
      if (checkNode.type !== 'actionNode') continue;
      
      // Check all positions in this node
      const actionNodeData = checkNode.data as any;
      if (actionNodeData.positions) {
        for (const position of actionNodeData.positions) {
          // Skip the current position
          if (position.vpi === currentPositionVpi) continue;
          
          // If we find a matching VPI, it's not unique
          if (position.vpi === vpi) {
            return false;
          }
        }
      }
    }
    
    return true;
  }, [nodes]);

  return {
    validateVpiUniqueness
  };
};
