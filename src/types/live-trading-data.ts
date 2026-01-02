/**
 * Live Trading Data Types - Session-based polling structure
 */

// API Request/Response Types
export interface StartLiveRequest {
  user_id: string;
  strategy_id: string;
  strategy_name?: string;
  connection_id: string;
  session_id?: string; // Optional, for future use
}

export interface StopLiveRequest {
  session_id: string;
  square_off?: boolean;
}

export interface LiveDashboardResponse {
  total_sessions: number;
  active_sessions: number;
  cache_time: string;
  sessions: {
    [sessionId: string]: {
      session_id: string;
      strategy_name: string;
      broker_info: {
        broker_type: string;
        account_id: string;
      };
      status: 'active' | 'starting' | 'stopped' | 'error';
      data: LiveSessionData | null;
    };
  };
}

export interface LiveSessionData {
  timestamp: string;
  is_fresh: boolean;
  gps_data: {
    positions: LivePosition[];
    trades: LiveTrade[];
    pnl: {
      total: number;
      today: number;
      realized: number;
      unrealized: number;
    };
  };
  broker_data: {
    orders: LiveOrder[];
    account_info: {
      available_margin: number;
      used_margin: number;
      total_value: number;
    };
  };
  market_data: {
    [symbol: string]: {
      ltp: number;
      change: number;
      change_percent: number;
    };
  };
  // Events history for flow diagrams (execution node records)
  events_history?: Record<string, any>;
}

export interface LivePosition {
  symbol: string;
  quantity: number;
  average_price: number;
  current_price: number;
  pnl: number;
  pnl_percentage: number;
  side: 'long' | 'short';
  product: 'MIS' | 'CNC' | 'NRML';
}

export interface LiveTrade {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  timestamp: string;
  pnl?: number;
}

export interface LiveOrder {
  order_id: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  order_type: 'market' | 'limit' | 'stoploss';
  status: 'pending' | 'complete' | 'rejected' | 'cancelled';
  timestamp: string;
}