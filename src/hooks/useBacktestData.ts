import { useState, useEffect, useCallback } from 'react';
import type { TradesDaily, DiagnosticsExport, ExecutionNode } from '@/types/backtest';

interface UseBacktestDataOptions {
  autoLoad?: boolean; // Whether to auto-load from static files (default: true)
}

interface UseBacktestDataReturn {
  tradesData: TradesDaily | null;
  diagnosticsData: DiagnosticsExport | null;
  allNodes: Record<string, ExecutionNode>;
  isLoading: boolean;
  error: string | null;
  getNodeById: (executionId: string) => ExecutionNode | null;
  getFlowNodes: (executionIds: string[]) => ExecutionNode[];
  setExternalData: (trades: TradesDaily, diagnostics: DiagnosticsExport) => void;
  clearData: () => void;
}

export const useBacktestData = (options: UseBacktestDataOptions = {}): UseBacktestDataReturn => {
  const { autoLoad = true } = options;
  
  const [tradesData, setTradesData] = useState<TradesDaily | null>(null);
  const [diagnosticsData, setDiagnosticsData] = useState<DiagnosticsExport | null>(null);
  const [isLoading, setIsLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!autoLoad) return;
    
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Load both JSON files in parallel
        const [tradesResponse, diagnosticsResponse] = await Promise.all([
          fetch('/data/trades_daily.json'),
          fetch('/data/diagnostics_export.json')
        ]);

        if (!tradesResponse.ok) {
          throw new Error('Failed to load trades data');
        }
        if (!diagnosticsResponse.ok) {
          throw new Error('Failed to load diagnostics data');
        }

        const trades = await tradesResponse.json();
        const diagnostics = await diagnosticsResponse.json();

        setTradesData(trades);
        setDiagnosticsData(diagnostics);
      } catch (err) {
        console.error('Error loading backtest data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [autoLoad]);

  const setExternalData = useCallback((trades: TradesDaily, diagnostics: DiagnosticsExport) => {
    setTradesData(trades);
    setDiagnosticsData(diagnostics);
    setError(null);
    setIsLoading(false);
  }, []);

  const clearData = useCallback(() => {
    setTradesData(null);
    setDiagnosticsData(null);
    setError(null);
  }, []);

  const getNodeById = (executionId: string): ExecutionNode | null => {
    if (!diagnosticsData?.events_history) return null;
    return diagnosticsData.events_history[executionId] || null;
  };

  const getFlowNodes = (executionIds: string[]): ExecutionNode[] => {
    if (!diagnosticsData?.events_history) return [];
    return executionIds
      .map(id => diagnosticsData.events_history[id])
      .filter((node): node is ExecutionNode => node !== undefined);
  };

  return {
    tradesData,
    diagnosticsData,
    allNodes: diagnosticsData?.events_history || {},
    isLoading,
    error,
    getNodeById,
    getFlowNodes,
    setExternalData,
    clearData
  };
};
