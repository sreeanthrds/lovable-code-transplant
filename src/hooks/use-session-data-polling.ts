import { useState, useEffect, useRef } from 'react';
import type { TradesDaily, DiagnosticsExport } from '@/types/backtest';

interface SessionData {
  session_id: string;
  found: boolean;
  message: string;
  diagnostics: DiagnosticsExport | null;
  trades: TradesDaily | null;
  has_diagnostics: boolean;
  has_trades: boolean;
}

interface HeartbeatData {
  session_id: string;
  found: boolean;
  mtimes: {
    diagnostics?: number;
    trades?: number;
  };
}

export const useSessionDataPolling = (
  sessionId: string | undefined,
  apiBaseUrl: string | null,
  enabled: boolean = true,
  pollingInterval: number = 2000 // 2 seconds - reasonable polling rate
) => {
  const [data, setData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataVersion, setDataVersion] = useState(0); // Track data updates to force re-renders
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMtimesRef = useRef<{ diagnostics?: number; trades?: number }>({});

  useEffect(() => {
    if (!enabled || !sessionId || !apiBaseUrl) {
      setLoading(false);
      // Clear data when disabled (modal closes)
      setData(null);
      setError(null);
      return;
    }

    // Reset everything when modal reopens (force fresh data fetch)
    setData(null);
    setError(null);
    setLoading(true);

    const baseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;

    const fetchFullData = async () => {
      console.log('🔵 [useSessionDataPolling] Fetching full data for session:', sessionId);
      try {
        const response = await fetch(
          `${baseUrl}/api/v1/live/session/${sessionId}/data`,
          {
            headers: { 'ngrok-skip-browser-warning': 'true' }
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const sessionData: SessionData = await response.json();
        
        console.log('✅ [useSessionDataPolling] Data received:', {
          session_id: sessionData.session_id,
          has_diagnostics: sessionData.has_diagnostics,
          has_trades: sessionData.has_trades,
          trades_count: sessionData.trades?.trades?.length || 0,
          diagnostics_events: sessionData.diagnostics?.events_history ? Object.keys(sessionData.diagnostics.events_history).length : 0
        });
        
        // Create NEW object reference to force React re-render
        setData({ ...sessionData });
        setDataVersion(prev => prev + 1); // Increment to trigger dependent effects
        setLoading(false);
        console.log('[useSessionDataPolling] Fetched full data (gunzip) - dataVersion incremented');
      } catch (err) {
        console.error('[useSessionDataPolling] Error fetching session data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };

    const checkHeartbeat = async () => {
      try {
        const heartbeatUrl = `${baseUrl}/api/v1/live/session/${sessionId}/heartbeat`;
        console.log(`🔍 [HEARTBEAT POLL] ${new Date().toLocaleTimeString()} - Calling: ${heartbeatUrl}`);
        
        const response = await fetch(
          heartbeatUrl,
          {
            headers: { 'ngrok-skip-browser-warning': 'true' }
          }
        );

        if (!response.ok) {
          console.log(`❌ [HEARTBEAT POLL] Failed: ${response.status}`);
          return;
        }

        const heartbeat: HeartbeatData = await response.json();
        const currentMtimes = heartbeat.mtimes || {};
        const lastMtimes = lastMtimesRef.current;
        
        console.log(`✅ [HEARTBEAT POLL] Response:`, {
          current_mtimes: currentMtimes,
          last_mtimes: lastMtimes,
          session_id: heartbeat.session_id?.substring(0, 30)
        });

        // Compare file modification times to detect changes
        const hasChanges = 
          (currentMtimes.diagnostics && currentMtimes.diagnostics !== lastMtimes.diagnostics) ||
          (currentMtimes.trades && currentMtimes.trades !== lastMtimes.trades);

        if (hasChanges) {
          console.log('🔥🔥🔥 [HEARTBEAT POLL] FILE CHANGES DETECTED - Fetching new data!');
          console.log(`   Diagnostics: ${lastMtimes.diagnostics} → ${currentMtimes.diagnostics}`);
          console.log(`   Trades: ${lastMtimes.trades} → ${currentMtimes.trades}`);
          
          // Update last mtimes
          lastMtimesRef.current = { ...currentMtimes };
          
          // Fetch full data (with gunzip)
          await fetchFullData();
        } else {
          console.log('⏸️ [HEARTBEAT POLL] No changes detected');
        }
      } catch (err) {
        console.error('❌ [HEARTBEAT POLL] Error:', err);
      }
    };

    // ALWAYS do initial fetch when modal opens to show latest data
    // This is crucial for completed sessions where heartbeat won't trigger
    console.log('🔵 [useSessionDataPolling] Doing initial fetch on modal open');
    fetchFullData();

    // Set up heartbeat polling for incremental updates (lightweight checks)
    console.log(`⏰ [useSessionDataPolling] Setting up heartbeat polling every ${pollingInterval}ms`);
    intervalRef.current = setInterval(() => {
      console.log(`⏰ [INTERVAL] Heartbeat check triggered at ${new Date().toLocaleTimeString()}`);
      checkHeartbeat();
    }, pollingInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [sessionId, apiBaseUrl, enabled, pollingInterval]);

  return {
    data,
    loading,
    error,
    diagnostics: data?.diagnostics,
    trades: data?.trades,
    has_diagnostics: data?.has_diagnostics ?? false,
    has_trades: data?.has_trades ?? false,
    dataVersion // Export version counter to force component re-renders
  };
};
