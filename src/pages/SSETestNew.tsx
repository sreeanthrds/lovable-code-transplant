import React, { useEffect, useState, useRef } from 'react';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Square, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Atomic Tick Structure from backend
interface AtomicTickEvent {
  type: 'tick_update';
  tick_number: number;
  node_catchup_id: number;
  trade_catchup_id: number;
  session_id: string;
  user_id: string;
  strategy_id: string;
  node_events_this_tick: NodeEventFromTick[];
  trade_updates_this_tick: TradeUpdateFromTick[];
  data: TickDiagnostics;
}

interface NodeEventFromTick {
  execution_id: string;
  catchup_id: number;
  event: {
    node_id: string;
    action?: string;
    node_type?: string;
    status?: string;
    message?: string;
    [key: string]: any;
  };
}

interface TradeUpdateFromTick {
  catchup_id: number;
  trade: {
    position_id: string;
    symbol: string;
    side: string;
    quantity: number;
    entry_price?: number;
    exit_price?: number;
    price?: number;
    realized_pnl?: number;
    [key: string]: any;
  };
  summary: {
    total_trades: number;
    total_pnl: string;
    win_rate: string;
  };
}

interface TickDiagnostics {
  timestamp?: string;
  progress?: {
    ticks_processed: number;
    total_ticks: number;
  };
  open_positions?: PositionData[];
  pnl_summary?: {
    realized_pnl: string;
    unrealized_pnl: string;
    total_pnl: string;
  };
  active_nodes?: string[];
  ltp_store?: any;
}

interface PositionData {
  position_id: string;
  symbol: string;
  quantity: number;
  entry_price: number;
  current_price?: number;
  unrealized_pnl?: string;
}

// Display State
interface TickInfo {
  tick_number: number;
  timestamp: string;
  node_catchup_id: number;
  trade_catchup_id: number;
  nodes_count: number;
  trades_count: number;
  positions_count: number;
  total_pnl: string;
}

export const SSETestNew: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('Disconnected');
  const [activeSessions, setActiveSessions] = useState<Set<string>>(new Set());
  
  // Live data sections
  const [latestTickData, setLatestTickData] = useState<any>(null);
  const [openPositions, setOpenPositions] = useState<any[]>([]);
  const [nodeEvents, setNodeEvents] = useState<any[]>([]);
  const [tradeEvents, setTradeEvents] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  
  const eventSourceRef = useRef<EventSource | null>(null);

  const startSSE = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Reset state on reconnect
    setLatestTickData(null);
    setOpenPositions([]);
    setNodeEvents([]);
    setTradeEvents([]);

    const endpoint = 'http://localhost:8000/api/v2/live/stream/all';
    console.log(`🔌 Connecting to SSE: ${endpoint}`);
    setStatusMessage('Connecting to live stream...');
    
    const eventSource = new EventSource(endpoint);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setStatusMessage('Connected - Waiting for events...');
      console.log('✅ SSE Connection opened');
    };

    eventSource.onmessage = (e) => {
      try {
        const events = JSON.parse(e.data);
        
        if (Array.isArray(events)) {
          events.forEach((event: any) => {
            if (event.type === 'heartbeat') {
              console.log('💓 Heartbeat');
              if (activeSessions.size === 0) {
                setStatusMessage('Connected - No active strategies. Start a strategy execution.');
              }
              return;
            }
            
            if (event.type === 'session_registered') {
              console.log('📋 Session registered:', event.session_id, event.strategy_id);
              setActiveSessions(prev => new Set(prev).add(event.session_id));
              setStatusMessage(`Strategy registered: ${event.strategy_id} - Initializing...`);
            }
            
            if (event.type === 'progress_update') {
              console.log('⏳ Progress:', event.message);
              setStatusMessage(`${event.strategy_id}: ${event.message}`);
            }
            
            if (event.type === 'status_update') {
              console.log('📊 Status:', event.status, event.message);
              setStatusMessage(`${event.session_id}: ${event.status} - ${event.message}`);
            }
            
            if (event.type === 'tick_update') {
              // Update session ID
              if (event.session_id) {
                setSessionId(event.session_id);
              }
              
              // Section 1: Latest Tick Data
              setLatestTickData({
                timestamp: event.data?.timestamp,
                progress: event.data?.progress,
                pnl_summary: event.data?.pnl_summary,
                ltp_store: event.data?.ltp_store
              });
              
              // Section 2: Open Positions (from tick data)
              if (event.data?.open_positions) {
                setOpenPositions(event.data.open_positions);
              }
              
              // Section 3: Node Events (from this tick)
              if (event.node_events_this_tick && event.node_events_this_tick.length > 0) {
                setNodeEvents(prev => [...event.node_events_this_tick, ...prev].slice(0, 50));
              }
              
              // Section 4: Trade Events (from this tick)
              if (event.trade_updates_this_tick && event.trade_updates_this_tick.length > 0) {
                setTradeEvents(prev => [...event.trade_updates_this_tick, ...prev].slice(0, 50));
              }
            }
            
            if (event.type === 'session_complete') {
              console.log('🏁 Session completed:', event.session_id);
              setStatusMessage(`Session ${event.session_id} completed`);
            }
          });
        }
      } catch (err) {
        console.error('❌ Error parsing SSE data:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('❌ SSE Error:', err);
      setIsConnected(false);
      setStatusMessage('Connection error - Retrying...');
    };
  };

  const stopSSE = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
    setStatusMessage('Disconnected');
    console.log('🛑 SSE Disconnected');
  };

  const clearData = () => {
    setNodeEvents([]);
    setTradeEvents([]);
    console.log('🗑️ Event history cleared');
  };

  useEffect(() => {
    // Auto-connect on mount
    startSSE();
    
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Live Strategy Monitor</h1>
          <div className="flex gap-2">
            <Button onClick={clearData} variant="outline" className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Clear History
            </Button>
          </div>
        </div>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Connection Status</span>
              {isConnected ? (
                <Badge className="bg-green-500 hover:bg-green-600">
                  🟢 CONNECTED
                </Badge>
              ) : (
                <Badge variant="secondary">⚫ DISCONNECTED</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{statusMessage}</p>
              <p className="text-sm">Active Sessions: <Badge>{activeSessions.size}</Badge></p>
              {sessionId && (
                <p className="text-xs text-muted-foreground">Session ID: {sessionId.substring(0, 20)}...</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Section 1: Latest Tick Data */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Latest Tick Update</CardTitle>
          </CardHeader>
          <CardContent>
            {latestTickData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Timestamp</p>
                    <p className="text-sm font-mono">{latestTickData.timestamp ? new Date(latestTickData.timestamp).toLocaleTimeString() : '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Progress</p>
                    <p className="text-sm font-bold">{latestTickData.progress?.progress_percentage?.toFixed(1) || 0}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Realized P&L</p>
                    <p className="text-sm font-bold text-green-600">₹{latestTickData.pnl_summary?.realized_pnl || '0.00'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total P&L</p>
                    <p className="text-sm font-bold">₹{latestTickData.pnl_summary?.total_pnl || '0.00'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Waiting for tick updates...</p>
            )}
          </CardContent>
        </Card>

        {/* Section 2: Open Positions */}
        <Card>
          <CardHeader>
            <CardTitle>💼 Open Positions</CardTitle>
          </CardHeader>
          <CardContent>
            {openPositions.length > 0 ? (
              <div className="space-y-2">
                {openPositions.map((pos, idx) => (
                  <div key={idx} className="p-3 bg-muted/50 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-mono font-bold">{pos.symbol || pos.trade_id}</p>
                      <p className="text-xs text-muted-foreground">
                        {pos.side} • Qty: {pos.quantity} • Entry: ₹{pos.entry_price}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{pos.pnl ? `₹${pos.pnl}` : '-'}</p>
                      <p className="text-xs text-muted-foreground">{pos.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No open positions</p>
            )}
          </CardContent>
        </Card>

        {/* Sections 3 & 4: Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Section 3: Node Events */}
          <Card>
            <CardHeader>
              <CardTitle>🔔 Node Events</CardTitle>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              {nodeEvents.length > 0 ? (
                <div className="space-y-2">
                  {nodeEvents.map((nodeEvt, idx) => (
                    <div key={idx} className="p-2 bg-muted/30 rounded text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-bold">{nodeEvt.event?.node_id}</span>
                        <Badge variant="outline" className="text-xs">{nodeEvt.event?.status || nodeEvt.event?.action}</Badge>
                      </div>
                      {nodeEvt.event?.message && (
                        <p className="text-muted-foreground">{nodeEvt.event.message}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No node events yet</p>
              )}
            </CardContent>
          </Card>

          {/* Section 4: Trade Events */}
          <Card>
            <CardHeader>
              <CardTitle>💰 Trade Events</CardTitle>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              {tradeEvents.length > 0 ? (
                <div className="space-y-2">
                  {tradeEvents.map((tradeEvt, idx) => (
                    <div key={idx} className="p-2 bg-muted/30 rounded text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-bold">{tradeEvt.trade?.symbol || tradeEvt.trade?.position_id}</span>
                        <Badge variant="outline" className="text-xs">{tradeEvt.trade?.side}</Badge>
                      </div>
                      <div className="text-muted-foreground">
                        {tradeEvt.trade?.entry_price && (
                          <span>Entry: ₹{tradeEvt.trade.entry_price} </span>
                        )}
                        {tradeEvt.trade?.exit_price && (
                          <span>Exit: ₹{tradeEvt.trade.exit_price} </span>
                        )}
                        {tradeEvt.trade?.realized_pnl && (
                          <span className="font-bold text-green-600">P&L: ₹{tradeEvt.trade.realized_pnl}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No trade events yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};
