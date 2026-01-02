import { useState, useEffect, useRef, useCallback } from 'react';
import { useLiveTradingApi } from './use-live-trading-api';
import { LiveDashboardResponse } from '@/types/live-trading-data';
import { useClerkUser } from '@/hooks/useClerkUser';

export const useLivePolling = (intervalMs: number = 1500) => {
  const { userId } = useClerkUser();
  const { getDashboardData, initApiUrl } = useLiveTradingApi(userId || undefined);
  const [dashboardData, setDashboardData] = useState<LiveDashboardResponse | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef(false);

  const startPolling = useCallback(() => {
    if (isPollingRef.current || !userId) return;
    
    isPollingRef.current = true;
    
    const poll = async () => {
      try {
        console.log('📊 Polling dashboard data for user:', userId);
        const data = await getDashboardData(userId);
        setDashboardData(data);
        setIsConnected(true);
        setLastUpdateTime(data.cache_time);
        setError(null);
        console.log('✅ Dashboard data received:', data);
      } catch (err) {
        console.error('❌ Dashboard polling error:', err);
        setIsConnected(false);
        const errorMessage = err instanceof Error ? err.message : 'Polling failed';
        
        // If it's a 404, stop polling silently as the endpoint might not be implemented yet
        if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
          console.warn('⚠️ Dashboard endpoint not found - stopping polling silently');
          setError(null); // Don't show error for 404
          stopPolling();
        } else {
          setError(errorMessage);
        }
      }
    };

    // Initial poll
    poll();
    
    // Set up interval
    intervalRef.current = setInterval(poll, intervalMs);
  }, [getDashboardData, userId, intervalMs]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    isPollingRef.current = false;
  }, []);

  const retryConnection = useCallback(async () => {
    if (!userId) return;
    
    try {
      const data = await getDashboardData(userId);
      setDashboardData(data);
      setIsConnected(true);
      setLastUpdateTime(data.cache_time);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Retry failed');
    }
  }, [getDashboardData, userId]);

  // Don't auto-start polling - only start when explicitly called via startPolling()
  // This prevents unnecessary API calls when there are no live sessions
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return stopPolling;
  }, [stopPolling]);

  return {
    dashboardData,
    isConnected,
    lastUpdateTime,
    error,
    startPolling,
    stopPolling,
    retryConnection,
    isPolling: isPollingRef.current,
  };
};
