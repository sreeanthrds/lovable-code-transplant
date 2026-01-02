
import { Edge } from '@xyflow/react';

/**
 * Checks if a connection already exists between two nodes
 */
export const isConnectionExisting = (sourceId: string, targetId: string, edges: Edge[]): boolean => {
  return edges.some(edge => edge.source === sourceId && edge.target === targetId);
};

/**
 * Simple cycle detection algorithm to prevent circular flows
 */
export const wouldCreateCycle = (sourceId: string, targetId: string, edges: Edge[]): boolean => {
  // If we're connecting to a node that's upstream of us, we have a cycle
  if (sourceId === targetId) return true;
  
  // Check if target leads back to source
  const visited = new Set<string>();
  
  const checkPathExists = (currentId: string, endId: string): boolean => {
    if (currentId === endId) return true;
    if (visited.has(currentId)) return false;
    
    visited.add(currentId);
    
    // Find all outgoing edges from current node
    const outgoingEdges = edges.filter(e => e.source === currentId);
    
    // Check if any of the target nodes lead to our end node
    for (const edge of outgoingEdges) {
      if (checkPathExists(edge.target, endId)) {
        return true;
      }
    }
    
    return false;
  };
  
  return checkPathExists(targetId, sourceId);
};
