import React, { useState, useCallback, ReactNode } from 'react';
import { GVAClipboardContext, GlobalVariableUpdate } from '../hooks/useGlobalVarAssignmentClipboard';

interface GVAClipboardProviderProps {
  children: ReactNode;
}

export function GVAClipboardProvider({ children }: GVAClipboardProviderProps) {
  const [clipboardData, setClipboardData] = useState<{ assignments: GlobalVariableUpdate[]; timestamp: number } | null>(null);

  const copyAssignments = useCallback((assignments: GlobalVariableUpdate[]) => {
    const cloned = assignments.map(a => ({
      ...a,
      id: `gva-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      expression: JSON.parse(JSON.stringify(a.expression))
    }));
    setClipboardData({ assignments: cloned, timestamp: Date.now() });
  }, []);

  const pasteAssignments = useCallback(() => {
    if (!clipboardData) return null;
    return clipboardData.assignments.map(a => ({
      ...a,
      id: `gva-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
    }));
  }, [clipboardData]);

  const hasClipboardData = clipboardData !== null;

  return (
    <GVAClipboardContext.Provider value={{ clipboardData, copyAssignments, pasteAssignments, hasClipboardData }}>
      {children}
    </GVAClipboardContext.Provider>
  );
}
