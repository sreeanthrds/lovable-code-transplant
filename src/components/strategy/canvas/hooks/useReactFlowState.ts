import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useReactFlowState() {
  const [searchParams] = useSearchParams();
  const currentStrategyId = searchParams.get('id') || '';
  const currentStrategyName = searchParams.get('name') || 'Untitled Strategy';
  const currentStrategyIdRef = useRef(currentStrategyId);
  
  // Force remount of ReactFlow when strategy changes by using a unique key
  const [flowKey, setFlowKey] = useState(`flow-${currentStrategyId || Date.now()}`);

  // Update flow key when strategy ID changes to force remount
  useEffect(() => {
    if (currentStrategyId !== currentStrategyIdRef.current) {
      console.log(`Strategy changed from ${currentStrategyIdRef.current} to ${currentStrategyId}, forcing remount`);
      setFlowKey(`flow-${currentStrategyId}-${Date.now()}`);
      currentStrategyIdRef.current = currentStrategyId;
    }
  }, [currentStrategyId]);

  return {
    currentStrategyId,
    currentStrategyName,
    currentStrategyIdRef,
    flowKey,
    setFlowKey
  };
}