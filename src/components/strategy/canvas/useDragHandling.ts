
import { useCallback, useRef, useMemo, useEffect } from 'react';
import { Node, NodeChange } from '@xyflow/react';

export function useDragHandling(onAddNode?: (type: string, position: { x: number, y: number }) => void) {
  const isNodeDraggingRef = useRef(false);
  const dragStartTimeRef = useRef(0);
  const dragNodesRef = useRef<Set<string>>(new Set());
  const dragThrottleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Clean up timeouts when unmounting
  useEffect(() => {
    return () => {
      if (dragThrottleTimeoutRef.current) {
        clearTimeout(dragThrottleTimeoutRef.current);
        dragThrottleTimeoutRef.current = null;
      }
    };
  }, []);

  const handleBeforeDrag = useCallback(() => {
    if (!isNodeDraggingRef.current) {
      isNodeDraggingRef.current = true;
      dragStartTimeRef.current = Date.now();
      dragNodesRef.current.clear();
      console.log('Drag started');
    }
  }, []);

  const handleDragStop = useCallback(() => {
    // Only reset dragging state after a small delay to avoid flickering
    // during quick drag operations
    if (dragThrottleTimeoutRef.current) {
      clearTimeout(dragThrottleTimeoutRef.current);
    }
    
    dragThrottleTimeoutRef.current = setTimeout(() => {
      isNodeDraggingRef.current = false;
      dragNodesRef.current.clear();
      dragThrottleTimeoutRef.current = null;
      console.log('Drag stopped');
    }, 300); // Wait a bit before considering drag truly complete
  }, []);

  // Enhanced nodes change handler with improved drag detection
  const handleNodesChange = useCallback((changes: NodeChange[], onNodesChange: (changes: NodeChange[]) => void) => {
    // Early return if changes is empty
    if (!changes || changes.length === 0) {
      return onNodesChange(changes);
    }
    
    // Process actual changes
    const positionChanges = changes.filter(change => change.type === 'position');
    
    // Log changes for debugging when relevant
    if (positionChanges.length > 0) {
      console.log('Position changes detected:', positionChanges);
    }
    
    // Detect start of dragging
    const dragStart = positionChanges.find(change => 
      change.type === 'position' && change.dragging === true
    );
    
    if (dragStart) {
      handleBeforeDrag();
      // Track which nodes are being dragged
      positionChanges.forEach(change => {
        if (change.type === 'position' && change.id) {
          dragNodesRef.current.add(change.id);
        }
      });
    }
    
    // Always apply changes to keep UI responsive
    onNodesChange(changes);
    
    // Detect end of dragging
    const dragEnd = positionChanges.find(change => 
      change.type === 'position' && 
      change.dragging === false &&
      dragNodesRef.current.has(change.id)
    );
    
    if (dragEnd && isNodeDraggingRef.current) {
      handleDragStop();
    }
  }, [handleBeforeDrag, handleDragStop]);

  // Handle drag over event
  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop event
  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (!onAddNode) return;

    const reactFlowBounds = event.currentTarget.getBoundingClientRect();
    const nodeType = event.dataTransfer.getData('application/reactflow/type');
    
    if (!nodeType) return;
    
    const position = {
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top
    };
    
    onAddNode(nodeType, position);
  }, [onAddNode]);

  return useMemo(() => ({
    isNodeDraggingRef,
    handleNodesChange,
    dragNodesRef,
    onDragOver,
    onDrop
  }), [handleNodesChange, onDragOver, onDrop]);
}
