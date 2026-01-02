
import { useState, useCallback, useRef, useMemo } from 'react';
import { Node, useNodesState } from '@xyflow/react';
import { deepEqual } from '../../utils/deepEqual';

/**
 * Hook to manage basic node state (nodes, selected node, drag state)
 */
export function useNodeBasicState(initialNodes: Node[]) {
  const [nodes, setLocalNodes, onNodesChange] = useNodesState(initialNodes);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const isDraggingRef = useRef(false);
  
  // Memoized selected node update to prevent recreation
  const updateSelectedNodeRef = useCallback((currentNodes: Node[], currentSelectedNode: Node | null) => {
    if (!currentSelectedNode) return null;
    
    const updatedSelectedNode = currentNodes.find(node => node.id === currentSelectedNode.id);
    if (updatedSelectedNode && !deepEqual(updatedSelectedNode, currentSelectedNode)) {
      return updatedSelectedNode;
    } else if (!updatedSelectedNode) {
      return null;
    }
    return currentSelectedNode;
  }, []);

  // Create a stable set selected node function that doesn't change on re-renders
  const stableSetSelectedNode = useCallback((node: Node | null) => {
    setSelectedNode(node);
  }, []);

  // Return stable objects to prevent unnecessary re-renders
  return useMemo(() => ({
    nodes,
    setLocalNodes,
    onNodesChange,
    selectedNode,
    setSelectedNode: stableSetSelectedNode,
    updateSelectedNodeRef,
    isDraggingRef
  }), [nodes, setLocalNodes, onNodesChange, selectedNode, stableSetSelectedNode, updateSelectedNodeRef]);
}
