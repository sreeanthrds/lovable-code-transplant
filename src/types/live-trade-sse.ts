// Live Trade SSE Types - Based on FINAL_SSE_SPEC_FOR_UI.md
// All numeric values are numbers (not strings)
// All timestamps are ISO 8601 strings

export interface LtpInfo {
  ltp: number;
  timestamp: string;
  volume: number;
  oi: number;
}

export interface OpenPosition {
  position_id: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  entry_price: number;
  current_price: number;
  unrealized_pnl: number;
  entry_time: string;
  status: 'OPEN';
}

export interface ClosedPosition {
  trade_id: string;
  position_id: string;
  re_entry_num: number;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  entry_price: number;
  entry_time: string;
  exit_price: number;
  exit_time: string;
  pnl: number;
  pnl_percent: number;
  duration_minutes: number;
  status: 'CLOSED';
  entry_flow_ids: string[];
  exit_flow_ids: string[];
  entry_trigger: string;
  exit_reason: string;
}

export interface PnlSummary {
  realized_pnl: number;
  unrealized_pnl: number;
  total_pnl: number;
  closed_trades: number;
  open_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
}

export interface ConditionEvaluated {
  lhs_expression: Record<string, unknown>;
  rhs_expression: Record<string, unknown>;
  lhs_value: number | string;
  rhs_value: number | string;
  operator: string;
  timestamp: string;
  condition_type: string;
  result: boolean;
  result_icon: string;
  raw: string;
  evaluated: string;
  condition_text: string;
}

export interface CandleData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface NodeExecution {
  execution_id: string;
  parent_execution_id: string | null;
  timestamp: string;
  event_type: string;
  node_id: string;
  node_name: string;
  node_type: string;
  children_nodes: { id: string }[];
  condition_type?: string;
  conditions_preview?: string;
  signal_emitted?: boolean;
  logic_completed?: boolean;
  evaluated_conditions?: {
    conditions_evaluated: ConditionEvaluated[];
    expression_values: Record<string, unknown>;
    candle_data: Record<string, {
      current: CandleData;
      previous: CandleData;
    }>;
  };
}

// Main tick_update event payload
export interface TickUpdate {
  event_id: number;
  session_id: string;
  tick: number;
  timestamp: string;
  execution_count: number;
  ltp: Record<string, LtpInfo>;
  open_positions: OpenPosition[];
  closed_positions: ClosedPosition[];
  pnl_summary: PnlSummary;
  node_executions: Record<string, NodeExecution>;
  active_nodes: string[];
}

// Node event for notifications
export interface NodeEvent {
  execution_id: string;
  node_id: string;
  node_name: string;
  node_type: string;
  timestamp: string;
  signal_emitted: boolean;
  event_type: string;
}

// Trade update for notifications
export interface TradeUpdateEvent {
  trade: ClosedPosition;
  timestamp: string;
}

// Connection state
export interface LiveSSEState {
  tickData: TickUpdate | null;
  isConnected: boolean;
  error: string | null;
  lastEventId: number | null;
}
