
import { useEffect } from 'react';
import { Node, Edge } from '@xyflow/react';
import { loadStrategyFromLocalStorage } from '../../utils/storage/operations/loadStrategy';

export interface UseExternalStorageChangeListenerProps {
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void;
  strategyStore: any;
  currentStrategyIdRef: React.MutableRefObject<string>;
  isUpdatingFromLocalStorageRef: React.MutableRefObject<boolean>;
  enabled?: boolean;
}

export function useExternalStorageChangeListener({
  setNodes,
  setEdges,
  strategyStore,
  currentStrategyIdRef,
  isUpdatingFromLocalStorageRef,
  enabled = true
}: UseExternalStorageChangeListenerProps) {
  // Listen for changes to localStorage (from another tab or from import)
  useEffect(() => {
    // Skip if disabled
    if (!enabled) return;
    
    const handleStorageChange = (event: StorageEvent) => {
      // Skip if we're already updating from localStorage
      if (isUpdatingFromLocalStorageRef.current) return;
      
      const currentStrategyKey = `strategy_${currentStrategyIdRef.current}`;
      
      // Only process if the change is for our current strategy
      if (event.key === currentStrategyKey && event.newValue) {
        console.log('External change detected, updating from localStorage');
        
        try {
          isUpdatingFromLocalStorageRef.current = true;
          
          // Load strategy from localStorage
          const loadedStrategy = loadStrategyFromLocalStorage(currentStrategyIdRef.current);
          
          if (loadedStrategy && loadedStrategy.nodes && loadedStrategy.nodes.length > 0) {
            // Update local state
            setNodes(loadedStrategy.nodes);
            setEdges(loadedStrategy.edges || []);
            
            // Update store
            strategyStore.setNodes(loadedStrategy.nodes);
            strategyStore.setEdges(loadedStrategy.edges || []);
            strategyStore.addHistoryItem(loadedStrategy.nodes, loadedStrategy.edges || []);
            
            console.log(`Updated from external change: ${loadedStrategy.nodes.length} nodes, ${loadedStrategy.edges?.length || 0} edges`);
          }
        } catch (error) {
          console.error('Error handling storage event:', error);
        } finally {
          // Reset after a delay
          setTimeout(() => {
            isUpdatingFromLocalStorageRef.current = false;
          }, 200);
        }
      }
    };
    
    // Add listener for storage events
    window.addEventListener('storage', handleStorageChange);
    
    // Clean up
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [setNodes, setEdges, strategyStore, currentStrategyIdRef, isUpdatingFromLocalStorageRef, enabled]);
}
