import { useCallback, useState } from 'react';
import { Node, useReactFlow } from '@xyflow/react';

export interface MultiSelectionState {
  selectedNodes: Node[];
  isMultiSelecting: boolean;
  selectionRect: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
}

/**
 * Pro multi-selection hook with advanced features
 */
export function useProMultiSelection() {
  const { getNodes, setNodes, screenToFlowPosition } = useReactFlow();
  const [selectionState, setSelectionState] = useState<MultiSelectionState>({
    selectedNodes: [],
    isMultiSelecting: false,
    selectionRect: null,
  });

  const selectAll = useCallback(() => {
    setNodes(nodes => nodes.map(node => ({ ...node, selected: true })));
  }, [setNodes]);

  const deselectAll = useCallback(() => {
    setNodes(nodes => nodes.map(node => ({ ...node, selected: false })));
  }, [setNodes]);

  const selectNodesByRect = useCallback((rect: { x: number; y: number; width: number; height: number }) => {
    const nodes = getNodes();
    const flowRect = {
      x: Math.min(rect.x, rect.x + rect.width),
      y: Math.min(rect.y, rect.y + rect.height),
      width: Math.abs(rect.width),
      height: Math.abs(rect.height),
    };

    setNodes(nodes.map(node => {
      const nodeCenter = {
        x: node.position.x + (node.width || node.measured?.width || 200) / 2,
        y: node.position.y + (node.height || node.measured?.height || 100) / 2,
      };

      const isInSelection = 
        nodeCenter.x >= flowRect.x &&
        nodeCenter.x <= flowRect.x + flowRect.width &&
        nodeCenter.y >= flowRect.y &&
        nodeCenter.y <= flowRect.y + flowRect.height;

      return {
        ...node,
        selected: isInSelection,
      };
    }));
  }, [getNodes, setNodes]);

  const toggleNodeSelection = useCallback((nodeId: string, addToSelection: boolean = false) => {
    setNodes(nodes => nodes.map(node => {
      if (node.id === nodeId) {
        return { ...node, selected: !node.selected };
      }
      if (!addToSelection) {
        return { ...node, selected: false };
      }
      return node;
    }));
  }, [setNodes]);

  const getSelectedNodes = useCallback(() => {
    return getNodes().filter(node => node.selected);
  }, [getNodes]);

  const selectNodesByType = useCallback((nodeType: string) => {
    setNodes(nodes => nodes.map(node => ({
      ...node,
      selected: node.type === nodeType,
    })));
  }, [setNodes]);

  const invertSelection = useCallback(() => {
    setNodes(nodes => nodes.map(node => ({
      ...node,
      selected: !node.selected,
    })));
  }, [setNodes]);

  return {
    selectionState,
    selectAll,
    deselectAll,
    selectNodesByRect,
    toggleNodeSelection,
    getSelectedNodes,
    selectNodesByType,
    invertSelection,
    setSelectionState,
  };
}

/**
 * Selection utilities for advanced operations
 */
export const selectionUtils = {
  /**
   * Group selected nodes by type
   */
  groupNodesByType: (nodes: Node[]): Record<string, Node[]> => {
    return nodes.reduce((groups, node) => {
      const type = node.type || 'default';
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(node);
      return groups;
    }, {} as Record<string, Node[]>);
  },

  /**
   * Calculate bounding box of selected nodes
   */
  getSelectionBounds: (nodes: Node[]): { x: number; y: number; width: number; height: number } => {
    if (nodes.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    nodes.forEach(node => {
      const nodeWidth = node.width || node.measured?.width || 200;
      const nodeHeight = node.height || node.measured?.height || 100;
      
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + nodeWidth);
      maxY = Math.max(maxY, node.position.y + nodeHeight);
    });

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  },

  /**
   * Align selected nodes
   */
  alignNodes: (nodes: Node[], alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'): Node[] => {
    if (nodes.length < 2) return nodes;

    const bounds = selectionUtils.getSelectionBounds(nodes);
    
    return nodes.map(node => {
      const nodeWidth = node.width || node.measured?.width || 200;
      const nodeHeight = node.height || node.measured?.height || 100;
      
      let newPosition = { ...node.position };

      switch (alignment) {
        case 'left':
          newPosition.x = bounds.x;
          break;
        case 'center':
          newPosition.x = bounds.x + (bounds.width - nodeWidth) / 2;
          break;
        case 'right':
          newPosition.x = bounds.x + bounds.width - nodeWidth;
          break;
        case 'top':
          newPosition.y = bounds.y;
          break;
        case 'middle':
          newPosition.y = bounds.y + (bounds.height - nodeHeight) / 2;
          break;
        case 'bottom':
          newPosition.y = bounds.y + bounds.height - nodeHeight;
          break;
      }

      return {
        ...node,
        position: newPosition,
      };
    });
  },

  /**
   * Distribute selected nodes evenly
   */
  distributeNodes: (nodes: Node[], direction: 'horizontal' | 'vertical'): Node[] => {
    if (nodes.length < 3) return nodes;

    const sorted = [...nodes].sort((a, b) => {
      return direction === 'horizontal' 
        ? a.position.x - b.position.x
        : a.position.y - b.position.y;
    });

    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    
    const totalDistance = direction === 'horizontal'
      ? last.position.x - first.position.x
      : last.position.y - first.position.y;
    
    const spacing = totalDistance / (sorted.length - 1);

    return nodes.map(node => {
      const index = sorted.findIndex(n => n.id === node.id);
      if (index === -1 || index === 0 || index === sorted.length - 1) {
        return node;
      }

      const newPosition = { ...node.position };
      if (direction === 'horizontal') {
        newPosition.x = first.position.x + spacing * index;
      } else {
        newPosition.y = first.position.y + spacing * index;
      }

      return {
        ...node,
        position: newPosition,
      };
    });
  },
};