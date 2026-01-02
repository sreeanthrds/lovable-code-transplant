/**
 * Service for interacting with local FastAPI server
 */

const LOCAL_API_BASE_URL = 'https://api.tradelayout.com'; // Production API endpoint

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface StrategyExecutionRequest {
  strategy_id: string;
  instructions?: string;
  parameters?: Record<string, any>;
}

export interface StrategyExecutionResponse {
  execution_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
  timestamp: string;
}

export interface BacktestRequest {
  start_date: string;
  end_date: string;
  user_id: string;
  strategy_id: string;
}

export interface BacktestResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface AngelOneSessionData {
  userId: string;
  jwtToken: string;
  refreshToken: string;
  feedToken: string;
  apiKey: string;
}

class LocalApiService {
  private baseUrl: string;

  constructor(baseUrl: string = LOCAL_API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Generic method to make API calls
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true', // Skip ngrok browser warning
          'Access-Control-Allow-Origin': '*', // Allow CORS
          ...options.headers,
        },
        mode: 'cors', // Enable CORS
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Test connection to local API
   */
  async testConnection(): Promise<ApiResponse> {
    return this.makeRequest('/health');
  }

  /**
   * Execute strategy with Python code
   */
  async executeStrategy(
    request: StrategyExecutionRequest
  ): Promise<ApiResponse<StrategyExecutionResponse>> {
    return this.makeRequest<StrategyExecutionResponse>('/execute-strategy', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get execution status
   */
  async getExecutionStatus(executionId: string): Promise<ApiResponse<StrategyExecutionResponse>> {
    return this.makeRequest<StrategyExecutionResponse>(`/execution/${executionId}/status`);
  }

  /**
   * Cancel strategy execution
   */
  async cancelExecution(executionId: string): Promise<ApiResponse> {
    return this.makeRequest(`/execution/${executionId}/cancel`, {
      method: 'POST',
    });
  }

  /**
   * Get list of available strategies from Python backend
   */
  async getAvailableStrategies(): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>('/strategies');
  }

  /**
   * Run optimized backtest for a strategy
   */
  async runBacktest(request: BacktestRequest): Promise<ApiResponse<BacktestResponse>> {
    return this.makeRequest<BacktestResponse>('/backtest/range/optimized', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get basic backtest endpoint
   */
  async getBacktest(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/backtest');
  }

  /**
   * Save AngelOne session tokens to FastAPI backend for strategy execution
   */
  async saveAngelOneSession(sessionData: AngelOneSessionData): Promise<ApiResponse> {
    return this.makeRequest('/save_angelone_session', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  /**
   * Execute strategy using a specific broker connection
   */
  async executeStrategyWithConnection(
    request: StrategyExecutionRequest,
    connectionTokens: {
      accessToken?: string;
      refreshToken?: string;
      requestToken?: string;
      brokerType: string;
      connectionId: string;
    }
  ): Promise<ApiResponse<StrategyExecutionResponse>> {
    return this.makeRequest<StrategyExecutionResponse>('/execute-strategy-with-connection', {
      method: 'POST',
      body: JSON.stringify({
        ...request,
        connection: connectionTokens
      }),
    });
  }

  /**
   * Update API base URL
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  /**
   * Get current base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }
}

// Export singleton instance
export const localApiService = new LocalApiService();