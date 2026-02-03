// Backtest Types based on API Documentation

export interface DailySummary {
  total_trades?: number;
  total_positions?: number; // API returns this field
  closed_positions?: number;
  open_positions?: number;
  total_pnl: string | number;
  winning_trades: number;
  losing_trades: number;
  breakeven_trades?: number;
  win_rate: string | number;
  avg_win?: number;
  avg_loss?: number;
  avg_duration_minutes?: number;
  largest_win?: number;
  largest_loss?: number;
  re_entries?: number;
  // Streaming backtest additions
  realized_pnl?: string;
  unrealized_pnl?: string;
}

export interface Trade {
  trade_id: string;
  position_id: string;
  re_entry_num: number;
  symbol: string;
  side: 'BUY' | 'SELL' | 'buy' | 'sell';
  quantity: number;
  actual_quantity?: number;  // Actual traded quantity (quantity × multiplier × scale)
  multiplier?: number;  // Lot size multiplier
  qty_closed: number;  // Phase 6: Track closed quantity for partial exits
  entry_price: string;
  entry_time: string;
  exit_price: string | null;
  exit_time: string | null;
  pnl: string;
  pnl_percent: string;
  unrealized_pnl: string | null;  // Phase 6: Live P&L for OPEN/PARTIAL trades
  duration_minutes: number;
  status: 'OPEN' | 'PARTIAL' | 'CLOSED' | 'open' | 'closed';  // Phase 6: Added OPEN, PARTIAL, CLOSED
  entry_flow_ids: string[];
  exit_flow_ids: string[][] | string[];  // Phase 6: Array of arrays for multiple partial exits (backwards compatible)
  entry_trigger: string;
  exit_reason: string | null;
}

export interface TradesDaily {
  date: string;
  summary: DailySummary;
  trades: Trade[];
}

export interface LtpData {
  ltp: number;
  timestamp: string;
  volume?: number;
  oi?: number;
}

export interface ChildNode {
  id: string;
}

export interface PositionInfo {
  position_id: string;
  re_entry_num?: number;
  symbol?: string;
  side?: string;
  quantity?: number;
  entry_price?: string;
  entry_time?: string;
  node_id?: string;
}

export interface ActionInfo {
  type: string;
  action_type?: string;
  order_id?: string;
  symbol?: string;
  side?: string;
  quantity?: number;
  price?: string;
  order_type?: string;
  exchange?: string;
  status?: string;
  target_position_id?: string;
  exit_type?: string;
  position_details?: {
    symbol: string;
    side: string;
    quantity: number;
    entry_price: string;
    current_price: string;
  };
}

export interface ExitResult {
  positions_closed: number;
  exit_price: string;
  pnl: string;
  exit_time: string;
}

export interface EntryConfig {
  max_entries: number;
  position_num: number;
  re_entry_num: number;
  positions_config?: Array<{
    side: string;
    quantity: number;
    option_type: string | null;
  }>;
}

export interface ExitConfig {
  target_position_vpi?: string;
  exit_type?: string | null;
  order_type?: string;
  has_re_entry?: boolean;
  post_execution?: boolean;
}

// Condition evaluation types
export interface ConditionEvaluated {
  lhs_expression: Record<string, unknown>;
  rhs_expression: Record<string, unknown>;
  lhs_value: number | string;
  rhs_value: number | string;
  operator: string;
  timestamp: string;
  condition_type: string;
  result: boolean;
  condition_text: string;
  raw?: string;
  evaluated?: string;
  result_icon?: string;
  tick_count?: number;
}

export interface CandleData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  indicators?: Record<string, number>;
}

export interface EvaluatedConditions {
  conditions_evaluated: ConditionEvaluated[];
  expression_values: Record<string, unknown>;
  candle_data: Record<string, {
    current: CandleData;
    previous: CandleData;
  }>;
}

export interface ExitSignalData {
  exit_signal_time: string;
  exit_signal_price: number;
  exit_reason: string;
  node_id: string;
  conditions_met?: unknown[];
}

// Square-off types
export interface SquareOffData {
  executed: boolean;
  reason: string;
  condition_type: string;
  orders_cancelled: number;
  positions_closed: number;
  exit_type: string;
  trigger_values?: {
    trigger_time: string | null;
    current_time: string;
    time_type: string;
    exit_time_configured: string;
  };
  exit_description: string;
}

export interface ClosedPosition {
  position_id: string;
  re_entry_num: number;
  symbol: string;
  side: string;
  quantity: number;
  entry_price: number;
  exit_price: number;
}

export interface SquareOffConfig {
  immediate_exit_enabled: boolean;
  performance_based_exit_enabled: boolean;
  time_based_exit_enabled: boolean;
  time_settings?: {
    exit_time: string;
    minutes_before_close: number;
  };
}

export interface SkipReason {
  executed: boolean;
  skipped: boolean;
  reason: string;
  exit_reason: string;
}

export interface StrategyConfig {
  symbol: string;
  timeframe: string;
  exchange: string;
  trading_instrument: {
    type: string;
    underlyingType: string;
  };
  end_conditions_configured: number;
}

export interface ExecutionNode {
  execution_id: string;
  parent_execution_id: string | null;
  timestamp: string;
  event_type: string;
  node_id: string;
  node_name: string;
  node_type: string;
  children_nodes: ChildNode[];
  strategy_config?: StrategyConfig;
  position?: PositionInfo;
  action?: ActionInfo;
  exit_result?: ExitResult;
  entry_config?: EntryConfig;
  exit_config?: ExitConfig;
  skip_reason?: SkipReason;
  statistics?: {
    orders_generated: number;
    positions_closed: number;
  };
  ltp_store?: Record<string, LtpData>;
  // Condition details (for signal nodes)
  condition_type?: string;
  conditions_preview?: string;
  signal_emitted?: boolean;
  evaluated_conditions?: EvaluatedConditions;
  signal_time?: string;
  variables_calculated?: string[];
  exit_reason?: string;
  exit_signal_data?: ExitSignalData;
  // Square-off details
  square_off?: SquareOffData;
  closed_positions?: ClosedPosition[];
  config?: SquareOffConfig;
  timestamp_info?: {
    current_time: string;
    strategy_symbol: string;
  };
  // Node variables calculated during execution
  node_variables?: Record<string, {
    expression_preview: string;
    value: number;
  }>;
}

export interface DiagnosticsExport {
  events_history: Record<string, ExecutionNode>;
}

// Node types for flow visualization
export type NodeCategory = 
  | 'start'
  | 'entry-signal'
  | 'entry'
  | 'exit-signal'
  | 'exit'
  | 're-entry-signal'
  | 'square-off';

export const getNodeCategory = (nodeType: string): NodeCategory => {
  switch (nodeType) {
    case 'StartNode':
      return 'start';
    case 'EntrySignalNode':
      return 'entry-signal';
    case 'EntryNode':
      return 'entry';
    case 'ExitSignalNode':
      return 'exit-signal';
    case 'ExitNode':
      return 'exit';
    case 'ReEntrySignalNode':
      return 're-entry-signal';
    case 'SquareOffNode':
      return 'square-off';
    default:
      return 'start';
  }
};

export const getNodeColor = (category: NodeCategory): string => {
  switch (category) {
    case 'start':
      return 'hsl(var(--primary))';
    case 'entry-signal':
      return 'hsl(142, 76%, 36%)'; // Green
    case 'entry':
      return 'hsl(142, 76%, 46%)'; // Lighter green
    case 'exit-signal':
      return 'hsl(0, 84%, 60%)'; // Red
    case 'exit':
      return 'hsl(0, 84%, 50%)'; // Darker red
    case 're-entry-signal':
      return 'hsl(38, 92%, 50%)'; // Orange
    case 'square-off':
      return 'hsl(262, 83%, 58%)'; // Purple
    default:
      return 'hsl(var(--muted-foreground))';
  }
};
