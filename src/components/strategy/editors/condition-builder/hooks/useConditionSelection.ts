import { useState, useCallback, useMemo } from 'react';
import { Condition, GroupCondition } from '../../../utils/conditions';

export interface ConditionPath {
  indices: number[];
  condition: Condition | GroupCondition;
}

export function useConditionSelection() {
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());

  // Convert path indices to string key for Set storage
  const pathToKey = useCallback((indices: number[]): string => {
    return indices.join('.');
  }, []);

  // Convert string key back to indices
  const keyToPath = useCallback((key: string): number[] => {
    return key.split('.').map(Number);
  }, []);

  const isSelected = useCallback((indices: number[]): boolean => {
    return selectedPaths.has(pathToKey(indices));
  }, [selectedPaths, pathToKey]);

  const toggleSelection = useCallback((indices: number[]): void => {
    const key = pathToKey(indices);
    setSelectedPaths(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  }, [pathToKey]);

  const clearSelection = useCallback((): void => {
    setSelectedPaths(new Set());
  }, []);

  const selectAll = useCallback((allPaths: number[][]): void => {
    const keys = allPaths.map(pathToKey);
    setSelectedPaths(new Set(keys));
  }, [pathToKey]);

  const getSelectedPaths = useCallback((): number[][] => {
    return Array.from(selectedPaths).map(keyToPath);
  }, [selectedPaths, keyToPath]);

  const hasSelections = useMemo(() => selectedPaths.size > 0, [selectedPaths]);

  return {
    isSelected,
    toggleSelection,
    clearSelection,
    selectAll,
    getSelectedPaths,
    hasSelections,
    selectedCount: selectedPaths.size
  };
}