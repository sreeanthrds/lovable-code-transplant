import { useState, useEffect, useRef, useCallback } from 'react';
import type { TickUpdate } from '@/types/live-trade-sse';
import type { ExecutionNode } from '@/types/backtest';
import { getApiBaseUrl } from '@/lib/api-config';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { useSSELogsStore } from '@/stores/sse-logs-store';

interface Trade {
  trade_id?: string;
  position_id?: string;
  symbol: string;
  side: string;
  quantity: number;
  entry_price: number;
  exit_price?: number;
  pnl?: number;
  pnl_percent?: number;
  entry_flow_ids?: string[];
  exit_flow_ids?: string[];
  entry_time?: string;
  exit_time?: string;
  status?: string;
  [key: string]: any;
}

interface TradesSummary {
  total_pnl?: string | number;
  closed_trades?: number;
  win_rate?: string | number;
  [key: string]: any;
}

interface UseLiveReportSSEResult {
  tickData: TickUpdate | null;
  eventsHistory: Record<string, ExecutionNode>;
  trades: Trade[];
  tradesSummary: TradesSummary;
  isConnected: boolean;
  error: string | null;
  lastEventId: number | null;
  connect: () => void;
  disconnect: () => void;
}

/**
 * SSE hook for Live Report with events_history support
 * 
 * December 2024 Migration:
 * - All events now plain JSON (no compression)
 * - initial_state: Contains full diagnostics.events_history
 * - node_events: Single new event only (not full history)
 * - tick_update: Live positions/P&L
 * - trade_update: Trade with entry_flow_ids/exit_flow_ids
 */
export function useLiveReportSSE(sessionId: string | null, userId?: string): UseLiveReportSSEResult {
  const [tickData, setTickData] = useState<TickUpdate | null>(null);
  const [eventsHistory, setEventsHistory] = useState<Record<string, ExecutionNode>>({});
  const [trades, setTrades] = useState<Trade[]>([]);
  const [tradesSummary, setTradesSummary] = useState<TradesSummary>({});
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastEventId, setLastEventId] = useState<number | null>(null);
  const [apiBaseUrl, setApiBaseUrl] = useState<string | null>(null);
  const [notFoundSessionId, setNotFoundSessionId] = useState<string | null>(null); // Track 404'd session
  
  const eventSourceRef = useRef<EventSourcePolyfill | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isManuallyDisconnectedRef = useRef(false);
  const isConnectingRef = useRef(false); // Prevent concurrent connect calls
  const lastConnectTimeRef = useRef<number>(0); // Track quick failures
  const maxReconnectAttempts = 5;

  // Initialize API base URL
  useEffect(() => {
    const initUrl = async () => {
      try {
        const url = await getApiBaseUrl(userId);
        setApiBaseUrl(url);
      } catch (err) {
        console.error('Failed to get API base URL:', err);
        // Fallback to production URL
        setApiBaseUrl('https://api.tradelayout.com');
      }
    };
    initUrl();
  }, [userId]);

  const connect = useCallback(async () => {
    if (!sessionId || !apiBaseUrl) {
      console.log('🔌 LiveSSE: No session ID or API URL, skipping connection');
      return;
    }

    if (isManuallyDisconnectedRef.current) {
      console.log('🔌 LiveSSE: Manually disconnected, skipping reconnect');
      return;
    }

    // Prevent concurrent connect calls
    if (isConnectingRef.current) {
      console.log('🔌 LiveSSE: Already connecting, skipping');
      return;
    }
    
    isConnectingRef.current = true;

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const sseUrl = `${apiBaseUrl}/api/live-trading/session/${sessionId}/stream`;
    console.log('🔌 LiveSSE: Connecting to', sseUrl);
    
    // Log connection attempt
    useSSELogsStore.getState().addLog({
      eventType: 'connection',
      message: `Connecting to ${sseUrl}`
    });

    // First, verify the session exists with a HEAD/GET request to avoid endless 404 retries
    try {
      const checkUrl = `${apiBaseUrl}/api/live-trading/session/${sessionId}/status`;
      const checkResponse = await fetch(checkUrl, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      if (checkResponse.status === 404) {
        console.log('❌ LiveSSE: Session not found (404), not connecting');
        setError('Session not found. It may have ended or been removed.');
        setIsConnected(false);
        setNotFoundSessionId(sessionId); // Mark this session as not found
        isConnectingRef.current = false;
        useSSELogsStore.getState().addLog({
          eventType: 'error',
          message: `Session ${sessionId} not found (404) - not retrying`
        });
        return;
      }
    } catch (checkErr) {
      // If check fails, still try SSE (might be a different endpoint structure)
      console.log('⚠️ LiveSSE: Session check failed, attempting SSE anyway');
    }

    try {
      // Track connection time to detect quick failures (404s)
      lastConnectTimeRef.current = Date.now();
      
      // Use EventSourcePolyfill to support custom headers
      const eventSource = new EventSourcePolyfill(sseUrl, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('✅ LiveSSE: Connected to', sseUrl);
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
        isConnectingRef.current = false;
        
        useSSELogsStore.getState().addLog({
          eventType: 'connection',
          message: `Connected successfully to session ${sessionId}`
        });
      };

      // Generic message handler to catch all events
      eventSource.onmessage = (event) => {
        console.log('📨 LiveSSE: Generic message received:', event.data?.substring(0, 200));
      };

      // Handle initial_state - plain JSON with diagnostics.events_history
      eventSource.addEventListener('initial_state', (event) => {
        try {
          console.log('📦 LiveSSE: Received initial_state event');
          const data = JSON.parse(event.data);
          
          // Get diagnostics with events_history
          if (data.diagnostics?.events_history) {
            const eventCount = Object.keys(data.diagnostics.events_history).length;
            console.log(`📦 LiveSSE: Loaded ${eventCount} events from initial_state`);
            setEventsHistory(data.diagnostics.events_history);
            
            useSSELogsStore.getState().addLog({
              eventType: 'initial_state',
              message: `Loaded ${eventCount} events from initial_state`,
              data: { eventCount, sampleKeys: Object.keys(data.diagnostics.events_history).slice(0, 3) }
            });
          }
          
          // Get trades data - Full snapshot on initial_state
          if (data.trades) {
            const tradesArray = data.trades.trades || [];
            const summary = data.trades.summary || {};
            console.log(`📦 LiveSSE: Loaded ${tradesArray.length} trades from initial_state`);
            setTrades(tradesArray);
            setTradesSummary(summary);
            
            useSSELogsStore.getState().addLog({
              eventType: 'initial_state',
              message: `Loaded ${tradesArray.length} trades from initial_state`,
              data: { tradesCount: tradesArray.length, summary }
            });
          }
        } catch (err) {
          console.error('❌ LiveSSE: Error parsing initial_state', err);
          useSSELogsStore.getState().addLog({
            eventType: 'error',
            message: `Error parsing initial_state: ${err}`
          });
        }
      });

      // Handle tick_update - merge node_executions into eventsHistory
      eventSource.addEventListener('tick_update', (event) => {
        try {
          const data: TickUpdate = JSON.parse(event.data);
          
          // Update tick data (complete state)
          setTickData(data);
          setLastEventId(data.event_id);
          
          // Merge node_executions into eventsHistory
          if (data.node_executions && Object.keys(data.node_executions).length > 0) {
            const execCount = Object.keys(data.node_executions).length;
            setEventsHistory(prev => ({
              ...prev,
              ...data.node_executions as unknown as Record<string, ExecutionNode>
            }));
            
            // Log node executions from tick_update
            useSSELogsStore.getState().addLog({
              eventType: 'tick_update',
              message: `Tick ${data.tick}: ${execCount} node executions, ${data.open_positions.length} open, ${data.closed_positions.length} closed`,
              data: { tick: data.tick, executions: Object.keys(data.node_executions) }
            });
          }
          
          // Debug log (throttled)
          if (data.tick % 100 === 0) {
            console.log(`📡 LiveSSE: tick ${data.tick}, ${data.open_positions.length} open, ${data.closed_positions.length} closed`);
          }
        } catch (err) {
          console.error('❌ LiveSSE: Error parsing tick_update', err);
        }
      });

      // Handle node_events - plain JSON, single new event per emission
      eventSource.addEventListener('node_events', (event) => {
        try {
          // Plain JSON: {exec_id: event_data}
          const newEvents = JSON.parse(event.data) as Record<string, ExecutionNode>;
          if (newEvents && typeof newEvents === 'object') {
            const eventCount = Object.keys(newEvents).length;
            const eventKeys = Object.keys(newEvents);
            console.log(`🔔 LiveSSE: Received ${eventCount} node event(s)`);
            
            // Merge single event into eventsHistory cache
            setEventsHistory(prev => ({
              ...prev,
              ...newEvents
            }));
            
            // Log each node event
            eventKeys.forEach(key => {
              const nodeEvent = newEvents[key];
              useSSELogsStore.getState().addLog({
                eventType: 'node_events',
                message: `Node event: ${key} - ${nodeEvent.node_name || 'unknown'} (${nodeEvent.node_type || 'unknown'})`,
                data: { execution_id: key, ...nodeEvent }
              });
            });
          }
        } catch (err) {
          console.error('❌ LiveSSE: Error parsing node_events', err);
          useSSELogsStore.getState().addLog({
            eventType: 'error',
            message: `Error parsing node_events: ${err}`
          });
        }
      });

      // Handle trade_update - INCREMENTAL: Single trade to append
      // Format: { trade: {...}, summary: {...} }
      eventSource.addEventListener('trade_update', (event) => {
        try {
          const data = JSON.parse(event.data);
          const trade = data.trade;
          const summary = data.summary;
          
          if (trade) {
            console.log(`💰 LiveSSE: Trade closed, P&L: ${trade.pnl}`);
            
            // INCREMENTAL: Append single trade to existing trades array
            setTrades(prev => [...prev, trade]);
            
            // Update summary if provided
            if (summary) {
              setTradesSummary(summary);
            }
            
            useSSELogsStore.getState().addLog({
              eventType: 'trade_update',
              message: `Trade closed: ${trade.symbol || 'unknown'} P&L: ${trade.pnl}`,
              data: { trade, summary }
            });
          }
        } catch (err) {
          console.error('❌ LiveSSE: Error parsing trade_update', err);
        }
      });

      // Handle session_complete - plain JSON
      eventSource.addEventListener('session_complete', (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('🏁 LiveSSE: Session complete', data.final_summary);
          
          useSSELogsStore.getState().addLog({
            eventType: 'session_complete',
            message: `Session complete`,
            data: data.final_summary
          });
        } catch (err) {
          console.error('❌ LiveSSE: Error parsing session_complete', err);
        }
      });

      eventSource.onerror = (err) => {
        console.error('❌ LiveSSE: Connection error', err);
        setIsConnected(false);
        
        eventSource.close();
        eventSourceRef.current = null;

        // Check if this is a quick failure (indicates 404 or server error)
        const timeSinceConnect = Date.now() - lastConnectTimeRef.current;
        const isQuickFailure = timeSinceConnect < 2000; // Failed within 2 seconds
        
        // If failing quickly multiple times, likely a 404 - stop retrying
        if (isQuickFailure && reconnectAttemptsRef.current >= 2) {
          console.log('🔌 LiveSSE: Multiple quick failures detected, session likely does not exist');
          setError('Session not found or unavailable. It may have ended.');
          setNotFoundSessionId(sessionId);
          isConnectingRef.current = false;
          useSSELogsStore.getState().addLog({
            eventType: 'error',
            message: `Session connection failed repeatedly - stopping retries`
          });
          return;
        }
        
        useSSELogsStore.getState().addLog({
          eventType: 'error',
          message: `Connection error - will retry (attempt ${reconnectAttemptsRef.current + 1})`
        });

        isConnectingRef.current = false;

        // Reconnect with exponential backoff
        if (!isManuallyDisconnectedRef.current && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          console.log(`🔄 LiveSSE: Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setError('Connection lost. Please refresh the page.');
        }
      };
    } catch (err) {
      console.error('❌ LiveSSE: Failed to create EventSource', err);
      setError('Failed to establish connection');
      isConnectingRef.current = false;
    }
  }, [sessionId, apiBaseUrl, notFoundSessionId]);

  const disconnect = useCallback(() => {
    console.log('🔌 LiveSSE: Disconnecting');
    isManuallyDisconnectedRef.current = true;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    setIsConnected(false);
    setTickData(null);
    setEventsHistory({});
    setTrades([]);
    setTradesSummary({});
    setLastEventId(null);
    reconnectAttemptsRef.current = 0;
  }, []);

  // Connect/disconnect on sessionId or apiBaseUrl change
  useEffect(() => {
    // Skip if this session was already marked as not found
    if (sessionId && sessionId === notFoundSessionId) {
      console.log('🔌 LiveSSE: Session was marked as not found, not connecting');
      return;
    }
    
    if (sessionId && apiBaseUrl) {
      isManuallyDisconnectedRef.current = false;
      isConnectingRef.current = false;
      reconnectAttemptsRef.current = 0; // Reset retry count
      setTickData(null);
      setEventsHistory({});
      setTrades([]);
      setTradesSummary({});
      setError(null);
      setLastEventId(null);
      connect();
    } else {
      disconnect();
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [sessionId, apiBaseUrl, connect, disconnect]);

  return {
    tickData,
    eventsHistory,
    trades,
    tradesSummary,
    isConnected,
    error,
    lastEventId,
    connect,
    disconnect
  };
}
