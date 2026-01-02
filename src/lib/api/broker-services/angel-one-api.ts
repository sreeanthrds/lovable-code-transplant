/**
 * Angel One SmartAPI Service
 */

interface AngelOneCredentials {
  apiKey: string;
  clientCode: string;
  password: string;
  totp: string;
}

interface AngelOneSessionData {
  userId: string;
  jwtToken: string;
  refreshToken: string;
  feedToken: string;
  apiKey: string;
}

interface LoginResponse {
  success: boolean;
  data?: {
    jwtToken: string;
    refreshToken: string;
    feedToken: string;
  };
  message?: string;
  error?: string;
}

export class AngelOneApiService {
  private smartConnect: any;
  
  constructor() {
    // SmartAPI will be initialized on login
    this.smartConnect = null;
  }

  /**
   * Authenticate with Angel One using API credentials
   */
  async login(credentials: AngelOneCredentials): Promise<LoginResponse> {
    try {
      // Dynamically import SmartAPI
      const { SmartAPI } = await import('smartapi-javascript');
      
      this.smartConnect = new SmartAPI({
        api_key: credentials.apiKey,
        client_code: credentials.clientCode,
        password: credentials.password,
        totp: credentials.totp
      });

      const sessionData = await this.smartConnect.generateSession(credentials.clientCode, credentials.password, credentials.totp);
      
      if (sessionData.status && sessionData.data) {
        return {
          success: true,
          data: {
            jwtToken: sessionData.data.jwtToken,
            refreshToken: sessionData.data.refreshToken,
            feedToken: sessionData.data.feedToken
          }
        };
      } else {
        return {
          success: false,
          error: sessionData.message || 'Login failed'
        };
      }
    } catch (error) {
      console.error('Angel One login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      };
    }
  }

  /**
   * Get user profile
   */
  async getProfile() {
    if (!this.smartConnect) {
      throw new Error('Not authenticated. Please login first.');
    }
    
    try {
      return await this.smartConnect.getProfile();
    } catch (error) {
      console.error('Error getting profile:', error);
      throw error;
    }
  }

  /**
   * Place order
   */
  async placeOrder(orderParams: any) {
    if (!this.smartConnect) {
      throw new Error('Not authenticated. Please login first.');
    }
    
    try {
      return await this.smartConnect.placeOrder(orderParams);
    } catch (error) {
      console.error('Error placing order:', error);
      throw error;
    }
  }

  /**
   * Get holdings
   */
  async getHolding() {
    if (!this.smartConnect) {
      throw new Error('Not authenticated. Please login first.');
    }
    
    try {
      return await this.smartConnect.getHolding();
    } catch (error) {
      console.error('Error getting holdings:', error);
      throw error;
    }
  }

  /**
   * Get positions
   */
  async getPosition() {
    if (!this.smartConnect) {
      throw new Error('Not authenticated. Please login first.');
    }
    
    try {
      return await this.smartConnect.getPosition();
    } catch (error) {
      console.error('Error getting positions:', error);
      throw error;
    }
  }

  /**
   * Logout
   */
  async logout() {
    if (!this.smartConnect) {
      return { success: true };
    }
    
    try {
      await this.smartConnect.terminateSession(this.smartConnect.user_id);
      this.smartConnect = null;
      return { success: true };
    } catch (error) {
      console.error('Error during logout:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Logout failed' };
    }
  }
}

export const angelOneApiService = new AngelOneApiService();