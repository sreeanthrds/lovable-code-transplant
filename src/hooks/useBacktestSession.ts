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
import { TradesDaily, DiagnosticsExport, Trade, DailySummary } from '@/types/backtest';
import { getApiBaseUrl } from '@/lib/api-config';

interface UseBacktestSessionOptions {
  userId?: string;
  isAdmin?: boolean;
}

// Polling configuration
const POLLING_INTERVAL = 10000; // 10 seconds - reduced polling rate
const STALE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes without changes = stale
const MAX_CONSECUTIVE_FAILURES = 10; // Stop after 10 consecutive network failures

export function useBacktestSession({ userId, isAdmin = false }: UseBacktestSessionOptions) {
  const [session, setSession] = useState<BacktestSession | null>(null);
  const [selectedDayData, setSelectedDayData] = useState<DayDetailData | null>(null);
  const [loadingDay, setLoadingDay] = useState<string | null>(null);
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const apiBaseUrl = useRef<string>('');
  const lastChangeTimeRef = useRef<number>(Date.now());
  const lastResultsHashRef = useRef<string>('');
  const consecutiveFailuresRef = useRef<number>(0);

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
      apiBaseUrl.current = await getApiBaseUrl(userId, isAdmin) || '';
    }
    return apiBaseUrl.current;
  }, [userId, isAdmin]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    // Reset tracking refs
    consecutiveFailuresRef.current = 0;
  }, []);

  // Generate a simple hash of results to detect changes
  const getResultsHash = (dailyResults: any): string => {
    if (!dailyResults || typeof dailyResults !== 'object') return '';
    const entries = dailyResults instanceof Map 
      ? Array.from(dailyResults.entries()) 
      : Object.entries(dailyResults);
    return entries.map(([k, v]: [string, any]) => `${k}:${v?.status}`).sort().join('|');
  };

  // Poll backtest status with smart timeout detection
  const pollBacktestStatus = useCallback(async (backtestId: string, baseUrl: string) => {
    try {
      const response = await fetch(`${baseUrl}/api/v1/backtest/${backtestId}/status`, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (!response.ok) {
        console.error('Poll failed with status:', response.status);
        consecutiveFailuresRef.current++;
        
        // Stop polling after too many consecutive failures
        if (consecutiveFailuresRef.current >= MAX_CONSECUTIVE_FAILURES) {
          console.warn('Stopping polling after', MAX_CONSECUTIVE_FAILURES, 'consecutive failures');
          stopPolling();
          setSession(prev => prev ? { ...prev, status: 'failed', error: 'Connection lost - too many failed requests' } : null);
        }
        return;
      }

      // Reset failure counter on success
      consecutiveFailuresRef.current = 0;

      const data = await response.json();
      console.log('Poll response:', data);

      // Check if results have changed
      const currentHash = getResultsHash(data.daily_results);
      if (currentHash !== lastResultsHashRef.current) {
        lastResultsHashRef.current = currentHash;
        lastChangeTimeRef.current = Date.now();
        console.log('Results changed, resetting stale timer');
      } else {
        // Check for stale timeout
        const timeSinceLastChange = Date.now() - lastChangeTimeRef.current;
        if (timeSinceLastChange >= STALE_TIMEOUT_MS) {
          console.warn('No changes detected in 5 minutes, stopping polling');
          stopPolling();
          setSession(prev => prev ? { 
            ...prev, 
            status: 'failed', 
            error: 'Backtest appears stale - no progress in 5 minutes' 
          } : null);
          return;
        }
      }

      // Update session state from polling response
      setSession(prev => {
        if (!prev) return null;

        const newResults = new Map(prev.daily_results);
        
        // IMPORTANT: Process summary_jsonl FIRST - it has the authoritative complete data
        // This ensures days with actual data are marked as completed before daily_results can override
        if (data.summary_jsonl) {
          const lines = data.summary_jsonl.split("\n").filter((l: string) => l.trim());
          lines.forEach((line: string, index: number) => {
            try {
              const daySummary = JSON.parse(line);
              const dateKey = daySummary.date;
              if (dateKey) {
                // Map API fields if necessary (total_positions -> total_trades)
                const mappedSummary = {
                  total_trades: daySummary.total_positions ?? daySummary.total_trades ?? 0,
                  total_pnl: String(daySummary.total_pnl ?? "0"),
                  winning_trades: daySummary.winning_trades ?? 0,
                  losing_trades: daySummary.losing_trades ?? 0,
                  win_rate: String(daySummary.win_rate ?? "0"),
                  realized_pnl: String(daySummary.realized_pnl || daySummary.total_pnl || "0"),
                  unrealized_pnl: String(daySummary.unrealized_pnl || "0"),
                };

                // Always set from summary_jsonl as it's the authoritative source
                const existing = newResults.get(dateKey);
                newResults.set(dateKey, {
                  date: dateKey,
                  day_number: existing?.day_number || (index + 1),
                  total_days: data.total_days || prev.total_days,
                  summary: mappedSummary,
                  has_detail_data: true,
                  status: "completed",
                });
              }
            } catch (e) {
              console.error("Error parsing summary_jsonl line:", e);
            }
          });
        }

        // Update daily results from response (API returns object, not array)
        // Only add entries that DON'T already exist as completed (from summary_jsonl)
        // This prevents overwriting completed days with "processing" status
        if (data.daily_results && typeof data.daily_results === 'object') {
          const dailyResultsEntries = Object.entries(data.daily_results);
          for (const [dateKey, day] of dailyResultsEntries) {
            const dayData = day as any;
            const existing = newResults.get(dateKey);
            
            // Skip if we already have this day marked as completed (from summary_jsonl)
            if (existing?.status === 'completed') {
              continue;
            }
            
            // Only add/update if day doesn't exist or has a non-completed status
            newResults.set(dateKey, {
              date: dayData.date || dateKey,
              day_number: dayData.day_number || existing?.day_number,
              total_days: data.total_days || prev.total_days,
              summary: dayData.summary || existing?.summary || { total_trades: 0, total_pnl: '0', winning_trades: 0, losing_trades: 0, win_rate: '0' },
              has_detail_data: dayData.has_detail_data ?? existing?.has_detail_data ?? false,
              status: dayData.status || 'processing',
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
          overall_summary: data.overall_summary ? { ...data.overall_summary, largest_win: data.overall_summary.largest_win || "0", largest_loss: data.overall_summary.largest_loss || "0" } : prev.overall_summary,
          error: data.error,
          total_days: data.total_days || prev.total_days,
        };
      });
    } catch (error) {
      console.error('Polling error:', error);
      consecutiveFailuresRef.current++;
      
      // Stop polling after too many consecutive failures
      if (consecutiveFailuresRef.current >= MAX_CONSECUTIVE_FAILURES) {
        console.warn('Stopping polling after', MAX_CONSECUTIVE_FAILURES, 'consecutive network errors');
        stopPolling();
        setSession(prev => prev ? { ...prev, status: 'failed', error: 'Connection lost - network errors' } : null);
      }
    }
  }, [stopPolling, getResultsHash]);

  // Start a new backtest
  const startBacktest = useCallback(async (request: StartBacktestRequest) => {
    const baseUrl = await initApiUrl();
    if (!baseUrl) {
      throw new Error('API URL not configured');
    }

    // Stop any existing polling and reset tracking
    stopPolling();
    lastChangeTimeRef.current = Date.now();
    lastResultsHashRef.current = '';
    consecutiveFailuresRef.current = 0;

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

      // Debug: Log what we extracted from the ZIP
      console.log('=== DEBUG: ZIP Extraction Results ===');
      console.log('ZIP files found:', zipFileNames);
      console.log('Trades object exists:', !!trades);
      console.log('Trades.trades array exists:', !!trades?.trades);
      console.log('Trades.trades length:', trades?.trades?.length ?? 'N/A');
      console.log('Diagnostics object exists:', !!diagnostics);
      console.log('Diagnostics.events_history exists:', !!diagnostics?.events_history);

      if (!trades) {
        throw new Error(`No trades_daily file found in ZIP. Found files: ${zipFileNames.join(', ')}`);
      }

      if (!diagnostics) {
        throw new Error(`No diagnostics_export file found in ZIP. Found files: ${zipFileNames.join(', ')}`);
      }

      // Handle both formats: direct array OR object with trades property
      // The API may return either: [{trade1}, {trade2}] OR { trades: [{trade1}, {trade2}], date: "..." }
      let tradesArray: any[];
      let tradesDate: string | undefined;
      
      if (Array.isArray(trades)) {
        // Format 1: Direct array of trades
        console.log('Trades data is a direct array, wrapping into expected structure');
        tradesArray = trades;
        tradesDate = date; // Use the date parameter passed to loadDayDetail
      } else if (trades.trades && Array.isArray(trades.trades)) {
        // Format 2: Object with trades property
        tradesArray = trades.trades;
        tradesDate = trades.date;
      } else {
        console.error('trades object structure:', JSON.stringify(trades, null, 2).substring(0, 500));
        throw new Error(`Unexpected trades format. Got: ${typeof trades}. Keys: ${Object.keys(trades).join(', ')}`);
      }

      // Debug: Log the structure of the data with actual string values
      const firstTrade = trades.trades[0];
      const eventKeys = diagnostics.events_history ? Object.keys(diagnostics.events_history) : [];
      
      console.log('=== DEBUG: Full Trade Data Analysis ===');
      console.log('Trades date:', trades.date);
      console.log('First trade keys:', firstTrade ? Object.keys(firstTrade) : 'no trade');
      console.log('First trade entry_flow_ids type:', typeof firstTrade?.entry_flow_ids);
      console.log('First trade entry_flow_ids value:', JSON.stringify(firstTrade?.entry_flow_ids));
      console.log('First trade exit_flow_ids value:', JSON.stringify(firstTrade?.exit_flow_ids));
      console.log('Events history keys (first 3):', JSON.stringify(eventKeys.slice(0, 3)));
      console.log('Do IDs match?', firstTrade?.entry_flow_ids?.[0] && eventKeys.includes(firstTrade.entry_flow_ids[0]) ? 'YES' : 'NO');
      
      // Build summary from trades if not provided (when API returns array directly)
      const existingSummary = !Array.isArray(trades) ? trades.summary : undefined;
      const computedSummary: DailySummary = existingSummary || {
        total_trades: tradesArray.length,
        total_pnl: tradesArray.reduce((sum, t) => sum + parseFloat(t.pnl || '0'), 0).toFixed(2),
        winning_trades: tradesArray.filter(t => parseFloat(t.pnl || '0') > 0).length,
        losing_trades: tradesArray.filter(t => parseFloat(t.pnl || '0') < 0).length,
        win_rate: tradesArray.length > 0 
          ? ((tradesArray.filter(t => parseFloat(t.pnl || '0') > 0).length / tradesArray.length) * 100).toFixed(2)
          : '0',
      };

      // Normalize trades with proper typing
      const normalizedTrades: TradesDaily = {
        date: tradesDate || date,
        summary: computedSummary,
        trades: tradesArray.map((t: any): Trade => ({
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
