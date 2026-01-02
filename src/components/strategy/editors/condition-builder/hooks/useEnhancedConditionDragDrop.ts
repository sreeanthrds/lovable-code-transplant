import { useState, useCallback, useRef } from 'react';
import { Condition, GroupCondition } from '../../../utils/conditions';

export interface EnhancedDragData {
  paths: number[][];
  conditions: (Condition | GroupCondition)[];
  sourceIndices: number[];
  isDragging: boolean;
  startPosition: { x: number; y: number };
}

export interface DropZone {
  path: number[];
  position: 'before' | 'after' | 'inside';
  isValid: boolean;
  isActive: boolean;
}

export function useEnhancedConditionDragDrop() {
  const [dragData, setDragData] = useState<EnhancedDragData | null>(null);
  const [dropZones, setDropZones] = useState<Map<string, DropZone>>(new Map());
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [autoScrollDirection, setAutoScrollDirection] = useState<'up' | 'down' | null>(null);
  
  const containerRef = useRef<HTMLElement | null>(null);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const pathToKey = useCallback((path: number[]): string => {
    return path.join('.');
  }, []);

  const startDrag = useCallback((
    paths: number[][], 
    conditions: (Condition | GroupCondition)[], 
    sourceIndices: number[],
    startPosition: { x: number; y: number }
  ): void => {
    setDragData({
      paths,
      conditions,
      sourceIndices,
      isDragging: true,
      startPosition
    });
    setDragPosition(startPosition);
  }, []);

  const updateDragPosition = useCallback((position: { x: number; y: number }): void => {
    setDragPosition(position);
    
    // Auto-scroll logic
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const scrollThreshold = 50;
      
      if (position.y < rect.top + scrollThreshold) {
        setAutoScrollDirection('up');
      } else if (position.y > rect.bottom - scrollThreshold) {
        setAutoScrollDirection('down');
      } else {
        setAutoScrollDirection(null);
      }
    }
  }, []);

  const endDrag = useCallback((): void => {
    setDragData(null);
    setDropZones(new Map());
    setDragPosition({ x: 0, y: 0 });
    setAutoScrollDirection(null);
    
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
    }
  }, []);

  const registerDropZone = useCallback((
    path: number[], 
    position: 'before' | 'after' | 'inside',
    isValid: boolean = true
  ): void => {
    const key = `${pathToKey(path)}-${position}`;
    setDropZones(prev => new Map(prev.set(key, {
      path,
      position,
      isValid,
      isActive: false
    })));
  }, [pathToKey]);

  const activateDropZone = useCallback((
    path: number[], 
    position: 'before' | 'after' | 'inside'
  ): void => {
    const key = `${pathToKey(path)}-${position}`;
    setDropZones(prev => {
      const newMap = new Map(prev);
      const zone = newMap.get(key);
      if (zone) {
        newMap.set(key, { ...zone, isActive: true });
      }
      return newMap;
    });
  }, [pathToKey]);

  const deactivateDropZone = useCallback((
    path: number[], 
    position: 'before' | 'after' | 'inside'
  ): void => {
    const key = `${pathToKey(path)}-${position}`;
    setDropZones(prev => {
      const newMap = new Map(prev);
      const zone = newMap.get(key);
      if (zone) {
        newMap.set(key, { ...zone, isActive: false });
      }
      return newMap;
    });
  }, [pathToKey]);

  const getDropZone = useCallback((
    path: number[], 
    position: 'before' | 'after' | 'inside'
  ): DropZone | undefined => {
    const key = `${pathToKey(path)}-${position}`;
    return dropZones.get(key);
  }, [dropZones, pathToKey]);

  const isValidDrop = useCallback((
    targetPath: number[], 
    position: 'before' | 'after' | 'inside'
  ): boolean => {
    if (!dragData) return false;
    
    // Prevent dropping on self or child
    return !dragData.paths.some(sourcePath => {
      if (position === 'inside') {
        return targetPath.length >= sourcePath.length && 
               targetPath.slice(0, sourcePath.length).every((val, i) => val === sourcePath[i]);
      }
      return targetPath.length === sourcePath.length && 
             targetPath.every((val, i) => val === sourcePath[i]);
    });
  }, [dragData]);

  // Auto-scroll effect
  const startAutoScroll = useCallback(() => {
    if (autoScrollDirection && containerRef.current && !autoScrollIntervalRef.current) {
      autoScrollIntervalRef.current = setInterval(() => {
        if (containerRef.current) {
          const scrollAmount = autoScrollDirection === 'up' ? -10 : 10;
          containerRef.current.scrollBy(0, scrollAmount);
        }
      }, 16); // ~60fps
    }
  }, [autoScrollDirection]);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
    }
  }, []);

  return {
    dragData,
    dragPosition,
    dropZones,
    autoScrollDirection,
    containerRef,
    startDrag,
    updateDragPosition,
    endDrag,
    registerDropZone,
    activateDropZone,
    deactivateDropZone,
    getDropZone,
    isValidDrop,
    startAutoScroll,
    stopAutoScroll,
    isDragging: dragData?.isDragging || false
  };
}