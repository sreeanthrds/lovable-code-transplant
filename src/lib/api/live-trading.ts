const API_BASE_URL = 'https://api.tradelayout.com/api';

export interface StartTradingRequest {
  user_id: string;
  strategy_id: string;
  broker_connection_id: string;
}

export interface StartTradingResponse {
  success: boolean;
  status: 'running';
}

export interface StopTradingResponse {
  success: boolean;
}

export interface PauseTradingResponse {
  success: boolean;
}

export interface StrategiesResponse {
  strategies: Array<{
    strategy_id: string;
    strategy_name: string;
    status: 'running' | 'stopped' | 'paused';
    total_pnl: number;
    realized_pnl: number;
    unrealized_pnl: number;
    positions: any[];
    started_at: string;
  }>;
}

export const liveTradingApi = {
  async startTrading(data: StartTradingRequest): Promise<StartTradingResponse> {
    const response = await fetch(`${API_BASE_URL}/live-trading/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to start trading: ${response.statusText}`);
    }

    return response.json();
  },

  async getActiveStrategies(userId: string): Promise<StrategiesResponse> {
    const response = await fetch(`${API_BASE_URL}/live-trading/strategies/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get strategies: ${response.statusText}`);
    }

    return response.json();
  },

  async stopTrading(userId: string, strategyId: string): Promise<StopTradingResponse> {
    const response = await fetch(`${API_BASE_URL}/live-trading/stop/${userId}/${strategyId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to stop trading: ${response.statusText}`);
    }

    return response.json();
  },

  async pauseTrading(userId: string, strategyId: string): Promise<PauseTradingResponse> {
    const response = await fetch(`${API_BASE_URL}/live-trading/pause/${userId}/${strategyId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to pause trading: ${response.statusText}`);
    }

    return response.json();
  },
};
