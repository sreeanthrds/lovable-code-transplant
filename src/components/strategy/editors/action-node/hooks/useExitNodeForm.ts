
import { Node } from '@xyflow/react';
import { useExitOrderForm } from '../exit-node/useExitOrderForm';
import type { 
  ExitOrderType, 
  ExitOrderConfig,
  ExitNodeData
} from '../exit-node/types';

// Re-export types for convenience
export type {
  ExitOrderType,
  ExitOrderConfig,
  ExitNodeData
};

interface UseExitNodeFormProps {
  node: Node;
  updateNodeData: (id: string, data: any) => void;
}

// This is just a proxy to the implementation in exit-node/useExitOrderForm.ts
export const useExitNodeForm = ({ node, updateNodeData }: UseExitNodeFormProps) => {
  return useExitOrderForm({ node, updateNodeData });
};
