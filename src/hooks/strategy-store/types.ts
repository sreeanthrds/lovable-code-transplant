
import { Node, Edge } from '@xyflow/react';

export interface GlobalVariable {
  id: string;
  name: string;
  initialValue: number;
}

// Zustand store types
export type SetState = (partial: Partial<StrategyStore> | ((state: StrategyStore) => Partial<StrategyStore>)) => void;
export type GetState = () => StrategyStore;

export interface StrategyStore {
  nodes: Node[];
  edges: Edge[];
  globalVariables: GlobalVariable[];
  history: Array<{ nodes: Node[]; edges: Edge[]; timestamp?: number }>;
  historyIndex: number;
  selectedNode: Node | null;
  isPanelOpen: boolean;
  
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setGlobalVariables: (vars: GlobalVariable[]) => void;
  setSelectedNode: (node: Node | null) => void;
  setIsPanelOpen: (open: boolean) => void;
  
  addHistoryItem: (nodes: Node[], edges: Edge[]) => void;
  undo: () => void;
  redo: () => void;
  resetHistory: () => void;
  resetNodes: () => void;
  
  // New methods for virtual nodes
  getExportableNodes: () => Node[];
  cleanupOverviewNodes: () => void;
  getStrategyOverviewNode: () => Node;
  getOrCreateOverviewNode: () => Node;
  
  handleAutoArrange: () => Promise<void>;
  autoArrangeOnChange: () => Promise<void>;
}
