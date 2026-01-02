import { useState, useEffect, useCallback, useRef } from 'react';
import type { Trade, DailySummary, ExecutionNode } from '@/types/backtest';

interface LiveReportData {
  trades: Trade[];
  summary: DailySummary;
  date: string;
  eventsHistory: Record<string, ExecutionNode>;
  timestamp: string;
  currentTime: string | null;
  status: string;
  progressPercentage: number;
}

interface UseLiveReportDataOptions {
  sessionId: string | null;
  enabled?: boolean;
  pollingInterval?: number;
}

interface UseLiveReportDataReturn {
  data: LiveReportData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  getFlowNodes: (executionIds: string[]) => ExecutionNode[];
}

const API_BASE = 'http://localhost:8000';

export function useLiveReportData({
  sessionId,
  enabled = true,
  pollingInterval = 1000
}: UseLiveReportDataOptions): UseLiveReportDataReturn {
  const [data, setData] = useState<LiveReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    if (!sessionId) {
      setIsLoading(false);
      return;
    }

    try {
      // Use simple stream polling endpoint for sessions starting with 'live-'
      const endpoint = sessionId.startsWith('live-') 
        ? `${API_BASE}/api/simple/live/state/${sessionId}`
        : `${API_BASE}/api/v1/simulation/${sessionId}/state`;
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const state = await response.json();

      // Transform backend data to report format (same as backtesting)
      const gpsData = state.gps_data || {};
      
      // Trades - already in correct format
      const trades: Trade[] = (gpsData.trades || []).map((trade: any) => ({
        trade_id: trade.trade_id || '',
        position_id: trade.position_id || '',
        re_entry_num: trade.re_entry_num || 0,
        symbol: trade.symbol || '',
        side: trade.side || '',
        quantity: trade.quantity || 0,
        entry_price: trade.entry_price || '0',
        entry_time: trade.entry_time || '',
        exit_price: trade.exit_price || '0',
        exit_time: trade.exit_time || '',
        pnl: trade.pnl || '0',
        pnl_percent: trade.pnl_percent || '0',
        duration_minutes: trade.duration_minutes || 0,
        status: trade.status || 'closed',
        entry_flow_ids: trade.entry_flow_ids || [],
        exit_flow_ids: trade.exit_flow_ids || [],
        entry_trigger: trade.entry_trigger || '',
        exit_reason: trade.exit_reason || null
      }));

      // Summary
      const pnlData = gpsData.pnl || {};
      const summary: DailySummary = {
        total_trades: pnlData.closed_trades || trades.length,
        total_pnl: pnlData.total_pnl || '0',
        winning_trades: pnlData.winning_trades || 0,
        losing_trades: pnlData.losing_trades || 0,
        win_rate: pnlData.win_rate || '0'
      };

      // Events history (for flow diagrams)
      const eventsHistory: Record<string, ExecutionNode> = gpsData.events_history || {};

      // Extract date from timestamp
      const timestamp = state.timestamp || new Date().toISOString();
      const date = timestamp.split('T')[0];
      
      // Get current backtest time from tick state
      const currentTime = state.tick_state?.current_time || null;

      setData({
        trades,
        summary,
        date,
        eventsHistory,
        timestamp,
        currentTime,
        status: state.status || 'running',
        progressPercentage: state.stats?.progress_percentage || 0
      });

      setError(null);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch live report data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      setIsLoading(false);
    }
  }, [sessionId]);

  // Start/stop polling
  useEffect(() => {
    if (!enabled || !sessionId) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial fetch
    fetchData();

    // Start polling
    intervalRef.current = setInterval(fetchData, pollingInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, sessionId, pollingInterval, fetchData]);

  const getFlowNodes = useCallback((executionIds: string[]): ExecutionNode[] => {
    if (!data?.eventsHistory) {
      return [];
    }

    return executionIds
      .map(id => data.eventsHistory[id])
      .filter((node): node is ExecutionNode => node !== undefined);
  }, [data?.eventsHistory]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    getFlowNodes
  };
}
