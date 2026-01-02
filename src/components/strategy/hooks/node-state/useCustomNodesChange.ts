
import { useCallback, useRef } from 'react';

/**
 * Hook for creating a custom onNodesChange handler with optimizations
 */
export function useCustomNodesChange(enhancedDragHandler: any, onNodesChange: any) {
  const isProcessingChangesRef = useRef(false);

  // Wrapper for onNodesChange to prevent cycles and add guards
  const customNodesChangeHandler = useCallback((changes: any) => {
    // Skip if we're already processing changes - prevent cycles
    if (isProcessingChangesRef.current) {
      return;
    }
    
    try {
      // Set processing flag
      isProcessingChangesRef.current = true;
      
      // Call the enhanced drag handler
      enhancedDragHandler(changes, onNodesChange);
    } catch (error) {
      console.error('Error in customNodesChangeHandler:', error);
    } finally {
      // Reset processing flag
      setTimeout(() => {
        isProcessingChangesRef.current = false;
      }, 0);
    }
  }, [enhancedDragHandler, onNodesChange]);

  return {
    customNodesChangeHandler,
    isProcessingChangesRef
  };
}
