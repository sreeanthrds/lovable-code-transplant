import { useEffect, useRef, useCallback } from 'react';
import { Node } from '@xyflow/react';

interface UseNodeSizeObserverProps {
  nodes: Node[];
  onNodesResize: (updatedNodes: Node[]) => void;
  enabled?: boolean;
}

/**
 * Observes node size changes and updates node dimensions dynamically
 * This enables smart layout adjustments when panels expand/collapse
 */
export const useNodeSizeObserver = ({
  nodes,
  onNodesResize,
  enabled = true
}: UseNodeSizeObserverProps) => {
  const observerRef = useRef<ResizeObserver | null>(null);
  const nodeSizesRef = useRef<Map<string, { width: number; height: number }>>(new Map());
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleResize = useCallback((entries: ResizeObserverEntry[]) => {
    if (!enabled) return;

    let hasSignificantChanges = false;
    const updates = new Map<string, { width: number; height: number }>();

    entries.forEach((entry) => {
      const nodeId = entry.target.getAttribute('data-id');
      if (!nodeId) return;

      const { width, height } = entry.contentRect;
      const previousSize = nodeSizesRef.current.get(nodeId);

      // Check if the size change is significant (more than 20px in either dimension)
      const isSignificantChange = !previousSize ||
        Math.abs(width - previousSize.width) > 20 ||
        Math.abs(height - previousSize.height) > 20;

      if (isSignificantChange) {
        hasSignificantChanges = true;
        updates.set(nodeId, { width, height });
        nodeSizesRef.current.set(nodeId, { width, height });
      }
    });

    // Debounce updates to avoid excessive re-renders
    if (hasSignificantChanges) {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      updateTimeoutRef.current = setTimeout(() => {
        const updatedNodes = nodes.map(node => {
          const newSize = updates.get(node.id);
          if (newSize) {
            return {
              ...node,
              width: newSize.width,
              height: newSize.height,
              measured: {
                ...node.measured,
                width: newSize.width,
                height: newSize.height
              }
            };
          }
          return node;
        });

        
        onNodesResize(updatedNodes);
      }, 300); // 300ms debounce
    }
  }, [nodes, onNodesResize, enabled]);

  useEffect(() => {
    if (!enabled) return;

    // Create ResizeObserver
    observerRef.current = new ResizeObserver(handleResize);

    // Observe all node elements
    nodes.forEach(node => {
      const nodeElement = document.querySelector(`[data-id="${node.id}"]`);
      if (nodeElement) {
        observerRef.current?.observe(nodeElement);
      }
    });

    // Cleanup
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      observerRef.current?.disconnect();
    };
  }, [nodes, handleResize, enabled]);

  return {
    nodeSizes: nodeSizesRef.current
  };
};
