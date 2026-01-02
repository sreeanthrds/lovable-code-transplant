import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  LiveSnapshot, 
  SSEUpdate, 
  ActiveNode, 
  LivePosition, 
  LiveTrade,
  LivePnL,
  LiveSessionStats
} from '@/types/live-simulation';
import { getApiConfig } from '@/lib/api-config';
import { useClerkUser } from './useClerkUser';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

interface UseLiveSimulationSSEOptions {
  sessionId: string;
  autoConnect?: boolean;
}

interface UseLiveSimulationSSEReturn {
  // Connection state
  connectionStatus: ConnectionStatus;
  error: string | null;
  
  // Session data
  snapshot: LiveSnapshot | null;
  activeNodes: ActiveNode[];
  openPositions: LivePosition[];
  trades: LiveTrade[];
  pnl: LivePnL;
  progress: number;
  currentTime: string;
  sessionStatus: 'running' | 'paused' | 'stopped' | 'completed';
  
  // Computed stats
  stats: LiveSessionStats;
  
  // Actions
  connect: () => void;
  disconnect: () => void;
  stopSession: () => Promise<void>;
  changeSpeed: (speed: number) => Promise<void>;
}

export const useLiveSimulationSSE = ({
  sessionId,
  autoConnect = true
}: UseLiveSimulationSSEOptions): UseLiveSimulationSSEReturn => {
  const { userId } = useClerkUser();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);
  
  // Session data state
  const [snapshot, setSnapshot] = useState<LiveSnapshot | null>(null);
  const [activeNodes, setActiveNodes] = useState<ActiveNode[]>([]);
  const [openPositions, setOpenPositions] = useState<LivePosition[]>([]);
  const [trades, setTrades] = useState<LiveTrade[]>([]);
  const [pnl, setPnl] = useState<LivePnL>({ total: 0, realized: 0, unrealized: 0, today: 0 });
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('');
  const [sessionStatus, setSessionStatus] = useState<'running' | 'paused' | 'stopped' | 'completed'>('running');
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const apiUrlRef = useRef<string>('');

  // Compute stats from current data
  const stats: LiveSessionStats = {
    total_trades: trades.length,
    winning_trades: trades.filter(t => t.pnl > 0).length,
    losing_trades: trades.filter(t => t.pnl < 0).length,
    win_rate: trades.length > 0 
      ? (trades.filter(t => t.pnl > 0).length / trades.length) * 100 
      : 0,
    total_pnl: pnl.total,
    realized_pnl: pnl.realized,
    unrealized_pnl: pnl.unrealized,
    open_positions: openPositions.length,
    active_nodes: activeNodes.filter(n => n.status === 'active').length,
    pending_nodes: activeNodes.filter(n => n.status === 'pending').length
  };

  // Load API URL
  const loadApiUrl = useCallback(async () => {
    try {
      const config = await getApiConfig(userId || undefined);
      apiUrlRef.current = config.baseUrl;
    } catch (err) {
      console.error('[SSE] Failed to load API config:', err);
      apiUrlRef.current = 'https://localhost:8000';
    }
  }, [userId]);

  // Fetch initial snapshot
  const fetchSnapshot = useCallback(async () => {
    try {
      const response = await fetch(
        `${apiUrlRef.current}/api/v1/live/${sessionId}/snapshot`,
        {
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch snapshot: ${response.status}`);
      }
      
      const data: LiveSnapshot = await response.json();
      setSnapshot(data);
      setActiveNodes(data.active_nodes || []);
      setOpenPositions(data.open_positions || []);
      setTrades(data.trades_daily || []);
      setPnl(data.pnl || { total: 0, realized: 0, unrealized: 0, today: 0 });
      setProgress(data.progress_percentage || 0);
      setCurrentTime(data.current_time || '');
      setSessionStatus(data.status || 'running');
      
      return data;
    } catch (err) {
      console.error('[SSE] Failed to fetch snapshot:', err);
      throw err;
    }
  }, [sessionId]);

  // Handle SSE updates
  const handleSSEUpdate = useCallback((update: SSEUpdate) => {
    console.log('[SSE] Received update:', update.event_type, update);
    
    // Update active nodes
    if (update.active_nodes) {
      setActiveNodes(update.active_nodes);
    }
    
    // Update open positions
    if (update.open_positions) {
      setOpenPositions(update.open_positions);
    }
    
    // Add new trades
    if (update.new_trades && update.new_trades.length > 0) {
      setTrades(prev => [...prev, ...update.new_trades!]);
    }
    
    // Update PnL
    if (update.pnl) {
      setPnl(update.pnl);
    }
    
    // Update progress
    if (update.progress_percentage !== undefined) {
      setProgress(update.progress_percentage);
    }
    
    // Update current time
    if (update.current_time) {
      setCurrentTime(update.current_time);
    }
    
    // Update status
    if (update.status) {
      setSessionStatus(update.status);
    }
    
    // Handle errors
    if (update.error) {
      setError(update.error);
    }
  }, []);

  // Connect to SSE stream
  const connect = useCallback(async () => {
    if (!sessionId) return;
    
    setConnectionStatus('connecting');
    setError(null);
    
    try {
      // Ensure we have the API URL
      if (!apiUrlRef.current) {
        await loadApiUrl();
      }
      
      // First fetch the snapshot
      await fetchSnapshot();
      
      // Then connect to SSE stream
      const streamUrl = `${apiUrlRef.current}/api/v1/live/${sessionId}/stream`;
      console.log('[SSE] Connecting to:', streamUrl);
      
      const eventSource = new EventSource(streamUrl);
      eventSourceRef.current = eventSource;
      
      eventSource.onopen = () => {
        console.log('[SSE] Connected');
        setConnectionStatus('connected');
        setError(null);
      };
      
      eventSource.addEventListener('state_update', (event) => {
        try {
          const update: SSEUpdate = JSON.parse(event.data);
          handleSSEUpdate(update);
        } catch (err) {
          console.error('[SSE] Failed to parse state_update:', err);
        }
      });
      
      eventSource.addEventListener('node_update', (event) => {
        try {
          const update: SSEUpdate = JSON.parse(event.data);
          handleSSEUpdate(update);
        } catch (err) {
          console.error('[SSE] Failed to parse node_update:', err);
        }
      });
      
      eventSource.addEventListener('event', (event) => {
        try {
          const update: SSEUpdate = JSON.parse(event.data);
          handleSSEUpdate(update);
        } catch (err) {
          console.error('[SSE] Failed to parse event:', err);
        }
      });
      
      eventSource.onerror = (err) => {
        console.error('[SSE] Error:', err);
        setConnectionStatus('reconnecting');
        
        // Close and attempt reconnect
        eventSource.close();
        eventSourceRef.current = null;
        
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('[SSE] Attempting reconnect...');
          connect();
        }, 3000);
      };
      
    } catch (err) {
      console.error('[SSE] Connection failed:', err);
      setConnectionStatus('error');
      setError(err instanceof Error ? err.message : 'Connection failed');
    }
  }, [sessionId, loadApiUrl, fetchSnapshot, handleSSEUpdate]);

  // Disconnect from SSE
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setConnectionStatus('disconnected');
  }, []);

  // Stop session
  const stopSession = useCallback(async () => {
    try {
      const response = await fetch(
        `${apiUrlRef.current}/api/v1/live/${sessionId}/stop`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to stop session');
      }
      
      setSessionStatus('stopped');
    } catch (err) {
      console.error('[SSE] Failed to stop session:', err);
      throw err;
    }
  }, [sessionId]);

  // Change speed
  const changeSpeed = useCallback(async (speed: number) => {
    try {
      const response = await fetch(
        `${apiUrlRef.current}/api/v1/live/${sessionId}/speed`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify({ speed_multiplier: speed })
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to change speed');
      }
    } catch (err) {
      console.error('[SSE] Failed to change speed:', err);
      throw err;
    }
  }, [sessionId]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && sessionId) {
      loadApiUrl().then(() => connect());
    }
    
    return () => {
      disconnect();
    };
  }, [autoConnect, sessionId, loadApiUrl, connect, disconnect]);

  return {
    connectionStatus,
    error,
    snapshot,
    activeNodes,
    openPositions,
    trades,
    pnl,
    progress,
    currentTime,
    sessionStatus,
    stats,
    connect,
    disconnect,
    stopSession,
    changeSpeed
  };
};
