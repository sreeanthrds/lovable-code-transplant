import { useState, useCallback } from 'react';
import { Condition, GroupCondition } from '../../../utils/conditions';

export interface DragData {
  paths: number[][];
  conditions: (Condition | GroupCondition)[];
  isDragging: boolean;
}

export function useConditionDragDrop() {
  const [dragData, setDragData] = useState<DragData | null>(null);
  const [dragOverPath, setDragOverPath] = useState<number[] | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | 'inside' | null>(null);

  const startDrag = useCallback((paths: number[][], conditions: (Condition | GroupCondition)[]): void => {
    setDragData({
      paths,
      conditions,
      isDragging: true
    });
  }, []);

  const endDrag = useCallback((): void => {
    setDragData(null);
    setDragOverPath(null);
    setDropPosition(null);
  }, []);

  const handleDragOver = useCallback((targetPath: number[], position: 'before' | 'after' | 'inside'): void => {
    setDragOverPath(targetPath);
    setDropPosition(position);
  }, []);

  const clearDragOver = useCallback((): void => {
    setDragOverPath(null);
    setDropPosition(null);
  }, []);

  const isDragOverTarget = useCallback((path: number[]): boolean => {
    return dragOverPath !== null && 
           dragOverPath.length === path.length && 
           dragOverPath.every((index, i) => index === path[i]);
  }, [dragOverPath]);

  return {
    dragData,
    dragOverPath,
    dropPosition,
    startDrag,
    endDrag,
    handleDragOver,
    clearDragOver,
    isDragOverTarget,
    isDragging: dragData?.isDragging || false
  };
}