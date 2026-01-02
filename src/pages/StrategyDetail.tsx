import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/layouts/AppLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useStrategyWebSocket } from '@/hooks/useStrategyWebSocket';
import { useAppAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConnectionStatus } from '@/components/live-trade/ConnectionStatus';
import { PnLDisplay } from '@/components/live-trade/PnLDisplay';
import { PositionsList } from '@/components/live-trade/PositionsList';
import { StrategyControls } from '@/components/live-trade/StrategyControls';
import { ArrowLeft, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const StrategyDetailPage = () => {
  const { strategyId } = useParams<{ strategyId: string }>();
  const { userId } = useAppAuth();
  const navigate = useNavigate();
  const { strategy, connectionStatus, error } = useStrategyWebSocket(strategyId);

  if (!strategy && connectionStatus === 'connected') {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto p-6">
          <Card>
            <CardContent className="py-12 text-center">
              <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Strategy Not Found</h3>
              <p className="text-muted-foreground mb-4">
                This strategy is not currently running or does not exist
              </p>
              <Button onClick={() => navigate('/app/live-trading')}>
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const getStatusConfig = () => {
    if (!strategy) return { variant: 'outline' as const, className: '' };
    
    switch (strategy.status) {
      case 'running':
        return {
          variant: 'default' as const,
          className: 'bg-green-500/20 text-green-400 border-green-500/30'
        };
      case 'paused':
        return {
          variant: 'secondary' as const,
          className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
        };
      case 'stopped':
        return {
          variant: 'outline' as const,
          className: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <AppLayout>
      <ErrorBoundary>
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/app/live-trading')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  {strategy?.strategy_name || 'Loading...'}
                </h1>
                <p className="text-muted-foreground font-semibold mt-1">
                  Real-time strategy monitoring
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ConnectionStatus status={connectionStatus} error={error} />
              {strategy?.status && (
                <Badge variant={statusConfig.variant} className={statusConfig.className}>
                  {strategy.status.toUpperCase()}
                </Badge>
              )}
            </div>
          </div>

          {/* Controls */}
          {userId && strategyId && strategy && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Strategy Controls</h3>
                    <p className="text-sm text-muted-foreground">
                      Manage your strategy execution
                    </p>
                  </div>
                  <StrategyControls
                    userId={userId}
                    strategyId={strategyId}
                    strategyName={strategy.strategy_name}
                    status={strategy.status}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* P&L Overview */}
          {strategy && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total P&L
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PnLDisplay value={strategy.total_pnl} size="lg" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Realized P&L
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PnLDisplay value={strategy.realized_pnl} size="lg" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Unrealized P&L
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PnLDisplay value={strategy.unrealized_pnl} size="lg" />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Strategy Details */}
          {strategy && (
            <Card>
              <CardHeader>
                <CardTitle>Strategy Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Strategy ID</p>
                  <p className="font-mono text-sm mt-1">{strategy.strategy_id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium mt-1">{strategy.status}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Open Positions</p>
                  <p className="font-medium mt-1">{strategy.positions.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Running Since</p>
                  <p className="font-medium mt-1">
                    {formatDistanceToNow(new Date(strategy.started_at), { addSuffix: true })}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Positions */}
          {strategy && <PositionsList positions={strategy.positions} />}

          {/* Node States */}
          {strategy?.node_states && Object.keys(strategy.node_states).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Node Execution Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(strategy.node_states).map(([nodeId, state]) => (
                    <div key={nodeId} className="p-3 rounded-lg border bg-card">
                      <p className="text-sm font-medium mb-1">{nodeId}</p>
                      <Badge
                        variant={
                          state.status === 'active' ? 'default' :
                          state.status === 'waiting' ? 'secondary' :
                          state.status === 'completed' ? 'outline' : 'destructive'
                        }
                      >
                        {state.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ErrorBoundary>
    </AppLayout>
  );
};

export default StrategyDetailPage;
