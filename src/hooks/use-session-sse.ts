import { useState, useEffect, useRef, useCallback } from 'react';
import { NodeState } from '@/components/live-trade/dashboard/StrategyCanvasPanel';
import type { TradesDaily, DiagnosticsExport } from '@/types/backtest';
import { EventSourcePolyfill } from 'event-source-polyfill';

interface SSEEventData {
  event_history?: any;
  current_state?: {
    nodes?: Record<string, {
      status: 'active' | 'pending' | 'inactive' | 'completed' | 'error';
      last_update?: string;
      data?: Record<string, unknown>;
    }>;
    tick_data?: Record<string, unknown>;
  };
}

interface LiveUpdate {
  id: string;
  timestamp: string;
  type: 'tick' | 'signal' | 'execution' | 'status';
  message: string;
  value?: string | number;
  nodeId?: string;
}

interface UseSessionSSEResult {
  nodeStates: Record<string, NodeState>;
  liveUpdates: LiveUpdate[];
  tradesData: TradesDaily | null;
  diagnosticsData: DiagnosticsExport | null;
  isConnected: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
}

export function useSessionSSE(sessionId: string | null): UseSessionSSEResult {
  const [nodeStates, setNodeStates] = useState<Record<string, NodeState>>({});
  const [liveUpdates, setLiveUpdates] = useState<LiveUpdate[]>([]);
  const [tradesData, setTradesData] = useState<TradesDaily | null>(null);
  const [diagnosticsData, setDiagnosticsData] = useState<DiagnosticsExport | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const eventSourceRef = useRef<EventSourcePolyfill | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const processCurrentState = useCallback((currentState: SSEEventData['current_state']) => {
    if (!currentState) return;

    // Process node states
    if (currentState.nodes) {
      const newNodeStates: Record<string, NodeState> = {};
      
      Object.entries(currentState.nodes).forEach(([nodeId, nodeData]) => {
        newNodeStates[nodeId] = {
          nodeId,
          status: nodeData.status,
          lastUpdate: nodeData.last_update,
          data: nodeData.data
        };
      });
      
      setNodeStates(newNodeStates);
      
      // Create live updates from node state changes
      Object.entries(currentState.nodes).forEach(([nodeId, nodeData]) => {
        if (nodeData.status === 'active' || nodeData.status === 'pending') {
          const update: LiveUpdate = {
            id: `${nodeId}-${Date.now()}`,
            timestamp: nodeData.last_update || new Date().toISOString(),
            type: 'status',
            message: `Node ${nodeId} is ${nodeData.status}`,
            nodeId
          };
          
          setLiveUpdates(prev => [update, ...prev].slice(0, 100)); // Keep last 100 updates
        }
      });
    }

    // Process tick data as live updates
    if (currentState.tick_data) {
      Object.entries(currentState.tick_data).forEach(([key, value]) => {
        const update: LiveUpdate = {
          id: `tick-${key}-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'tick',
          message: `${key}`,
          value: typeof value === 'number' ? value : String(value)
        };
        
        setLiveUpdates(prev => [update, ...prev].slice(0, 100));
      });
    }
  }, []);

  const processEventHistory = useCallback((eventHistory: any) => {
    if (!eventHistory) return;
    
    // Process event_history for diagnostics data
    // This matches the structure from diagnostics_export.json
    if (eventHistory.diagnostics || eventHistory.summary) {
      setDiagnosticsData(eventHistory as DiagnosticsExport);
    }
  }, []);

  const connect = useCallback(() => {
    if (!sessionId) {
      console.log('🔌 SSE: No session ID provided, skipping connection');
      return;
    }

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const sseUrl = `https://api.tradelayout.com/api/live-trading/session/${sessionId}/sse`;
    console.log('🔌 SSE: Connecting to', sseUrl);

    try {
      // Use EventSourcePolyfill to support custom headers
      const eventSource = new EventSourcePolyfill(sseUrl, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('✅ SSE: Connected');
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      eventSource.onmessage = (event) => {
        try {
          const data: SSEEventData = JSON.parse(event.data);
          console.log('📡 SSE: Received message', data);

          // Process current_state for live node updates
          if (data.current_state) {
            processCurrentState(data.current_state);
          }

          // Process event_history for reports
          if (data.event_history) {
            processEventHistory(data.event_history);
          }
        } catch (err) {
          console.error('❌ SSE: Error parsing message', err);
        }
      };

      eventSource.onerror = (err) => {
        console.error('❌ SSE: Connection error', err);
        setIsConnected(false);
        
        // Close the current connection
        eventSource.close();
        eventSourceRef.current = null;

        // Attempt to reconnect with exponential backoff
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          console.log(`🔄 SSE: Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        } else {
          setError('Failed to connect to live updates. Please refresh the page.');
        }
      };
    } catch (err) {
      console.error('❌ SSE: Failed to create EventSource', err);
      setError('Failed to establish SSE connection');
    }
  }, [sessionId, processCurrentState, processEventHistory]);

  const disconnect = useCallback(() => {
    console.log('🔌 SSE: Disconnecting');
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    setIsConnected(false);
    reconnectAttemptsRef.current = 0;
  }, []);

  // Connect when sessionId changes
  useEffect(() => {
    if (sessionId) {
      // Reset state for new session
      setNodeStates({});
      setLiveUpdates([]);
      setTradesData(null);
      setDiagnosticsData(null);
      setError(null);
      
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [sessionId, connect, disconnect]);

  return {
    nodeStates,
    liveUpdates,
    tradesData,
    diagnosticsData,
    isConnected,
    error,
    connect,
    disconnect
  };
}
