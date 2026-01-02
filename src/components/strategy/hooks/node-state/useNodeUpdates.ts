
import { useCallback, useMemo, useEffect, useRef } from 'react';
import { Node } from '@xyflow/react';
import { shouldUpdateNodes } from '../../utils/performanceUtils';
import { useNodeUpdateStore } from './useNodeUpdateStore';
import { useUpdateProcessing } from './useUpdateProcessing';
import { handleError } from '../../utils/errorHandling';

/**
 * Hook to manage throttled node updates and prevent update cycles
 * Optimized for better performance with large node sets
 */
export function useNodeUpdates(strategyStore: any) {
  // Use more focused hooks for specific functionality
  const {
    lastUpdateTimeRef,
    updateCycleRef,
    storeUpdateInProgressRef,
    processStoreUpdate,
    cleanup: cleanupNodeUpdateStore
  } = useNodeUpdateStore(strategyStore);
  
  const {
    updateTimeoutRef,
    isProcessingChangesRef,
    scheduleUpdate,
    cleanup: cleanupUpdateProcessing
  } = useUpdateProcessing();
  
  // Track consecutive updates to detect potential infinite loops
  const consecutiveUpdatesRef = useRef({ count: 0, time: 0 });
  const lastConsoleWarnRef = useRef(0);
  const cycleDetectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // More aggressive cycle detection with source tracking
  useEffect(() => {
    const checkUpdateCycles = () => {
      const now = Date.now();
      const timeSinceLastUpdate = now - consecutiveUpdatesRef.current.time;
      
      if (timeSinceLastUpdate < 2000) { // Increased from 1000ms to 2000ms
        consecutiveUpdatesRef.current.count++;
        
        // More aggressive detection - lower threshold
        if (consecutiveUpdatesRef.current.count > 10) { // Reduced from 20 to 10
          // Only log warning once every 10 seconds to avoid console spam
          if (now - lastConsoleWarnRef.current > 10000) {
            console.warn('[useNodeUpdates] Infinite render cycle detected, breaking cycle. Count:', consecutiveUpdatesRef.current.count);
            console.warn('[useNodeUpdates] Cycle source - processing state:', isProcessingChangesRef.current, 'store updating:', storeUpdateInProgressRef.current);
            lastConsoleWarnRef.current = now;
          }
          
          updateCycleRef.current = true;
          
          // Clear any pending timeouts to stop the cycle
          if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current);
            updateTimeoutRef.current = null;
          }
          
          // Reset flags immediately to break the cycle
          isProcessingChangesRef.current = false;
          storeUpdateInProgressRef.current = false;
          
          // Reset cycle breaker after longer delay
          if (cycleDetectionTimeoutRef.current) {
            clearTimeout(cycleDetectionTimeoutRef.current);
          }
          
          cycleDetectionTimeoutRef.current = setTimeout(() => {
            updateCycleRef.current = false;
            consecutiveUpdatesRef.current.count = 0;
            console.log('[useNodeUpdates] Cycle breaker reset, allowing updates again');
            cycleDetectionTimeoutRef.current = null;
          }, 5000); // Increased from 3000ms to 5000ms
        }
      } else {
        // Reset counter if enough time has passed
        if (consecutiveUpdatesRef.current.count > 0) {
          consecutiveUpdatesRef.current.count = 0; // Reset to 0 instead of 1
        }
      }
      consecutiveUpdatesRef.current.time = now;
    };
    
    const interval = setInterval(checkUpdateCycles, 2000); // Check even less frequently
    return () => clearInterval(interval);
  }, [updateCycleRef, isProcessingChangesRef, storeUpdateInProgressRef, updateTimeoutRef]);
  
  // Add cleanup effect to prevent memory leaks and lingering timers
  useEffect(() => {
    return () => {
      cleanupNodeUpdateStore();
      cleanupUpdateProcessing();
      consecutiveUpdatesRef.current.count = 0;
      
      if (cycleDetectionTimeoutRef.current) {
        clearTimeout(cycleDetectionTimeoutRef.current);
        cycleDetectionTimeoutRef.current = null;
      }
    };
  }, [cleanupNodeUpdateStore, cleanupUpdateProcessing]);
  
  // Return stable references to prevent re-renders
  return useMemo(() => ({
    lastUpdateTimeRef,
    updateTimeoutRef,
    updateCycleRef,
    isProcessingChangesRef,
    storeUpdateInProgressRef,
    processStoreUpdate,
    shouldUpdateNodes,
    scheduleUpdate,
    handleError
  }), [processStoreUpdate, scheduleUpdate]);
}
