import { useCallback, useEffect } from 'react';
import { Node, Edge, useReactFlow } from '@xyflow/react';

export interface KeyboardShortcutHandlers {
  onClone: (selectedNodes: Node[]) => void;
  onDeleteSelected: () => void;
  onSelectAll: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onCopy: (selectedNodes: Node[]) => void;
  onPaste: () => void;
}

/**
 * Pro keyboard shortcuts hook with advanced functionality
 */
export function useProKeyboardShortcuts(handlers: KeyboardShortcutHandlers) {
  const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const isCtrlOrCmd = event.ctrlKey || event.metaKey;
    const selectedNodes = getNodes().filter(node => node.selected);
    
    // Check if the user is typing in an input field
    const target = event.target as HTMLElement;
    const isInInputField = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.contentEditable === 'true';

    // Prevent default browser shortcuts when appropriate (but not in input fields)
    if (!isInInputField && isCtrlOrCmd && ['d', 'a', 'z', 'y', 'c', 'v'].includes(event.key.toLowerCase())) {
      event.preventDefault();
    }

    switch (event.key.toLowerCase()) {
      case 'd':
        if (isCtrlOrCmd && selectedNodes.length > 0) {
          handlers.onClone(selectedNodes);
        }
        break;
      
      case 'delete':
      case 'backspace':
        // Only prevent default if NOT in an input field - allow normal editing in inputs
        if (!isInInputField) {
          event.preventDefault();
        }
        break;
      
      case 'a':
        if (isCtrlOrCmd) {
          handlers.onSelectAll();
        }
        break;
      
      case 'z':
        if (isCtrlOrCmd && !event.shiftKey) {
          handlers.onUndo();
        } else if (isCtrlOrCmd && event.shiftKey) {
          handlers.onRedo();
        }
        break;
      
      case 'y':
        if (isCtrlOrCmd) {
          handlers.onRedo();
        }
        break;
      
      case 'c':
        if (isCtrlOrCmd && selectedNodes.length > 0) {
          handlers.onCopy(selectedNodes);
        }
        break;
      
      case 'v':
        if (isCtrlOrCmd) {
          handlers.onPaste();
        }
        break;
      
      case 'escape':
        // Deselect all nodes
        setNodes(nodes => nodes.map(node => ({ ...node, selected: false })));
        break;
    }
  }, [getNodes, setNodes, handlers]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Import the consistent function from nodeFactory
import { generateIncrementalNodeId, regenerateAllUniqueIds } from '../nodes/nodeFactory';

/**
 * Generate incremental edge ID based on existing edges
 */
function generateIncrementalEdgeId(edges: Edge[]): string {
  const existingNumbers = edges
    .map(edge => {
      const match = edge.id.match(/^e(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(num => !isNaN(num));
  
  const highestNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
  const nextNumber = highestNumber + 1;
  
  return `e${nextNumber}`;
}

/**
 * Advanced cloning utility with smart positioning and incremental IDs
 */
export function cloneNodes(
  nodes: Node[],
  edges: Edge[],
  selectedNodes: Node[]
): { newNodes: Node[]; newEdges: Edge[] } {
  console.log('🎯 cloneNodes called with', selectedNodes.length, 'selected nodes');
  
  if (selectedNodes.length === 0) {
    console.log('❌ No nodes selected for cloning');
    return { newNodes: nodes, newEdges: edges };
  }

  // Filter out start nodes from cloning
  const cloneableNodes = selectedNodes.filter(node => node.type !== 'start');
  console.log('📋 Cloneable nodes (excluding start):', cloneableNodes.length, 'types:', cloneableNodes.map(n => n.type));
  
  if (cloneableNodes.length === 0) {
    console.log('❌ No cloneable nodes after filtering');
    return { newNodes: nodes, newEdges: edges };
  }

  const nodeIdMap = new Map<string, string>();
  const CLONE_OFFSET = 50;

  // Create new nodes with incremental IDs and positions
  const clonedNodes = cloneableNodes.map(node => {
    const newId = generateIncrementalNodeId([...nodes, ...cloneableNodes], node.type || 'default');
    nodeIdMap.set(node.id, newId);
    
    // Regenerate ALL unique IDs in the node data (positions, conditions, indicators, VPIs)
    const updatedData = regenerateAllUniqueIds(node.data, newId);
    
    return {
      ...node,
      id: newId,
      data: updatedData,
      position: {
        x: 0, // Reset to origin to avoid overlapping with existing nodes
        y: 0,
      },
      selected: true, // Select the new nodes
    };
  });

  // Deselect original nodes
  const updatedNodes = nodes.map(node => 
    cloneableNodes.some(selected => selected.id === node.id)
      ? { ...node, selected: false }
      : node
  );

  // Clone internal edges (edges between cloneable nodes only)
  const cloneableNodeIds = new Set(cloneableNodes.map(n => n.id));
  const internalEdges = edges.filter(edge => 
    cloneableNodeIds.has(edge.source) && cloneableNodeIds.has(edge.target)
  );

  const clonedEdges = internalEdges.map(edge => ({
    ...edge,
    id: generateIncrementalEdgeId([...edges, ...internalEdges]),
    source: nodeIdMap.get(edge.source) || edge.source,
    target: nodeIdMap.get(edge.target) || edge.target,
  }));

  console.log('✨ Clone complete. New node positions:', clonedNodes.map(n => ({ id: n.id, x: n.position.x, y: n.position.y })));
  
  return {
    newNodes: [...updatedNodes, ...clonedNodes],
    newEdges: [...edges, ...clonedEdges],
  };
}

/**
 * Advanced copy/paste functionality with clipboard
 */
export class NodeClipboard {
  private static instance: NodeClipboard;
  private clipboardData: { nodes: Node[]; edges: Edge[] } | null = null;

  static getInstance(): NodeClipboard {
    if (!NodeClipboard.instance) {
      NodeClipboard.instance = new NodeClipboard();
    }
    return NodeClipboard.instance;
  }

  copy(nodes: Node[], edges: Edge[], selectedNodes: Node[]): void {
    // Filter out start nodes from copying
    const copyableNodes = selectedNodes.filter(node => node.type !== 'start');
    const copyableNodeIds = new Set(copyableNodes.map(n => n.id));
    const internalEdges = edges.filter(edge => 
      copyableNodeIds.has(edge.source) && copyableNodeIds.has(edge.target)
    );

    this.clipboardData = {
      nodes: copyableNodes,
      edges: internalEdges,
    };

    console.log('Copied to clipboard:', copyableNodes.length, 'nodes');
  }

  paste(currentNodes: Node[], currentEdges: Edge[]): { newNodes: Node[]; newEdges: Edge[] } {
    if (!this.clipboardData) {
      return { newNodes: currentNodes, newEdges: currentEdges };
    }

    const { newNodes, newEdges } = cloneNodes(
      currentNodes,
      currentEdges,
      this.clipboardData.nodes
    );

    console.log('Pasted from clipboard:', this.clipboardData.nodes.length, 'nodes');
    return { newNodes, newEdges };
  }

  hasData(): boolean {
    return this.clipboardData !== null;
  }
}