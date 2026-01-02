import { createContext, useContext } from 'react';
import { Condition, GroupCondition } from '../../../utils/conditions';

export interface ClipboardData {
  conditions: (Condition | GroupCondition)[];
  timestamp: number;
}

export interface ConditionClipboardContextType {
  clipboardData: ClipboardData | null;
  copyConditions: (conditions: (Condition | GroupCondition)[]) => void;
  pasteConditions: () => (Condition | GroupCondition)[] | null;
  hasClipboardData: boolean;
}

export const ConditionClipboardContext = createContext<ConditionClipboardContextType | null>(null);

export function useConditionClipboard() {
  const context = useContext(ConditionClipboardContext);
  if (!context) {
    throw new Error('useConditionClipboard must be used within a ConditionClipboardProvider');
  }
  return context;
}