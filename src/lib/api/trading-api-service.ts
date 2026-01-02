/**
 * Trading API Service - Comprehensive backend integration
 * Base URL: https://daf8278853a0.ngrok-free.app
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

// Broker Types

// Stored in database (one-time registration)
export interface BrokerConnectionData {
  id?: string;
  user_id: string;
  broker: string;
  connection_name: string;
  client_code: string;
  totp_secret: string;
  status?: 'connected' | 'disconnected';
  created_at?: string;
}

// Request to save/register broker connection
export interface SaveBrokerConnectionRequest {
  user_id: string;
  broker: string;
  connection_name: string;
  client_code: string;
  api_key: string;
}

// Used for daily connection (TOTP code never stored)
export interface BrokerConnectRequest {
  user_id: string;
  broker_connection_id: string;
  totp_code: string; // 6-digit TOTP code - never stored in DB
}

export interface BrokerConnectResponse {
  success: boolean;
  message: string;
  connection_id: string;
  broker: string;
  status: 'connected' | 'disconnected' | 'error';
}

export interface BrokerStatusResponse {
  broker: string;
  status: 'connected' | 'disconnected';
  connected_at?: string;
  account_info?: {
    account_id: string;
    name: string;
    available_margin: number;
    used_margin: number;
    total_margin: number;
  };
}

export interface BrokerDisconnectRequest {
  user_id: string;
  broker: 'angelone';
}

// Live Trading Types
export interface StartSessionRequest {
  strategy_id: string;
  user_id: string;
  broker: 'angelone';
}

export interface StartSessionResponse {
  session_id: string;
  status: 'running' | 'stopped' | 'error';
  strategy_id: string;
  started_at: string;
}

export interface SessionSnapshot {
  session_id: string;
  status: 'running' | 'stopped' | 'error';
  strategy_name: string;
  started_at: string;
  pnl: {
    realized_pnl: number;
    unrealized_pnl: number;
    total_pnl: number;
  };
  positions: Array<{
    symbol: string;
    quantity: number;
    entry_price: number;
    current_price: number;
    pnl: number;
    side: 'BUY' | 'SELL';
  }>;
  orders: Array<{
    order_id: string;
    symbol: string;
    side: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    status: 'PENDING' | 'FILLED' | 'REJECTED' | 'CANCELLED';
    timestamp: string;
  }>;
  account: {
    available_margin: number;
    used_margin: number;
    total_margin: number;
  };
}

export interface StopSessionRequest {
  session_id: string;
}

export interface StopSessionResponse {
  success: boolean;
  message: string;
  session_id: string;
  final_pnl: number;
}

// Backtest Types
export interface BacktestRequest {
  strategy: {
    name: string;
    instrument: string;
    timeframe: string;
    entry_conditions: any[];
    exit_conditions: any[];
  };
  start_date: string;
  end_date: string;
  initial_capital: number;
}

export interface BacktestResponse {
  backtest_id: string;
  status: 'completed' | 'running' | 'failed';
  results: {
    total_trades: number;
    winning_trades: number;
    losing_trades: number;
    win_rate: number;
    total_pnl: number;
    max_drawdown: number;
    sharpe_ratio: number;
  };
}

export interface BacktestResultsResponse {
  backtest_id: string;
  strategy_name: string;
  results: {
    total_trades: number;
    winning_trades: number;
    losing_trades: number;
    win_rate: number;
    total_pnl: number;
    max_drawdown: number;
    sharpe_ratio: number;
  };
  trades: Array<{
    entry_time: string;
    exit_time: string;
    symbol: string;
    entry_price: number;
    exit_price: number;
    quantity: number;
    pnl: number;
  }>;
}

// Strategy Types
export interface SaveStrategyRequest {
  user_id: string;
  strategy: {
    name: string;
    instrument: string;
    timeframe: string;
    entry_conditions: any[];
    exit_conditions: any[];
  };
}

export interface SaveStrategyResponse {
  success: boolean;
  strategy_id: string;
  message: string;
}

export interface StrategyResponse {
  strategy_id: string;
  name: string;
  instrument: string;
  timeframe: string;
  entry_conditions: any[];
  exit_conditions: any[];
  created_at: string;
}

export interface ValidateStrategyRequest {
  strategy: {
    name: string;
    instrument: string;
    timeframe: string;
    entry_conditions: any[];
    exit_conditions: any[];
  };
}

export interface ValidateStrategyResponse {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  message: string;
}

// Market Data Types
export interface QuoteResponse {
  symbol: string;
  exchange: string;
  ltp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: string;
}

export interface HistoricalDataResponse {
  symbol: string;
  timeframe: string;
  data: Array<{
    timestamp: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
}

export interface InstrumentsResponse {
  instruments: Array<{
    symbol: string;
    name: string;
    exchange: string;
    instrument_type: string;
    lot_size: number;
  }>;
}

// ============================================
// API SERVICE CLASS
// ============================================

class TradingApiService {
  private baseUrl: string;

  constructor(baseUrl: string = 'https://daf8278853a0.ngrok-free.app') {
    this.baseUrl = baseUrl;
  }

  // ============================================
  // CORE REQUEST HANDLER
  // ============================================
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true', // Skip ngrok warning
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log(`✅ API Response:`, data);
      return data;
    } catch (error) {
      console.error(`❌ API Error:`, error);
      throw error;
    }
  }

  // ============================================
  // HEALTH & INFO
  // ============================================
  async getHealth() {
    return this.request<{ status: string; redis: string; websocket: string }>(
      '/health'
    );
  }

  async getInfo() {
    return this.request<{ name: string; version: string; endpoints: any }>(
      '/'
    );
  }

  // ============================================
  // BROKER CONNECTION APIs
  // ============================================
  
  // Save/Register Broker Connection
  async saveBrokerConnection(request: SaveBrokerConnectionRequest): Promise<{ success: boolean; connection_id: string; message: string }> {
    return this.request<{ success: boolean; connection_id: string; message: string }>('/api/broker/save-connection', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Connect using saved broker connection
  async connectBroker(request: BrokerConnectRequest): Promise<BrokerConnectResponse> {
    return this.request<BrokerConnectResponse>('/api/broker/connect', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // List saved broker connections
  async listBrokerConnections(userId: string): Promise<BrokerConnectionData[]> {
    return this.request<BrokerConnectionData[]>(`/api/broker/connections?user_id=${userId}`);
  }

  // Update broker connection
  async updateBrokerConnection(connectionId: string, data: Partial<BrokerConnectionData>): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/api/broker/connections/${connectionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getBrokerStatus(userId: string, broker: string = 'angelone'): Promise<BrokerStatusResponse> {
    return this.request<BrokerStatusResponse>(
      `/api/broker/status?user_id=${userId}&broker=${broker}`
    );
  }

  async disconnectBroker(request: BrokerDisconnectRequest): Promise<{ success: boolean; message: string }> {
    return this.request('/api/broker/disconnect', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // ============================================
  // LIVE TRADING APIs
  // ============================================
  async startSession(request: StartSessionRequest): Promise<StartSessionResponse> {
    return this.request<StartSessionResponse>('/api/live-trading/sessions/start', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getSessionSnapshot(sessionId: string): Promise<SessionSnapshot> {
    return this.request<SessionSnapshot>(
      `/api/live-trading/sessions/${sessionId}/snapshot`
    );
  }

  async stopSession(request: StopSessionRequest): Promise<StopSessionResponse> {
    return this.request<StopSessionResponse>('/api/live-trading/sessions/stop', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async listSessions(userId: string): Promise<{ sessions: Array<any> }> {
    return this.request(`/api/live-trading/sessions?user_id=${userId}`);
  }

  // ============================================
  // BACKTESTING APIs
  // ============================================
  async runBacktest(request: BacktestRequest): Promise<BacktestResponse> {
    return this.request<BacktestResponse>('/api/backtest/run', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getBacktestResults(backtestId: string): Promise<BacktestResultsResponse> {
    return this.request<BacktestResultsResponse>(
      `/api/backtest/results/${backtestId}`
    );
  }

  // ============================================
  // STRATEGY APIs
  // ============================================
  async saveStrategy(request: SaveStrategyRequest): Promise<SaveStrategyResponse> {
    return this.request<SaveStrategyResponse>('/api/strategies/save', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getStrategy(strategyId: string): Promise<StrategyResponse> {
    return this.request<StrategyResponse>(`/api/strategies/${strategyId}`);
  }

  async listStrategies(userId: string): Promise<{ strategies: Array<StrategyResponse> }> {
    return this.request(`/api/strategies/list?user_id=${userId}`);
  }

  async validateStrategy(request: ValidateStrategyRequest): Promise<ValidateStrategyResponse> {
    return this.request<ValidateStrategyResponse>('/api/strategies/validate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // ============================================
  // MARKET DATA APIs
  // ============================================
  async getQuote(symbol: string, exchange: string = 'NSE'): Promise<QuoteResponse> {
    return this.request<QuoteResponse>(
      `/api/market/quote?symbol=${symbol}&exchange=${exchange}`
    );
  }

  async getHistoricalData(
    symbol: string,
    timeframe: string,
    from: string,
    to: string
  ): Promise<HistoricalDataResponse> {
    return this.request<HistoricalDataResponse>(
      `/api/market/historical?symbol=${symbol}&timeframe=${timeframe}&from=${from}&to=${to}`
    );
  }

  async getInstruments(exchange: string = 'NSE'): Promise<InstrumentsResponse> {
    return this.request<InstrumentsResponse>(
      `/api/market/instruments?exchange=${exchange}`
    );
  }

  // ============================================
  // UTILITY METHODS
  // ============================================
  setBaseUrl(url: string) {
    this.baseUrl = url;
    console.log(`🔧 API Base URL updated to: ${url}`);
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================
export const tradingApiService = new TradingApiService();
