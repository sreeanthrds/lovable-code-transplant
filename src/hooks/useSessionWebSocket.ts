import { useState, useEffect, useRef, useCallback } from 'react';
import { ConnectionStatus } from '@/types/live-trading-websocket';
import { LiveSessionData } from '@/types/live-trading-data';

const RECONNECT_DELAYS = [1000, 2000, 5000, 10000, 30000];
const MAX_RECONNECT_ATTEMPTS = 10;

interface UseSessionWebSocketProps {
  sessionId: string | null;
  onDataUpdate?: (data: LiveSessionData) => void;
}

export function useSessionWebSocket({ sessionId, onDataUpdate }: UseSessionWebSocketProps) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<LiveSessionData | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onDataUpdateRef = useRef(onDataUpdate);
  const isConnectingRef = useRef(false);

  // Keep callback ref updated without triggering reconnects
  useEffect(() => {
    onDataUpdateRef.current = onDataUpdate;
  }, [onDataUpdate]);

  const connect = useCallback(() => {
    if (!sessionId) {
      console.log('No sessionId available, skipping WebSocket connection');
      return;
    }

    // Prevent multiple simultaneous connection attempts
    if (isConnectingRef.current || wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('Connection already in progress or established, skipping');
      return;
    }

    // Clean up existing connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    isConnectingRef.current = true;
    const wsUrl = `wss://api.tradelayout.com/api/live-trading/session/${sessionId}/ws`;
    console.log('🔌 Connecting to Session WebSocket:', wsUrl);
    setConnectionStatus('connecting');
    setError(null);

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ Session WebSocket connected for session:', sessionId);
        setConnectionStatus('connected');
        reconnectAttemptRef.current = 0;
        isConnectingRef.current = false;
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data: LiveSessionData = JSON.parse(event.data);
          console.log('📨 Session data received:', data);
          
          setSessionData(data);
          onDataUpdateRef.current?.(data);
        } catch (err) {
          console.error('❌ Error parsing Session WebSocket message:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('❌ Session WebSocket error:', event);
        setError('Connection error occurred');
        isConnectingRef.current = false;
      };

      ws.onclose = (event) => {
        console.log('🔌 Session WebSocket closed:', event.code, event.reason);
        wsRef.current = null;
        isConnectingRef.current = false;

        if (event.code !== 1000 && reconnectAttemptRef.current < MAX_RECONNECT_ATTEMPTS) {
          // Attempt to reconnect with exponential backoff
          const delay = RECONNECT_DELAYS[Math.min(reconnectAttemptRef.current, RECONNECT_DELAYS.length - 1)];
          
          setConnectionStatus('reconnecting');
          console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttemptRef.current + 1}/${MAX_RECONNECT_ATTEMPTS})...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptRef.current += 1;
            connect();
          }, delay);
        } else if (reconnectAttemptRef.current >= MAX_RECONNECT_ATTEMPTS) {
          console.log('❌ Max reconnection attempts reached, giving up');
          setConnectionStatus('error');
          setError('Failed to connect after maximum attempts');
        } else {
          setConnectionStatus('disconnected');
        }
      };
    } catch (err) {
      console.error('❌ Error creating Session WebSocket:', err);
      setConnectionStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to create WebSocket connection');
      isConnectingRef.current = false;
    }
  }, [sessionId]); // Only depend on sessionId, not onDataUpdate

  useEffect(() => {
    if (sessionId) {
      // Reset reconnect attempts when sessionId changes
      reconnectAttemptRef.current = 0;
      connect();
    }

    return () => {
      console.log('🧹 Cleaning up Session WebSocket connection');
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting');
        wsRef.current = null;
      }
      isConnectingRef.current = false;
    };
  }, [connect, sessionId]);

  const disconnect = useCallback(() => {
    reconnectAttemptRef.current = MAX_RECONNECT_ATTEMPTS; // Prevent auto-reconnect
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    setConnectionStatus('disconnected');
  }, []);

  return {
    sessionData,
    connectionStatus,
    error,
    isConnected: connectionStatus === 'connected',
    isConnecting: connectionStatus === 'connecting',
    isReconnecting: connectionStatus === 'reconnecting',
    disconnect
  };
}
