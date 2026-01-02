
import { Node, Edge } from '@xyflow/react';
import { 
  haveSameNodeIds, 
  hasZIndexChanged,
  hasPositionChangedSignificantly,
  hasNodeDataChanged,
  haveSameEdgeIds,
  hasEdgeChanged
} from './change-detection';
import { SetState, GetState } from './types';

/**
 * Enhanced setNodes function with optimization to avoid unnecessary updates
 */
export function createSetNodesFunction(set: SetState, get: GetState) {
  return (nodes: Node[]) => {
    // Skip invalid nodes
    if (!nodes || !Array.isArray(nodes)) {
      console.warn('Invalid nodes provided to setNodes:', nodes);
      return;
    }
    
    // For stability, only update if there's a meaningful change
    const currentNodes = get().nodes;
    
    // Simple length check as first line of defense
    if (currentNodes.length !== nodes.length) {
      set({ nodes });
      return;
    }
    
    // Quick map for node lookup by id
    const currentNodesMap = new Map(currentNodes.map(node => [node.id, node]));
    
    // Check if node IDs have changed
    if (!haveSameNodeIds(currentNodes, nodes)) {
      set({ nodes });
      return;
    }
    
    // Check for meaningful position, selection, or z-index changes
    for (const node of nodes) {
      const currentNode = currentNodesMap.get(node.id);
      if (!currentNode) continue;
      
      // Check selection state - ensure both nodes have the selected property
      const nodeSelected = 'selected' in node ? node.selected : false;
      const currentNodeSelected = 'selected' in currentNode ? currentNode.selected : false;
      if (nodeSelected !== currentNodeSelected) {
        set({ nodes });
        return;
      }
      
      // Check z-index changes
      if (hasZIndexChanged(currentNode, node)) {
        set({ nodes });
        return;
      }
      
      // Check position for nodes that have positions
      if (hasPositionChangedSignificantly(currentNode, node)) {
        set({ nodes });
        return;
      }
      
      // Check data changes (simplified deep comparison)
      if (hasNodeDataChanged(currentNode, node)) {
        set({ nodes });
        return;
      }
    }
    
    // If we get here, no meaningful changes were detected
    // console.log('Skipping node update - no meaningful changes');
  };
}

/**
 * Enhanced setEdges function with optimization to avoid unnecessary updates
 */
export function createSetEdgesFunction(set: SetState, get: GetState) {
  return (edges: Edge[]) => {
    // Skip invalid edges
    if (!edges || !Array.isArray(edges)) {
      console.warn('Invalid edges provided to setEdges:', edges);
      return;
    }
    
    // Only update if there's a meaningful change
    const currentEdges = get().edges;
    
    // Length check first
    if (currentEdges.length !== edges.length) {
      set({ edges });
      return;
    }
    
    // Check if edge IDs have changed
    if (!haveSameEdgeIds(currentEdges, edges)) {
      set({ edges });
      return;
    }
    
    // Check for meaningful changes in edge properties
    if (hasEdgeChanged(currentEdges, edges)) {
      set({ edges });
    }
  };
}
