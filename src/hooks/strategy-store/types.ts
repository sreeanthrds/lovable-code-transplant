
import { Node, Edge } from '@xyflow/react';

// Zustand store types
export type SetState = (partial: Partial<StrategyStore> | ((state: StrategyStore) => Partial<StrategyStore>)) => void;
export type GetState = () => StrategyStore;

export interface StrategyStore {
  nodes: Node[];
  edges: Edge[];
  history: Array<{ nodes: Node[]; edges: Edge[]; timestamp?: number }>;
  historyIndex: number;
  selectedNode: Node | null;
  isPanelOpen: boolean;
  
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
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
