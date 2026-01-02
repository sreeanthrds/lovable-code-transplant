import React, { useEffect, useState, useRef } from 'react';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Square, Trash2 } from 'lucide-react';

// Atomic Tick Structure from backend
interface AtomicTickEvent {
  type: 'tick_update';
  tick_number: number;
  node_catchup_id: number;       // Cumulative node count
  trade_catchup_id: number;      // Cumulative trade count
  session_id: string;
  user_id: string;
  strategy_id: string;
  node_events_this_tick: NodeEventFromTick[];   // All nodes this tick
  trade_updates_this_tick: TradeUpdateFromTick[]; // All trades this tick
  data: TickDiagnostics;         // Positions, pnl, etc.
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

// Display interfaces
interface DisplayTick {
  tick_number: number;
  timestamp: string;
  node_catchup_id: number;
  trade_catchup_id: number;
  positions_count: number;
  nodes_this_tick: number;
  trades_this_tick: number;
}

interface DisplayNode {
  catchup_id: number;
  tick_number: number;
  timestamp: string;
  execution_id: string;
  node_id: string;
  action: string;
}

interface DisplayTrade {
  catchup_id: number;
  tick_number: number;
  timestamp: string;
  position_id: string;
  symbol: string;
  side: string;
  quantity: number;
  price: number;
  pnl?: number;
}

interface DisplayPosition {
  tick_number: number;
  timestamp: string;
  position_id: string;
  symbol: string;
  quantity: number;
  entry_price: number;
  current_price: number;
  unrealized_pnl: number;
}

export const SSETest: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [streamStatus, setStreamStatus] = useState<'connecting' | 'live' | 'disconnected'>('disconnected');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [dataMode, setDataMode] = useState<'mock' | 'real'>('real');
  const [activeSessions, setActiveSessions] = useState<Set<string>>(new Set());
  
  // Catchup validation
  const [lastNodeCatchupId, setLastNodeCatchupId] = useState<number>(0);
  const [lastTradeCatchupId, setLastTradeCatchupId] = useState<number>(0);
  const [catchupMismatches, setCatchupMismatches] = useState<string[]>([]);
  
  // Display data
  const [ticks, setTicks] = useState<DisplayTick[]>([]);
  const [nodes, setNodes] = useState<DisplayNode[]>([]);
  const [trades, setTrades] = useState<DisplayTrade[]>([]);
  const [positions, setPositions] = useState<DisplayPosition[]>([]);
  
  const eventSourceRef = useRef<EventSource | null>(null);

  const startSSE = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Choose endpoint based on data mode
    const endpoint = dataMode === 'mock' 
      ? 'http://localhost:8000/api/v1/live/sse-test'
      : 'http://localhost:8000/api/v2/live/stream/all';

    console.log(`🔌 Connecting to SSE [${dataMode.toUpperCase()}]: ${endpoint}`);
    setStreamStatus('connecting');
    setStatusMessage(`Connecting to ${dataMode === 'mock' ? 'mock data' : 'live strategy'} stream...`);
    
    const eventSource = new EventSource(endpoint);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      console.log('✅ SSE Connection opened successfully');
    };

    if (dataMode === 'mock') {
      // Mock data event handlers
      eventSource.addEventListener('status', (e) => {
        console.log('📢 Status event received:', e.data);
        const data: StatusEvent = JSON.parse(e.data);
        setStreamStatus(data.status === 'catching_up' ? 'catching_up' : 'live');
        setStatusMessage(data.message);
      });

      eventSource.addEventListener('tick', (e) => {
        const data: TickEvent = JSON.parse(e.data);
        if (data.is_catchup) {
          console.log(`⏪ Tick #${data.tick_number} (CATCH-UP):`, data);
        } else {
          console.log(`📊 Tick #${data.tick_number} (LIVE):`, data);
        }
        setTickEvents(prev => [data, ...prev].slice(0, 50));
      });

      eventSource.addEventListener('node', (e) => {
        const data: NodeEvent = JSON.parse(e.data);
        console.log(`🔧 Node #${data.node_number}:`, data);
        setNodeEvents(prev => [data, ...prev].slice(0, 50));
      });

      eventSource.addEventListener('trade', (e) => {
        const data: TradeEvent = JSON.parse(e.data);
        console.log(`💰 Trade #${data.trade_number}:`, data);
        setTradeEvents(prev => [data, ...prev].slice(0, 50));
      });

      eventSource.addEventListener('position', (e) => {
        const data: PositionEvent = JSON.parse(e.data);
        console.log(`📈 Position #${data.position_number}:`, data);
        setPositionEvents(prev => [data, ...prev].slice(0, 50));
      });
    } else {
      // Real strategy data - handle message events
      eventSource.onmessage = (e) => {
        try {
          const events = JSON.parse(e.data);
          if (!Array.isArray(events)) return;

          // Track active sessions
          const sessions = new Set<string>();
          
          events.forEach((event: any) => {
            if (event.session_id) sessions.add(event.session_id);

            if (event.type === 'tick_update' && event.data) {
              // Convert tick_update to TickEvent
              const tickData: TickEvent = {
                tick_number: event.sequence || 0,
                timestamp: new Date().toLocaleTimeString(),
                symbol: event.data.symbol || 'UNKNOWN',
                ltp: event.data.ltp_store?.ltp_TI || event.data.ltp || 0,
                volume: event.data.progress?.ticks_processed || 0,
                is_catchup: false
              };
              console.log(`📊 Real Tick #${tickData.tick_number}:`, tickData);
              setTickEvents(prev => [tickData, ...prev].slice(0, 50));
            }

            if (event.type === 'node_events' && event.data) {
              // Backend sends: {execution_id: event_payload}
              // Extract event payloads from dict
              const nodeEvents = Object.values(event.data);
              nodeEvents.forEach((nodePayload: any) => {
                const nodeData: NodeEvent = {
                  node_number: event.sequence || 0,
                  timestamp: new Date().toLocaleTimeString(),
                  node_id: nodePayload.node_id || 'unknown',
                  node_type: nodePayload.node_type || nodePayload.action || 'Node',
                  status: nodePayload.status || 'ACTIVE',
                  message: nodePayload.message || nodePayload.action || 'Node event',
                  is_catchup: false
                };
                console.log(`🔧 Real Node #${nodeData.node_number}:`, nodeData);
                setNodeEvents(prev => [nodeData, ...prev].slice(0, 50));
              });
            }

            if (event.type === 'trade_update' && event.data) {
              // Backend sends: {trade: {...}, summary: {...}}
              const trade = event.data.trade;
              if (trade) {
                const tradeData: TradeEvent = {
                  trade_number: event.sequence || 0,
                  timestamp: new Date().toLocaleTimeString(),
                  position_id: trade.position_id || 'unknown',
                  action: trade.side || trade.action || 'UNKNOWN',
                  symbol: trade.symbol || trade.trading_symbol || 'UNKNOWN',
                  quantity: trade.quantity || 0,
                  price: trade.entry_price || trade.exit_price || 0,
                  pnl: trade.realized_pnl || trade.pnl,
                  is_catchup: false
                };
                console.log(`💰 Real Trade #${tradeData.trade_number}:`, tradeData);
                setTradeEvents(prev => [tradeData, ...prev].slice(0, 50));
              }
            }

            if (event.type === 'session_complete') {
              console.log(`🏁 Session Complete:`, event);
              // Show completion notification
              setStatusMessage(`Strategy ${event.strategy_id} completed`);
            }

            if (event.type === 'current_state' && event.data?.open_positions) {
              // Convert open positions to PositionEvents
              event.data.open_positions.forEach((pos: any, idx: number) => {
                const posData: PositionEvent = {
                  position_number: event.sequence || 0,
                  timestamp: new Date().toLocaleTimeString(),
                  position_id: pos.position_id || 'unknown',
                  symbol: pos.symbol || 'UNKNOWN',
                  quantity: pos.quantity || 0,
                  entry_price: pos.entry_price || 0,
                  current_price: pos.current_price || 0,
                  pnl: pos.unrealized_pnl || 0,
                  pnl_percent: ((pos.current_price - pos.entry_price) / pos.entry_price * 100) || 0,
                  is_catchup: false
                };
                if (idx === 0) { // Only log first position to avoid spam
                  console.log(`📈 Real Position #${posData.position_number}:`, posData);
                }
                setPositionEvents(prev => {
                  // Update or add position
                  const existing = prev.findIndex(p => p.position_id === posData.position_id);
                  if (existing >= 0) {
                    const updated = [...prev];
                    updated[existing] = posData;
                    return updated;
                  }
                  return [posData, ...prev].slice(0, 50);
                });
              });
            }
          });

          if (sessions.size > 0) {
            setActiveSessions(Array.from(sessions));
            setStreamStatus('live');
            setStatusMessage(`🔴 LIVE - ${sessions.size} active session(s)`);
          }
        } catch (err) {
          console.error('Error parsing real strategy event:', err);
        }
      };
    }

    eventSource.onerror = (error) => {
      console.error('❌ SSE Error:', error);
      console.error('EventSource readyState:', eventSource.readyState);
      setIsConnected(false);
      setStreamStatus('disconnected');
      setStatusMessage('Connection failed');
      eventSource.close();
    };
  };

  const stopSSE = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    }
  };

  const clearAll = () => {
    setTickEvents([]);
    setNodeEvents([]);
    setTradeEvents([]);
    setPositionEvents([]);
  };

  useEffect(() => {
    // Auto-start SSE connection on mount
    console.log('🚀 SSE Test page mounted - auto-starting connection');
    startSSE();

    // Cleanup on unmount
    return () => {
      console.log('🛑 SSE Test page unmounting - closing connection');
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Reconnect when data mode changes
  useEffect(() => {
    if (isConnected) {
      console.log(`🔄 Data mode changed to ${dataMode}, reconnecting...`);
      stopSSE();
      clearAll();
      setTimeout(() => startSSE(), 100);
    }
  }, [dataMode]);

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">SSE Test Page</h1>
            <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
              <Button
                size="sm"
                variant={dataMode === 'real' ? 'default' : 'ghost'}
                onClick={() => setDataMode('real')}
                className="text-xs"
              >
                Real Strategy Data
              </Button>
              <Button
                size="sm"
                variant={dataMode === 'mock' ? 'default' : 'ghost'}
                onClick={() => setDataMode('mock')}
                className="text-xs"
              >
                Mock Data
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={isConnected ? 'default' : 'secondary'}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
            {activeSessions.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {activeSessions.length} session{activeSessions.length > 1 ? 's' : ''}
              </Badge>
            )}
            {!isConnected ? (
              <Button onClick={startSSE} className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Start
              </Button>
            ) : (
              <Button onClick={stopSSE} variant="destructive" className="flex items-center gap-2">
                <Square className="w-4 h-4" />
                Stop
              </Button>
            )}
            <Button onClick={clearAll} variant="outline" className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Clear
            </Button>
          </div>
        </div>

        {/* Stream Status Banner */}
        {statusMessage && (
          <Card className={
            streamStatus === 'catching_up' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950' :
            streamStatus === 'live' ? 'border-green-500 bg-green-50 dark:bg-green-950' : ''
          }>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Badge variant={
                  streamStatus === 'catching_up' ? 'secondary' :
                  streamStatus === 'live' ? 'default' : 'outline'
                }>
                  {streamStatus === 'catching_up' ? '⏪ Catching Up' :
                   streamStatus === 'live' ? '🔴 LIVE' :
                   streamStatus === 'connecting' ? '🔌 Connecting' : '⚫ Disconnected'}
                </Badge>
                <span className="text-sm font-medium">{statusMessage}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 gap-6">
        {/* Tick Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Tick Events
              <Badge variant="outline">{tickEvents.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {tickEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tick events yet</p>
              ) : (
                tickEvents.map((event, idx) => (
                  <div key={idx} className={`p-3 rounded-lg text-sm space-y-1 ${
                    event.is_catchup ? 'bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300' : 'bg-muted/50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">#{event.tick_number}</span>
                        <span className="font-semibold">{event.symbol}</span>
                        {event.is_catchup && <Badge variant="secondary" className="text-xs py-0">CATCHUP</Badge>}
                      </div>
                      <span className="text-xs text-muted-foreground">{event.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span>LTP: <span className="font-mono font-semibold">₹{event.ltp.toFixed(2)}</span></span>
                      <span>Vol: <span className="font-mono">{event.volume}</span></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Node Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Node Events
              <Badge variant="outline">{nodeEvents.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {nodeEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No node events yet</p>
              ) : (
                nodeEvents.map((event, idx) => (
                  <div key={idx} className={`p-3 rounded-lg text-sm space-y-1 ${
                    event.is_catchup ? 'bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300' : 'bg-muted/50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">#{event.node_number}</span>
                        <span className="font-semibold">{event.node_type}</span>
                        {event.is_catchup && <Badge variant="secondary" className="text-xs py-0">CATCHUP</Badge>}
                      </div>
                      <span className="text-xs text-muted-foreground">{event.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{event.status}</Badge>
                      <span className="text-xs">ID: {event.node_id.slice(0, 8)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{event.message}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Trade Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Trade Events
              <Badge variant="outline">{tradeEvents.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {tradeEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No trade events yet</p>
              ) : (
                tradeEvents.map((event, idx) => (
                  <div key={idx} className={`p-3 rounded-lg text-sm space-y-1 ${
                    event.is_catchup ? 'bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300' : 'bg-muted/50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">#{event.trade_number}</span>
                        <span className="font-semibold">{event.symbol}</span>
                        {event.is_catchup && <Badge variant="secondary" className="text-xs py-0">CATCHUP</Badge>}
                      </div>
                      <span className="text-xs text-muted-foreground">{event.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={event.action === 'BUY' ? 'default' : 'destructive'} className="text-xs">
                        {event.action}
                      </Badge>
                      <span className="text-xs">Qty: {event.quantity}</span>
                      <span className="text-xs">@ ₹{event.price.toFixed(2)}</span>
                    </div>
                    {event.pnl !== undefined && (
                      <p className={`text-xs font-semibold ${event.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        P&L: ₹{event.pnl.toFixed(2)}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Position Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Position Events
              <Badge variant="outline">{positionEvents.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {positionEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No position events yet</p>
              ) : (
                positionEvents.map((event, idx) => (
                  <div key={idx} className={`p-3 rounded-lg text-sm space-y-1 ${
                    event.is_catchup ? 'bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300' : 'bg-muted/50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">#{event.position_number}</span>
                        <span className="font-semibold">{event.symbol}</span>
                        {event.is_catchup && <Badge variant="secondary" className="text-xs py-0">CATCHUP</Badge>}
                      </div>
                      <span className="text-xs text-muted-foreground">{event.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span>Qty: {event.quantity}</span>
                      <span>Entry: ₹{event.entry_price.toFixed(2)}</span>
                      <span>Current: ₹{event.current_price.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold ${event.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        P&L: ₹{event.pnl.toFixed(2)}
                      </span>
                      <span className={`text-xs ${event.pnl_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        ({event.pnl_percent >= 0 ? '+' : ''}{event.pnl_percent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </AppLayout>
  );
};
