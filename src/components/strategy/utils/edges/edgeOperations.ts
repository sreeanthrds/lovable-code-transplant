
// This file is now split into individual files
// See the edges directory for the refactored code

import { Node, Edge, Connection } from '@xyflow/react';
import { toast } from "@/hooks/use-toast";

/**
 * @deprecated This file is being refactored into smaller modules
 * Import from individual files in the edges directory instead
 */
export const createEdgeBetweenNodes = (
  sourceNode: Node,
  targetNode: Node,
  edgeType: string = 'bezier'
): Edge => {
  return {
    id: `e-${sourceNode.id}-${targetNode.id}`,
    source: sourceNode.id,
    target: targetNode.id,
    type: edgeType
  };
};

export const isConnectionExisting = (sourceId: string, targetId: string, edges: Edge[]): boolean => {
  return edges.some(edge => edge.source === sourceId && edge.target === targetId);
};

export const wouldCreateCycle = (sourceId: string, targetId: string, edges: Edge[]): boolean => {
  if (sourceId === targetId) return true;
  const visited = new Set<string>();
  
  const checkPathExists = (currentId: string, endId: string): boolean => {
    if (currentId === endId) return true;
    if (visited.has(currentId)) return false;
    
    visited.add(currentId);
    
    const outgoingEdges = edges.filter(e => e.source === currentId);
    
    for (const edge of outgoingEdges) {
      if (checkPathExists(edge.target, endId)) {
        return true;
      }
    }
    
    return false;
  };
  
  return checkPathExists(targetId, sourceId);
};

export const validateNodeRelationships = (
  sourceNode: Node | undefined,
  targetNode: Node | undefined,
  edges: Edge[]
): boolean => {
  // ... moved to nodeTypeRules.ts
  return true;
};

export const validateConnectionLimits = (
  sourceId: string, 
  edges: Edge[]
): boolean => {
  // ... moved to connectionLimits.ts
  return true;
};

export const validateEntryNodeConnections = (
  sourceNode: Node | undefined,
  targetNode: Node | undefined,
  edges: Edge[]
): boolean => {
  // ... moved to nodeTypeRules.ts
  return true;
};

export const validateConnection = (
  connection: Connection, 
  nodes: Node[],
  edges: Edge[] = []
): boolean => {
  // ... moved to edgeValidator.ts
  return true;
};
