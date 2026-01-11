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

export function useBacktestSession({ userId }: UseBacktestSessionOptions) {
  const [session, setSession] = useState<BacktestSession | null>(null);
  const [selectedDayData, setSelectedDayData] = useState<DayDetailData | null>(null);
  const [loadingDay, setLoadingDay] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
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

  // Parse SSE event from text
  const parseSSEEvent = (text: string): { event: string; data: any } | null => {
    const lines = text.split('\n');
    let event = '';
    let data = '';
    
    for (const line of lines) {
      if (line.startsWith('event:')) {
        event = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        data = line.slice(5).trim();
      }
    }
    
    if (event && data) {
      try {
        return { event, data: JSON.parse(data) };
      } catch {
        return null;
      }
    }
    return null;
  };

  // Start a new backtest
  const startBacktest = useCallback(async (request: StartBacktestRequest) => {
    const baseUrl = await initApiUrl();
    if (!baseUrl) {
      throw new Error('API URL not configured');
    }

    // Abort any existing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

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

      // Update session with backtest_id
      setSession(prev => prev ? {
        ...prev,
        backtest_id: data.backtest_id,
        total_days: data.total_days,
        status: 'streaming',
      } : null);

      // Connect to SSE stream using EventSource (proper SSE implementation)
      const streamUrl = `${baseUrl}${data.stream_url}`;
      
      // Create EventSource for proper SSE handling
      const eventSource = new EventSource(streamUrl);

      // Handle SSE events
      eventSource.onmessage = (event) => {
        console.log("SSE message:", event.data);
        try {
          const parsed = parseSSEEvent(`message\ndata: ${event.data}`);
          if (parsed) {
            handleSSEEvent(parsed.event, parsed.data);
          }
        } catch (error) {
          console.error('Error parsing SSE message:', error);
        }
      };

      eventSource.addEventListener("day_started", (e) => {
        const payload = JSON.parse(e.data);
        console.log("Day started:", payload);
        handleSSEEvent("day_started", payload);
      });

      eventSource.addEventListener("day_completed", (e) => {
        const payload = JSON.parse(e.data);
        console.log("Day completed:", payload);
        handleSSEEvent("day_completed", payload);
      });

      eventSource.addEventListener("backtest_completed", (e) => {
        const payload = JSON.parse(e.data);
        console.log("Backtest completed:", payload);
        handleSSEEvent("backtest_completed", payload);
        eventSource.close();
        abortControllerRef.current = null;
      });

      eventSource.addEventListener("error", (e) => {
        // NOTE:
        // - EventSource uses the 'error' event for connection-level failures.
        // - Our backend ALSO emits `event: error` with a JSON payload (date + error message).
        // Distinguish by presence of `data` (MessageEvent) and handle gracefully.
        const maybeMessageEvent = e as MessageEvent;
        if (typeof maybeMessageEvent?.data === 'string' && maybeMessageEvent.data.trim()) {
          try {
            const payload = JSON.parse(maybeMessageEvent.data);
            console.log("Backtest error event:", payload);
            handleSSEEvent("error", payload);
            return;
          } catch (parseErr) {
            console.error("Failed to parse SSE error payload:", parseErr, maybeMessageEvent.data);
            // fall through to treat as connection error
          }
        }

        console.error("SSE connection error:", e);
        setSession(prev => prev ? { ...prev, status: 'failed' } : null);
        eventSource.close();
        abortControllerRef.current = null;
      });

      eventSource.addEventListener("open", () => {
        console.log("SSE connection opened");
      });

      // Handle SSE events
      const handleSSEEvent = (event: string, eventData: any) => {
        console.log('SSE Event:', event, eventData);

        switch (event) {
          case 'day_started':
            console.log('Processing day_started for date:', eventData.date);
            setSession(prev => {
              if (!prev) {
                console.log('day_started: prev is null');
                return null;
              }
              const newResults = new Map(prev.daily_results);
              newResults.set(eventData.date, {
                date: eventData.date,
                day_number: eventData.day_number,
                total_days: eventData.total_days,
                summary: { total_trades: 0, total_pnl: '0', winning_trades: 0, losing_trades: 0, win_rate: '0' },
                has_detail_data: false,
                status: 'running',
              });
              console.log('day_started: Map size after update:', newResults.size);
              return {
                ...prev,
                daily_results: newResults,
                progress: Math.round(((eventData.day_number - 1) / eventData.total_days) * 100),
              };
            });
            break;

          case 'day_completed':
            console.log('Processing day_completed for date:', eventData.date, 'summary:', eventData.summary);
            setSession(prev => {
              if (!prev) {
                console.log('day_completed: prev is null');
                return null;
              }
              const newResults = new Map(prev.daily_results);
              newResults.set(eventData.date, {
                date: eventData.date,
                day_number: eventData.day_number,
                total_days: eventData.total_days,
                summary: eventData.summary,
                has_detail_data: eventData.has_detail_data,
                status: 'completed',
              });
              console.log('day_completed: Map size after update:', newResults.size);
              return {
                ...prev,
                daily_results: newResults,
                progress: Math.round((eventData.day_number / eventData.total_days) * 100),
              };
            });
            break;

          case 'backtest_completed':
            console.log('Processing backtest_completed');
            setSession(prev => {
              if (!prev) return null;
              console.log('backtest_completed: daily_results size:', prev.daily_results.size);
              return {
                ...prev,
                status: 'completed',
                overall_summary: eventData.overall_summary,
                progress: 100,
              };
            });
            break;

          case 'error':
            if (eventData.date) {
              setSession(prev => {
                if (!prev) return null;
                const newResults = new Map(prev.daily_results);
                const existing = newResults.get(eventData.date);
                if (existing) {
                  newResults.set(eventData.date, {
                    ...existing,
                    status: 'error',
                    error: eventData.error,
                  });
                }
                return { ...prev, daily_results: newResults };
              });
            } else {
              setSession(prev => prev ? {
                ...prev,
                status: 'failed',
                error: eventData.error,
              } : null);
            }
            break;
        }
      };

    } catch (error) {
      // Clear session on failure so form reappears
      setSession(null);
      throw error;
    }
  }, [initApiUrl]);

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
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setSession(null);
    setSelectedDayData(null);
    setLoadingDay(null);
  }, []);

  // Get sorted daily results as array
  const getDailyResultsArray = useCallback((): DayResult[] => {
    if (!session) return [];
    return Array.from(session.daily_results.values()).sort((a, b) => 
      a.date.localeCompare(b.date)
    );
  }, [session]);

  return {
    session,
    selectedDayData,
    loadingDay,
    startBacktest,
    loadDayDetail,
    reset,
    getDailyResultsArray,
  };
}
