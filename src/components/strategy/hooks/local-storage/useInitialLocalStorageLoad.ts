
import { useEffect } from 'react';
import { Node, Edge } from '@xyflow/react';
import { loadStrategy } from '@/hooks/strategy-store/supabase-persistence';

export interface UseInitialLocalStorageLoadProps {
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void;
  strategyStore: any;
  initialNodes: Node[];
  currentStrategyId: string;
  isInitialLoadRef: React.MutableRefObject<boolean>;
  isUpdatingFromLocalStorageRef: React.MutableRefObject<boolean>;
  onLoadComplete?: () => void;
  enabled?: boolean;
}

export function useInitialLocalStorageLoad({
  setNodes,
  setEdges,
  strategyStore,
  initialNodes,
  currentStrategyId,
  isInitialLoadRef,
  isUpdatingFromLocalStorageRef,
  onLoadComplete,
  enabled = true
}: UseInitialLocalStorageLoadProps) {
  // Initial load from Supabase/localStorage
  useEffect(() => {
    // Skip if disabled (for new strategy creation)
    if (!enabled) {
      return;
    }
    
    if (isInitialLoadRef.current && currentStrategyId) {
      const loadAsync = async () => {
        try {
          isUpdatingFromLocalStorageRef.current = true;
          
          // Load strategy from Supabase (with localStorage fallback)
          const loadedStrategy = await loadStrategy(currentStrategyId);
          
          if (loadedStrategy && loadedStrategy.nodes && loadedStrategy.nodes.length > 0) {
            // Filter out any existing strategy overview nodes from loaded data to prevent duplicates
            const cleanedNodes = loadedStrategy.nodes.filter(node => !node.data?.isStrategyOverview);
            // Include cleaned nodes AND the single virtual overview node
            const nodesWithOverview = [...cleanedNodes, strategyStore.getStrategyOverviewNode()];
            setNodes(nodesWithOverview);
            setEdges(loadedStrategy.edges || []);
            
            // Update store with combined nodes
            strategyStore.setNodes(nodesWithOverview);
            strategyStore.setEdges(loadedStrategy.edges || []);
            
            // Reset history and add initial state (only clean nodes, no overview nodes in history)
            strategyStore.resetHistory();
            strategyStore.addHistoryItem(cleanedNodes, loadedStrategy.edges || []);
            
            // Call load complete callback for auto-arrange
            if (onLoadComplete) {
              setTimeout(() => {
                onLoadComplete();
              }, 300);
            }
          } else {
            // If no nodes were loaded, use initial nodes
            // Include both initial nodes AND the virtual overview node
            const nodesWithOverview = [...initialNodes, strategyStore.getStrategyOverviewNode()];
            setNodes(nodesWithOverview);
            setEdges([]);
            
            // Update store with combined nodes
            strategyStore.setNodes(nodesWithOverview);
            strategyStore.setEdges([]);
            
            // Reset history and add initial state (only exportable nodes in history)
            strategyStore.resetHistory();
            strategyStore.addHistoryItem(initialNodes, []);
            
            // Call load complete callback
            if (onLoadComplete) {
              setTimeout(() => {
                onLoadComplete();
              }, 300);
            }
          }
        } catch (error) {
          console.error('Error loading strategy:', error);
          
          // Fallback to initial nodes with virtual overview node
          const nodesWithOverview = [...initialNodes, strategyStore.getStrategyOverviewNode()];
          setNodes(nodesWithOverview);
          setEdges([]);
          
          // Update store with combined nodes
          strategyStore.setNodes(nodesWithOverview);
          strategyStore.setEdges([]);
          
          // Reset history
          strategyStore.resetHistory();
          strategyStore.addHistoryItem(initialNodes, []);
          
          // Call load complete callback even on error
          if (onLoadComplete) {
            setTimeout(() => {
              onLoadComplete();
            }, 300);
          }
        } finally {
          // Reset flags
          isInitialLoadRef.current = false;
          
          // Reset updating flag after a delay
          setTimeout(() => {
            isUpdatingFromLocalStorageRef.current = false;
          }, 200);
        }
      };
      
      loadAsync();
    }
  }, [
    setNodes, 
    setEdges, 
    strategyStore, 
    initialNodes, 
    currentStrategyId, 
    isInitialLoadRef, 
    isUpdatingFromLocalStorageRef,
    onLoadComplete,
    enabled
  ]);
}
