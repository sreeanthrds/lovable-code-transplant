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

  const decodePossiblyGzippedJson = (bytes: Uint8Array, fileName: string) => {
    // GZIP magic header: 1f 8b
    const looksGzipped = bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b;
    try {
      const text = looksGzipped
        ? pako.ungzip(bytes, { to: 'string' })
        : new TextDecoder('utf-8').decode(bytes);
      return JSON.parse(text);
    } catch (e) {
      throw new Error(
        `Failed to parse ${fileName} as ${looksGzipped ? 'gzip+json' : 'json'}: ${e instanceof Error ? e.message : String(e)}`
      );
    }
  };

  // Initialize API URL
  const initApiUrl = useCallback(async () => {
    if (userId && !apiBaseUrl.current) {
      apiBaseUrl.current = await getApiBaseUrl(userId) || '';
    }
    return apiBaseUrl.current;
  }, [userId]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Start polling for backtest status
  const startPolling = useCallback((backtestId: string) => {
    // Clear any existing polling
    stopPolling();

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
  }, [initApiUrl, stopPolling]);


  // Start a new backtest
  const startBacktest = useCallback(async (request: StartBacktestRequest) => {
    const baseUrl = await initApiUrl();
    if (!baseUrl) {
      throw new Error('API URL not configured');
    }

    // Abort any existing polling
    if (pollingIntervalRef.current) {
      stopPolling();
    }

    // Initialize session
    setSession({
      backtest_id: '',
      strategy_id: request.strategy_id,
      start_date: request.start_date,
      end_date: request.end_date,
      total_days: 0,
      status: 'running',
      daily_results: new Map(),
      progress: 0,
    });
    setSelectedDayData(null);

    try {
      // Call start endpoint via proxy
      const response = await fetch(`${baseUrl}/api/v1/backtest/start`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Failed to start backtest' }));
        throw new Error(error.detail || 'Failed to start backtest');
      }

      const data: StartBacktestResponse = await response.json();

      // Update session with backtest_id and start polling
      setSession(prev => prev ? {
        ...prev,
        backtest_id: data.backtest_id,
        total_days: data.total_days,
        status: 'running',
      } : null);

      // Start polling for status updates
      startPolling(data.backtest_id);

    } catch (error) {
      // Clear session on failure so form reappears
      setSession(null);
      throw error;
    }
  }, [initApiUrl, startPolling]);

  // Download and extract day detail data
  const loadDayDetail = useCallback(async (date: string) => {
    if (!session?.backtest_id) return;

    const baseUrl = await initApiUrl();
    if (!baseUrl) {
      throw new Error('API URL not configured');
    }

    setLoadingDay(date);
    setSelectedDayData(null);

    try {
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

      const zipFileNames = Object.keys(zip.files);

      for (const [fileName, file] of Object.entries(zip.files)) {
        if (file.dir) continue;
        
        const fileData = await file.async('uint8array');
        
        if (fileName.includes('trades_daily')) {
          trades = decodePossiblyGzippedJson(fileData, fileName);
        } else if (fileName.includes('diagnostics_export')) {
          diagnostics = decodePossiblyGzippedJson(fileData, fileName);
        }
      }

      if (trades && diagnostics) {
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
      } else {
        console.error('Missing data - trades:', !!trades, 'diagnostics:', !!diagnostics);
        throw new Error(
          `Missing trades or diagnostics data in ZIP. Found files: ${zipFileNames.join(', ')}`
        );
      }
    } catch (error) {
      console.error('Error loading day details:', error);
      throw error;
    } finally {
      setLoadingDay(null);
    }
  }, [session?.backtest_id, initApiUrl]);

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
    reset,
    getDailyResultsArray,
  };
}
