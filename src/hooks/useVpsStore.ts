
import { create } from 'zustand';
import { Position } from '@/components/strategy/types/position-types';

interface VpsStoreState {
  isOpen: boolean;
  positions: Position[];
  toggle: () => void;
  setPositions: (positions: Position[]) => void;
  addPosition: (position: Position) => void;
  updatePosition: (position: Position) => void;
  removePosition: (positionId: string) => void;
  clearPositions: () => void;
  // Add re-entry tracking functions
  incrementReEntryCount: (vpi: string) => void;
  resetReEntryCount: (vpi: string) => void;
}

export const useVpsStore = create<VpsStoreState>((set) => ({
  isOpen: false,
  positions: [],
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setPositions: (positions) => set({ positions }),
  addPosition: (position) => set((state) => ({ 
    positions: [...state.positions, position] 
  })),
  updatePosition: (updatedPosition) => set((state) => ({
    positions: state.positions.map((pos) => 
      pos.vpi === updatedPosition.vpi ? { ...pos, ...updatedPosition } : pos
    )
  })),
  removePosition: (positionVpi) => set((state) => ({
    positions: state.positions.filter((pos) => pos.vpi !== positionVpi)
  })),
  clearPositions: () => set({ positions: [] }),
  
  // Re-entry tracking
  incrementReEntryCount: (vpi) => set((state) => ({
    positions: state.positions.map((pos) => {
      if (pos.vpi === vpi && pos.reEntry?.enabled) {
        return {
          ...pos,
          reEntry: {
            ...pos.reEntry,
            currentReEntryCount: (pos.reEntry.currentReEntryCount || 0) + 1
          }
        };
      }
      return pos;
    })
  })),
  
  resetReEntryCount: (vpi) => set((state) => ({
    positions: state.positions.map((pos) => {
      if (pos.vpi === vpi && pos.reEntry?.enabled) {
        return {
          ...pos,
          reEntry: {
            ...pos.reEntry,
            currentReEntryCount: 0
          }
        };
      }
      return pos;
    })
  }))
}));
