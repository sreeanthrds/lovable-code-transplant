
import { useCallback, useRef, useEffect } from 'react';
import { Edge, Node } from '@xyflow/react';
import { toast } from '@/hooks/use-toast';
import { createDeleteEdgeHandler } from '../../utils/handlers/edgeHandlers';
import { handleError } from '../../utils/errorHandling';

interface UseEdgeHandlersProps {
  edges: Edge[];
  nodes: Node[];
  setEdges: (edges: Edge[]) => void;
  strategyStore: any;
  updateHandlingRef: React.MutableRefObject<boolean>;
}

/**
 * Hook for edge-related event handlers
 */
export const useEdgeHandlers = ({
  edges,
  nodes,
  setEdges,
  strategyStore,
  updateHandlingRef
}: UseEdgeHandlersProps) => {
  // Create stable refs to latest values
  const edgesRef = useRef(edges);
  const nodesRef = useRef(nodes);
  const storeRef = useRef(strategyStore);
  
  // Update refs when dependencies change
  useEffect(() => {
    edgesRef.current = edges;
    nodesRef.current = nodes;
    storeRef.current = strategyStore;
  }, [edges, nodes, strategyStore]);
  
  // Create stable handler for deleting edges
  const handleDeleteEdge = useCallback((id: string) => {
    try {
      // Skip if update is already in progress
      if (updateHandlingRef.current) {
        console.log('Skipping edge deletion due to ongoing update');
        return;
      }
      
      // Set the flag to prevent concurrent updates
      updateHandlingRef.current = true;
      
      const deleteHandler = createDeleteEdgeHandler(
        edgesRef.current, 
        setEdges, 
        storeRef.current, 
        nodesRef.current
      );
      
      // Execute the deletion
      deleteHandler(id);
    } catch (error) {
      handleError(error, "Edge deletion handler");
    } finally {
      // Reset the flag after a short delay
      setTimeout(() => {
        updateHandlingRef.current = false;
      }, 100);
    }
  }, [setEdges, updateHandlingRef]);

  return {
    handleDeleteEdge
  };
};
