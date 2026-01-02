import { useState, useEffect, useRef, useCallback } from 'react';
import type { Trade, DailySummary, ExecutionNode } from '@/types/backtest';

interface UseSSELiveDataOptions {
  userId: string | null;
  strategyId: string;
  sessionId?: string | null; // Existing session ID from Start Trading
  backtestDate: string;
  enabled?: boolean;
  speedMultiplier?: number;
}

interface LiveData {
  trades: Trade[];
  summary: DailySummary;
  eventsHistory: Record<string, ExecutionNode>;
  isConnected: boolean;
  connectionStatus: string;
  lastHeartbeat: Date | null;
  currentTime: string | null;
}

const API_BASE = 'http://localhost:8000';

export function useSSELiveData({ userId, strategyId, sessionId: externalSessionId, backtestDate, enabled = true, speedMultiplier = 500 }: UseSSELiveDataOptions) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [eventsHistory, setEventsHistory] = useState<Record<string, ExecutionNode>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [lastHeartbeat, setLastHeartbeat] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string | null>(null);
  const [initialStateLoaded, setInitialStateLoaded] = useState(false);
  
  // Track last IDs for delta updates
  const lastEventIdRef = useRef<string | null>(null);
  const lastTradeIdRef = useRef<string | null>(null);
  
  const eventSourceRef = useRef<EventSource | null>(null);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
      setConnectionStatus('disconnected');
      console.log('SSE Disconnected');
    }
  }, []);

  // Load initial state first (for reconnection support)
  useEffect(() => {
    if (!enabled || !userId) {
      return;
    }

    const loadInitialState = async () => {
      try {
        console.log('📥 Loading initial state...');
        setConnectionStatus('loading-state');
        
        // Build query params
        const params = new URLSearchParams({
          backtest_date: backtestDate
        });
        
        // Add delta params if we have them (reconnection)
        if (lastEventIdRef.current) {
          params.append('last_event_id', lastEventIdRef.current);
        }
        if (lastTradeIdRef.current) {
          params.append('last_trade_id', lastTradeIdRef.current);
        }
        
        const response = await fetch(
          `${API_BASE}/api/simple/live/initial-state/${userId}/${strategyId}?${params}`
        );
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Initial state loaded:', {
            eventCount: data.event_count,
            tradeCount: data.trade_count,
            isDelta: data.is_delta
          });
          
          // Merge initial state
          if (data.is_delta) {
            // Delta: merge with existing state
            setEventsHistory(prev => ({ ...prev, ...data.events }));
            setTrades(prev => {
              const tradeMap = new Map(prev.map(t => [t.trade_id, t]));
              data.trades.forEach((t: Trade) => tradeMap.set(t.trade_id, t));
              return Array.from(tradeMap.values());
            });
          } else {
            // Full state: replace
            setEventsHistory(data.events || {});
            setTrades(data.trades || []);
          }
          
          setInitialStateLoaded(true);
        } else if (response.status === 404) {
          // No previous state - fresh start
          console.log('ℹ️  No previous state found - fresh start');
          setInitialStateLoaded(true);
        } else {
          console.warn('⚠️  Failed to load initial state:', response.status);
          setInitialStateLoaded(true); // Continue anyway
        }
      } catch (err: any) {
        console.error('❌ Error loading initial state:', err);
        setInitialStateLoaded(true); // Continue anyway
      }
    };

    loadInitialState();
  }, [userId, strategyId, backtestDate, enabled]);

  // NOTE: Session start is now handled by "Start Trading" button
  // This hook only views existing sessions via SSE
  // externalSessionId comes from strategy.backendSessionId

  // Connect to SSE stream for existing session
  useEffect(() => {
    if (!enabled || !externalSessionId) {
      disconnect();
      return;
    }

    disconnect();
    setError(null);
    setConnectionStatus('connecting');

    const url = `${API_BASE}/api/simple/live/stream/${externalSessionId}`;
    console.log('🔌 Connecting to SSE:', url);

    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('✅ SSE Connected');
      setIsConnected(true);
      setConnectionStatus('connected');
    };

    // Simple pattern: just 'data' event with accumulated + delta
    eventSource.addEventListener('data', (event) => {
      try {
        const data = JSON.parse(event.data);
        
        console.log('📊 SSE Data received:', {
          hasTrades: !!data.accumulated?.trades?.length,
          tradesCount: data.accumulated?.trades?.length || 0,
          summary: data.accumulated?.summary,
          currentTime: data.current_time,
          status: data.status
        });
        
        // Use accumulated data (all trades/events so far)
        if (data.accumulated) {
          const newTrades = data.accumulated.trades || [];
          const newEvents = data.accumulated.events_history || {};
          
          // Deduplicate trades by trade_id (keep latest version only)
          const tradesMap = new Map<string, Trade>();
          newTrades.forEach((trade: Trade) => {
            tradesMap.set(trade.trade_id, trade);
          });
          const uniqueTrades = Array.from(tradesMap.values());
          
          setTrades(uniqueTrades);
          setEventsHistory(newEvents);
          
          // Track last IDs for potential reconnection
          if (newTrades.length > 0) {
            const lastTrade = newTrades[newTrades.length - 1];
            lastTradeIdRef.current = lastTrade.trade_id;
          }
          
          const eventIds = Object.keys(newEvents);
          if (eventIds.length > 0) {
            lastEventIdRef.current = eventIds[eventIds.length - 1];
          }
        }
        
        // Update current backtest time
        if (data.current_time) {
          setCurrentTime(data.current_time);
        }
        
        // Update heartbeat
        setLastHeartbeat(new Date(data.timestamp));
        
        // Check status
        if (data.status === 'completed') {
          setConnectionStatus('completed');
        }
      } catch (err) {
        console.error('❌ Error parsing data:', err);
      }
    });

    eventSource.addEventListener('completed', (event) => {
      console.log('🏁 Session completed');
      try {
        const data = JSON.parse(event.data);
        if (data.accumulated) {
          setTrades(data.accumulated.trades || []);
          setEventsHistory(data.accumulated.events_history || {});
        }
        setConnectionStatus('completed');
      } catch (err) {
        console.error('❌ Error parsing completed:', err);
      }
    });

    eventSource.onerror = (error) => {
      console.error('❌ SSE Connection Error:', error);
      setConnectionStatus('error');
      setIsConnected(false);
      setError('Connection error. No active sessions or server is down.');
    };

    return () => {
      disconnect();
    };
  }, [externalSessionId, enabled, disconnect]);

  // Calculate summary from trades
  const summary: DailySummary = {
    total_trades: trades.length,
    total_pnl: trades.reduce((sum, t) => sum + parseFloat(String(t.pnl || 0)), 0).toFixed(2),
    winning_trades: trades.filter(t => parseFloat(String(t.pnl || 0)) > 0).length,
    losing_trades: trades.filter(t => parseFloat(String(t.pnl || 0)) <= 0).length,
    win_rate: trades.length > 0 
      ? ((trades.filter(t => parseFloat(String(t.pnl || 0)) > 0).length / trades.length) * 100).toFixed(1)
      : '0'
  };

  return {
    trades,
    summary,
    eventsHistory,
    isConnected,
    connectionStatus,
    lastHeartbeat,
    currentTime,
    error,
    disconnect
  };
}
