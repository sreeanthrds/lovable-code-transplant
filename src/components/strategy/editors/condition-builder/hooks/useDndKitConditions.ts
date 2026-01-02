import { useState, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  UniqueIdentifier,
  DragOverlay,
  closestCenter,
  rectIntersection,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from '@dnd-kit/core';
import { Condition, GroupCondition } from '../../../utils/conditions';

export interface DragItem {
  id: UniqueIdentifier;
  condition: Condition | GroupCondition;
  index: number;
  groupId: string;
}

export interface DropResult {
  sourceGroupId: string;
  sourceIndex: number;
  targetGroupId: string;
  targetIndex: number;
  position: 'before' | 'after' | 'inside';
}

export function useDndKitConditions() {
  const [activeItem, setActiveItem] = useState<DragItem | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Reduced for smoother feel
      },
    })
  );

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  };

  // Configure drag overlay to follow cursor exactly
  const dragOverlayProps = {
    style: {
      cursor: 'grabbing',
    },
    // Disable the default offset so it follows cursor exactly
    modifiers: [],
  };

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const dragItem = active.data.current as DragItem;
    setActiveItem(dragItem);
    setMousePosition(null);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over, activatorEvent } = event;
    setOverId(over?.id || null);
    
    // Track mouse position for cursor-based drop zones
    if (activatorEvent && 'clientX' in activatorEvent && 'clientY' in activatorEvent) {
      setMousePosition({ 
        x: activatorEvent.clientX as number, 
        y: activatorEvent.clientY as number 
      });
    }
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent, onMove: (result: DropResult) => void) => {
    const { active, over } = event;
    
    if (!over || !activeItem) {
      setActiveItem(null);
      setOverId(null);
      return;
    }

    const sourceItem = active.data.current as DragItem;
    const targetData = over.data.current;

    if (!sourceItem || !targetData) {
      setActiveItem(null);
      setOverId(null);
      return;
    }

    // Determine drop position based on the drop zone
    let position: 'before' | 'after' | 'inside' = 'after';
    let targetIndex = targetData.index;
    let targetGroupId = targetData.groupId;
    
    if (over.id.toString().includes('-before')) {
      position = 'before';
    } else if (over.id.toString().includes('-after')) {
      position = 'after';
    } else if (over.id.toString().includes('-inside')) {
      position = 'inside';
    }

    // Prevent dropping on self or invalid targets
    if (sourceItem.groupId === targetData.groupId && sourceItem.index === targetData.index) {
      setActiveItem(null);
      setOverId(null);
      return;
    }

    const result: DropResult = {
      sourceGroupId: sourceItem.groupId,
      sourceIndex: sourceItem.index,
      targetGroupId: targetGroupId,
      targetIndex,
      position,
    };

    onMove(result);
    setActiveItem(null);
    setOverId(null);
    setMousePosition(null);
  }, [activeItem]);

  const handleDragCancel = useCallback(() => {
    setActiveItem(null);
    setOverId(null);
    setMousePosition(null);
  }, []);

  return {
    sensors,
    activeItem,
    overId,
    mousePosition,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    isDragging: !!activeItem,
    dropAnimation,
    dragOverlayProps,
  };
}