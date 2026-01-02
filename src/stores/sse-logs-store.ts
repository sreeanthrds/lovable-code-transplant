import { create } from 'zustand';

export interface SSELogEntry {
  id: string;
  timestamp: string;
  eventType: 'initial_state' | 'tick_update' | 'node_events' | 'trade_update' | 'session_complete' | 'error' | 'connection';
  message: string;
  data?: Record<string, unknown>;
}

interface SSELogsStore {
  logs: SSELogEntry[];
  maxLogs: number;
  
  addLog: (entry: Omit<SSELogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  setMaxLogs: (max: number) => void;
}

export const useSSELogsStore = create<SSELogsStore>((set, get) => ({
  logs: [],
  maxLogs: 500,

  addLog: (entry) => {
    const newLog: SSELogEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };
    
    set(state => ({
      logs: [newLog, ...state.logs].slice(0, state.maxLogs)
    }));
  },

  clearLogs: () => {
    set({ logs: [] });
  },

  setMaxLogs: (max) => {
    set({ maxLogs: max });
  }
}));
