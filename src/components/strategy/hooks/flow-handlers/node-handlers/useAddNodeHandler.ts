
import { useCallback } from 'react';
import { toast } from "@/hooks/use-toast";
import { createAddNodeHandler } from '../../../utils/handlers';
import { UseAddNodeHandlerProps } from './types';

export const useAddNodeHandler = ({
  reactFlowWrapper,
  reactFlowInstance,
  nodes,
  nodesRef,
  edgesRef,
  setNodes,
  setEdges,
  strategyStore,
  updateHandlingRef
}: UseAddNodeHandlerProps) => {
  // Create stable handler for adding nodes that supports both position objects and parent node IDs
  return useCallback((type: string, positionOrParentId?: { x: number, y: number } | string) => {
    // Skip if update is already in progress, but don't cancel first-time additions
    if (updateHandlingRef.current && nodes.length > 1) {
      console.log('Skipping add node due to ongoing update');
      return;
    }
    
    // Set the flag but also ensure it gets reset even if errors occur
    updateHandlingRef.current = true;
    
    try {
      // Ensure reactFlowInstance is available
      if (!reactFlowInstance.current || !reactFlowWrapper.current) {
        console.error('React Flow instance or wrapper not available');
        updateHandlingRef.current = false;
        return;
      }
      
      const addNodeHandler = createAddNodeHandler(
        reactFlowInstance.current,
        reactFlowWrapper,
        nodesRef.current,
        edgesRef.current,
        setNodes,
        setEdges,
        strategyStore.current
      );
      
      // Add the node - support both position objects and parent node IDs
      addNodeHandler(type, positionOrParentId);
      
      // Force immediate update to store without delay - CRITICAL FOR FIRST NODE ADDITION
      console.log('✅ Node added successfully, triggering auto-arrange');
      
      // IMPORTANT: Check if we actually have more than one node before auto-arranging
      console.log('Current nodes count before auto-arrange:', nodesRef.current.length);
      
      // Auto-arrange with hierarchical layout after adding node - WITH LONGER DELAY
      setTimeout(async () => {
        console.log('🔄 Starting auto-arrange after node addition');
        console.log('Updated nodes count:', nodesRef.current.length);
        console.log('Updated edges count:', edgesRef.current.length);
        
        // Only auto-arrange if we have more than one node
        if (nodesRef.current.length > 1) {
          try {
            // Use the same approach as manual auto-arrange
            const { getLayoutedElements, layoutPresets } = await import('../../../utils/pro-layout/elkLayoutUtils');
            console.log('📦 ELK layout utilities imported for auto-arrange');
            
            const { nodes: arrangedNodes, edges: arrangedEdges } = await getLayoutedElements(
              nodesRef.current, 
              edgesRef.current, 
              layoutPresets.symmetricTree
            );
            
            console.log('✅ Auto-layout applied after node addition, updating nodes:', arrangedNodes.length);
            
            // Update React Flow state
            setNodes(arrangedNodes);
            setEdges(arrangedEdges);
            
            // Update store for persistence
            strategyStore.current.addHistoryItem(arrangedNodes, arrangedEdges);
            
            console.log('🎯 Auto-arrange after node addition completed successfully');
            
            // Auto-fit viewport with margin after layout is complete
            setTimeout(() => {
              if (reactFlowInstance.current) {
                console.log('🎯 Auto-fitting viewport after node addition');
                reactFlowInstance.current.fitView({
                  padding: 0.15, // 15% padding around the flow
                  includeHiddenNodes: false,
                  duration: 600,
                  minZoom: 0.1,
                  maxZoom: 1.5
                });
              }
            }, 200); // Short delay to ensure layout is rendered
          } catch (error) {
            console.error('❌ Auto-arrange on node addition failed:', error);
          }
        } else {
          console.log('⏭️ Skipping auto-arrange - only one node present');
          // Still fit view for single node case
          setTimeout(() => {
            if (reactFlowInstance.current) {
              console.log('🎯 Auto-fitting viewport for single node');
              reactFlowInstance.current.fitView({
                padding: 0.2, // More padding for single node
                includeHiddenNodes: false,
                duration: 600,
                minZoom: 0.5,
                maxZoom: 1.5
              });
            }
          }, 200);
        }
      }, 1000); // Increased delay to ensure node is fully added
    } catch (error) {
      console.error('Error in handleAddNode:', error);
      toast({
        title: "Error",
        description: "Failed to add node",
        variant: "destructive"
      });
    } finally {
      // Reset the flag with short delay to prevent race conditions
      setTimeout(() => {
        updateHandlingRef.current = false;
        console.log('Reset update handling flag');
      }, 300);
    }
  }, [reactFlowWrapper, setNodes, setEdges, updateHandlingRef, nodes.length, reactFlowInstance, nodesRef, edgesRef, strategyStore]);
};
