import { getApiConfig } from '@/lib/api-config';

// Default fallback URL - should be overridden by user config
const DEFAULT_BACKTEST_API_URL = 'https://localhost:8000';

// Request types based on OpenAPI spec
export interface BacktestRequest {
  strategy_id: string;
  start_date: string; // YYYY-MM-DD
  end_date?: string | null; // YYYY-MM-DD, optional - defaults to start_date
  mode?: string; // defaults to 'backtesting'
  include_diagnostics?: boolean; // defaults to true
}

export interface BacktestResponse {
  success: boolean;
  data?: any | null;
  error?: string | null;
}

// Simulation request types
export interface SimulationStartRequest {
  user_id: string;
  strategy_id: string;
  start_date: string; // YYYY-MM-DD
  mode?: string; // defaults to 'live'
  broker_connection_id?: string; // defaults to 'clickhouse'
  speed_multiplier?: number; // defaults to 1.0
}

export interface SimulationStartResponse {
  session_id: string;
  status: string;
  poll_url: string;
}

export interface SimulationState {
  session_id: string;
  status: string;
  timestamp: string;
  progress_percentage: number;
  active_nodes: Array<{
    node_id: string;
    node_type: string;
    status: string;
  }>;
  latest_candles?: Record<string, any>;
  ltp_store?: Record<string, { ltp: number }>;
  open_positions?: Array<{
    position_id: string;
    symbol: string;
    entry_price: number;
    current_ltp: number;
    unrealized_pnl: number;
  }>;
  total_unrealized_pnl?: number;
  stats?: {
    ticks_processed: number;
    total_ticks: number;
    progress_percentage: number;
  };
}

export interface SimulationSession {
  session_id: string;
  user_id: string;
  strategy_id: string;
  status: string;
  progress_percentage: number;
}

// Legacy types for backward compatibility (used by some UI components)
export interface BacktestProgress {
  current_date: string;
  total_days: number;
  completed_days: number;
  percentage: number;
}
export interface OverallSummary {
  total_positions: number;
  total_pnl: number;
  win_rate: number;
  total_winning_trades: number;
  total_losing_trades: number;
}

export interface DailySummary {
  date: string;
  positions: number;
  pnl: number;
  has_data: boolean;
  file_size_kb: number;
}

export interface BacktestMetadataResponse {
  strategy_id: string;
  start_date: string;
  end_date: string;
  overall_summary: OverallSummary;
  daily_summaries: DailySummary[];
}

export interface Condition {
  timestamp?: string;
  expression: string;
  lhs_value: number;
  rhs_value: number;
  operator: string;
  result: boolean;
}

export interface EntryExitSnapshot {
  timestamp: string;
  spot_price: number;
  ltp_store_snapshot?: Record<string, { ltp: number }>;
  conditions?: Condition[];
  node_variables?: NodeVariables;
}

export interface PositionEntry {
  entry_time?: string;
  price?: number;
  nifty_spot?: number;
  contract_ltp?: number;
  node_id?: string;
  entry_snapshot?: EntryExitSnapshot;
  diagnostics?: Record<string, any>;
  snapshot?: Record<string, any>;
}

export interface PositionExit {
  exit_time?: string;
  price?: number;
  nifty_spot?: number;
  contract_ltp?: number;
  node_id?: string;
  trigger_node_id?: string;
  close_reason?: string;
  exit_snapshot?: EntryExitSnapshot;
  diagnostics?: Record<string, any>;
  snapshot?: Record<string, any>;
}

export interface ConditionInfo {
  original: string;
  substituted: string;
}

export interface NodeVariableValue {
  original: string;
  substituted: string | number;
}

export type NodeVariables = Record<string, Record<string, NodeVariableValue | number>>;

export interface Position {
  position_id: string;
  position_num: number;
  re_entry_num: number;
  status: string;
  symbol: string;
  side?: string;
  quantity?: number;
  entry_time: string;
  entry_price?: number;
  exit_time: string;
  exit_price?: number;
  pnl: number;
  pnl_percentage?: number;
  nifty_spot_at_entry?: number;
  nifty_spot_at_exit?: number;
  entry_node_id?: string;
  exit_node_id?: string;
  exit_reason?: string;
  entry_conditions?: ConditionInfo;
  exit_conditions?: ConditionInfo;
  node_variables?: NodeVariables;
  exit_node_variables?: NodeVariables;
  node_variables_display?: NodeVariables;
  exit_node_variables_display?: NodeVariables;
  entry?: PositionEntry;
  exit?: PositionExit;
}

export interface DayDetailSummary {
  total_positions: number;
  total_pnl: number;
  winning_trades: number;
  losing_trades: number;
  breakeven_trades: number;
  win_rate: number;
  avg_win?: number;
  avg_loss?: number;
  largest_win?: number;
  largest_loss?: number;
}

export interface DayDetailResponse {
  date: string;
  summary: DayDetailSummary;
  positions: Position[];
}

// Stream event types
export type StreamEventType = 'metadata' | 'day_start' | 'transaction' | 'day_summary' | 'complete';

export interface StreamEvent {
  type: StreamEventType;
  data?: any;
  date?: string;
  summary?: any;
  overall_summary?: any;
}

class BacktestApiService {
  private baseUrl: string;
  private configLoaded: boolean = false;

  constructor() {
    this.baseUrl = DEFAULT_BACKTEST_API_URL;
  }

  // Load config from database for a specific user
  async loadConfig(userId?: string): Promise<void> {
    try {
      const config = await getApiConfig(userId);
      this.baseUrl = config.baseUrl;
      this.configLoaded = true;
      console.log('[BacktestApiService] Loaded API config, baseUrl:', this.baseUrl);
    } catch (error) {
      console.error('[BacktestApiService] Failed to load config, using default:', error);
    }
  }

  setBaseUrl(url: string) {
    this.baseUrl = url;
    this.configLoaded = true;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  isConfigLoaded(): boolean {
    return this.configLoaded;
  }

  // Common headers for all requests (includes ngrok header)
  private getHeaders(contentType?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'ngrok-skip-browser-warning': 'true',
    };
    if (contentType) {
      headers['Content-Type'] = contentType;
    }
    return headers;
  }

  // ============ Backtest Endpoints ============

  /**
   * Run backtest synchronously and get comprehensive results
   * POST /api/v1/backtest
   */
  async runBacktest(request: BacktestRequest): Promise<BacktestResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/backtest`, {
      method: 'POST',
      headers: this.getHeaders('application/json'),
      body: JSON.stringify({
        strategy_id: request.strategy_id,
        start_date: request.start_date,
        end_date: request.end_date || request.start_date,
        mode: request.mode || 'backtesting',
        include_diagnostics: request.include_diagnostics ?? true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to run backtest: ${response.status} ${errorText}`);
    }

    return response.json();
  }

  /**
   * Stream backtest results progressively (NDJSON format)
   * POST /api/v1/backtest/stream
   * Returns an async generator for streaming events
   */
  async *streamBacktest(request: BacktestRequest): AsyncGenerator<StreamEvent, void, unknown> {
    const response = await fetch(`${this.baseUrl}/api/v1/backtest/stream`, {
      method: 'POST',
      headers: this.getHeaders('application/json'),
      body: JSON.stringify({
        strategy_id: request.strategy_id,
        start_date: request.start_date,
        end_date: request.end_date || request.start_date,
        mode: request.mode || 'backtesting',
        include_diagnostics: request.include_diagnostics ?? true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to stream backtest: ${response.status} ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      
      // Process complete lines (NDJSON format)
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer
      
      for (const line of lines) {
        if (line.trim()) {
          try {
            const event: StreamEvent = JSON.parse(line);
            yield event;
          } catch (e) {
            console.error('Failed to parse stream event:', line, e);
          }
        }
      }
    }
    
    // Process any remaining content
    if (buffer.trim()) {
      try {
        const event: StreamEvent = JSON.parse(buffer);
        yield event;
      } catch (e) {
        console.error('Failed to parse final stream event:', buffer, e);
      }
    }
  }

  /**
   * Get backtest service status
   * GET /api/v1/backtest/status
   */
  async getBacktestStatus(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/backtest/status`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get backtest status: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get generated trades_daily.json file
   * GET /api/v1/backtest/files/trades_daily
   */
  async getTradesDailyFile(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/backtest/files/trades_daily`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get trades daily file: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get generated diagnostics_export.json file
   * GET /api/v1/backtest/files/diagnostics_export
   */
  async getDiagnosticsExportFile(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/backtest/files/diagnostics_export`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get diagnostics export file: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get both trades and diagnostics files in parallel
   */
  async getBacktestFiles(): Promise<{ trades: any; diagnostics: any }> {
    const [trades, diagnostics] = await Promise.all([
      this.getTradesDailyFile(),
      this.getDiagnosticsExportFile()
    ]);

    return { trades, diagnostics };
  }

  // ============ Simulation Endpoints ============

  /**
   * Start live simulation
   * POST /api/v1/simulation/start
   */
  async startSimulation(request: SimulationStartRequest): Promise<SimulationStartResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/simulation/start`, {
      method: 'POST',
      headers: this.getHeaders('application/json'),
      body: JSON.stringify({
        user_id: request.user_id,
        strategy_id: request.strategy_id,
        start_date: request.start_date,
        mode: request.mode || 'live',
        broker_connection_id: request.broker_connection_id || 'clickhouse',
        speed_multiplier: request.speed_multiplier || 1.0,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to start simulation: ${response.status} ${errorText}`);
    }

    return response.json();
  }

  /**
   * Get current state of running simulation
   * GET /api/v1/simulation/{session_id}/state
   */
  async getSimulationState(sessionId: string): Promise<SimulationState> {
    const response = await fetch(`${this.baseUrl}/api/v1/simulation/${sessionId}/state`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get simulation state: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Stop running simulation
   * POST /api/v1/simulation/{session_id}/stop
   */
  async stopSimulation(sessionId: string): Promise<{ session_id: string; status: string }> {
    const response = await fetch(`${this.baseUrl}/api/v1/simulation/${sessionId}/stop`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to stop simulation: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * List all active simulation sessions
   * GET /api/v1/simulation/sessions
   */
  async listSimulationSessions(): Promise<{ sessions: SimulationSession[] }> {
    const response = await fetch(`${this.baseUrl}/api/v1/simulation/sessions`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to list simulation sessions: ${response.statusText}`);
    }

    return response.json();
  }

  // ============ Health/Info Endpoints ============

  /**
   * Root endpoint - API information
   * GET /
   */
  async getApiInfo(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get API info: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Health check endpoint
   * GET /health
   */
  async healthCheck(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/health`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }

    return response.json();
  }
}

export const backtestApi = new BacktestApiService();
