import { useCallback } from 'react';
import { createDeleteNodeHandler } from '../../../utils/handlers';
import { useVpsStore } from '@/hooks/useVpsStore';
import { UseDeleteNodeHandlerProps } from './types';

export const useDeleteNodeHandler = ({
  nodesRef,
  edgesRef,
  setNodes,
  setEdges,
  strategyStore,
  updateHandlingRef
}: UseDeleteNodeHandlerProps) => {
  // Get access to the VPS store
  const { setPositions } = useVpsStore();
  
  // Create stable handler for deleting nodes
  return useCallback((id: string) => {
    if (updateHandlingRef.current) return;
    updateHandlingRef.current = true;
    
    try {
      // First, get the node that's being deleted to find any associated positions
      const nodeToDelete = nodesRef.current.find(node => node.id === id);
      
      // Standard delete handler
      const handler = createDeleteNodeHandler(
        nodesRef.current,
        edgesRef.current,
        setNodes,
        setEdges,
        strategyStore.current
      );
      
      // Execute the deletion
      handler(id);
      
      // After the node is deleted, sync remaining nodes' positions with VPS and auto-arrange
      setTimeout(async () => {
        // Extract positions from all remaining nodes
        const remainingPositions = nodesRef.current.reduce((acc, node) => {
          if (node.data?.positions && Array.isArray(node.data.positions)) {
            return [...acc, ...node.data.positions];
          }
          return acc;
        }, []);
        
        // Update the VPS store with only positions from remaining nodes
        setPositions(remainingPositions);

        // Auto-arrange after deletion if we have more than one node
        if (nodesRef.current.length > 1) {
          try {
            const { getLayoutedElements, layoutPresets } = await import('../../../utils/pro-layout/elkLayoutUtils');
            const { nodes: arrangedNodes, edges: arrangedEdges } = await getLayoutedElements(
              nodesRef.current, 
              edgesRef.current, 
              layoutPresets.symmetricTree
            );
            
            setNodes(arrangedNodes);
            setEdges(arrangedEdges);
            strategyStore.current.addHistoryItem(arrangedNodes, arrangedEdges);
          } catch (error) {
            console.error('Auto-arrange after deletion failed:', error);
          }
        }
      }, 50);
    } finally {
      setTimeout(() => {
        updateHandlingRef.current = false;
      }, 100);
    }
  }, [setNodes, setEdges, updateHandlingRef, nodesRef, edgesRef, strategyStore, setPositions]);
};
