/**
 * Zerodha Kite Connect API Service
 */

interface ZerodhaCredentials {
  apiKey: string;
  apiSecret: string;
  requestToken: string;
}

interface LoginResponse {
  success: boolean;
  data?: {
    accessToken: string;
    userId: string;
  };
  message?: string;
  error?: string;
}

export class ZerodhaApiService {
  private apiKey: string;
  private accessToken: string | null = null;
  private userId: string | null = null;

  constructor() {
    this.apiKey = '';
  }

  /**
   * Generate access token from request token
   */
  async generateAccessToken(credentials: ZerodhaCredentials): Promise<LoginResponse> {
    try {
      // This would typically be done on the server side for security
      // For demo purposes, we'll simulate the token generation
      const response = await fetch('https://api.kite.trade/session/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Kite-Version': '3'
        },
        body: new URLSearchParams({
          api_key: credentials.apiKey,
          request_token: credentials.requestToken,
          checksum: this.generateChecksum(credentials.apiKey, credentials.requestToken, credentials.apiSecret)
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'success') {
        this.apiKey = credentials.apiKey;
        this.accessToken = data.data.access_token;
        this.userId = data.data.user_id;

        return {
          success: true,
          data: {
            accessToken: data.data.access_token,
            userId: data.data.user_id
          }
        };
      } else {
        return {
          success: false,
          error: data.message || 'Token generation failed'
        };
      }
    } catch (error) {
      console.error('Zerodha token generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Token generation failed'
      };
    }
  }

  /**
   * Generate checksum for authentication
   */
  private generateChecksum(apiKey: string, requestToken: string, apiSecret: string): string {
    // This would typically use crypto module on server side
    // For client-side demo, we'll simulate this
    const crypto = require('crypto');
    const message = apiKey + requestToken + apiSecret;
    return crypto.createHash('sha256').update(message).digest('hex');
  }

  /**
   * Make authenticated API request
   */
  private async makeAuthenticatedRequest(endpoint: string, method: string = 'GET', body?: any) {
    if (!this.accessToken) {
      throw new Error('Not authenticated. Please generate access token first.');
    }

    const response = await fetch(`https://api.kite.trade${endpoint}`, {
      method,
      headers: {
        'Authorization': `token ${this.apiKey}:${this.accessToken}`,
        'Content-Type': 'application/json',
        'X-Kite-Version': '3'
      },
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get user profile
   */
  async getProfile() {
    return this.makeAuthenticatedRequest('/user/profile');
  }

  /**
   * Place order
   */
  async placeOrder(orderParams: any) {
    return this.makeAuthenticatedRequest('/orders/regular', 'POST', orderParams);
  }

  /**
   * Get holdings
   */
  async getHoldings() {
    return this.makeAuthenticatedRequest('/portfolio/holdings');
  }

  /**
   * Get positions
   */
  async getPositions() {
    return this.makeAuthenticatedRequest('/portfolio/positions');
  }

  /**
   * Get orders
   */
  async getOrders() {
    return this.makeAuthenticatedRequest('/orders');
  }

  /**
   * Logout (invalidate token)
   */
  async logout() {
    if (!this.accessToken) {
      return { success: true };
    }

    try {
      await this.makeAuthenticatedRequest('/session/token', 'DELETE');
      this.accessToken = null;
      this.userId = null;
      return { success: true };
    } catch (error) {
      console.error('Error during logout:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Logout failed' };
    }
  }
}

export const zerodhaApiService = new ZerodhaApiService();