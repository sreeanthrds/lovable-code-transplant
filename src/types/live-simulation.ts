/**
 * Live Simulation Types - ClickHouse-based simulation and SSE updates
 */

// Node states
export type NodeStatus = 'active' | 'pending' | 'inactive';

// Active node with detailed diagnostics
export interface ActiveNode {
  node_id: string;
  node_type: string;
  status: NodeStatus;
  last_action?: string;
  conditions_evaluated?: Record<string, boolean>;
  order_info?: {
    order_id: string;
    side: 'BUY' | 'SELL';
    quantity: number;
    symbol: string;
    price?: number;
    status: 'placed' | 'pending' | 'filled' | 'rejected';
  };
  target_info?: {
    target_price: number;
    current_price: number;
    points_to_go: number;
  };
  sl_info?: {
    sl_price: number;
    current_price: number;
    points_away: number;
  };
}

// Open position in live trading
export interface LivePosition {
  position_id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  entry_price: number;
  current_price: number;
  unrealized_pnl: number;
  pnl_percentage: number;
  entry_time: string;
}

// Closed trade/position
export interface LiveTrade {
  position_id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  entry_price: number;
  exit_price: number;
  pnl: number;
  pnl_percentage: number;
  entry_time: string;
  exit_time: string;
  exit_reason?: string;
}

// Live session PnL summary
export interface LivePnL {
  total: number;
  realized: number;
  unrealized: number;
  today: number;
}

// Snapshot data - initial state when connecting
export interface LiveSnapshot {
  session_id: string;
  strategy_id: string;
  strategy_name: string;
  broker_type: string;
  simulation_date: string;
  speed_multiplier: number;
  status: 'running' | 'paused' | 'stopped' | 'completed';
  current_time: string;
  progress_percentage: number;
  
  // Trades and positions
  trades_daily: LiveTrade[];
  open_positions: LivePosition[];
  
  // PnL summary
  pnl: LivePnL;
  
  // Current active/pending nodes
  active_nodes: ActiveNode[];
  
  // Diagnostics data (similar to backtest)
  diagnostics?: any;
}

// SSE Update event types
export type SSEEventType = 
  | 'state_change' 
  | 'node_update' 
  | 'position_update' 
  | 'trade_completed' 
  | 'pnl_update'
  | 'progress_update'
  | 'session_completed'
  | 'error';

// SSE Update payload
export interface SSEUpdate {
  event_type: SSEEventType;
  timestamp: string;
  sequence_number: number;
  
  // Updated data (only present fields that changed)
  active_nodes?: ActiveNode[];
  open_positions?: LivePosition[];
  new_trades?: LiveTrade[];
  pnl?: LivePnL;
  progress_percentage?: number;
  current_time?: string;
  status?: 'running' | 'paused' | 'stopped' | 'completed';
  
  // Events that occurred
  events?: Array<{
    event_type: string;
    node_id?: string;
    details: any;
  }>;
  
  // Error info
  error?: string;
}

// ClickHouse broker connection config
export interface ClickHouseConnectionConfig {
  simulation_date: string; // YYYY-MM-DD
  speed_multiplier: number; // 1, 4, 10, etc.
}

// Start simulation request
export interface StartSimulationRequest {
  user_id: string;
  strategy_id: string;
  broker_connection_id: string;
  simulation_date: string;
  speed_multiplier: number;
}

// Start simulation response (matches API response)
export interface StartSimulationResponse {
  session_id: string;
  stream_url: string;
  status: 'starting' | 'running';
}

// Session control actions
export interface SessionControlRequest {
  action: 'stop' | 'change_speed';
  speed_multiplier?: number;
}

// Summary statistics for display
export interface LiveSessionStats {
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  total_pnl: number;
  realized_pnl: number;
  unrealized_pnl: number;
  open_positions: number;
  active_nodes: number;
  pending_nodes: number;
}
