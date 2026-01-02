import { useState, useEffect, useRef, useCallback } from 'react';

interface TickState {
  session_id: string;
  timestamp: string;
  status: string;
  ltp_store?: Record<string, number>;
  open_positions?: Array<any>;
  pnl_summary?: {
    total_pnl: string;
    realized_pnl: string;
    unrealized_pnl: string;
    closed_trades: number;
    open_trades: number;
  };
  progress?: {
    ticks_processed: number;
    total_ticks: number;
  };
  current_time?: string;
}

interface SessionTickData {
  sessionId: string;
  tickState: TickState;
  lastUpdate: string;
}

export const useHttpPolling = (
  userId: string | null,
  apiBaseUrl: string | null,
  sessionIds: string[],
  enabled: boolean = true,
  pollingInterval: number = 100
) => {
  const [sessionTicks, setSessionTicks] = useState<Record<string, SessionTickData>>({});
  const [isPolling, setIsPolling] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const pollAllSessions = useCallback(async () => {
    if (!enabled || !apiBaseUrl || sessionIds.length === 0) {
      return;
    }

    const baseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;

    // Poll all sessions in parallel
    const promises = sessionIds.map(async (sessionId) => {
      try {
        const response = await fetch(
          `${baseUrl}/api/v1/live/session/${sessionId}/state`,
          {
            headers: { 'ngrok-skip-browser-warning': 'true' }
          }
        );

        if (!response.ok) {
          console.error(`[HTTP Polling] Error for session ${sessionId}: ${response.status}`);
          return null;
        }

        const data = await response.json();

        if (data.found && data.tick_state) {
          const tickState = data.tick_state as TickState;
          
          // Log LTP and position counts
          const ltpCount = tickState.ltp_store ? Object.keys(tickState.ltp_store).length : 0;
          const posCount = tickState.open_positions?.length || 0;
          
          // Only log every 10th poll to reduce noise
          if (Math.random() < 0.1) {
            console.log(`[HTTP Poll] ${sessionId.slice(0,12)} | LTP: ${ltpCount} | Pos: ${posCount} | P&L: ₹${tickState.pnl_summary?.total_pnl || '0'}`);
          }

          return {
            sessionId,
            tickState,
            lastUpdate: tickState.timestamp
          };
        }

        return null;
      } catch (error) {
        console.error(`[HTTP Polling] Error fetching session ${sessionId}:`, error);
        return null;
      }
    });

    const results = await Promise.all(promises);

    // Update state with results
    setSessionTicks(prev => {
      const newState = { ...prev };
      results.forEach(result => {
        if (result) {
          newState[result.sessionId] = result;
        }
      });
      return newState;
    });

  }, [enabled, apiBaseUrl, sessionIds]);

  useEffect(() => {
    if (!enabled || !apiBaseUrl || sessionIds.length === 0) {
      setIsPolling(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    console.log(`[HTTP Polling] Starting polling for ${sessionIds.length} sessions at ${pollingInterval}ms interval`);
    setIsPolling(true);

    // Initial poll
    pollAllSessions();

    // Set up interval polling
    intervalRef.current = setInterval(pollAllSessions, pollingInterval);

    return () => {
      console.log('[HTTP Polling] Stopping polling');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsPolling(false);
    };
  }, [enabled, apiBaseUrl, sessionIds, pollingInterval, pollAllSessions]);

  const connectPolling = useCallback(() => {
    console.log('[HTTP Polling] Connect called (no-op, polling is automatic)');
  }, []);

  const disconnectPolling = useCallback(() => {
    console.log('[HTTP Polling] Disconnect called - stopping polling');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  return {
    sessionTicks,
    isPolling,
    connectPolling,
    disconnectPolling
  };
};
