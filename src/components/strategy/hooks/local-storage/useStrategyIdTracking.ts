
import { useEffect, useRef } from 'react';

export function useStrategyIdTracking(currentStrategyId: string) {
  const currentStrategyIdRef = useRef(currentStrategyId);
  const isInitialLoadRef = useRef(true);
  
  // Update the ref when the strategy ID changes
  useEffect(() => {
    console.log('🆔 Strategy ID tracking effect:', {
      currentStrategyId,
      currentStrategyIdRef: currentStrategyIdRef.current,
      changed: currentStrategyId !== currentStrategyIdRef.current
    });
    
    if (currentStrategyId !== currentStrategyIdRef.current) {
      console.log(`🔄 Strategy ID changed from ${currentStrategyIdRef.current} to ${currentStrategyId}`);
      isInitialLoadRef.current = true; // Reset to trigger loading the new strategy
      currentStrategyIdRef.current = currentStrategyId;
      console.log(`✅ Set isInitialLoadRef to TRUE for new strategy: ${currentStrategyId}`);
    }
  }, [currentStrategyId]);

  // Log current state
  useEffect(() => {
    console.log('🔍 Current tracking state:', {
      currentStrategyId,
      isInitialLoadRef: isInitialLoadRef.current,
      shouldTriggerLoad: isInitialLoadRef.current && !!currentStrategyId
    });
  }, [currentStrategyId]);

  return {
    currentStrategyIdRef,
    isInitialLoadRef
  };
}
