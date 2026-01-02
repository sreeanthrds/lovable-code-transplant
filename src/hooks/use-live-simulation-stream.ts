import { useState, useEffect, useCallback, useRef } from 'react';
import pako from 'pako';
import {
  LiveSimulationState,
  initialLiveSimulationState,
  TickUpdateEvent,
  InitialStateEvent,
  DiagnosticsData,
  TradesDailyData,
  StartSimulationRequest,
  StartSimulationResponse,
  TickActiveNode,
  TickPendingNode,
  TickOpenPosition,
  TickPnLSummary,
  TradeRecord
} from '@/types/live-simulation-api';
import { getApiConfig } from '@/lib/api-config';
import { useClerkUser } from './useClerkUser';

const API_VERSION = 'v2';

interface UseLiveSimulationStreamOptions {
  sessionId?: string;
  autoConnect?: boolean;
}

interface UseLiveSimulationStreamReturn extends LiveSimulationState {
  // Actions
  startSimulation: (request: Omit<StartSimulationRequest, 'user_id'>) => Promise<StartSimulationResponse>;
  stopSimulation: () => Promise<void>;
  connectToStream: (sessionId: string) => void;
  disconnect: () => void;
  
  // Computed helpers
  trades: TradeRecord[];
  totalPnl: number;
  realizedPnl: number;
  unrealizedPnl: number;
  winRate: number;
  progressPercentage: number;
}

/**
 * Decompresses base64-encoded gzip data
 */
function decompressGzip<T>(base64Data: string): T {
  try {
    // Decode base64 to binary
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Decompress with pako
    const decompressed = pako.inflate(bytes, { to: 'string' });
    
    // Parse JSON
    return JSON.parse(decompressed) as T;
  } catch (err) {
    console.error('[SSE] Failed to decompress gzip data:', err);
    throw err;
  }
}

export function useLiveSimulationStream({
  sessionId: initialSessionId,
  autoConnect = false
}: UseLiveSimulationStreamOptions = {}): UseLiveSimulationStreamReturn {
  const { userId } = useClerkUser();
  const [state, setState] = useState<LiveSimulationState>(initialLiveSimulationState);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const apiUrlRef = useRef<string>('');
  const currentSessionIdRef = useRef<string | null>(initialSessionId || null);

  // Load API URL
  const loadApiUrl = useCallback(async () => {
    try {
      const config = await getApiConfig(userId || undefined);
      apiUrlRef.current = config.baseUrl;
      console.log('[SSE] API URL loaded:', apiUrlRef.current);
    } catch (err) {
      console.error('[SSE] Failed to load API config:', err);
      apiUrlRef.current = 'http://localhost:8000';
    }
  }, [userId]);

  // Handle initial_state event (compressed)
  const handleInitialState = useCallback((data: InitialStateEvent) => {
    console.log('[SSE] Processing initial_state...');
    
    try {
      const diagnostics = decompressGzip<DiagnosticsData>(data.diagnostics);
      const trades = decompressGzip<TradesDailyData>(data.trades);
      
      console.log('[SSE] Decompressed diagnostics:', Object.keys(diagnostics.events_history || {}).length, 'events');
      console.log('[SSE] Decompressed trades:', trades.trades?.length || 0, 'trades');
      
      setState(prev => ({
        ...prev,
        diagnostics,
        tradesDaily: trades,
        sessionStatus: 'running'
      }));
    } catch (err) {
      console.error('[SSE] Failed to process initial_state:', err);
      setState(prev => ({ ...prev, error: 'Failed to process initial state' }));
    }
  }, []);

  // Handle tick_update event (uncompressed, every ~1 sec)
  const handleTickUpdate = useCallback((data: TickUpdateEvent) => {
    setState(prev => ({
      ...prev,
      currentTime: data.current_time,
      timestamp: data.timestamp,
      progress: data.progress,
      activeNodes: data.active_nodes || [],
      pendingNodes: data.pending_nodes || [],
      completedNodesThisTick: data.completed_nodes_this_tick || [],
      openPositions: data.open_positions || [],
      pnlSummary: data.pnl_summary,
      ltpStore: data.ltp_store || {}
    }));
  }, []);

  // Handle node_events (compressed) - replace diagnostics
  const handleNodeEvents = useCallback((base64Data: string) => {
    try {
      const diagnostics = decompressGzip<DiagnosticsData>(base64Data);
      console.log('[SSE] Node events update:', Object.keys(diagnostics.events_history || {}).length, 'events');
      
      setState(prev => ({ ...prev, diagnostics }));
    } catch (err) {
      console.error('[SSE] Failed to process node_events:', err);
    }
  }, []);

  // Handle trade_update (compressed) - replace trades
  const handleTradeUpdate = useCallback((base64Data: string) => {
    try {
      const trades = decompressGzip<TradesDailyData>(base64Data);
      console.log('[SSE] Trade update:', trades.trades?.length || 0, 'trades');
      
      setState(prev => ({ ...prev, tradesDaily: trades }));
    } catch (err) {
      console.error('[SSE] Failed to process trade_update:', err);
    }
  }, []);

  // Handle heartbeat
  const handleHeartbeat = useCallback(() => {
    // Just keep connection alive, maybe update last heartbeat time
    console.debug('[SSE] Heartbeat received');
  }, []);

  // Connect to SSE stream
  const connectToStream = useCallback((sessionId: string) => {
    if (!sessionId) {
      console.error('[SSE] No session ID provided');
      return;
    }

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    currentSessionIdRef.current = sessionId;
    setState(prev => ({
      ...prev,
      connectionStatus: 'connecting',
      sessionId,
      error: null
    }));

    const streamUrl = `${apiUrlRef.current}/api/${API_VERSION}/live/stream/${sessionId}`;
    console.log('[SSE] Connecting to:', streamUrl);

    const eventSource = new EventSource(streamUrl);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('[SSE] Connected');
      setState(prev => ({
        ...prev,
        isConnected: true,
        connectionStatus: 'connected',
        error: null
      }));
    };

    // Listen for initial_state event
    eventSource.addEventListener('initial_state', (event) => {
      try {
        const data: InitialStateEvent = JSON.parse(event.data);
        handleInitialState(data);
      } catch (err) {
        console.error('[SSE] Failed to parse initial_state:', err);
      }
    });

    // Listen for tick_update event (most frequent, uncompressed)
    eventSource.addEventListener('tick_update', (event) => {
      try {
        const data: TickUpdateEvent = JSON.parse(event.data);
        handleTickUpdate(data);
      } catch (err) {
        console.error('[SSE] Failed to parse tick_update:', err);
      }
    });

    // Listen for node_events (compressed)
    eventSource.addEventListener('node_events', (event) => {
      handleNodeEvents(event.data);
    });

    // Listen for trade_update (compressed)
    eventSource.addEventListener('trade_update', (event) => {
      handleTradeUpdate(event.data);
    });

    // Listen for heartbeat
    eventSource.addEventListener('heartbeat', () => {
      handleHeartbeat();
    });

    // Handle errors
    eventSource.onerror = (err) => {
      console.error('[SSE] Connection error:', err);
      setState(prev => ({ ...prev, connectionStatus: 'reconnecting' }));

      eventSource.close();
      eventSourceRef.current = null;

      // Attempt reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        if (currentSessionIdRef.current) {
          console.log('[SSE] Attempting reconnect...');
          connectToStream(currentSessionIdRef.current);
        }
      }, 3000);
    };
  }, [handleInitialState, handleTickUpdate, handleNodeEvents, handleTradeUpdate, handleHeartbeat]);

  // Disconnect from stream
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    currentSessionIdRef.current = null;
    setState(prev => ({
      ...prev,
      isConnected: false,
      connectionStatus: 'disconnected'
    }));
  }, []);

  // Start simulation
  const startSimulation = useCallback(async (
    request: Omit<StartSimulationRequest, 'user_id'>
  ): Promise<StartSimulationResponse> => {
    if (!apiUrlRef.current) {
      await loadApiUrl();
    }

    const response = await fetch(`${apiUrlRef.current}/api/${API_VERSION}/live/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        ...request,
        user_id: userId || 'anonymous'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to start simulation: ${error}`);
    }

    const data: StartSimulationResponse = await response.json();
    console.log('[SSE] Simulation started:', data);

    // Auto-connect to stream
    connectToStream(data.session_id);

    return data;
  }, [userId, loadApiUrl, connectToStream]);

  // Stop simulation
  const stopSimulation = useCallback(async () => {
    if (!currentSessionIdRef.current) {
      console.warn('[SSE] No active session to stop');
      return;
    }

    const response = await fetch(
      `${apiUrlRef.current}/api/${API_VERSION}/live/stop/${currentSessionIdRef.current}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to stop simulation');
    }

    setState(prev => ({ ...prev, sessionStatus: 'stopped' }));
    disconnect();
  }, [disconnect]);

  // Auto-connect if sessionId provided
  useEffect(() => {
    if (autoConnect && initialSessionId) {
      loadApiUrl().then(() => connectToStream(initialSessionId));
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, initialSessionId, loadApiUrl, connectToStream, disconnect]);

  // Initialize API URL on mount
  useEffect(() => {
    loadApiUrl();
  }, [loadApiUrl]);

  // Computed values
  const trades = state.tradesDaily?.trades || [];
  const totalPnl = parseFloat(state.pnlSummary.total_pnl) || 0;
  const realizedPnl = parseFloat(state.pnlSummary.realized_pnl) || 0;
  const unrealizedPnl = parseFloat(state.pnlSummary.unrealized_pnl) || 0;
  const winRate = parseFloat(state.pnlSummary.win_rate) || 0;
  const progressPercentage = state.progress.progress_percentage || 0;

  return {
    ...state,
    startSimulation,
    stopSimulation,
    connectToStream,
    disconnect,
    trades,
    totalPnl,
    realizedPnl,
    unrealizedPnl,
    winRate,
    progressPercentage
  };
}
