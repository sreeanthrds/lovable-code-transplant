import React, { useState, useCallback, useEffect, ReactNode } from 'react';
import { GVAClipboardContext, GlobalVariableUpdate } from '../hooks/useGlobalVarAssignmentClipboard';

// Module-level clipboard storage so it persists across remounts
let moduleClipboard: { assignments: GlobalVariableUpdate[]; timestamp: number } | null = null;
let listeners: Set<() => void> = new Set();

function notifyListeners() {
  listeners.forEach(fn => fn());
}

interface GVAClipboardProviderProps {
  children: ReactNode;
}

export function GVAClipboardProvider({ children }: GVAClipboardProviderProps) {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const listener = () => forceUpdate(c => c + 1);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  const copyAssignments = useCallback((assignments: GlobalVariableUpdate[]) => {
    moduleClipboard = {
      assignments: assignments.map(a => ({
        ...a,
        id: `gva-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        expression: JSON.parse(JSON.stringify(a.expression))
      })),
      timestamp: Date.now()
    };
    notifyListeners();
  }, []);

  const pasteAssignments = useCallback(() => {
    if (!moduleClipboard) return null;
    return moduleClipboard.assignments.map(a => ({
      ...a,
      id: `gva-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
    }));
  }, []);

  const hasClipboardData = moduleClipboard !== null;

  return (
    <GVAClipboardContext.Provider value={{ clipboardData: moduleClipboard, copyAssignments, pasteAssignments, hasClipboardData }}>
      {children}
    </GVAClipboardContext.Provider>
  );
}
