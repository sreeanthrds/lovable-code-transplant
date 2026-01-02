
import { useCallback, useRef } from 'react';
import { Node } from '@xyflow/react';

/**
 * Hook to manage node updates to the strategy store
 */
export function useNodeUpdateStore(strategyStore: any) {
  const lastUpdateTimeRef = useRef<number>(0);
  const updateCycleRef = useRef<boolean>(false);
  const storeUpdateInProgressRef = useRef<boolean>(false);

  // Process a store update (throttled)
  const processStoreUpdate = useCallback((nodesToUpdate: Node[]) => {
    // Skip updates if processing is in progress or cycle detected
    if (storeUpdateInProgressRef.current || updateCycleRef.current) {
      return;
    }
    
    // Set processing flag
    storeUpdateInProgressRef.current = true;
    
    try {
      // Set a minimum time between updates
      const currentTime = Date.now();
      const timeSinceLastUpdate = currentTime - lastUpdateTimeRef.current;
      
      // If the update is happening too soon after the last one, skip it
      if (timeSinceLastUpdate < 100) {
        console.debug('Skipping update: too soon after previous update');
        return;
      }
      
      // Update the store with the provided nodes
      lastUpdateTimeRef.current = currentTime;
      
      // Apply the update to the strategy store
      strategyStore.setNodes(nodesToUpdate);
      strategyStore.addHistoryItem(nodesToUpdate, strategyStore.edges);
      
      console.debug('Store update processed');
    } catch (error) {
      console.error('Error updating store:', error);
    } finally {
      // Reset processing flag after a short delay to prevent immediate further updates
      setTimeout(() => {
        storeUpdateInProgressRef.current = false;
      }, 50);
    }
  }, [strategyStore]);

  // Clean up function
  const cleanup = useCallback(() => {
    updateCycleRef.current = false;
    storeUpdateInProgressRef.current = false;
  }, []);

  return {
    lastUpdateTimeRef,
    updateCycleRef,
    storeUpdateInProgressRef,
    processStoreUpdate,
    cleanup
  };
}
