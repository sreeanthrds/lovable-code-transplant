
import { useCallback } from 'react';
import { Node } from '@xyflow/react';

/**
 * Hook for creating a custom setNodes function with optimizations
 */
export function useCustomSetNodes({
  setLocalNodes,
  isDraggingRef,
  pendingNodesUpdate,
  lastUpdateTimeRef,
  updateTimeoutRef,
  updateCycleRef,
  storeUpdateInProgressRef,
  shouldUpdateNodes,
  processStoreUpdate,
  handleError
}: {
  setLocalNodes: (nodes: Node[]) => void;
  isDraggingRef: React.MutableRefObject<boolean>;
  pendingNodesUpdate: React.MutableRefObject<Node[] | null>;
  lastUpdateTimeRef: React.MutableRefObject<number>;
  updateTimeoutRef: React.MutableRefObject<any>;
  updateCycleRef: React.MutableRefObject<boolean>;
  storeUpdateInProgressRef: React.MutableRefObject<boolean>;
  shouldUpdateNodes: (oldNodes: Node[], newNodes: Node[]) => boolean;
  processStoreUpdate: (nodes: Node[]) => void;
  handleError: (error: unknown, context: string) => void;
}) {
  return useCallback((newNodes: Node[]) => {
    try {
      // Update the local state
      setLocalNodes(newNodes);
      
      // Check if this update should be propagated to the store
      const shouldPropagate = true;
      
      if (!shouldPropagate) {
        return;
      }

      // Handle updates differently based on drag state and scheduling
      if (isDraggingRef.current) {
        // If we're dragging, store the nodes for later update
        pendingNodesUpdate.current = newNodes;
        
        // Clear any existing timeout to avoid duplicate updates
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
          updateTimeoutRef.current = null;
        }
      } else if (!storeUpdateInProgressRef.current && !updateCycleRef.current) {
        // Check if update is needed
        const currentTime = Date.now();
        const timeSinceLastUpdate = currentTime - (lastUpdateTimeRef.current || 0);
        
        // Schedule update with throttling
        if (timeSinceLastUpdate > 200) {
          processStoreUpdate(newNodes);
        } else {
          // Queue an update if we're updating too frequently
          if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current);
          }
          
          updateTimeoutRef.current = setTimeout(() => {
            processStoreUpdate(newNodes);
            updateTimeoutRef.current = null;
          }, 250);
        }
      }
    } catch (error) {
      handleError(error, 'setNodes');
    }
  }, [
    setLocalNodes,
    isDraggingRef,
    pendingNodesUpdate,
    lastUpdateTimeRef,
    updateTimeoutRef,
    updateCycleRef,
    storeUpdateInProgressRef,
    shouldUpdateNodes,
    processStoreUpdate,
    handleError
  ]);
}
