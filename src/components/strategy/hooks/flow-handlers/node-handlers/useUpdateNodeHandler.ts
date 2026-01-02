
import { useCallback } from 'react';
import { createUpdateNodeDataHandler } from '../../../utils/handlers';
import { v4 as uuidv4 } from 'uuid';
import { Node } from '@xyflow/react';
import { UseUpdateNodeHandlerProps, ExitNodeData } from './types';

export const useUpdateNodeHandler = ({
  nodesRef,
  setNodes,
  strategyStore,
  updateHandlingRef,
  setEdges
}: UseUpdateNodeHandlerProps) => {
  // Create stable handler for updating node data
  return useCallback((id: string, data: any) => {
    // Prevent recursive update loops
    if (updateHandlingRef.current) return;
    updateHandlingRef.current = true;
    
    setTimeout(() => {
      try {
        const handler = createUpdateNodeDataHandler(
          nodesRef.current,
          setNodes,
          strategyStore.current
        );
        
        // Special handling for exit nodes with re-entry toggle
        if (
          data?.exitNodeData &&
          data.exitNodeData?.reEntryConfig !== undefined
        ) {
          const node = nodesRef.current.find(n => n.id === id);
          
          if (node) {
            // Use type assertion to safely access exitNodeData
            const nodeDataTyped = node.data as { exitNodeData?: { reEntryConfig?: { enabled?: boolean } } };
            const oldConfig = nodeDataTyped?.exitNodeData?.reEntryConfig;
            const newConfig = data.exitNodeData.reEntryConfig;
            
            // Type-safe comparison of enabled property
            const oldEnabled = oldConfig ? oldConfig.enabled : false;
            const newEnabled = newConfig ? newConfig.enabled : false;
            
            // If re-entry was toggled on, create a retry node
            if (oldEnabled === false && newEnabled === true) {
              console.log('Re-entry was enabled, creating retry node');
              
              // Get node position
              const exitNode = nodesRef.current.find(n => n.id === id);
              if (exitNode) {
                const exitNodePosition = exitNode.position;
                
                // Create a retry node floating to the left of the exit node
                const retryNodeId = `retry-${uuidv4().substring(0, 6)}`;
                const retryNode: Node = {
                  id: retryNodeId,
                  type: 'retryNode',
                  position: {
                    x: exitNodePosition.x - 150,  // Position to the left
                    y: exitNodePosition.y + 20    // Slightly below
                  },
                  data: {
                    label: 'Re-entry',
                    actionType: 'retry',
                    retryConfig: {
                      groupNumber: newConfig.groupNumber || 1,
                      maxReEntries: newConfig.maxReEntries || 1
                    }
                  }
                };
                
                // Create regular edge from exit node to retry node
                const connectingEdge = {
                  id: `e-${id}-${retryNodeId}`,
                  source: id,
                  target: retryNodeId,
                  style: { 
                    stroke: '#9b59b6', 
                    strokeWidth: 2 
                  },
                  sourceHandle: null,
                  targetHandle: null
                };
                
                // Find the correct entry node to connect based on VPI
                const entryNodes = nodesRef.current.filter(n => n.type === 'entryNode');
                let dashEdge = null;
                let targetEntryNode = null;
                
                // Get the VPI from the exit node's selected position
                const exitNodeData = node.data as any;
                const targetPositionId = exitNodeData?.exitNodeData?.orderConfig?.targetPositionId;
                
                if (targetPositionId && entryNodes.length > 0) {
                  // Find the position with the target ID to get its VPI
                  const allPositions = nodesRef.current.flatMap(n => {
                    const positions = n.data?.positions;
                    return Array.isArray(positions) ? positions : [];
                  });
                  const targetPosition = allPositions.find((p: any) => p?.id === targetPositionId);
                  
                  if (targetPosition && targetPosition.vpi) {
                    // Find the entry node that has a position with the same VPI
                    for (const entryNode of entryNodes) {
                      const entryPositions = entryNode.data?.positions;
                      if (Array.isArray(entryPositions)) {
                        const hasMatchingVpi = entryPositions.some((pos: any) => pos?.vpi === targetPosition.vpi);
                        if (hasMatchingVpi) {
                          targetEntryNode = entryNode;
                          break;
                        }
                      }
                    }
                  }
                }
                
                // Fallback to first entry node if no VPI match found
                if (!targetEntryNode && entryNodes.length > 0) {
                  targetEntryNode = entryNodes[0];
                  console.log('No VPI match found, connecting to first entry node as fallback');
                }
                
                if (targetEntryNode) {
                  dashEdge = {
                    id: `e-${retryNodeId}-${targetEntryNode.id}`,
                    source: retryNodeId,
                    target: targetEntryNode.id,
                    type: 'dashEdge',
                    animated: true,
                    style: { 
                      stroke: '#9b59b6', 
                      strokeWidth: 2
                    }
                  };
                }
                
                // Update node data first
                handler(id, data);
                
                // Then add the retry node and edges
                setNodes((prev: Node[]) => [...prev, retryNode]);
                
                // Add edges (both connecting and dashed if available)
                if (dashEdge) {
                  setEdges((prev: any[]) => [...prev, connectingEdge, dashEdge]);
                } else {
                  setEdges((prev: any[]) => [...prev, connectingEdge]);
                }
                
                // Store exit node's connection to retry node
                setNodes((prev: Node[]) => prev.map(node => {
                  if (node.id === id) {
                    return {
                      ...node,
                      data: {
                        ...node.data,
                        linkedRetryNodeId: retryNodeId
                      }
                    };
                  }
                  return node;
                }));
                
                // Update store
                setTimeout(() => {
                  const updatedNodes = [...nodesRef.current, retryNode];
                  let updatedEdges = [...strategyStore.current.edges, connectingEdge];
                  if (dashEdge) {
                    updatedEdges.push(dashEdge);
                  }
                  
                  strategyStore.current.setNodes(updatedNodes);
                  strategyStore.current.setEdges(updatedEdges);
                  strategyStore.current.addHistoryItem(updatedNodes, updatedEdges);
                }, 100);
                
                return;
              }
            }
            // If re-entry was toggled off, remove the retry node
            else if (oldEnabled === true && newEnabled === false) {
              console.log('Re-entry was disabled, removing retry node');
              
              // Find the retry node connected to this exit node
              const linkedRetryNodeId = node.data.linkedRetryNodeId;
              
              if (linkedRetryNodeId) {
                // Find all edges connected to the retry node
                const edgesToRemove = strategyStore.current.edges.filter(edge => 
                  edge.source === linkedRetryNodeId || edge.target === linkedRetryNodeId
                );
                
                // Get edge IDs to remove
                const edgeIdsToRemove = edgesToRemove.map(edge => edge.id);
                
                // First update the node data
                handler(id, {
                  ...data,
                  linkedRetryNodeId: undefined  // Clear the reference to retry node
                });
                
                // Remove the retry node
                setNodes((prev: Node[]) => prev.filter(n => n.id !== linkedRetryNodeId));
                
                // Remove related edges
                setEdges((prev: any[]) => prev.filter(e => !edgeIdsToRemove.includes(e.id)));
                
                // Update store
                setTimeout(() => {
                  const updatedNodes = nodesRef.current.filter(n => n.id !== linkedRetryNodeId);
                  const updatedEdges = strategyStore.current.edges.filter(e => !edgeIdsToRemove.includes(e.id));
                  
                  strategyStore.current.setNodes(updatedNodes);
                  strategyStore.current.setEdges(updatedEdges);
                  strategyStore.current.addHistoryItem(updatedNodes, updatedEdges);
                }, 100);
                
                return;
              }
            }
          }
        }
        
        // Handle exit node position changes for existing retry nodes
        const exitNodeForPositionChange = nodesRef.current.find(n => n.id === id);
        if (exitNodeForPositionChange?.type === 'exitNode' && data?.exitNodeData?.orderConfig?.targetPositionId) {
          const exitNode = nodesRef.current.find(n => n.id === id);
          const linkedRetryNodeId = exitNode?.data?.linkedRetryNodeId;
          
          if (linkedRetryNodeId) {
            console.log('Exit node position changed, updating retry node connection');
            
            // Find the retry node
            const retryNode = nodesRef.current.find(n => n.id === linkedRetryNodeId);
            if (retryNode) {
              // Find current dash edge from retry node
              const currentDashEdge = strategyStore.current.edges.find(edge => 
                edge.source === linkedRetryNodeId && edge.type === 'dashEdge'
              );
              
              // Find the correct entry node based on new position
              const entryNodes = nodesRef.current.filter(n => n.type === 'entryNode');
              const targetPositionId = data.exitNodeData.orderConfig.targetPositionId;
              
              if (targetPositionId && entryNodes.length > 0) {
                // Find the position with the target ID to get its VPI
                const allPositions = nodesRef.current.flatMap(n => {
                  const positions = n.data?.positions;
                  return Array.isArray(positions) ? positions : [];
                });
                const targetPosition = allPositions.find((p: any) => p?.id === targetPositionId);
                
                if (targetPosition && targetPosition.vpi) {
                  // Find the entry node that has a position with the same VPI
                  let targetEntryNode = null;
                  for (const entryNode of entryNodes) {
                    const entryPositions = entryNode.data?.positions;
                    if (Array.isArray(entryPositions)) {
                      const hasMatchingVpi = entryPositions.some((pos: any) => pos?.vpi === targetPosition.vpi);
                      if (hasMatchingVpi) {
                        targetEntryNode = entryNode;
                        break;
                      }
                    }
                  }
                  
                  // If we found a different target entry node, update the connection
                  if (targetEntryNode && (!currentDashEdge || currentDashEdge.target !== targetEntryNode.id)) {
                    console.log('Updating retry node connection to new entry node:', targetEntryNode.id);
                    
                    // Create new dash edge
                    const newDashEdge = {
                      id: `e-${linkedRetryNodeId}-${targetEntryNode.id}`,
                      source: linkedRetryNodeId,
                      target: targetEntryNode.id,
                      type: 'dashEdge',
                      animated: true,
                      style: { 
                        stroke: '#9b59b6', 
                        strokeWidth: 2
                      }
                    };
                    
                    // Update edges: remove old and add new in one operation
                    setEdges((prev: any[]) => {
                      const filtered = currentDashEdge ? prev.filter(e => e.id !== currentDashEdge.id) : prev;
                      return [...filtered, newDashEdge];
                    });
                    
                    // Update store
                    setTimeout(() => {
                      let updatedEdges = currentDashEdge 
                        ? strategyStore.current.edges.filter(e => e.id !== currentDashEdge.id) 
                        : strategyStore.current.edges;
                      updatedEdges.push(newDashEdge);
                      
                      strategyStore.current.setEdges(updatedEdges);
                      strategyStore.current.addHistoryItem(nodesRef.current, updatedEdges);
                    }, 100);
                  }
                }
              }
            }
          }
        }
        
        // Default update behavior
        handler(id, data);
      } finally {
        // Reset the flag after a short delay
        setTimeout(() => {
          updateHandlingRef.current = false;
        }, 100);
      }
    }, 0);
  }, [setNodes, setEdges, updateHandlingRef, nodesRef, strategyStore]);
};
