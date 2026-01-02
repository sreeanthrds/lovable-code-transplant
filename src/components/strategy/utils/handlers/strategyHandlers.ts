
import { Node, Edge } from '@xyflow/react';
import { setSavingState } from '@/hooks/strategy-store/supabase-persistence';

export const createResetStrategyHandler = (
  setNodes: (nodes: Node[]) => void,
  setEdges: (edges: Edge[]) => void,
  strategyStore: any,
  initialNodes: Node[],
  closePanel: () => void
) => {
  return async () => {
    // Show resetting indicator
    setSavingState(true, 'Resetting strategy...');
    
    // Reset nodes and edges in both state and store
    setNodes(initialNodes);
    setEdges([]);
    strategyStore.setNodes(initialNodes);
    strategyStore.setEdges([]);
    
    // Reset history and clear any selected nodes
    strategyStore.resetHistory();
    
    // Add the initial state to history
    strategyStore.addHistoryItem(initialNodes, []);
    
    // Close any open panel
    closePanel();
    
    // Also clear the current strategy in localStorage
    localStorage.removeItem('tradyStrategy');
    
    // Add a small delay to show the resetting state
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setSavingState(false);
  };
};

// This handler only shows the saving indicator for imports
export const createImportSuccessHandler = (
  reactFlowInstance: any
) => {
  return async () => {
    setSavingState(true, 'Processing import...');
    
    // Add a small delay to show the processing state
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSavingState(false);
  };
};
