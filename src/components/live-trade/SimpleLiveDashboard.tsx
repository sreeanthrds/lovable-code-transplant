import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';
import { useSSELiveData } from '@/hooks/useSSELiveData';
import { useClerkUser } from '@/hooks/useClerkUser';
import { useBrokerConnections, ClickHouseMetadata } from '@/hooks/use-broker-connections';
import SummaryDashboard from '@/components/backtest-report/SummaryDashboard';
import TradesTable from '@/components/backtest-report/TradesTable';
import NodeDetailModal from '@/components/backtest-report/NodeDetailModal';
import type { ExecutionNode } from '@/types/backtest';
import type { LiveStrategy } from '@/hooks/use-live-trade-store';

interface SimpleLiveDashboardProps {
  strategy: LiveStrategy;
  polledDiagnostics?: any;
  polledTrades?: any[];
}

const SimpleLiveDashboard: React.FC<SimpleLiveDashboardProps> = ({ 
  strategy,
  polledDiagnostics,
  polledTrades
}) => {
  const { userId } = useClerkUser();
  const { connections: brokerConnections } = useBrokerConnections();
  const [selectedNode, setSelectedNode] = useState<ExecutionNode | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get connection for backtest date
  const connection = brokerConnections.find(c => c.id === strategy.id);
  const metadata = connection?.broker_metadata as ClickHouseMetadata | null;
  const backtestDate = metadata?.simulation_date || '2024-10-29';

  // Use SSE to get live data - connects to EXISTING session (no auto-start)
  const { trades: sseTrades, summary, eventsHistory, isConnected, connectionStatus, currentTime, error } = useSSELiveData({
    userId,
    strategyId: strategy.strategyId,
    sessionId: strategy.backendSessionId, // Use existing session from Start Trading
    backtestDate,
    enabled: !!userId && !!strategy.backendSessionId,
    speedMultiplier: 500
  });

  // Use polled data if available, otherwise fall back to SSE
  const trades = polledTrades || sseTrades;

  const handleNodeClick = (node: ExecutionNode) => {
    setSelectedNode(node);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNode(null);
  };

  const getFlowNodes = (executionIds: string[]): ExecutionNode[] => {
    return executionIds
      .map(id => eventsHistory[id])
      .filter((node): node is ExecutionNode => node !== undefined);
  };

  // Show connection status
  if (!userId) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="max-w-md p-6">
          <div className="text-center space-y-3">
            <Activity className="w-12 h-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Please sign in to view live trading data</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="max-w-md p-6">
          <div className="text-center space-y-3">
            <Activity className="w-12 h-12 mx-auto text-destructive" />
            <h3 className="font-semibold">Connection Error</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="max-w-md p-6">
          <div className="text-center space-y-3">
            <Activity className="w-12 h-12 mx-auto text-warning animate-pulse" />
            <h3 className="font-semibold">Connecting...</h3>
            <p className="text-sm text-muted-foreground">Connecting to live trading stream</p>
          </div>
        </Card>
      </div>
    );
  }

  const date = new Date().toISOString().split('T')[0];

  return (
    <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">Live Trading Report</h2>
            {connectionStatus === 'connected' && (
              <Badge variant="outline" className="bg-success/10 text-success border-success/30 animate-pulse">
                LIVE
              </Badge>
            )}
            {connectionStatus === 'completed' && (
              <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30">
                COMPLETED
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            Session: {strategy.backendSessionId?.substring(0, 12)}...
          </div>
        </div>

        {/* Summary Dashboard - Same as Backtest */}
        <SummaryDashboard summary={summary} date={date} currentTime={currentTime || undefined} />

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

export default SimpleLiveDashboard;
