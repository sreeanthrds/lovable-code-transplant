/**
 * Live Simulation API Types - Based on LIVE_SIMULATION_UI_GUIDE.md
 * Uses SSE with gzip compression for real-time updates
 */

// ==================== API Request/Response Types ====================

export interface StartSimulationRequest {
  user_id: string;
  strategy_id: string;
  start_date: string; // YYYY-MM-DD
  speed_multiplier: number;
}

export interface StartSimulationResponse {
  session_id: string;
  stream_url: string;
  status: 'starting' | 'running';
}

export interface StopSimulationResponse {
  session_id: string;
  status: 'stopped';
}

export interface SimulationStatusResponse {
  session_id: string;
  status: 'running' | 'stopped' | 'completed';
  progress: {
    ticks_processed: number;
    total_ticks: number;
    progress_percentage: number;
  };
  pnl_summary: {
    realized_pnl: string;
    unrealized_pnl: string;
    total_pnl: string;
  };
}

// ==================== SSE Event Types ====================

export type SSEEventType = 
  | 'initial_state'
  | 'tick_update'
  | 'node_events'
  | 'trade_update'
  | 'heartbeat';

// ==================== Tick Update (Uncompressed, ~1/sec) ====================

export interface TickUpdateEvent {
  timestamp: string; // "YYYY-MM-DD HH:MM:SS+05:30"
  current_time: string; // "HH:MM:SS"
  progress: {
    ticks_processed: number;
    total_ticks: number;
    progress_percentage: number;
  };
  active_nodes: TickActiveNode[];
  pending_nodes: TickPendingNode[];
  completed_nodes_this_tick: TickCompletedNode[];
  open_positions: TickOpenPosition[];
  pnl_summary: TickPnLSummary;
  ltp_store: Record<string, LTPData>;
  candle_data?: Record<string, CandleTimeframes>;
}

export interface TickActiveNode {
  node_id: string;
  execution_id: string;
  parent_execution_id: string;
  node_name: string;
  node_type: string;
  status: 'active';
  last_evaluation: string;
  signal_emitted: boolean;
}

export interface TickPendingNode {
  node_id: string;
  execution_id: null;
  parent_execution_id: null;
  node_name: string;
  node_type: string;
  status: 'pending';
  waiting_for: string;
}

export interface TickCompletedNode {
  node_id: string;
  execution_id: string;
  parent_execution_id: string;
  node_name: string;
  node_type: string;
  event_type: string;
  timestamp: string;
  result: string;
  positions_closed?: number;
  exit_price?: string;
  pnl?: string;
}

export interface TickOpenPosition {
  position_id: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  entry_price: string; // String!
  entry_time: string;
  current_ltp: string; // String!
  unrealized_pnl: string; // String!
  unrealized_pnl_percent: string; // String!
  duration_minutes: number;
  node_id: string;
  re_entry_num: number;
}

export interface TickPnLSummary {
  realized_pnl: string; // String!
  unrealized_pnl: string; // String!
  total_pnl: string; // String!
  closed_trades: number;
  open_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: string; // String!
}

export interface LTPData {
  ltp: number;
  timestamp: string;
  volume: number;
  oi: number;
}

export interface CandleTimeframes {
  '1m'?: {
    current: CandleData;
    previous: CandleData & { indicators?: Record<string, number> };
  };
}

export interface CandleData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// ==================== Initial State (Compressed) ====================

export interface InitialStateEvent {
  diagnostics: string; // Base64-encoded gzip JSON
  trades: string; // Base64-encoded gzip JSON
}

// Decompressed diagnostics structure
export interface DiagnosticsData {
  events_history: Record<string, NodeEventData>;
  current_state: Record<string, NodeStateData>;
}

export interface NodeEventData {
  execution_id: string;
  node_id: string;
  node_name: string;
  node_type: string;
  event_type: string;
  timestamp: string;
  parent_execution_id?: string;
  result?: string;
  details?: Record<string, any>;
}

export interface NodeStateData {
  node_id: string;
  node_name: string;
  node_type: string;
  status: 'active' | 'pending' | 'completed' | 'failed';
  execution_id?: string;
  last_evaluation?: string;
}

// Decompressed trades structure
export interface TradesDailyData {
  date: string;
  summary: TradesSummary;
  trades: TradeRecord[];
}

export interface TradesSummary {
  total_trades: number;
  total_pnl: string; // String!
  winning_trades: number;
  losing_trades: number;
  win_rate: string; // String!
}

export interface TradeRecord {
  trade_id: string;
  position_id: string;
  re_entry_num: number;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  entry_price: string; // String!
  entry_time: string;
  exit_price: string; // String!
  exit_time: string;
  pnl: string; // String!
  pnl_percent: string; // String!
  duration_minutes: number;
  status: 'closed';
  entry_flow_ids: string[];
  exit_flow_ids: string[];
  entry_trigger: string;
  exit_reason: string;
}

// ==================== Heartbeat Event ====================

export interface HeartbeatEvent {
  timestamp: string;
}

// ==================== UI State Types ====================

export interface LiveSimulationState {
  // Connection
  isConnected: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';
  error: string | null;
  
  // Session info
  sessionId: string | null;
  sessionStatus: 'running' | 'stopped' | 'completed';
  
  // Tick data (updates every tick)
  currentTime: string;
  timestamp: string;
  progress: {
    ticks_processed: number;
    total_ticks: number;
    progress_percentage: number;
  };
  
  // Nodes
  activeNodes: TickActiveNode[];
  pendingNodes: TickPendingNode[];
  completedNodesThisTick: TickCompletedNode[];
  
  // Positions & PnL
  openPositions: TickOpenPosition[];
  pnlSummary: TickPnLSummary;
  
  // Market data
  ltpStore: Record<string, LTPData>;
  
  // Historical data (from compressed events)
  diagnostics: DiagnosticsData | null;
  tradesDaily: TradesDailyData | null;
}

// Initial state for the store
export const initialLiveSimulationState: LiveSimulationState = {
  isConnected: false,
  connectionStatus: 'disconnected',
  error: null,
  sessionId: null,
  sessionStatus: 'stopped',
  currentTime: '',
  timestamp: '',
  progress: {
    ticks_processed: 0,
    total_ticks: 0,
    progress_percentage: 0
  },
  activeNodes: [],
  pendingNodes: [],
  completedNodesThisTick: [],
  openPositions: [],
  pnlSummary: {
    realized_pnl: '0.00',
    unrealized_pnl: '0.00',
    total_pnl: '0.00',
    closed_trades: 0,
    open_trades: 0,
    winning_trades: 0,
    losing_trades: 0,
    win_rate: '0.00'
  },
  ltpStore: {},
  diagnostics: null,
  tradesDaily: null
};
