
import { Node, Edge } from '@xyflow/react';
import { toast } from "@/hooks/use-toast";

/**
 * Validates relationships between nodes based on their types
 */
export const validateNodeRelationships = (
  sourceNode: Node | undefined,
  targetNode: Node | undefined,
  edges: Edge[]
): boolean => {
  if (!sourceNode || !targetNode) {
    toast({
      title: "Invalid connection",
      description: "Source or target node not found",
      variant: "destructive"
    });
    return false;
  }

  // Rule: End nodes cannot have outgoing connections
  if (sourceNode?.type === 'endNode' || sourceNode?.type === 'forceEndNode') {
    toast({
      title: "Invalid connection",
      description: "End nodes cannot have outgoing connections",
      variant: "destructive"
    });
    return false;
  }
  
  // Rule: Start nodes cannot have incoming connections
  if (targetNode?.type === 'startNode') {
    toast({
      title: "Invalid connection",
      description: "Start nodes cannot have incoming connections",
      variant: "destructive"
    });
    return false;
  }
  
  // Rule: Order nodes (entry, exit) shouldn't directly link to each other, except for retry nodes
  const isOrderNode = (nodeType: string | undefined): boolean => 
    nodeType === 'entryNode' || nodeType === 'exitNode';
    
  const isRetryNode = (nodeType: string | undefined): boolean => 
    nodeType === 'retryNode';
    
  if (isOrderNode(sourceNode?.type) && 
      isOrderNode(targetNode?.type) && 
      !isRetryNode(targetNode?.type) && 
      !isRetryNode(sourceNode?.type)) {
    toast({
      title: "Invalid connection",
      description: "Order nodes cannot directly link to each other",
      variant: "destructive"
    });
    return false;
  }
  
  // Special case: Allow exit nodes to connect to retry nodes
  if (sourceNode?.type === 'exitNode' && targetNode?.type === 'retryNode') {
    // This connection is allowed
    return true;
  }
  
  // Special case: Allow retry nodes to connect to entry nodes
  if (sourceNode?.type === 'retryNode' && targetNode?.type === 'entryNode') {
    // This connection is allowed
    return true;
  }
  
  return true;
}

/**
 * Helper to check if a node is a signal-type node
 */
const isSignalNode = (nodeType: string | undefined): boolean => {
  return nodeType === 'signalNode' || 
         nodeType === 'entrySignalNode' || 
         nodeType === 'exitSignalNode' ||
         nodeType === 'conditionNode';
};

/**
 * Validates the entry node connections
 */
export const validateEntryNodeConnections = (
  sourceNode: Node | undefined,
  targetNode: Node | undefined,
  edges: Edge[]
): boolean => {
  if (!sourceNode || !targetNode) return false;
  
  // Rule: Entry nodes should only receive connections from Signal, Start, or Retry nodes
  if (targetNode.type === 'entryNode' && 
      !isSignalNode(sourceNode.type) && 
      sourceNode.type !== 'startNode' &&
      sourceNode.type !== 'retryNode') {
    toast({
      title: "Invalid connection",
      description: "Entry nodes can only receive connections from Signal, Start, or Retry nodes",
      variant: "destructive"
    });
    return false;
  }
  
  // Rule: Order nodes should be triggered by only one signal
  // Check if target node is an order node and already has an incoming signal connection
  if ((targetNode?.type === 'entryNode' || targetNode?.type === 'exitNode')) {
    const existingSignalConnections = edges.filter(edge => {
      const existingSource = sourceNode; // We already have the source node
      return edge.target === targetNode.id && 
             (isSignalNode(existingSource?.type) || existingSource?.type === 'startNode');
    });
    
    if (existingSignalConnections.length > 0 && 
        (isSignalNode(sourceNode?.type) || sourceNode?.type === 'startNode')) {
      toast({
        title: "Invalid connection",
        description: "An order node can only be triggered by one signal",
        variant: "destructive"
      });
      return false;
    }
  }
  
  return true;
}

/**
 * Validates that nodes won't be orphaned and prevents multiple start nodes
 */
export const validateNodeOrphaning = (
  nodes: any[],
  edges: any[],
  nodeToDelete?: string
): boolean => {
  // Check for multiple start nodes
  const startNodes = nodes.filter(node => node.type === 'startNode');
  if (startNodes.length > 1) {
    toast({
      title: "Invalid strategy",
      description: "Only one start node is allowed per strategy",
      variant: "destructive"
    });
    return false;
  }
  
  // If deleting a node, check if it would orphan other nodes
  if (nodeToDelete) {
    const remainingNodes = nodes.filter(node => node.id !== nodeToDelete);
    const remainingEdges = edges.filter(edge => 
      edge.source !== nodeToDelete && edge.target !== nodeToDelete
    );
    
    // Check if any node (except start) would become orphaned
    for (const node of remainingNodes) {
      if (node.type === 'startNode') continue;
      
      const hasIncomingConnection = remainingEdges.some(edge => edge.target === node.id);
      if (!hasIncomingConnection) {
        toast({
          title: "Cannot delete node",
          description: "This would leave other nodes orphaned. Every node except start must have a parent.",
          variant: "destructive"
        });
        return false;
      }
    }
  }
  
  return true;
}
