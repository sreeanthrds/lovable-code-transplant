import { Node, Edge } from '@xyflow/react';
import { toast } from "@/hooks/use-toast";
import { NodeFactory } from '../nodes/nodeFactory';
import { createEdgeBetweenNodes } from '../edges';
import { handleError } from '../errorHandling';
import { getNodeTypePrefix } from '../nodes/types/nodeTypes';

type NodeMouseHandler = (event: React.MouseEvent, node: Node) => void;
type ReactFlowInstance = any;

export const createNodeClickHandler = (
  setSelectedNode: (node: Node | null) => void,
  setIsPanelOpen: (isOpen: boolean) => void
): NodeMouseHandler => {
  return (_, node: Node) => {
    setSelectedNode(node);
    setIsPanelOpen(true);
  };
};

export const createAddNodeHandler = (
  reactFlowInstance: ReactFlowInstance,
  reactFlowWrapper: React.RefObject<HTMLDivElement>,
  nodes: Node[],
  edges: Edge[],
  setNodes: (nodes: Node[]) => void,
  setEdges: (edges: Edge[]) => void,
  strategyStore: any
) => {
  return (type: string, positionOrParentId: { x: number, y: number } | string) => {
    if (!reactFlowInstance || !reactFlowWrapper.current) {
      console.error('React Flow instance or wrapper not available');
      return;
    }
    
    try {
      let newNode;
      let parentNode;
      let position;
      
      // Check if positionOrParentId is a position object or a parent node ID
      if (typeof positionOrParentId === 'object' && 'x' in positionOrParentId && 'y' in positionOrParentId) {
        // It's a position object
        position = positionOrParentId;
        
        // Convert screen coordinates to flow coordinates
        const flowPosition = reactFlowInstance.screenToFlowPosition(position);
        
        // Use NodeFactory to create node with incremental ID
        const result = NodeFactory.createNode(type, reactFlowInstance, nodes);
        newNode = {
          ...result.node,
          position: flowPosition
        };
      } else {
        // It's a parent node ID
        const parentNodeId = positionOrParentId as string;
        
        // Create a new node using NodeFactory
        const result = NodeFactory.createNode(
          type,
          reactFlowInstance,
          nodes,
          parentNodeId
        );
        
        if (!result || !result.node) {
          console.error('Failed to create new node');
          return;
        }
        
        newNode = result.node;
        parentNode = result.parentNode;
      }
      
      if (!newNode) {
        console.error('Failed to create new node');
        return;
      }
      
      console.log('Before adding node:', nodes.length, 'existing nodes');
      
      const updatedNodes = [...nodes, newNode];
      
      let updatedEdges = [...edges];
      if (parentNode) {
        const newEdge = createEdgeBetweenNodes(parentNode, newNode);
        updatedEdges = [...edges, newEdge];
      }
      
      console.log('After adding node:', updatedNodes.length, 'total nodes');
      
      setNodes(updatedNodes);
      setEdges(updatedEdges);
      
      if (nodes.length <= 1) {
        console.log('First node addition - using immediate store update');
        strategyStore.setNodes(updatedNodes);
        strategyStore.setEdges(updatedEdges);
        strategyStore.addHistoryItem(updatedNodes, updatedEdges);
      } else {
        setTimeout(() => {
          try {
            strategyStore.setNodes(updatedNodes);
            strategyStore.setEdges(updatedEdges);
            strategyStore.addHistoryItem(updatedNodes, updatedEdges);
            console.log('Node added and persisted to store:', newNode.id);
          } catch (error) {
            console.error('Error updating strategy store:', error);
          }
        }, 0);
      }
      
      toast({
        title: "Node added",
        description: `Added ${type.replace('Node', '')} node`
      });
    } catch (error) {
      console.error('Error adding node:', error);
      toast({
        title: "Error",
        description: "Failed to add node",
        variant: "destructive"
      });
    }
  };
};

const createNewNode = (
  type: string, 
  reactFlowInstance: ReactFlowInstance, 
  reactFlowWrapper: React.RefObject<HTMLDivElement>,
  existingNodes: Node[]
): Node | null => {
  try {
    const rect = reactFlowWrapper.current?.getBoundingClientRect();
    const position = rect 
      ? reactFlowInstance.screenToFlowPosition({
          x: rect.width / 2,
          y: rect.height / 2
        })
      : { x: 100, y: 100 };
    
    // Generate incremental ID similar to other nodes
    const typePrefix = type.replace('Node', '').toLowerCase();
    const existingNodesOfType = existingNodes.filter(node => 
      node.id.startsWith(`${typePrefix}-`)
    );
    const existingNumbers = existingNodesOfType
      .map(node => {
        const match = node.id.match(/-(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(num => !isNaN(num));
    
    const highestNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    const nextNumber = highestNumber + 1;
    const id = `${typePrefix}-${nextNumber}`;
    
    return {
      id,
      type,
      position,
      data: { label: `${type} node` }
    };
  } catch (error) {
    console.error('Error creating new node:', error);
    return null;
  }
};

import { migrateNodeData } from '../positionDataMigration';

export const createUpdateNodeDataHandler = (
  nodes: Node[],
  setNodes: (nodes: Node[]) => void,
  strategyStore: any
) => {
  return (id: string, data: any) => {
    if (!nodes || !id || !data) {
      console.error('Invalid parameters for updateNodeData');
      return;
    }
    
    try {
      const updatedNodes = nodes.map((node) => {
        if (node.id === id) {
          let mergedData;
          if (data.positions && node.data && node.data.positions) {
            mergedData = { 
              ...node.data, 
              ...data,
              _lastUpdated: Date.now() 
            };
          } else {
            mergedData = { 
              ...node.data, 
              ...data,
              _lastUpdated: Date.now() 
            };
          }
          
          // Apply position data migration to clean up old position ID references
          mergedData = migrateNodeData(mergedData);
          
          if (node.type === 'startNode' && data.indicatorParameters) {
            mergedData.indicators = Object.keys(data.indicatorParameters);
          }
          
          return { ...node, data: mergedData };
        }
        return node;
      });
      
      setNodes(updatedNodes);
      strategyStore.setNodes(updatedNodes);
      strategyStore.addHistoryItem(updatedNodes, strategyStore.edges);
    } catch (error) {
      console.error('Error updating node data:', error);
    }
  };
};

export const createDeleteNodeHandler = (
  nodes: Node[],
  edges: Edge[],
  setNodes: (nodes: Node[]) => void,
  setEdges: (edges: Edge[]) => void,
  strategyStore: any
) => {
  return (nodeId: string) => {
    if (!nodes || !edges || !nodeId) {
      console.error('Invalid parameters for deleteNode');
      return;
    }
    
    try {
      const newNodes = nodes.filter(node => node.id !== nodeId);
      
      const newEdges = edges.filter(
        edge => edge.source !== nodeId && edge.target !== nodeId
      );
      
      setNodes(newNodes);
      setEdges(newEdges);
      strategyStore.setNodes(newNodes);
      strategyStore.setEdges(newEdges);
      strategyStore.addHistoryItem(newNodes, newEdges);
      
      toast({
        title: "Node deleted",
        description: "Node deleted"
      });
    } catch (error) {
      console.error('Error deleting node:', error);
      toast({
        title: "Error",
        description: "Failed to delete node",
        variant: "destructive"
      });
    }
  };
};
