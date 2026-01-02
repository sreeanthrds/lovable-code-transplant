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

      // Connect to SSE stream using fetch (supports custom headers)
      const streamUrl = `${baseUrl}${data.stream_url}`;
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const streamResponse = await fetch(streamUrl, {
        headers: {
          'Accept': 'text/event-stream',
          'ngrok-skip-browser-warning': 'true',
        },
        signal: abortController.signal,
      });

      if (!streamResponse.ok) {
        throw new Error('Failed to connect to SSE stream');
      }

      const reader = streamResponse.body?.getReader();
      if (!reader) {
        throw new Error('No readable stream available');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      // Process the stream
      const processStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              console.log('SSE stream ended');
              // Process any remaining buffer - may contain multiple events
              if (buffer.trim()) {
                const remainingEvents = buffer.split('\n\n');
                for (const eventText of remainingEvents) {
                  if (!eventText.trim()) continue;
                  const parsed = parseSSEEvent(eventText);
                  if (parsed) {
                    handleSSEEvent(parsed.event, parsed.data);
                  }
                }
              }
              // If stream ended but status is still streaming, mark as completed
              setSession(prev => {
                if (!prev || prev.status === 'completed' || prev.status === 'failed') return prev;
                return { ...prev, status: 'completed', progress: 100 };
              });
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            
            // Normalize line endings - handle both \r\n and \n
            buffer = buffer.replace(/\r\n/g, '\n');
            
            console.log('Buffer received, length:', buffer.length);
            console.log('Has double newline:', buffer.includes('\n\n'));
            console.log('Newline count:', (buffer.match(/\n/g) || []).length);
            
            // Split by double newlines (SSE event separator)
            const events = buffer.split('\n\n');
            buffer = events.pop() || ''; // Keep incomplete event in buffer

            console.log('Split into', events.length, 'events, remaining buffer:', buffer.length);
            for (const eventText of events) {
              if (!eventText.trim()) continue;
              
              const parsed = parseSSEEvent(eventText);
              if (!parsed) {
                console.log('Failed to parse event:', eventText.substring(0, 100));
                continue;
              }

              console.log('Parsed event:', parsed.event);
              handleSSEEvent(parsed.event, parsed.data);
            }
          }
        } catch (err) {
          if ((err as Error).name === 'AbortError') {
            console.log('SSE stream aborted');
            return;
          }
          console.error('SSE stream error:', err);
          setSession(prev => {
            if (!prev || prev.status === 'completed') return prev;
            return {
              ...prev,
              status: 'failed',
              error: 'Connection to server lost',
            };
          });
        }
      };

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

      // Start processing the stream
      processStream();

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

      for (const [fileName, file] of Object.entries(zip.files)) {
        if (file.dir) continue;
        
        const fileData = await file.async('uint8array');
        
        if (fileName.includes('trades_daily')) {
          const decompressed = pako.ungzip(fileData, { to: 'string' });
          trades = JSON.parse(decompressed);
        } else if (fileName.includes('diagnostics_export')) {
          const decompressed = pako.ungzip(fileData, { to: 'string' });
          diagnostics = JSON.parse(decompressed);
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
        throw new Error('Missing trades or diagnostics data in ZIP');
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
