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
            // Map API fields (total_positions -> total_trades) for consistency
            const daySummary = dayData.summary || existing?.summary || {};
            const mappedSummary = {
              total_trades: daySummary.total_positions ?? daySummary.total_trades ?? 0,
              total_pnl: String(daySummary.total_pnl ?? "0"),
              winning_trades: daySummary.winning_trades ?? 0,
              losing_trades: daySummary.losing_trades ?? 0,
              win_rate: String(daySummary.win_rate ?? "0"),
              realized_pnl: String(daySummary.realized_pnl || daySummary.total_pnl || "0"),
              unrealized_pnl: String(daySummary.unrealized_pnl || "0"),
            };

            newResults.set(dateKey, {
              date: dayData.date || dateKey,
              day_number: dayData.day_number || existing?.day_number,
              total_days: data.total_days || prev.total_days,
              summary: mappedSummary,
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

        // Determine status - check both API status AND client-side completion
        let status = prev.status;
        const allDaysCompleted = totalDays > 0 && completedCount >= totalDays;
        
        if (data.status === 'completed' || allDaysCompleted) {
          status = 'completed';
          console.log('Backtest completed - stopping polling. API status:', data.status, 'Days:', completedCount, '/', totalDays);
          stopPolling();
        } else if (data.status === 'failed') {
          status = 'failed';
          stopPolling();
        } else if (data.status === 'running' || data.status === 'starting') {
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
    if (!session?.backtest_id || !userId) return;

    const baseUrl = await initApiUrl();
    if (!baseUrl) {
      throw new Error('API URL not configured');
    }

    setLoadingDay(date);
    setSelectedDayData(null);

    try {
      const url = `${baseUrl}/api/v1/backtest/${userId}/${session.backtest_id}/day/${date}`;
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
        console.log('=== DEBUG: Processing ZIP file ===');
        console.log('File name:', fileName);
        console.log('File data size:', fileData.length, 'bytes');
        
        if (fileName.includes('trades_daily')) {
          const parsed = decodePossiblyGzippedJson(fileData, fileName);
          console.log('=== DEBUG: Parsed trades_daily structure ===');
          console.log('Parsed object keys:', Object.keys(parsed));
          console.log('Full parsed object:', JSON.stringify(parsed).slice(0, 500));
          
          // Handle different possible structures from the API
          // The trades might be at root level as an array, or nested under 'trades' or 'positions'
          if (Array.isArray(parsed)) {
            // Root level is an array of trades
            trades = { date, trades: parsed, summary: null };
          } else if (parsed.trades && Array.isArray(parsed.trades)) {
            // Standard structure with trades array
            trades = parsed;
          } else if (parsed.positions && Array.isArray(parsed.positions)) {
            // Alternative: positions instead of trades
            trades = { ...parsed, trades: parsed.positions };
          } else {
            // Fallback: try to find any array property
            const arrayKey = Object.keys(parsed).find(k => Array.isArray(parsed[k]));
            if (arrayKey) {
              console.log('Found array at key:', arrayKey);
              trades = { ...parsed, trades: parsed[arrayKey] };
            } else {
              trades = parsed;
            }
          }
        } else if (fileName.includes('diagnostics_export')) {
          diagnostics = decodePossiblyGzippedJson(fileData, fileName);
        }
      }

      if (trades && diagnostics) {
        // Debug: Log the structure of the data with actual string values
        const tradesArray = trades.trades || [];
        const firstTrade = tradesArray[0];
        const eventKeys = diagnostics.events_history ? Object.keys(diagnostics.events_history) : [];
        
        console.log('=== DEBUG: Final Trade Data Analysis ===');
        console.log('Trades date:', trades.date);
        console.log('Trades array length:', tradesArray.length);
        console.log('First trade keys:', firstTrade ? Object.keys(firstTrade) : 'no trade');
        console.log('First trade sample:', firstTrade ? JSON.stringify(firstTrade).slice(0, 200) : 'none');
        
        // Ensure trades have flow_ids arrays and proper typing - with defensive array check
        const normalizedTrades: TradesDaily = {
          ...trades,
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
