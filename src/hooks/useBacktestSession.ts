import { useState, useCallback, useRef } from 'react';
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

// Polling interval in milliseconds
const POLLING_INTERVAL = 2000;

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

  // Poll backtest status
  const pollBacktestStatus = useCallback(async (backtestId: string, baseUrl: string) => {
    try {
      const response = await fetch(`${baseUrl}/api/v1/backtest/${backtestId}/status`, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (!response.ok) {
        console.error('Poll failed with status:', response.status);
        // Continue polling on non-fatal errors
        return;
      }

      const data = await response.json();
      console.log('Poll response:', data);

      // Update session state from polling response
      setSession(prev => {
        if (!prev) return null;

        const newResults = new Map(prev.daily_results);
        
      // Update daily results from response (API returns object, not array)
        if (data.daily_results && typeof data.daily_results === 'object') {
          const dailyResultsEntries = Object.entries(data.daily_results);
          for (const [dateKey, day] of dailyResultsEntries) {
            const dayData = day as any;
            newResults.set(dateKey, {
              date: dayData.date || dateKey,
              day_number: dayData.day_number,
              total_days: data.total_days || prev.total_days,
              summary: dayData.summary || { total_trades: 0, total_pnl: '0', winning_trades: 0, losing_trades: 0, win_rate: '0' },
              has_detail_data: dayData.has_detail_data ?? false,
              status: dayData.status || 'completed',
              error: dayData.error,
            });
          }
        }

        // Calculate progress
        const completedCount = Array.from(newResults.values()).filter(d => d.status === 'completed').length;
        const totalDays = data.total_days || prev.total_days;
        const progress = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;

        // Determine status
        let status = prev.status;
        if (data.status === 'completed') {
          status = 'completed';
          stopPolling();
        } else if (data.status === 'failed') {
          status = 'failed';
          stopPolling();
        } else if (data.status === 'running') {
          status = 'running';
        }

        return {
          ...prev,
          daily_results: newResults,
          progress,
          status,
          overall_summary: data.overall_summary || prev.overall_summary,
          error: data.error,
          total_days: data.total_days || prev.total_days,
        };
      });
    } catch (error) {
      console.error('Polling error:', error);
      // Continue polling on network errors - don't stop
    }
  }, [stopPolling]);

  // Start a new backtest
  const startBacktest = useCallback(async (request: StartBacktestRequest) => {
    const baseUrl = await initApiUrl();
    if (!baseUrl) {
      throw new Error('API URL not configured');
    }

    // Stop any existing polling
    stopPolling();

    // Initialize session
    setSession({
      backtest_id: '',
      strategy_id: request.strategy_id,
      start_date: request.start_date,
      end_date: request.end_date,
      total_days: 0,
      status: 'starting',
      daily_results: new Map(),
      progress: 0,
      start_time: Date.now(),
    });
    setSelectedDayData(null);

    try {
      // Call start endpoint
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
      const backtestId = data.backtest_id;

      // Update session with backtest_id and start polling
      setSession(prev => prev ? {
        ...prev,
        backtest_id: backtestId,
        total_days: data.total_days,
        status: 'running',
      } : null);

      // Start polling for status updates
      console.log('Starting polling for backtest:', backtestId);
      pollingIntervalRef.current = setInterval(() => {
        pollBacktestStatus(backtestId, baseUrl);
      }, POLLING_INTERVAL);

      // Initial poll
      await pollBacktestStatus(backtestId, baseUrl);

    } catch (error) {
      // Clear session on failure so form reappears
      stopPolling();
      setSession(null);
      throw error;
    }
  }, [initApiUrl, pollBacktestStatus, stopPolling]);

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

  // Reset session
  const reset = useCallback(() => {
    stopPolling();
    setSession(null);
    setSelectedDayData(null);
    setLoadingDay(null);
  }, [stopPolling]);

  // Get sorted daily results as array - handle both Map and plain object
  const getDailyResultsArray = useCallback((): DayResult[] => {
    if (!session) return [];
    
    const dailyResults = session.daily_results;
    
    // Handle both Map and plain object formats
    let resultsArray: DayResult[];
    if (dailyResults instanceof Map) {
      resultsArray = Array.from(dailyResults.values());
    } else if (dailyResults && typeof dailyResults === 'object') {
      resultsArray = Object.values(dailyResults) as DayResult[];
    } else {
      return [];
    }
    
    return resultsArray.sort((a, b) => a.date.localeCompare(b.date));
  }, [session]);

  return {
    session,
    selectedDayData,
    loadingDay,
    startBacktest,
    loadDayDetail,
    reset,
    getDailyResultsArray,
    stopPolling,
  };
}
