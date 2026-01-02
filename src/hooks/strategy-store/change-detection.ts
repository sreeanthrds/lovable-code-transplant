
import { Node, Edge } from '@xyflow/react';

/**
 * Checks if two node arrays have the same node IDs
 */
export function haveSameNodeIds(oldNodes: Node[], newNodes: Node[]): boolean {
  if (oldNodes.length !== newNodes.length) return false;
  
  const oldIds = new Set(oldNodes.map(n => n.id));
  const newIds = new Set(newNodes.map(n => n.id));
  
  if (oldIds.size !== newIds.size) return false;
  
  for (const id of oldIds) {
    if (!newIds.has(id)) return false;
  }
  
  return true;
}

/**
 * Checks if two edge arrays have the same edge IDs
 */
export function haveSameEdgeIds(oldEdges: Edge[], newEdges: Edge[]): boolean {
  if (oldEdges.length !== newEdges.length) return false;
  
  const oldIds = new Set(oldEdges.map(e => e.id));
  const newIds = new Set(newEdges.map(e => e.id));
  
  if (oldIds.size !== newIds.size) return false;
  
  for (const id of oldIds) {
    if (!newIds.has(id)) return false;
  }
  
  return true;
}

/**
 * Checks if the z-index has changed between two nodes
 */
export function hasZIndexChanged(oldNode: Node, newNode: Node): boolean {
  const oldZIndex = oldNode.style?.zIndex ? parseInt(oldNode.style.zIndex.toString()) : 0;
  const newZIndex = newNode.style?.zIndex ? parseInt(newNode.style.zIndex.toString()) : 0;
  
  return oldZIndex !== newZIndex;
}

/**
 * Checks if node position has changed significantly (more than 1px)
 */
export function hasPositionChangedSignificantly(oldNode: Node, newNode: Node): boolean {
  // Skip nodes without position data
  if (!oldNode.position || !newNode.position) return false;
  
  // Check if position changed by more than 1px (to avoid floating point issues)
  const xDiff = Math.abs((oldNode.position.x || 0) - (newNode.position.x || 0));
  const yDiff = Math.abs((oldNode.position.y || 0) - (newNode.position.y || 0));
  
  return xDiff > 1 || yDiff > 1 || 
         oldNode.dragging !== newNode.dragging;
}

/**
 * Checks if node data has changed in a meaningful way
 */
export function hasNodeDataChanged(oldNode: Node, newNode: Node): boolean {
  // Skip if no data on either node
  if (!oldNode.data && !newNode.data) return false;
  
  // If one has data and the other doesn't
  if ((!oldNode.data && newNode.data) || (oldNode.data && !newNode.data)) return true;
  
  // Safely access data properties
  const oldData = oldNode.data || {};
  const newData = newNode.data || {};
  
  // Quick _lastUpdated timestamp check (used by our system to mark explicit updates)
  if (oldData._lastUpdated !== newData._lastUpdated) return true;
  
  // Check only critical data fields that affect rendering
  // This is intentionally simplified to avoid deep comparison performance issues
  const criticalFields = ['label', 'actionType', 'positions', 'symbol'];
  
  for (const field of criticalFields) {
    if (JSON.stringify(oldData[field]) !== JSON.stringify(newData[field])) {
      return true;
    }
  }
  
  return false;
}

/**
 * Checks if any edge has changed in a meaningful way
 */
export function hasEdgeChanged(oldEdges: Edge[], newEdges: Edge[]): boolean {
  // Map for quick lookups by id
  const oldEdgesMap = new Map(oldEdges.map(edge => [edge.id, edge]));
  
  // Check for any edge changes
  return newEdges.some(newEdge => {
    const oldEdge = oldEdgesMap.get(newEdge.id);
    if (!oldEdge) return true; // Edge didn't exist before
    
    return oldEdge.source !== newEdge.source || 
           oldEdge.target !== newEdge.target ||
           oldEdge.selected !== newEdge.selected;
  });
}
