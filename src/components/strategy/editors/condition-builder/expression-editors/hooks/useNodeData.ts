
import { useStrategyStore } from '@/hooks/use-strategy-store';

export const useNodeData = () => {
  const { nodes } = useStrategyStore();

  const getNodeVariables = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node || !node.data?.variables) {
      return [];
    }
    
    return Array.isArray(node.data.variables) ? node.data.variables : [];
  };

  return {
    getNodeVariables
  };
};
