
import { useEffect, useRef } from 'react';
import { Node, Edge } from '@xyflow/react';

/**
 * Hook to handle synchronization between local state and strategy store history
 */
export function useHistorySync(
  nodes: Node[],
  edges: Edge[],
  strategyStore: any,
  isDraggingRef: React.MutableRefObject<boolean>
) {
  const isInitialLoad = useRef(true);
  
  // Initial load from localStorage - only run once
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
    }
  }, []);

  // Set up history management
  useEffect(() => {
    // Don't update history during dragging operations
    if (isDraggingRef.current || isInitialLoad.current) return;
    
    const timer = setTimeout(() => {
      strategyStore.addHistoryItem(nodes, edges);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [nodes, edges, strategyStore, isDraggingRef]);

  return {
    isInitialLoad
  };
}
