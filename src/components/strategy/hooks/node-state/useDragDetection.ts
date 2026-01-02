import { useCallback, useRef, useMemo } from 'react';
import { NodeChange } from '@xyflow/react';

/**
 * Hook for detecting drag operations and optimizing node updates
 */
export function useDragDetection() {
  // Keep track of drag state for optimization
  const isNodeDraggingRef = useRef(false);
  const pendingNodesUpdate = useRef<any>(null);

  // Custom nodes change handler with drag detection
  const onNodesChangeWithDragDetection = useCallback((changes: NodeChange[], onNodesChange: any, handleUpdateAfterDrag: any) => {
    // Detect the start of a drag operation
    if (!isNodeDraggingRef.current) {
      const dragStarting = changes.some(
        change => change.type === 'position' && change.dragging === true
      );
      if (dragStarting) {
        isNodeDraggingRef.current = true;
        // console.log('Drag operation started');
      }
    }

    // Detect the end of a drag operation
    if (isNodeDraggingRef.current) {
      const dragEnding = changes.some(
        change => change.type === 'position' && change.dragging === false
      );
      if (dragEnding) {
        isNodeDraggingRef.current = false;
        // When drag ends, apply the pending update if any
        if (pendingNodesUpdate.current) {
          // console.log('Applying pending update after drag');
          handleUpdateAfterDrag(pendingNodesUpdate.current);
          pendingNodesUpdate.current = null;
        }
      }
    }

    // Apply the changes to the local state
    onNodesChange(changes);
  }, []);

  // Handle node changes with drag detection
  const handleNodesChange = useCallback((changes: NodeChange[], onNodesChange: any) => {
    // Process changes normally, but track drag state
    changes.forEach(change => {
      if (change.type === 'position') {
        isNodeDraggingRef.current = change.dragging || false;
      }
    });
    onNodesChange(changes);
  }, []);

  return useMemo(() => ({
    isNodeDraggingRef,
    pendingNodesUpdate,
    onNodesChangeWithDragDetection,
    handleNodesChange
  }), [onNodesChangeWithDragDetection, handleNodesChange]);
}
