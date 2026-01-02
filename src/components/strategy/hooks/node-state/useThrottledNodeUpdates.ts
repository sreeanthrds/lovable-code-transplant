
import { useEffect } from 'react';
import { Node } from '@xyflow/react';

/**
 * Hook to manage throttled node updates on an interval
 */
export function useThrottledNodeUpdates({
  pendingNodesUpdate,
  lastUpdateTimeRef,
  updateTimeoutRef,
  processStoreUpdate
}: {
  pendingNodesUpdate: React.MutableRefObject<Node[] | null>;
  lastUpdateTimeRef: React.MutableRefObject<number>;
  updateTimeoutRef: React.MutableRefObject<any>;
  processStoreUpdate: (nodes: Node[]) => void;
}) {
  // Set up a throttled update interval for long operations
  useEffect(() => {
    // Check for pending updates every second
    const intervalId = setInterval(() => {
      if (pendingNodesUpdate.current && updateTimeoutRef.current === null) {
        const currentTime = Date.now();
        
        // Only process if it's been at least 1 second since last update
        if (currentTime - (lastUpdateTimeRef.current || 0) > 1000) {
          processStoreUpdate(pendingNodesUpdate.current);
          pendingNodesUpdate.current = null;
        }
      }
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [pendingNodesUpdate, lastUpdateTimeRef, updateTimeoutRef, processStoreUpdate]);
}
