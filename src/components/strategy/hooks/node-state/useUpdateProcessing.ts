
import { useCallback, useRef, useEffect } from 'react';
import { Node } from '@xyflow/react';
import { handleError } from '../../utils/errorHandling';

/**
 * Hook to manage the processing of queued node updates
 * with improved performance and reduced render cycles
 */
export function useUpdateProcessing() {
  const updateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isProcessingChangesRef = useRef(false);
  const pendingProcessTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastProcessTimeRef = useRef(0);
  
  // Clean up timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (pendingProcessTimeoutRef.current) {
        clearTimeout(pendingProcessTimeoutRef.current);
        pendingProcessTimeoutRef.current = null;
      }
      
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }
      
      isProcessingChangesRef.current = false;
    };
  }, []);

  const scheduleUpdate = useCallback((nodes: Node[], process: (nodes: Node[]) => void) => {
    const now = Date.now();
    
    // Skip if we're already processing changes or if too recent
    if (isProcessingChangesRef.current || (now - lastProcessTimeRef.current < 300)) {
      console.debug('[useUpdateProcessing] Skipping update - processing:', isProcessingChangesRef.current, 'recent:', (now - lastProcessTimeRef.current < 300));
      return;
    }
    
    // Clear any existing timeouts to prevent multiple updates
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
      updateTimeoutRef.current = null;
    }
    
    // Set a flag to indicate that we're processing changes
    isProcessingChangesRef.current = true;
    lastProcessTimeRef.current = now;
    
    // Use a longer timeout to reduce frequency of updates
    updateTimeoutRef.current = setTimeout(() => {
      try {
        console.debug('[useUpdateProcessing] Processing scheduled update');
        process(nodes);
      } catch (error) {
        handleError(error, 'scheduleUpdate');
      } finally {
        updateTimeoutRef.current = null;
        
        // Reset the processing flag after a delay
        setTimeout(() => {
          isProcessingChangesRef.current = false;
        }, 150); // Increased from 100ms to 150ms
      }
    }, 300); // Increased from 200ms to 300ms for more stability
  }, []);

  const cleanup = useCallback(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
      updateTimeoutRef.current = null;
    }
    
    if (pendingProcessTimeoutRef.current) {
      clearTimeout(pendingProcessTimeoutRef.current);
      pendingProcessTimeoutRef.current = null;
    }
    
    isProcessingChangesRef.current = false;
    lastProcessTimeRef.current = 0;
  }, []);

  return {
    updateTimeoutRef,
    isProcessingChangesRef,
    scheduleUpdate,
    cleanup
  };
}
