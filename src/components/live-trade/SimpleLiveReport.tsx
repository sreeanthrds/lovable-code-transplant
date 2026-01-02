import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertCircle, Activity } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useLiveReportData } from '@/hooks/useLiveReportData';
import type { ExecutionNode } from '@/types/backtest';
import SummaryDashboard from '@/components/backtest-report/SummaryDashboard';
import TradesTable from '@/components/backtest-report/TradesTable';
import NodeDetailModal from '@/components/backtest-report/NodeDetailModal';

interface SimpleLiveReportProps {
  sessionId: string | null;
  strategyName?: string;
}

const SimpleLiveReport: React.FC<SimpleLiveReportProps> = ({ 
  sessionId,
  strategyName = 'Live Strategy'
}) => {
  const { data, isLoading, error, getFlowNodes } = useLiveReportData({
    sessionId,
    enabled: !!sessionId,
    pollingInterval: 1000
  });
  
  const [selectedNode, setSelectedNode] = useState<ExecutionNode | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNodeClick = (node: ExecutionNode) => {
    setSelectedNode(node);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNode(null);
  };

  // No session selected
  if (!sessionId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Activity className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Select a live session to view report</p>
        </div>
      </div>
    );
  }

  // Loading initial data
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading live data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive" className="max-w-lg mx-auto mt-8">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  // No data yet
  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Activity className="h-12 w-12 mx-auto text-warning animate-pulse" />
          <p className="text-muted-foreground">Waiting for live data...</p>
        </div>
      </div>
    );
  }

  const { trades, summary, date, eventsHistory, status, progressPercentage, currentTime } = data;

  // Debug info
  const debugInfo = {
    status,
    progress: progressPercentage.toFixed(1),
    tradesCount: trades.length,
    eventsCount: Object.keys(eventsHistory).length,
    firstTradeFlowIds: trades[0] ? {
      entry: trades[0].entry_flow_ids?.slice(0, 2) || [],
      exit: trades[0].exit_flow_ids?.slice(0, 2) || []
    } : null,
    firstEventKeys: Object.keys(eventsHistory).slice(0, 2)
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header with Status */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">Session {sessionId?.substring(4, 12) || 'N/A'}</h2>
            {status === 'running' && (
              <Badge variant="outline" className="bg-success/10 text-success border-success/30 animate-pulse">
                LIVE
              </Badge>
            )}
            {status === 'completed' && (
              <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30">
                COMPLETED
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {strategyName} • {date}
          </div>
        </div>
        {status === 'running' && (
          <div className="text-sm text-muted-foreground">
            Progress: {progressPercentage.toFixed(1)}%
          </div>
        )}
      </div>

      {/* Debug Banner */}
      <div className="text-xs bg-muted/50 p-2 rounded border border-border/50 font-mono">
        <div className="flex flex-wrap gap-4">
          <span>Status: {debugInfo.status}</span>
          <span>Progress: {debugInfo.progress}%</span>
          <span>Trades: {debugInfo.tradesCount}</span>
          <span>Events: {debugInfo.eventsCount}</span>
          {debugInfo.firstTradeFlowIds && (
            <span>1st Trade Entry IDs: [{debugInfo.firstTradeFlowIds.entry.join(', ')}...]</span>
          )}
          {debugInfo.firstEventKeys.length > 0 && (
            <span>Event Keys: [{debugInfo.firstEventKeys.join(', ')}...]</span>
          )}
        </div>
      </div>

      {/* Summary Dashboard - Same as Backtest */}
      <SummaryDashboard 
        summary={summary} 
        date={date}
        currentTime={currentTime || undefined}
      />

      {/* Trades Table - Same as Backtest */}
      {trades.length === 0 ? (
        <Card className="card-elegant">
          <CardContent className="py-8 text-center text-muted-foreground">
            No closed trades yet. Waiting for positions to close...
          </CardContent>
        </Card>
      ) : (
        <TradesTable 
          trades={trades}
          getFlowNodes={getFlowNodes}
          onNodeClick={handleNodeClick}
        />
      )}

      {/* Node Detail Modal - Same as Backtest */}
      <NodeDetailModal
        node={selectedNode}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        allNodes={eventsHistory}
      />
    </div>
  );
};

export default SimpleLiveReport;
