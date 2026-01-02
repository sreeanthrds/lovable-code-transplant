
import { useEffect, useRef, useLayoutEffect } from 'react';
import { Node, Edge } from '@xyflow/react';
import { initialNodes } from '../../utils/flowUtils';

interface UseStrategyInitializationProps {
  isNew: boolean;
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void;
  strategyStore: any;
}

/**
 * Hook to handle strategy initialization
 */
export function useStrategyInitialization({
  isNew,
  setNodes,
  setEdges,
  strategyStore
}: UseStrategyInitializationProps) {
  const hasInitializedRef = useRef(false);
  
  // Use useLayoutEffect for synchronous initialization before paint
  useLayoutEffect(() => {
    if (isNew && !hasInitializedRef.current) {
      console.log('🆕 Initializing new strategy with default nodes');
      hasInitializedRef.current = true;
      
      try {
        // Clear localStorage for new strategy
        localStorage.removeItem('tradyStrategy');
        
        // Set initial nodes immediately (no delays)
        setNodes(initialNodes);
        setEdges([]);
        
        // Update store state
        strategyStore.setNodes(initialNodes);
        strategyStore.setEdges([]);
        strategyStore.resetHistory();
        strategyStore.addHistoryItem(initialNodes, []);
        
        console.log('✅ New strategy initialized successfully with nodes:', initialNodes.length);
      } catch (error) {
        console.error('❌ Error initializing new strategy:', error);
        hasInitializedRef.current = false;
      }
    }
  }, [isNew, setNodes, setEdges, strategyStore]);
}
