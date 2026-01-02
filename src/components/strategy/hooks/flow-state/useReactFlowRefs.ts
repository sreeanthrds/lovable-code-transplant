
import { useRef, useState, useEffect } from 'react';
import { useReactFlow } from '@xyflow/react';

/**
 * Hook to manage ReactFlow references and initialization state
 */
export function useReactFlowRefs() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useReactFlow();
  const isInitializedRef = useRef(false);
  const [storeInitialized, setStoreInitialized] = useState(false);
  const updateHandlingRef = useRef(false);
  
  // Initialize store after ReactFlow is ready
  useEffect(() => {
    if (!isInitializedRef.current && reactFlowInstance) {
      isInitializedRef.current = true;
      
      // Delay the store initialization to ensure initial load is complete
      const syncTimeout = setTimeout(() => {
        setStoreInitialized(true);
      }, 3000); // Longer delay for initialization
      
      return () => clearTimeout(syncTimeout);
    }
  }, [reactFlowInstance]);
  
  return {
    reactFlowWrapper,
    reactFlowInstance,
    isInitializedRef,
    storeInitialized,
    setStoreInitialized,
    updateHandlingRef
  };
}
