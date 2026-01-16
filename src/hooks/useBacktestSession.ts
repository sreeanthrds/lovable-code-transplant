import { useState, useCallback, useRef, useEffect } from 'react';
import pako from 'pako';
import JSZip from 'jszip';
import {
  BacktestSession,
  DayResult,
  StartBacktestRequest,
  StartBacktestResponse,
  DayDetailData,
} from '@/types/backtest-session';
import { TradesDaily, DiagnosticsExport, Trade } from '@/types/backtest';
import { getApiBaseUrl } from '@/lib/api-config';

interface UseBacktestSessionOptions {
  userId?: string;
}

export function useBacktestSession({ userId }: UseBacktestSessionOptions) {
  const [session, setSession] = useState<BacktestSession | null>(null);
  const [selectedDayData, setSelectedDayData] = useState<DayDetailData | null>(null);
  const [loadingDay, setLoadingDay] = useState<string | null>(null);
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const apiBaseUrl = useRef<string>('');

  // Initialize API URL
  const initApiUrl = useCallback(async () => {
    if (userId && !apiBaseUrl.current) {
      apiBaseUrl.current = await getApiBaseUrl(userId) || '';
    }
    return apiBaseUrl.current;
  }, [userId]);

  // Start polling for backtest status
  const startPolling = useCallback((backtestId: string) => {
    // Clear any existing polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Start polling every 2 seconds
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const baseUrl = await initApiUrl();
        const response = await fetch(`${baseUrl}/api/v1/backtest/${backtestId}/status`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch status: ${response.statusText}`);
        }

        const sessionData = await response.json();
        
        // Update session state
        setSession(sessionData);
        
        // Stop polling if completed or failed
        if (sessionData.status === 'completed' || sessionData.status === 'failed') {
          stopPolling();
        }
        
      } catch (error) {
        console.error('Polling error:', error);
        // Continue polling on error, but log it
      }
    }, 2000);
  }, [initApiUrl]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Start backtest
  const startBacktest = useCallback(async (request: StartBacktestRequest) => {
    try {
      const baseUrl = await initApiUrl();
      
      const response = await fetch(`${baseUrl}/api/v1/backtest/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Failed to start backtest: ${response.statusText}`);
      }

      const result: StartBacktestResponse = await response.json();
      
      // Initialize session with start response
      const initialSession: BacktestSession = {
        backtest_id: result.backtest_id,
        strategy_id: request.strategy_id,
        start_date: request.start_date,
        end_date: request.end_date,
        status: 'starting',
        start_time: new Date().toISOString(),
        total_days: result.total_days,
        progress: 0,
        daily_results: new Map(),
        overall_summary: null,
      };

      setSession(initialSession);
      
      // Start polling for updates
      startPolling(result.backtest_id);
      
      return result;
      
    } catch (error) {
      setSession(null);
      throw error;
    }
  }, [initApiUrl, startPolling]);

  // Load day details
  const loadDayDetail = useCallback(async (date: string) => {
    if (!session) return;
    
    setLoadingDay(date);
    setSelectedDayData(null);
    
    try {
      const baseUrl = await initApiUrl();
      const url = `${baseUrl}/api/v1/backtest/${session.backtest_id}/day/${date}`;
      const response = await fetch(url, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download day details');
      }

      // Get the ZIP blob and parse with JSZip
      const blob = await response.blob();
      const zip = await JSZip.loadAsync(blob);
      
      let trades: TradesDaily | null = null;
      let diagnostics: DiagnosticsExport | null = null;

      // Extract files from ZIP
      for (const [fileName, fileData] of Object.entries(zip.files)) {
        if (!fileData.dir) {
          const content = await fileData.async('uint8array');
          
          if (fileName.includes('trades_daily.json')) {
            const decompressed = pako.ungzip(content, { to: 'string' });
            trades = JSON.parse(decompressed);
          } else if (fileName.includes('diagnostics_export.json')) {
            const decompressed = pako.ungzip(content, { to: 'string' });
            diagnostics = JSON.parse(decompressed);
          }
        }
      }

      if (!trades || !diagnostics) {
        console.error('Missing data - trades:', !!trades, 'diagnostics:', !!diagnostics);
        throw new Error('Missing trades or diagnostics data in ZIP');
      }

      // Debug: Log the structure of the data with actual string values
      const firstTrade = trades.trades?.[0];
      const eventKeys = diagnostics.events_history ? Object.keys(diagnostics.events_history) : [];
      
      console.log('=== DEBUG: Full Trade Data Analysis ===');
      console.log('Trades date:', trades.date);
      console.log('First trade keys:', firstTrade ? Object.keys(firstTrade) : 'no trade');
      console.log('First trade entry_flow_ids type:', typeof firstTrade?.entry_flow_ids);
      console.log('First trade entry_flow_ids value:', JSON.stringify(firstTrade?.entry_flow_ids));
      console.log('First trade exit_flow_ids value:', JSON.stringify(firstTrade?.exit_flow_ids));
      console.log('Events history keys (first 3):', JSON.stringify(eventKeys.slice(0, 3)));
      console.log('Do IDs match?', firstTrade?.entry_flow_ids?.[0] && eventKeys.includes(firstTrade.entry_flow_ids[0]) ? 'YES' : 'NO');
      
      // Ensure trades have flow_ids arrays and proper typing
      const normalizedTrades: TradesDaily = {
        ...trades,
        trades: trades.trades.map((t: any): Trade => ({
          ...t,
          side: t.side?.toUpperCase() === 'BUY' ? 'BUY' : 
                t.side?.toUpperCase() === 'SELL' ? 'SELL' : 
                t.side?.toLowerCase() === 'buy' ? 'buy' : 'sell',
          status: t.status === 'open' ? 'open' : 'closed',
          exit_price: t.exit_price ?? null,
          exit_time: t.exit_time ?? null,
          exit_reason: t.exit_reason ?? null,
          entry_flow_ids: t.entry_flow_ids || [],
          exit_flow_ids: t.exit_flow_ids || [],
        })),
      };
      setSelectedDayData({ trades: normalizedTrades, diagnostics });
      
    } catch (error) {
      console.error('Failed to load day details:', error);
      throw error;
    } finally {
      setLoadingDay(null);
    }
  }, [session, initApiUrl]);

  // Stop backtest
  const stopBacktest = useCallback(async () => {
    if (!session) return;
    
    try {
      const baseUrl = await initApiUrl();
      
      const response = await fetch(`${baseUrl}/api/v1/backtest/${session.backtest_id}/stop`, {
        method: 'POST',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to stop backtest: ${response.statusText}`);
      }

      stopPolling();
      setSession(prev => prev ? { ...prev, status: 'stopped' } : null);
      
    } catch (error) {
      console.error('Failed to stop backtest:', error);
      throw error;
    }
  }, [session, initApiUrl, stopPolling]);

  // Reset session
  const reset = useCallback(() => {
    stopPolling();
    setSession(null);
    setSelectedDayData(null);
    setLoadingDay(null);
  }, [stopPolling]);

  // Get sorted daily results as array
  const getDailyResultsArray = useCallback((): DayResult[] => {
    if (!session) return [];
    return Array.from(session.daily_results.values()).sort((a, b) => 
      a.date.localeCompare(b.date)
    );
  }, [session]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    session,
    selectedDayData,
    loadingDay,
    startBacktest,
    loadDayDetail,
    stopBacktest,
    reset, // Changed from resetSession to reset for compatibility
    getDailyResultsArray,
  };
}
