import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppAuth } from '@/contexts/AuthContext';
import { Strategy, WebSocketMessage, ConnectionStatus } from '@/types/live-trading-websocket';

const WEBSOCKET_BASE_URL = 'wss://api.tradelayout.com/ws/live-trading';
const RECONNECT_DELAYS = [1000, 2000, 5000, 10000, 30000]; // Exponential backoff

export function useStrategyWebSocket(strategyId: string | undefined) {
  const { userId } = useAppAuth();
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (!userId || !strategyId) {
      console.log('Missing userId or strategyId, skipping WebSocket connection');
      return;
    }

    // Clean up existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    const wsUrl = `${WEBSOCKET_BASE_URL}/${userId}/${strategyId}`;
    console.log('🔌 Connecting to Strategy WebSocket:', wsUrl);
    setConnectionStatus('connecting');
    setError(null);

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ Strategy WebSocket connected');
        setConnectionStatus('connected');
        reconnectAttemptRef.current = 0;
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('📨 Strategy received:', message.type, message);

          if (message.data) {
            setStrategy(prev => ({
              ...prev,
              ...message.data,
              strategy_id: strategyId
            } as Strategy));
          }
        } catch (err) {
          console.error('❌ Error parsing Strategy WebSocket message:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('❌ Strategy WebSocket error:', event);
        setError('Connection error occurred');
      };

      ws.onclose = (event) => {
        console.log('🔌 Strategy WebSocket closed:', event.code, event.reason);
        wsRef.current = null;

        if (event.code !== 1000) {
          const delay = RECONNECT_DELAYS[Math.min(reconnectAttemptRef.current, RECONNECT_DELAYS.length - 1)];
          
          setConnectionStatus('reconnecting');
          console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttemptRef.current + 1})...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptRef.current += 1;
            connect();
          }, delay);
        } else {
          setConnectionStatus('disconnected');
        }
      };
    } catch (err) {
      console.error('❌ Error creating Strategy WebSocket:', err);
      setConnectionStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to create WebSocket connection');
    }
  }, [userId, strategyId]);

  useEffect(() => {
    connect();

    return () => {
      console.log('🧹 Cleaning up Strategy WebSocket connection');
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting');
      }
    };
  }, [connect]);

  return {
    strategy,
    connectionStatus,
    error,
    isConnected: connectionStatus === 'connected',
    isConnecting: connectionStatus === 'connecting',
    isReconnecting: connectionStatus === 'reconnecting'
  };
}
