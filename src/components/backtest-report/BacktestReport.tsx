import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useBacktestData } from '@/hooks/useBacktestData';
import type { ExecutionNode, TradesDaily, DiagnosticsExport } from '@/types/backtest';
import SummaryDashboard from './SummaryDashboard';
import TradesTable from './TradesTable';
import NodeDetailModal from './NodeDetailModal';

interface BacktestReportProps {
  externalTradesData?: TradesDaily;
  externalDiagnosticsData?: DiagnosticsExport;
}

const BacktestReport: React.FC<BacktestReportProps> = ({ 
  externalTradesData, 
  externalDiagnosticsData 
}) => {
  const hasExternalData = !!(externalTradesData && externalDiagnosticsData);
  
  const { 
    tradesData: hookTradesData, 
    isLoading, 
    error, 
    getFlowNodes: hookGetFlowNodes, 
    allNodes: hookAllNodes,
    setExternalData 
  } = useBacktestData({ autoLoad: !hasExternalData });
  
  const [selectedNode, setSelectedNode] = useState<ExecutionNode | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Set external data when provided
  useEffect(() => {
    if (externalTradesData && externalDiagnosticsData) {
      setExternalData(externalTradesData, externalDiagnosticsData);
    }
  }, [externalTradesData, externalDiagnosticsData, setExternalData]);

  // Use external data if provided, otherwise use hook data
  const tradesData = externalTradesData || hookTradesData;
  
  // Handle diagnostics - ensure events_history exists
  let resolvedAllNodes: Record<string, ExecutionNode> = {};
  if (externalDiagnosticsData) {
    if (externalDiagnosticsData.events_history) {
      resolvedAllNodes = externalDiagnosticsData.events_history;
    } else if (typeof externalDiagnosticsData === 'object') {
      // Check if externalDiagnosticsData IS the events_history
      const sampleKey = Object.keys(externalDiagnosticsData)[0];
      const sampleValue = sampleKey ? (externalDiagnosticsData as any)[sampleKey] : null;
      if (sampleValue && typeof sampleValue === 'object' && 'execution_id' in sampleValue) {
        console.log('[BacktestReport] External diagnostics is events_history at root level');
        resolvedAllNodes = externalDiagnosticsData as unknown as Record<string, ExecutionNode>;
      }
    }
  } else {
    resolvedAllNodes = hookAllNodes;
  }
  
  const allNodes = resolvedAllNodes;
  
  // Debug: Log diagnostics state on mount
  React.useEffect(() => {
    console.log('[BacktestReport] Diagnostics state:', {
      hasExternalDiagnostics: !!externalDiagnosticsData,
      externalDiagnosticsKeys: externalDiagnosticsData ? Object.keys(externalDiagnosticsData) : [],
      resolvedAllNodesCount: Object.keys(resolvedAllNodes).length,
      sampleNodeKeys: Object.keys(resolvedAllNodes).slice(0, 5)
    });
  }, [externalDiagnosticsData, resolvedAllNodes]);
  
  const getFlowNodes = (executionIds: string[]): ExecutionNode[] => {
    const resolved = executionIds
      .map(id => allNodes[id])
      .filter((node): node is ExecutionNode => node !== undefined);
    
    // Debug: Log mismatch details
    if (executionIds.length > 0 && resolved.length === 0) {
      console.log('🔴 Flow ID mismatch detected:', {
        requestedIds: executionIds.slice(0, 3),
        availableKeySamples: Object.keys(allNodes).slice(0, 5),
        totalAvailableKeys: Object.keys(allNodes).length,
        requestedCount: executionIds.length,
        resolvedCount: resolved.length
      });
    } else if (executionIds.length > 0 && resolved.length > 0) {
      console.log('✅ Flow nodes resolved:', {
        requestedCount: executionIds.length,
        resolvedCount: resolved.length
      });
    }
    
    return resolved;
  };

  const handleNodeClick = (node: ExecutionNode) => {
    setSelectedNode(node);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNode(null);
  };

  if (isLoading && !hasExternalData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading backtest data...</p>
        </div>
      </div>
    );
  }

  if (error && !hasExternalData) {
    return (
      <Alert variant="destructive" className="max-w-lg mx-auto mt-8">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error}. Please make sure the sample data files are available.
        </AlertDescription>
      </Alert>
    );
  }

  if (!tradesData) {
    return (
      <Alert className="max-w-lg mx-auto mt-8">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Data</AlertTitle>
        <AlertDescription>
          No backtest data available. Run a backtest first.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Summary Dashboard */}
      <SummaryDashboard 
        summary={tradesData.summary} 
        date={tradesData.date} 
      />

      {/* Trades Table with Flow Diagrams */}
      <TradesTable 
        trades={tradesData.trades}
        getFlowNodes={getFlowNodes}
        onNodeClick={handleNodeClick}
      />

      {/* Node Detail Modal */}
      <NodeDetailModal
        node={selectedNode}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        allNodes={allNodes}
      />
    </div>
  );
};

export default BacktestReport;
