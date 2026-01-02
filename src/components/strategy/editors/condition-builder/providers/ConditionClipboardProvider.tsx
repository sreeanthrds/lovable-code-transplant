import React, { useState, useCallback, ReactNode } from 'react';
import { ConditionClipboardContext, ClipboardData } from '../hooks/useConditionClipboard';
import { Condition, GroupCondition } from '../../../utils/conditions';

interface ConditionClipboardProviderProps {
  children: ReactNode;
}

export function ConditionClipboardProvider({ children }: ConditionClipboardProviderProps) {
  const [clipboardData, setClipboardData] = useState<ClipboardData | null>(null);

  const copyConditions = useCallback((conditions: (Condition | GroupCondition)[]) => {
    // Deep clone conditions to avoid reference issues
    const clonedConditions = conditions.map(condition => {
      if ('groupLogic' in condition) {
        return {
          ...condition,
          id: Math.random().toString(36).substr(2, 9),
          conditions: condition.conditions.map(c => ({
            ...c,
            id: Math.random().toString(36).substr(2, 9)
          }))
        };
      } else {
        return {
          ...condition,
          id: Math.random().toString(36).substr(2, 9)
        };
      }
    });

    setClipboardData({
      conditions: clonedConditions,
      timestamp: Date.now()
    });
  }, []);

  const pasteConditions = useCallback(() => {
    if (!clipboardData) return null;
    
    // Return a fresh copy with new IDs
    return clipboardData.conditions.map(condition => {
      if ('groupLogic' in condition) {
        return {
          ...condition,
          id: Math.random().toString(36).substr(2, 9),
          conditions: condition.conditions.map(c => ({
            ...c,
            id: Math.random().toString(36).substr(2, 9)
          }))
        };
      } else {
        return {
          ...condition,
          id: Math.random().toString(36).substr(2, 9)
        };
      }
    });
  }, [clipboardData]);

  const hasClipboardData = clipboardData !== null;

  return (
    <ConditionClipboardContext.Provider value={{
      clipboardData,
      copyConditions,
      pasteConditions,
      hasClipboardData
    }}>
      {children}
    </ConditionClipboardContext.Provider>
  );
}