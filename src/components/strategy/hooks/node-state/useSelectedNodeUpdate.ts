
import { useEffect, useCallback } from 'react';
import { Node } from '@xyflow/react';
import { deepEqual } from '../../utils/deepEqual';

/**
 * Hook to update the selected node when nodes change
 */
export function useSelectedNodeUpdate(nodes: Node[], selectedNode: Node | null, setSelectedNode: (node: Node | null) => void) {
  // Memoize the node update function to prevent unnecessary recreations
  const updateSelectedNode = useCallback((currentNode: Node | null, allNodes: Node[]) => {
    if (!currentNode) return null;
    
    const updatedNode = allNodes.find(node => node.id === currentNode.id);
    
    if (updatedNode && !deepEqual(updatedNode, currentNode)) {
      return updatedNode;
    } else if (!updatedNode) {
      // Clear selected node if it's been removed
      return null;
    }
    
    return currentNode;
  }, []);
  
  // Update selectedNode when nodes change (if it's among them)
  useEffect(() => {
    if (selectedNode) {
      const updatedSelectedNode = updateSelectedNode(selectedNode, nodes);
      if (updatedSelectedNode !== selectedNode) {
        setSelectedNode(updatedSelectedNode);
      }
    }
  }, [nodes, selectedNode, setSelectedNode, updateSelectedNode]);
}
