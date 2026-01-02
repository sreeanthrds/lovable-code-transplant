import { useState, useEffect, useRef, useCallback } from 'react';
import { EventSourcePolyfill } from 'event-source-polyfill';
import pako from 'pako';
import type { TradesDaily, DiagnosticsExport } from '@/types/backtest';
import { useSSELogsStore } from '@/stores/sse-logs-store';

// Event types from backend
interface TickState {
  timestamp: string;
  current_time: string;
  progress: {
    ticks_processed: number;
    total_ticks: number;
    progress_percentage: number;
  };
  active_nodes: string[];
  pending_nodes: string[];
  completed_nodes_this_tick: string[];
  open_positions: Array<{
    position_id: string;
    symbol: string;
    exchange: string;
    quantity: number;
    entry_price: number;
    current_price: number;
    unrealized_pnl: number;
    entry_time: string;
  }>;
  pnl_summary: {
    realized_pnl: string;
    unrealized_pnl: string;
    total_pnl: string;
    closed_trades: number;
    open_trades: number;
    winning_trades?: number;
    losing_trades?: number;
    win_rate?: string;
  };
  ltp_store: Record<string, number>;
  candle_data: Record<string, {
    timestamp: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
}

interface SessionTickData {
  sessionId: string;
  tickState: TickState;
  lastUpdate: string;
}

interface SessionTradesData {
  sessionId: string;
  trades: TradesDaily;
}

interface SessionDiagnosticsData {
  sessionId: string;
  diagnostics: DiagnosticsExport;
}

interface UseUserSSEResult {
  // Per-session tick data
  sessionTicks: Record<string, SessionTickData>;
  // Per-session trades
  sessionTrades: Record<string, TradesDaily>;
  // Per-session diagnostics
  sessionDiagnostics: Record<string, DiagnosticsExport>;
  // Connection state
  isConnected: boolean;
  error: string | null;
  // Control methods
  connect: () => void;
  disconnect: () => void;
}

// Parse data - handles both compressed (base64+gzip) and uncompressed JSON
function parseData(data: any): any {
  // If it's already an object, return as-is
  if (typeof data === 'object' && data !== null) {
    return data;
  }
  
  // If it's a string, try to parse it
  if (typeof data === 'string') {
    // First, try parsing as plain JSON
    try {
      return JSON.parse(data);
    } catch {
      // Not valid JSON, try base64+gzip decompression
    }
    
    // Try base64 + gzip decompression
    try {
      const binaryString = atob(data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const decompressed = pako.inflate(bytes, { to: 'string' });
      return JSON.parse(decompressed);
    } catch (error) {
      console.warn('Failed to parse data:', error);
      return null;
    }
  }
  
  return data;
}

export function useUserSSE(userId: string | null, apiBaseUrl: string | null, enabled: boolean = true): UseUserSSEResult {
  const [sessionTicks, setSessionTicks] = useState<Record<string, SessionTickData>>({});
  const [sessionTrades, setSessionTrades] = useState<Record<string, TradesDaily>>({});
  const [sessionDiagnostics, setSessionDiagnostics] = useState<Record<string, DiagnosticsExport>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const eventSourceRef = useRef<EventSourcePolyfill | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isManuallyDisconnectedRef = useRef(false);
  const enabledRef = useRef(enabled);
  const maxReconnectAttempts = 5;

  // Keep enabledRef in sync
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const disconnect = useCallback(() => {
    console.log('🔌 User SSE: Disconnecting and stopping all reconnection');
    isManuallyDisconnectedRef.current = true;
    enabledRef.current = false;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    setIsConnected(false);
    setError(null);
    reconnectAttemptsRef.current = 0;
    
    // Clear all session data on disconnect
    setSessionTicks({});
    setSessionTrades({});
    setSessionDiagnostics({});
  }, []);

  const connect = useCallback(() => {
    if (!userId || !apiBaseUrl) {
      console.log('🔌 User SSE: No user ID or API URL, skipping connection');
      return;
    }

    // Reset flags when explicitly connecting
    isManuallyDisconnectedRef.current = false;
    enabledRef.current = true;
    
    console.log('🔌 User SSE: connect() called, resetting flags');

    // Close existing connection first
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    const sseUrl = `${apiBaseUrl}/api/live-trading/stream/${userId}`;
    console.log('🔌 User SSE: Connecting to', sseUrl);
    
    useSSELogsStore.getState().addLog({
      eventType: 'connection',
      message: `Connecting to user stream: ${sseUrl}`
    });

    try {
      // Use EventSourcePolyfill to add custom headers (required for ngrok)
      const eventSource = new EventSourcePolyfill(sseUrl, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'User-Agent': 'TradeLayout-App'
        }
      });
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('✅ User SSE: Connected');
        console.log('🎧 User SSE: Listening for events: initial_state, node_events, trade_update, tick_update, session_complete');
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
        
        useSSELogsStore.getState().addLog({
          eventType: 'connection',
          message: `Connected to user stream for ${userId}`
        });
      };

      // Handle initial_state event (sent once per session on connect)
      eventSource.addEventListener('initial_state', (event) => {
        try {
          const data = JSON.parse(event.data);
          const sessionId = data.session_id;
          console.log('📡 User SSE: initial_state for', sessionId);
          
          useSSELogsStore.getState().addLog({
            eventType: 'initial_state',
            message: `Session ${sessionId}: initial_state received`,
            data: { sessionId, hasDiagnostics: !!data.diagnostics, hasTrades: !!data.trades }
          });
          
          // Parse diagnostics and trades (handles both compressed and uncompressed)
          if (data.diagnostics) {
            const diagnostics = parseData(data.diagnostics);
            if (diagnostics) {
              setSessionDiagnostics(prev => ({ ...prev, [sessionId]: diagnostics }));
              
              const eventsCount = diagnostics.events_history ? Object.keys(diagnostics.events_history).length : 0;
              useSSELogsStore.getState().addLog({
                eventType: 'initial_state',
                message: `Session ${sessionId}: Loaded ${eventsCount} events from diagnostics`,
                data: { sessionId, eventsCount }
              });
            }
          }
          if (data.trades) {
            const trades = parseData(data.trades);
            if (trades) {
              setSessionTrades(prev => ({ ...prev, [sessionId]: trades }));
            }
          }
        } catch (err) {
          console.error('❌ User SSE: Error parsing initial_state', err);
          useSSELogsStore.getState().addLog({
            eventType: 'error',
            message: `Error parsing initial_state: ${err}`
          });
        }
      });

      // Handle node_events - INCREMENTAL: Single new event(s) to merge into cache
      // Format: { exec_id: event_data } or { session_id, events: { exec_id: event_data } }
      eventSource.addEventListener('node_events', (event) => {
        try {
          const data = JSON.parse(event.data);
          const sessionId = data.session_id;
          
          // Support both formats: direct events object or nested under 'events'
          const newEvents = data.events || data;
          
          // Filter out session_id from events if present at top level
          const eventsToMerge: Record<string, any> = {};
          for (const [key, value] of Object.entries(newEvents)) {
            if (key !== 'session_id' && typeof value === 'object' && value !== null) {
              eventsToMerge[key] = value;
            }
          }
          
          const eventCount = Object.keys(eventsToMerge).length;
          if (eventCount > 0 && sessionId) {
            console.log(`📡 User SSE: node_events for ${sessionId} - ${eventCount} new event(s)`);
            
            // INCREMENTAL: Merge new events into existing events_history
            setSessionDiagnostics(prev => {
              const existing = prev[sessionId] || { events_history: {}, current_state: {} };
              return {
                ...prev,
                [sessionId]: {
                  ...existing,
                  events_history: {
                    ...existing.events_history,
                    ...eventsToMerge
                  }
                }
              };
            });
            
            useSSELogsStore.getState().addLog({
              eventType: 'node_events',
              message: `Session ${sessionId}: Merged ${eventCount} new event(s)`,
              data: { sessionId, eventCount, eventIds: Object.keys(eventsToMerge) }
            });
          }
        } catch (err) {
          console.error('❌ User SSE: Error parsing node_events', err);
          useSSELogsStore.getState().addLog({
            eventType: 'error',
            message: `Error parsing node_events: ${err}`
          });
        }
      });

      // Handle trade_update - INCREMENTAL: Single trade to append
      // Format: { session_id, trade: {...}, summary: {...} }
      eventSource.addEventListener('trade_update', (event) => {
        try {
          const data = JSON.parse(event.data);
          const sessionId = data.session_id;
          const trade = data.trade;
          const summary = data.summary;
          
          if (sessionId && trade) {
            console.log(`✅ Trade closed: ${trade.symbol || 'unknown'} PnL: ${trade.pnl}`);
            
            // INCREMENTAL: Append single trade to existing trades array
            setSessionTrades(prev => {
              const existing = prev[sessionId] || { trades: [], summary: {} };
              return {
                ...prev,
                [sessionId]: {
                  trades: [...existing.trades, trade],
                  summary: summary || existing.summary
                }
              };
            });
            
            useSSELogsStore.getState().addLog({
              eventType: 'trade_update',
              message: `Session ${sessionId}: Trade ${trade.symbol || 'unknown'} closed, PnL: ${trade.pnl}`,
              data: { sessionId, trade, summary }
            });
          }
        } catch (err) {
          console.error('❌ User SSE: Error parsing trade_update', err);
          useSSELogsStore.getState().addLog({
            eventType: 'error',
            message: `Error parsing trade_update: ${err}`
          });
        }
      });

      // Handle tick_update (P&L, positions, LTP) - most frequent event
      eventSource.addEventListener('tick_update', (event) => {
        try {
          const data = JSON.parse(event.data);
          const sessionId = data.session_id;
          const tickState = data.tick_state as TickState;
          
          // DEBUG: Log LTP and position data
          const ltpCount = tickState.ltp_store ? Object.keys(tickState.ltp_store).length : 0;
          const posCount = tickState.open_positions?.length || 0;
          console.log(`🔴 TICK_UPDATE: Session ${sessionId.slice(0,12)} | LTP: ${ltpCount} symbols | Positions: ${posCount}`);
          
          setSessionTicks(prev => ({
            ...prev,
            [sessionId]: {
              sessionId,
              tickState,
              lastUpdate: tickState.timestamp
            }
          }));
          
          // Log detailed state every few ticks
          const tick = tickState.progress?.ticks_processed || 0;
          if (tick % 100 === 0 || ltpCount > 0) {
            console.log(`📊 ${sessionId.slice(0,12)}: Tick ${tick} | ${posCount} pos | P&L: ₹${tickState.pnl_summary?.total_pnl || '0'} | LTP: ${ltpCount}`);
          }
        } catch (err) {
          console.error('❌ User SSE: Error parsing tick_update', err);
        }
      });

      // Handle session_complete - mark session as completed
      eventSource.addEventListener('session_complete', (event) => {
        try {
          const data = JSON.parse(event.data);
          const sessionId = data.session_id;
          console.log(`🏁 Session ${sessionId} completed`);
          
          useSSELogsStore.getState().addLog({
            eventType: 'session_complete',
            message: `Session ${sessionId} completed`,
            data: { sessionId, finalSummary: data.final_summary }
          });
          
          // Notify parent components that session completed
          // They should update strategy status to 'completed' and isLive to false
          const completionEvent = new CustomEvent('session_completed', { 
            detail: { sessionId, finalSummary: data.final_summary } 
          });
          window.dispatchEvent(completionEvent);
        } catch (err) {
          console.error('❌ User SSE: Error parsing session_complete', err);
        }
      });

      // Handle heartbeat (keep-alive) - silent to avoid console flood
      eventSource.addEventListener('heartbeat', (event) => {
        // Heartbeat received - no logging
      });

      // Handle generic message (fallback) - silent
      eventSource.onmessage = (event) => {
        // Generic message - no logging
      };

      eventSource.onerror = (error) => {
        console.error('❌ User SSE: Connection error', error);
        console.log('📊 User SSE: ReadyState:', eventSource.readyState, '(0=CONNECTING, 1=OPEN, 2=CLOSED)');
        setIsConnected(false);
        
        // Close the current connection
        eventSource.close();
        eventSourceRef.current = null;

        // Don't reconnect if manually disconnected
        if (isManuallyDisconnectedRef.current) {
          console.log('🔌 User SSE: Manual disconnect, not reconnecting');
          return;
        }

        // Don't reconnect if disabled (use ref for current value)
        if (!enabledRef.current) {
          console.log('🔌 User SSE: Connection disabled, not reconnecting');
          return;
        }

        // Attempt to reconnect with exponential backoff
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          console.log(`🔄 User SSE: Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        } else {
          setError('Failed to connect to live updates. Please refresh the page.');
        }
      };
    } catch (err) {
      console.error('❌ User SSE: Failed to create EventSource', err);
      setError('Failed to establish SSE connection');
    }
  }, [userId, apiBaseUrl, enabled]);

  // Auto-disconnect when disabled changes to false
  useEffect(() => {
    if (!enabled && eventSourceRef.current) {
      console.log('🔌 User SSE: Disabled, auto-disconnecting');
      disconnect();
    }
  }, [enabled, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isManuallyDisconnectedRef.current = true;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return {
    sessionTicks,
    sessionTrades,
    sessionDiagnostics,
    isConnected,
    error,
    connect,
    disconnect
  };
}
