
import { create } from 'zustand';

export interface PositionStoreEntry {
  vpi: string; // VPI identifier for the position
  positionTag?: string | null; // Tag from entry node, can be null
  entryPrice?: number;
  exitPrice?: number;
  status: 'open' | 'closed';
  underlyingPriceOnEntry?: number;
  underlyingPriceOnExit?: number;
  entryTime?: number; // in seconds
  exitTime?: number; // in seconds
}

interface PositionStoreState {
  positions: PositionStoreEntry[];
  updatePosition: (vpi: string, updates: Partial<PositionStoreEntry>) => void;
  addPosition: (position: PositionStoreEntry) => void;
  removePosition: (vpi: string) => void;
  clearAllPositions: () => void;
  getPosition: (vpi: string) => PositionStoreEntry | undefined;
  getPositionsByTag: (tag: string) => PositionStoreEntry[];
  getOpenPositions: () => PositionStoreEntry[];
  getClosedPositions: () => PositionStoreEntry[];
}

export const usePositionStore = create<PositionStoreState>((set, get) => ({
  positions: [],

  updatePosition: (vpi, updates) => {
    set((state) => ({
      positions: state.positions.map((pos) =>
        pos.vpi === vpi 
          ? { ...pos, ...updates }
          : pos
      )
    }));
  },

  addPosition: (position) => {
    set((state) => {
      // Check if position already exists, if so update it
      const existingIndex = state.positions.findIndex(p => p.vpi === position.vpi);
      if (existingIndex >= 0) {
        const updatedPositions = [...state.positions];
        updatedPositions[existingIndex] = { ...updatedPositions[existingIndex], ...position };
        return { positions: updatedPositions };
      }
      return { positions: [...state.positions, position] };
    });
  },

  removePosition: (vpi) => {
    set((state) => ({
      positions: state.positions.filter((pos) => pos.vpi !== vpi)
    }));
  },

  clearAllPositions: () => {
    set({ positions: [] });
  },

  getPosition: (vpi) => {
    return get().positions.find(pos => pos.vpi === vpi);
  },

  getPositionsByTag: (tag) => {
    return get().positions.filter(pos => pos.positionTag === tag);
  },

  getOpenPositions: () => {
    return get().positions.filter(pos => pos.status === 'open');
  },

  getClosedPositions: () => {
    return get().positions.filter(pos => pos.status === 'closed');
  }
}));
