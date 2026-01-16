import { useState, useCallback, useRef, useEffect } from 'react';
import pako from 'pako';
import JSZip from 'jszip';
import {
  BacktestSession,
  DayResult,
  StartBacktestRequest,
  StartBacktestResponse,
  DayDetailData,
} from '@/types/backtest-session';
import { getApiBaseUrl } from '@/lib/api-config';

interface UseBacktestSessionOptions {
  userId?: string;
}

export function useBacktestSessionSimple({ userId }: UseBacktestSessionOptions) {
  const [session, setSession] = useState<BacktestSession | null>(null);
  const [selectedDayData, setSelectedDayData] = useState<DayDetailData | null>(null);
  const [loadingDay, setLoadingDay] = useState<string | null>(null);
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const apiBaseUrl = useRef<string>('');

  // Initialize API URL - simplified
  const initApiUrl = useCallback(async () => {
    if (userId && !apiBaseUrl.current) {
      try {
        const baseUrl = await getApiBaseUrl(userId);
        if (baseUrl) {
          apiBaseUrl.current = baseUrl;
        }
      } catch (error) {
        console.error('Failed to get API base URL:', error);
        apiBaseUrl.current = '';
      }
    }
    return apiBaseUrl.current;
  }, [userId]);

  // Simple polling without complex Map conversion
  const startPolling = useCallback((backtestId: string) => {
    // Clear any existing polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Start polling every 2 seconds
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const baseUrl = await initApiUrl();
        if (!baseUrl) return;
        
        const response = await fetch(`${baseUrl}/api/v1/backtest/${backtestId}/status`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch status: ${response.statusText}`);
        }

        const sessionData = await response.json();
        
        // Simple daily_results handling - avoid Map conversion for now
        if (sessionData.daily_results && typeof sessionData.daily_results === 'object') {
          // Keep as object, convert to Map in getDailyResultsArray
          // This avoids potential Map constructor issues in production
        }
        
        // Update session state
        setSession(sessionData);
        
        // Stop polling if completed or failed
        if (sessionData.status === 'completed' || sessionData.status === 'failed') {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        }
        
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 2000);
  }, [initApiUrl]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Start backtest - simplified
  const startBacktest = useCallback(async (request: StartBacktestRequest) => {
    try {
      const baseUrl = await initApiUrl();
      if (!baseUrl) {
        throw new Error('API base URL not available');
      }
      
      const response = await fetch(`${baseUrl}/api/v1/backtest/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Failed to start backtest: ${response.statusText}`);
      }

      const result: StartBacktestResponse = await response.json();
      
      // Initialize session with start response - simplified
      const initialSession: BacktestSession = {
        backtest_id: result.backtest_id,
        strategy_id: request.strategy_id,
        start_date: request.start_date,
        end_date: request.end_date,
        status: 'starting',
        total_days: result.total_days,
        completed_days: 0,
        daily_results: new Map(), // Keep Map for initialization only
        overall_summary: undefined,
      };

      setSession(initialSession);
      
      // Start polling for updates
      startPolling(result.backtest_id);
      
      return result;
      
    } catch (error) {
      console.error('Failed to start backtest:', error);
      throw error;
    }
  }, [initApiUrl, startPolling]);

  // Load day detail - simplified
  const loadDayDetail = useCallback(async (date: string) => {
    if (!session) return;
    
    setLoadingDay(date);
    
    try {
      const baseUrl = await initApiUrl();
      if (!baseUrl) return;
      
      const response = await fetch(`${baseUrl}/api/v1/backtest/${session.backtest_id}/day/${date}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load day details: ${response.statusText}`);
      }

      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const decompressed = pako.ungzip(new Uint8Array(arrayBuffer));
      const text = new TextDecoder().decode(decompressed);
      
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(text);
      
      const [tradesFile, diagnosticsFile] = await Promise.all([
        zipContent.file('trades_daily.json')?.async('string'),
        zipContent.file('diagnostics_export.json')?.async('string')
      ]);

      if (tradesFile && diagnosticsFile) {
        const trades = JSON.parse(tradesFile);
        const diagnostics = JSON.parse(diagnosticsFile);
        
        setSelectedDayData({ trades, diagnostics });
      }
      
    } catch (error) {
      console.error('Failed to load day details:', error);
      throw error;
    } finally {
      setLoadingDay(null);
    }
  }, [session, initApiUrl]);

  // Stop backtest - simplified
  const stopBacktest = useCallback(async () => {
    if (!session) return;
    
    try {
      const baseUrl = await initApiUrl();
      if (!baseUrl) return;
      
      const response = await fetch(`${baseUrl}/api/v1/backtest/${session.backtest_id}/stop`, {
        method: 'POST',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to stop backtest: ${response.statusText}`);
      }

      stopPolling();
      setSession(prev => prev ? { ...prev, status: 'stopped' } : null);
      
    } catch (error) {
      console.error('Failed to stop backtest:', error);
      throw error;
    }
  }, [session, initApiUrl, stopPolling]);

  // Reset session
  const reset = useCallback(() => {
    stopPolling();
    setSession(null);
    setSelectedDayData(null);
    setLoadingDay(null);
  }, [stopPolling]);

  // Get sorted daily results as array - handle object to Map conversion here
  const getDailyResultsArray = useCallback((): DayResult[] => {
    if (!session) return [];
    
    const dailyResults = session.daily_results;
    
    // Convert to array - handle both Map and object
    let results: DayResult[] = [];
    
    if (dailyResults instanceof Map) {
      results = Array.from(dailyResults.values());
    } else if (typeof dailyResults === 'object' && dailyResults !== null) {
      // Convert object to array
      results = Object.values(dailyResults);
    }
    
    // Sort by date
    return results.sort((a, b) => a.date.localeCompare(b.date));
  }, [session]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    session,
    selectedDayData,
    loadingDay,
    startBacktest,
    loadDayDetail,
    stopBacktest,
    reset,
    getDailyResultsArray,
  };
}
