import { createContext, useContext } from 'react';

export interface GlobalVariableUpdate {
  id: string;
  globalVariableId: string;
  globalVariableName: string;
  expression: any;
}

export interface GVAClipboardData {
  assignments: GlobalVariableUpdate[];
  timestamp: number;
}

export interface GVAClipboardContextType {
  clipboardData: GVAClipboardData | null;
  copyAssignments: (assignments: GlobalVariableUpdate[]) => void;
  pasteAssignments: () => GlobalVariableUpdate[] | null;
  hasClipboardData: boolean;
}

export const GVAClipboardContext = createContext<GVAClipboardContextType | null>(null);

export function useGlobalVarAssignmentClipboard() {
  const context = useContext(GVAClipboardContext);
  if (!context) {
    throw new Error('useGlobalVarAssignmentClipboard must be used within a GVAClipboardProvider');
  }
  return context;
}
