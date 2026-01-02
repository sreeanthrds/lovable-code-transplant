import { useState, useCallback, useRef } from 'react';
import { Condition, GroupCondition } from '../../../utils/conditions';

export interface DragState {
  isDragging: boolean;
  draggedItems: (Condition | GroupCondition)[];
  sourceIndices: number[];
  sourceGroupId: string;
  dragPosition: { x: number; y: number };
}

export interface DropTarget {
  groupId: string;
  index: number;
  position: 'before' | 'after' | 'inside';
}

export function useDragAndDrop() {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const dragDataRef = useRef<any>(null);

  const startDrag = useCallback((
    items: (Condition | GroupCondition)[],
    sourceIndices: number[],
    sourceGroupId: string,
    position: { x: number; y: number }
  ) => {
    const newDragState = {
      isDragging: true,
      draggedItems: items,
      sourceIndices,
      sourceGroupId,
      dragPosition: position
    };
    
    setDragState(newDragState);
    dragDataRef.current = newDragState;
  }, []);

  const updateDragPosition = useCallback((position: { x: number; y: number }) => {
    if (dragState) {
      setDragState(prev => prev ? { ...prev, dragPosition: position } : null);
    }
  }, [dragState]);

  const setDropTargetZone = useCallback((target: DropTarget | null) => {
    setDropTarget(target);
  }, []);

  const endDrag = useCallback(() => {
    setDragState(null);
    setDropTarget(null);
    dragDataRef.current = null;
  }, []);

  const isValidDrop = useCallback((target: DropTarget): boolean => {
    if (!dragState) return false;
    
    // Can't drop on self
    if (target.groupId === dragState.sourceGroupId) {
      // For same group drops
      if (target.position === 'inside') {
        // Can't drop inside self
        return !dragState.sourceIndices.includes(target.index);
      } else {
        // Can't drop before/after self
        return !dragState.sourceIndices.includes(target.index);
      }
    }
    
    // Cross-group drops are always valid
    return true;
  }, [dragState]);

  const executeDrop = useCallback((
    target: DropTarget,
    onMove: (items: (Condition | GroupCondition)[], from: { groupId: string; indices: number[] }, to: DropTarget) => void
  ) => {
    if (!dragState || !isValidDrop(target)) return false;

    onMove(
      dragState.draggedItems,
      { groupId: dragState.sourceGroupId, indices: dragState.sourceIndices },
      target
    );

    endDrag();
    return true;
  }, [dragState, isValidDrop, endDrag]);

  return {
    dragState,
    dropTarget,
    startDrag,
    updateDragPosition,
    setDropTargetZone,
    endDrag,
    isValidDrop,
    executeDrop,
    isDragging: dragState?.isDragging || false
  };
}