import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SimulationSession {
  sessionId: string;
  strategyId: string;
  strategyName: string;
  brokerType: string;
  simulationDate: string;
  speedMultiplier: number;
  status: 'starting' | 'running' | 'stopped' | 'completed' | 'error';
  createdAt: string;
  error?: string;
}

interface LiveSimulationStore {
  // Active simulation session
  activeSession: SimulationSession | null;
  
  // Session history (for quick access to recent sessions)
  sessionHistory: SimulationSession[];
  
  // Actions
  setActiveSession: (session: SimulationSession | null) => void;
  updateSessionStatus: (status: SimulationSession['status'], error?: string) => void;
  clearActiveSession: () => void;
  addToHistory: (session: SimulationSession) => void;
}

export const useLiveSimulationStore = create<LiveSimulationStore>()(
  persist(
    (set, get) => ({
      activeSession: null,
      sessionHistory: [],

      setActiveSession: (session) => {
        set({ activeSession: session });
        if (session) {
          // Also add to history
          const history = get().sessionHistory;
          const exists = history.find(s => s.sessionId === session.sessionId);
          if (!exists) {
            set({ 
              sessionHistory: [session, ...history].slice(0, 10) // Keep last 10
            });
          }
        }
      },

      updateSessionStatus: (status, error) => {
        const current = get().activeSession;
        if (current) {
          set({
            activeSession: { ...current, status, error }
          });
        }
      },

      clearActiveSession: () => {
        set({ activeSession: null });
      },

      addToHistory: (session) => {
        const history = get().sessionHistory;
        const exists = history.find(s => s.sessionId === session.sessionId);
        if (!exists) {
          set({ 
            sessionHistory: [session, ...history].slice(0, 10)
          });
        }
      }
    }),
    {
      name: 'live-simulation-storage',
      partialize: (state) => ({ sessionHistory: state.sessionHistory })
    }
  )
);
