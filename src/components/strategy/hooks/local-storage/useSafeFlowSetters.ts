
import { useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';

interface UseSafeFlowSettersProps {
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void;
}

export function useSafeFlowSetters({
  setNodes,
  setEdges
}: UseSafeFlowSettersProps) {
  // Safe setter functions that check if the setters exist
  const safeSetNodes = useCallback((nodes: Node[] | ((prev: Node[]) => Node[])) => {
    if (typeof setNodes === 'function') {
      try {
        setNodes(nodes);
      } catch (error) {
        console.error('Error in safeSetNodes:', error);
      }
    } else {
      console.warn('setNodes is not a function');
    }
  }, [setNodes]);
  
  const safeSetEdges = useCallback((edges: Edge[] | ((prev: Edge[]) => Edge[])) => {
    if (typeof setEdges === 'function') {
      try {
        setEdges(edges);
        console.log('Edges set successfully via safeSetEdges:', 
          typeof edges === 'function' ? 'function' : edges.length);
      } catch (error) {
        console.error('Error in safeSetEdges:', error);
      }
    } else {
      console.warn('setEdges is not a function');
    }
  }, [setEdges]);

  return {
    safeSetNodes,
    safeSetEdges
  };
}
