import { create } from 'zustand';

export interface LiveUpdate {
  id: string;
  nodeId: string;
  timestamp: string;
  type: 'tick' | 'signal' | 'execution' | 'status';
  message: string;
  value?: string | number;
}

interface LiveNodeUpdatesStore {
  // Whether to store historical updates
  storeHistory: boolean;
  
  // Updates organized by node ID
  updatesByNode: Record<string, LiveUpdate[]>;
  
  // Actions
  setStoreHistory: (enabled: boolean) => void;
  addUpdate: (update: LiveUpdate) => void;
  addUpdates: (updates: LiveUpdate[]) => void;
  getUpdatesForNode: (nodeId: string) => LiveUpdate[];
  clearNodeUpdates: (nodeId: string) => void;
  clearAllUpdates: () => void;
}

export const useLiveNodeUpdatesStore = create<LiveNodeUpdatesStore>((set, get) => ({
  storeHistory: false,
  updatesByNode: {},

  setStoreHistory: (enabled) => {
    set({ storeHistory: enabled });
    // Clear all history when disabled
    if (!enabled) {
      set({ updatesByNode: {} });
    }
  },

  addUpdate: (update) => {
    const { storeHistory, updatesByNode } = get();
    if (!storeHistory) return;
    
    const nodeUpdates = updatesByNode[update.nodeId] || [];
    // Avoid duplicates by ID
    if (nodeUpdates.some(u => u.id === update.id)) return;
    
    set({
      updatesByNode: {
        ...updatesByNode,
        [update.nodeId]: [...nodeUpdates, update].slice(-100) // Keep last 100 per node
      }
    });
  },

  addUpdates: (updates) => {
    const { storeHistory, updatesByNode } = get();
    if (!storeHistory || updates.length === 0) return;
    
    const newUpdatesByNode = { ...updatesByNode };
    
    updates.forEach(update => {
      const nodeUpdates = newUpdatesByNode[update.nodeId] || [];
      if (!nodeUpdates.some(u => u.id === update.id)) {
        newUpdatesByNode[update.nodeId] = [...nodeUpdates, update].slice(-100);
      }
    });
    
    set({ updatesByNode: newUpdatesByNode });
  },

  getUpdatesForNode: (nodeId) => {
    const { storeHistory, updatesByNode } = get();
    if (!storeHistory) return [];
    return updatesByNode[nodeId] || [];
  },

  clearNodeUpdates: (nodeId) => {
    const { updatesByNode } = get();
    const { [nodeId]: _, ...rest } = updatesByNode;
    set({ updatesByNode: rest });
  },

  clearAllUpdates: () => {
    set({ updatesByNode: {} });
  }
}));
