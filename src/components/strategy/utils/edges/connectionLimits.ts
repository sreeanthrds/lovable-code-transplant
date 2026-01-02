
import { toast } from "@/hooks/use-toast";
import { Edge } from '@xyflow/react';

/**
 * Validates if a node has reached its maximum number of outgoing connections
 */
export const validateConnectionLimits = (
  sourceId: string, 
  edges: Edge[]
): boolean => {
  // Limit the number of outgoing connections from a node for visual clarity
  const outgoingConnections = edges.filter(edge => edge.source === sourceId);
  if (outgoingConnections.length >= 10) { // Adjust this number based on UI considerations
    toast({
      title: "Too many connections",
      description: "A node cannot have more than 10 outgoing connections",
      variant: "default"
    });
    // This is just a warning, not blocking the connection
  }
  
  return true;
}
