import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppAuth } from '@/contexts/AuthContext';
import { Strategy, WebSocketMessage, ConnectionStatus } from '@/types/live-trading-websocket';
import { getApiBaseUrl } from '@/lib/api-config';

const DEFAULT_WEBSOCKET_BASE_URL = 'wss://api.tradelayout.com/ws/live-trading';
const RECONNECT_DELAYS = [1000, 2000, 5000, 10000, 30000]; // Exponential backoff

// Convert HTTP URL to WebSocket URL
const toWebSocketUrl = (httpUrl: string): string => {
  return httpUrl
    .replace(/^https:\/\//, 'wss://')
    .replace(/^http:\/\//, 'ws://');
};

export function useDashboardWebSocket() {
  const { userId, isLoaded } = useAppAuth();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [wsBaseUrl, setWsBaseUrl] = useState<string>(DEFAULT_WEBSOCKET_BASE_URL);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch API base URL from config and convert to WebSocket URL
  useEffect(() => {
    const fetchWsUrl = async () => {
      if (!userId) return;
      try {
        const apiBaseUrl = await getApiBaseUrl(userId);
        // Convert HTTP base URL to WebSocket URL for live trading
        const wsUrl = `${toWebSocketUrl(apiBaseUrl.replace(/\/+$/, ''))}/ws/live-trading`;
        console.log('🔗 WebSocket URL from config:', wsUrl);
        setWsBaseUrl(wsUrl);
      } catch (err) {
        console.warn('Failed to get API config, using default WebSocket URL:', err);
      }
    };
    fetchWsUrl();
  }, [userId]);

  const connect = useCallback(() => {
    if (!userId) {
      console.log('No userId available, skipping WebSocket connection');
      return;
    }

    // Clean up existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    const wsUrl = `${wsBaseUrl}/${userId}`;
    console.log('🔌 Connecting to Dashboard WebSocket:', wsUrl);
    setConnectionStatus('connecting');
    setError(null);

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ Dashboard WebSocket connected');
        setConnectionStatus('connected');
        reconnectAttemptRef.current = 0;
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('📨 Dashboard received:', message.type, message);

          if (message.strategy_id && message.data) {
            // Update specific strategy
            setStrategies((prev) => {
              const existingIndex = prev.findIndex(s => s.strategy_id === message.strategy_id);
              
              if (existingIndex >= 0) {
                // Update existing strategy
                const updated = [...prev];
                updated[existingIndex] = {
                  ...updated[existingIndex],
                  ...message.data,
                  strategy_id: message.strategy_id
                };
                return updated;
              } else {
                // Add new strategy
                return [...prev, { ...message.data, strategy_id: message.strategy_id }];
              }
            });
          }
        } catch (err) {
          console.error('❌ Error parsing Dashboard WebSocket message:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('❌ Dashboard WebSocket error:', event);
        setError('Connection error occurred');
      };

      ws.onclose = (event) => {
        console.log('🔌 Dashboard WebSocket closed:', event.code, event.reason);
        wsRef.current = null;

        if (event.code !== 1000) {
          // Attempt to reconnect with exponential backoff
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
      console.error('❌ Error creating Dashboard WebSocket:', err);
      setConnectionStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to create WebSocket connection');
    }
  }, [userId, wsBaseUrl]);

  useEffect(() => {
    connect();

    return () => {
      console.log('🧹 Cleaning up Dashboard WebSocket connection');
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting');
      }
    };
  }, [connect]);

  const updateStrategy = useCallback((strategyId: string, updates: Partial<Strategy>) => {
    setStrategies(prev => 
      prev.map(s => s.strategy_id === strategyId ? { ...s, ...updates } : s)
    );
  }, []);

  const removeStrategy = useCallback((strategyId: string) => {
    setStrategies(prev => prev.filter(s => s.strategy_id !== strategyId));
  }, []);

  return {
    strategies,
    connectionStatus,
    error,
    isConnected: connectionStatus === 'connected',
    isConnecting: connectionStatus === 'connecting',
    isReconnecting: connectionStatus === 'reconnecting',
    updateStrategy,
    removeStrategy
  };
}
