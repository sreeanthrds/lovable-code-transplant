
import { Node, Edge, Connection } from '@xyflow/react';
import { toast } from "@/hooks/use-toast";
import { isConnectionExisting, wouldCreateCycle } from './connectionUtils';
import { validateNodeRelationships, validateEntryNodeConnections } from './nodeTypeRules';
import { validateConnectionLimits } from './connectionLimits';

/**
 * Main validation function for connections between nodes
 */
export const validateConnection = (
  connection: Connection, 
  nodes: Node[],
  edges: Edge[] = []
): boolean => {
  const sourceNode = nodes.find(node => node.id === connection.source);
  const targetNode = nodes.find(node => node.id === connection.target);
  
  // ==== 1. Node Relationships & Linking Restrictions ====
  if (!validateNodeRelationships(sourceNode, targetNode, edges)) {
    return false;
  }
  
  // ==== 2. Circular Dependency Prevention ====
  
  // Prevent self-connections
  if (sourceNode?.id === targetNode?.id) {
    toast({
      title: "Invalid connection",
      description: "Cannot connect a node to itself",
      variant: "destructive"
    });
    return false;
  }
  
  // Check for existing connections between these nodes
  if (sourceNode && targetNode) {
    const existingConnection = isConnectionExisting(sourceNode.id, targetNode.id, edges);
    if (existingConnection) {
      toast({
        title: "Connection exists",
        description: "These nodes are already connected",
        variant: "destructive"
      });
      return false;
    }
  
    // Check for circular dependencies
    if (wouldCreateCycle(sourceNode.id, targetNode.id, edges)) {
      toast({
        title: "Invalid connection",
        description: "This would create a circular flow",
        variant: "destructive"
      });
      return false;
    }
  }
  
  // ==== 3. Node Type-Specific Rules ====
  if (!validateEntryNodeConnections(sourceNode, targetNode, edges)) {
    return false;
  }
  
  // ==== 4. Preventing Too Many Connections ====
  if (sourceNode) {
    validateConnectionLimits(sourceNode.id, edges);
  }
  
  return true;
};
