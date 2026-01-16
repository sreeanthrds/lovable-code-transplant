// Types for SSE-based backtest session
// Re-exports common types from backtest.ts for consistency
import { TradesDaily, DiagnosticsExport, DailySummary } from './backtest';

export type { TradesDaily, DiagnosticsExport, DailySummary };

export interface OverallSummary {
  total_days: number;
  total_trades: number;
  total_pnl: string;
  win_rate: string;
  largest_win: string;
  largest_loss: string;
}

export interface DayResult {
  date: string;
  day_number: number;
  total_days: number;
  summary: DailySummary;
  has_detail_data: boolean;
  status: 'pending' | 'running' | 'completed' | 'error';
  error?: string;
}

export interface BacktestSession {
  backtest_id: string;
  strategy_id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  status: 'idle' | 'starting' | 'running' | 'completed' | 'failed' | 'stopped';
  current_day?: string; // Currently running day
  completed_days: number; // Number of completed days
  daily_results: Map<string, DayResult>;
  overall_summary?: OverallSummary;
  error?: string;
  start_time?: string; // For polling implementation
}

// SSE Event Types
export interface SSEDayStarted {
  event: 'day_started';
  data: {
    date: string;
    day_number: number;
    total_days: number;
  };
}

export interface SSEDayCompleted {
  event: 'day_completed';
  data: {
    date: string;
    day_number: number;
    total_days: number;
    summary: DailySummary;
    has_detail_data: boolean;
  };
}

export interface SSEBacktestCompleted {
  event: 'backtest_completed';
  data: {
    backtest_id: string;
    overall_summary: OverallSummary;
  };
}

export interface SSEError {
  event: 'error';
  data: {
    date?: string;
    error: string;
  };
}

export type SSEEvent = SSEDayStarted | SSEDayCompleted | SSEBacktestCompleted | SSEError;

// Start backtest request/response
export interface StartBacktestRequest {
  strategy_id: string;
  start_date: string;
  end_date: string;
  initial_capital?: number;
  slippage_percentage?: number;
  commission_percentage?: number;
}

export interface StartBacktestResponse {
  backtest_id: string;
  total_days: number;
  status: string;
  stream_url: string;
}

// Day detail data (from ZIP)
export interface DayDetailData {
  trades: TradesDaily;
  diagnostics: DiagnosticsExport;
}
