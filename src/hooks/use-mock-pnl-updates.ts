import { useState, useEffect } from 'react';

export interface PnLData {
  total: number;
  realized: number;
  unrealized: number;
  today: number;
  positions: number;
}

interface UsePnLDataReturn {
  pnlData: Record<string, PnLData>;
  updatePnL: (strategyId: string, data: Partial<PnLData>) => void;
  isUpdating: boolean;
}

// Default zero P&L data
const defaultPnLData: PnLData = {
  total: 0,
  realized: 0,
  unrealized: 0,
  today: 0,
  positions: 0
};

/**
 * Hook to manage P&L data for strategies.
 * Initializes with zeros and can be updated with real data from SSE/WebSocket.
 */
export const useMockPnLUpdates = (strategyIds: string[], _enabled: boolean = true): UsePnLDataReturn => {
  const [pnlData, setPnlData] = useState<Record<string, PnLData>>(() => {
    // Initialize all strategies with zero P&L
    const initial: Record<string, PnLData> = {};
    strategyIds.forEach(id => {
      initial[id] = { ...defaultPnLData };
    });
    return initial;
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Ensure new strategies get initialized with zero P&L
  useEffect(() => {
    setPnlData(prev => {
      const updated = { ...prev };
      let hasNew = false;
      
      strategyIds.forEach(id => {
        if (!updated[id]) {
          updated[id] = { ...defaultPnLData };
          hasNew = true;
        }
      });
      
      return hasNew ? updated : prev;
    });
  }, [strategyIds.join(',')]);

  // Function to update P&L from real data (SSE/WebSocket)
  const updatePnL = (strategyId: string, data: Partial<PnLData>) => {
    setIsUpdating(true);
    setPnlData(prev => ({
      ...prev,
      [strategyId]: {
        ...defaultPnLData,
        ...prev[strategyId],
        ...data
      }
    }));
    // Reset updating flag after a short delay
    setTimeout(() => setIsUpdating(false), 100);
  };

  return { pnlData, updatePnL, isUpdating };
};
