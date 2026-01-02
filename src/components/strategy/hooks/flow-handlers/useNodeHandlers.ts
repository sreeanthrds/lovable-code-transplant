
import { useCallback, useRef, useEffect } from 'react';
import { Node } from '@xyflow/react';
import { toast } from "@/hooks/use-toast";
import { 
  createNodeClickHandler, 
  createAddNodeHandler,
  createUpdateNodeDataHandler,
  createDeleteNodeHandler
} from '../../utils/handlers';
import { v4 as uuidv4 } from 'uuid';

interface UseNodeHandlersProps {
  nodes: Node[];
  edges: any[];
  reactFlowInstance: any;
  reactFlowWrapper: React.RefObject<HTMLDivElement>;
  setSelectedNode: (node: Node | null) => void;
  setIsPanelOpen: (isOpen: boolean) => void;
  setNodes: (nodes: Node[] | ((nds: Node[]) => Node[])) => void;
  setEdges: (edges: any[] | ((eds: any[]) => any[])) => void;
  strategyStore: any;
  updateHandlingRef: React.MutableRefObject<boolean>;
}

// Add interface for the exit node data with reEntryConfig
interface ExitNodeReEntryConfig {
  enabled?: boolean;
  groupNumber?: number;
  maxReEntries?: number;
}

interface ExitNodeData {
  exitNodeData?: {
    reEntryConfig?: ExitNodeReEntryConfig;
  };
}

export const useNodeHandlers = ({
  nodes,
  edges,
  reactFlowInstance,
  reactFlowWrapper,
  setSelectedNode,
  setIsPanelOpen,
  setNodes,
  setEdges,
  strategyStore,
  updateHandlingRef
}: UseNodeHandlersProps) => {
  // Create stable refs to latest values
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  const storeRef = useRef(strategyStore);
  const instanceRef = useRef(reactFlowInstance);
  
  // Update refs when dependencies change
  useEffect(() => {
    nodesRef.current = nodes;
    edgesRef.current = edges;
    storeRef.current = strategyStore;
    instanceRef.current = reactFlowInstance;
  }, [nodes, edges, strategyStore, reactFlowInstance]);

  // Create stable handler for node click
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setIsPanelOpen(true);
  }, [setSelectedNode, setIsPanelOpen]);

  // Create stable handler for adding nodes
  const handleAddNode = useCallback((type: string, parentNodeId?: string) => {
    // Skip if update is already in progress, but don't cancel first-time additions
    if (updateHandlingRef.current && nodes.length > 1) {
      console.log('Skipping add node due to ongoing update');
      return;
    }
    
    // Set the flag but also ensure it gets reset even if errors occur
    updateHandlingRef.current = true;
    
    try {
      // Ensure reactFlowInstance is available
      if (!instanceRef.current || !reactFlowWrapper.current) {
        console.error('React Flow instance or wrapper not available');
        updateHandlingRef.current = false;
        return;
      }
      
      const addNodeHandler = createAddNodeHandler(
        instanceRef.current,
        reactFlowWrapper,
        nodesRef.current,
        edgesRef.current,
        setNodes,
        setEdges,
        storeRef.current
      );
      
      // Add the node 
      addNodeHandler(type, parentNodeId);
      
      // Force immediate update to store without delay - CRITICAL FOR FIRST NODE ADDITION
      console.log('Forcing immediate update after adding node');
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
  }, [reactFlowWrapper, setNodes, setEdges, updateHandlingRef, nodes.length]);

  // Create stable handler for updating node data
  const updateNodeData = useCallback((id: string, data: any) => {
    // Prevent recursive update loops
    if (updateHandlingRef.current) return;
    updateHandlingRef.current = true;
    
    setTimeout(() => {
      try {
        const handler = createUpdateNodeDataHandler(
          nodesRef.current,
          setNodes,
          storeRef.current
        );
        
        // Special handling for exit nodes with re-entry toggle
        if (
          data?.exitNodeData &&
          data.exitNodeData?.reEntryConfig
        ) {
          const node = nodesRef.current.find(n => n.id === id);
          
          if (node) {
            // Use type assertion to safely access exitNodeData
            const nodeDataTyped = node.data as ExitNodeData;
            const oldConfig = nodeDataTyped?.exitNodeData?.reEntryConfig;
            const newConfig = data.exitNodeData.reEntryConfig as ExitNodeReEntryConfig;
            
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
                      groupNumber: (newConfig as ExitNodeReEntryConfig).groupNumber || 1,
                      maxReEntries: (newConfig as ExitNodeReEntryConfig).maxReEntries || 1
                    }
                  }
                };
                
                // Create regular edge from exit node to retry node (remove fixed-length)
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
                
                // Find any entry node to connect with animated dashed edge
                const entryNodes = nodesRef.current.filter(n => n.type === 'entryNode');
                let dashEdge = null;
                
                if (entryNodes.length > 0) {
                  // Connect to the first entry node with a dashed animated edge
                  const targetEntryNode = entryNodes[0];
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
                
                // Update store
                setTimeout(() => {
                  const updatedNodes = [...nodesRef.current, retryNode];
                  let updatedEdges = [...edgesRef.current, connectingEdge];
                  if (dashEdge) {
                    updatedEdges.push(dashEdge);
                  }
                  
                  storeRef.current.setNodes(updatedNodes);
                  storeRef.current.setEdges(updatedEdges);
                  storeRef.current.addHistoryItem(updatedNodes, updatedEdges);
                }, 100);
                
                return;
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
  }, [setNodes, setEdges, updateHandlingRef]);
  
  // Create stable handler for deleting nodes
  const handleDeleteNode = useCallback((id: string) => {
    if (updateHandlingRef.current) return;
    updateHandlingRef.current = true;
    
    try {
      const handler = createDeleteNodeHandler(
        nodesRef.current,
        edgesRef.current,
        setNodes,
        setEdges,
        storeRef.current
      );
      handler(id);
    } finally {
      setTimeout(() => {
        updateHandlingRef.current = false;
      }, 100);
    }
  }, [setNodes, setEdges, updateHandlingRef]);

  return {
    onNodeClick,
    handleAddNode,
    updateNodeData,
    handleDeleteNode
  };
};
