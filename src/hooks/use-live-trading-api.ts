import { useState, useCallback, useRef } from 'react';
import { StartLiveRequest, StopLiveRequest, LiveDashboardResponse } from '@/types/live-trading-data';
import { getApiBaseUrl } from '@/lib/api-config';

// Mock data for demonstration when API is unavailable
const MOCK_DASHBOARD_DATA: LiveDashboardResponse = {
  total_sessions: 1,
  active_sessions: 1,
  cache_time: new Date().toISOString(),
  sessions: {
    'mock_session_1': {
      session_id: 'mock_session_1',
      strategy_name: 'Demo Strategy',
      broker_info: {
        broker_type: 'clickhouse',
        account_id: 'DEMO'
      },
      status: 'active',
      data: {
        timestamp: new Date().toISOString(),
        is_fresh: true,
        gps_data: {
          positions: [
            {
              symbol: 'NIFTY24DEC23000CE',
              quantity: 50,
              average_price: 150.0,
              current_price: 165.5,
              pnl: 775.0,
              pnl_percentage: 10.33,
              side: 'long',
              product: 'MIS'
            }
          ],
          trades: [
            {
              id: 'trade_1',
              symbol: 'NIFTY24DEC23000CE',
              side: 'buy',
              quantity: 50,
              price: 150.0,
              timestamp: new Date(Date.now() - 1800000).toISOString(),
              pnl: 775.0
            }
          ],
          pnl: {
            total: 775.0,
            today: 775.0,
            realized: 0,
            unrealized: 775.0
          }
        },
        broker_data: {
          orders: [
            {
              order_id: 'order_1',
              symbol: 'NIFTY24DEC23000CE',
              side: 'buy',
              quantity: 50,
              price: 150.0,
              order_type: 'market',
              status: 'complete',
              timestamp: new Date(Date.now() - 1800000).toISOString()
            }
          ],
          account_info: {
            available_margin: 95000.0,
            used_margin: 5000.0,
            total_value: 100000.0
          }
        },
        market_data: {
          'NIFTY24DEC23000CE': {
            ltp: 165.5,
            change: 15.5,
            change_percent: 10.33
          }
        }
      }
    }
  }
};

export const useLiveTradingApi = (userId?: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiBaseUrl = useRef<string>('');

  // Initialize API URL from config
  const initApiUrl = useCallback(async () => {
    if (userId && !apiBaseUrl.current) {
      apiBaseUrl.current = await getApiBaseUrl(userId) || '';
    }
    return apiBaseUrl.current;
  }, [userId]);

  const startLiveSession = useCallback(async (request: StartLiveRequest) => {
    setError(null);
    setLoading(true);
    
    try {
      const baseUrl = await initApiUrl();
      if (!baseUrl) {
        throw new Error('API URL not configured. Please set up API configuration in admin panel.');
      }
      
      console.log('🚀 Starting live session with URL:', baseUrl);
      
      const response = await fetch(`${baseUrl}/api/live-trading/session/start`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || errorData.detail || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start session';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [initApiUrl]);

  const stopLiveSession = useCallback(async (request: StopLiveRequest, requestUserId?: string) => {
    setError(null);
    setLoading(true);
    
    try {
      const baseUrl = await initApiUrl();
      if (!baseUrl) {
        throw new Error('API URL not configured. Please set up API configuration in admin panel.');
      }
      
      // Add user_id to the request body for authentication
      const requestBody = requestUserId ? { ...request, user_id: requestUserId } : request;
      
      const response = await fetch(`${baseUrl}/api/live-trading/session/stop`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || errorData.detail || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop session';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [initApiUrl]);

  const getDashboardData = useCallback(async (requestUserId: string): Promise<LiveDashboardResponse> => {
    try {
      const baseUrl = await initApiUrl();
      if (!baseUrl) {
        console.log('📊 No API URL configured, using mock dashboard data');
        return { ...MOCK_DASHBOARD_DATA, cache_time: new Date().toISOString() };
      }
      
      const response = await fetch(`${baseUrl}/api/live-trading/dashboard/${requestUserId}`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });

      // Check if response is HTML (ngrok warning page)
      const contentType = response.headers.get('content-type') || '';
      const responseText = await response.text();

      if (contentType.includes('text/html') || responseText.startsWith('<!DOCTYPE')) {
        console.warn('📊 API returned HTML, using mock dashboard data');
        return { ...MOCK_DASHBOARD_DATA, cache_time: new Date().toISOString() };
      }

      if (!response.ok) {
        console.warn('📊 API error, using mock dashboard data');
        return { ...MOCK_DASHBOARD_DATA, cache_time: new Date().toISOString() };
      }

      const data = JSON.parse(responseText);
      return data;
    } catch (err) {
      console.warn('📊 Dashboard fetch failed, using mock data:', err);
      return { ...MOCK_DASHBOARD_DATA, cache_time: new Date().toISOString() };
    }
  }, [initApiUrl]);

  const getSessionData = useCallback(async (sessionId: string) => {
    try {
      const baseUrl = await initApiUrl();
      if (!baseUrl) {
        console.log('📊 No API URL configured');
        return null;
      }
      
      const response = await fetch(`${baseUrl}/api/live-trading/session/${sessionId}`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('📊 Session not found:', sessionId);
          return null;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.warn('📊 Session fetch failed:', err);
      return null;
    }
  }, [initApiUrl]);

  // Stop all sessions for a user (cleanup orphaned sessions)
  const stopAllUserSessions = useCallback(async (requestUserId: string) => {
    try {
      const baseUrl = await initApiUrl();
      if (!baseUrl) {
        console.log('No API URL configured');
        return { stopped: 0 };
      }
      
      const response = await fetch(`${baseUrl}/api/live-trading/user/${requestUserId}/stop-all`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || errorData.detail || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('🛑 Stopped all user sessions:', data);
      return data;
    } catch (err) {
      console.warn('Failed to stop all user sessions:', err);
      return { stopped: 0, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, [initApiUrl]);

  return {
    startLiveSession,
    stopLiveSession,
    stopAllUserSessions,
    getDashboardData,
    getSessionData,
    initApiUrl,
    loading,
    error,
  };
};