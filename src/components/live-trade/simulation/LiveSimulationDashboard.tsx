import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMockLiveSimulation } from '@/hooks/use-mock-live-simulation';
import ActiveNodesPanel from './ActiveNodesPanel';
import LiveTradesTable from './LiveTradesTable';
import SimulationControls from './SimulationControls';
import { ArrowLeft, Activity, BarChart3, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface LiveSimulationDashboardProps {
  sessionId: string;
  strategyName: string;
  brokerType: string;
  simulationDate?: string;
  initialSpeedMultiplier?: number;
  onBack: () => void;
}

const LiveSimulationDashboard: React.FC<LiveSimulationDashboardProps> = ({
  sessionId,
  strategyName,
  brokerType,
  simulationDate,
  initialSpeedMultiplier = 1,
  onBack
}) => {
  const [speedMultiplier, setSpeedMultiplier] = React.useState(initialSpeedMultiplier);
  const [isChangingSpeed, setIsChangingSpeed] = React.useState(false);

  const {
    connectionStatus,
    error,
    activeNodes,
    openPositions,
    trades,
    pnl,
    progress,
    currentTime,
    sessionStatus,
    stats,
    stopSession,
    changeSpeed
  } = useMockLiveSimulation({
    sessionId,
    autoConnect: true
  });

  const handleStop = async () => {
    try {
      await stopSession();
      toast.success('Session stopped successfully');
    } catch (err) {
      toast.error('Failed to stop session');
    }
  };

  const handleSpeedChange = async (newSpeed: number) => {
    setIsChangingSpeed(true);
    try {
      await changeSpeed(newSpeed);
      setSpeedMultiplier(newSpeed);
      toast.success(`Speed changed to ${newSpeed}x`);
    } catch (err) {
      toast.error('Failed to change speed');
    } finally {
      setIsChangingSpeed(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{strategyName}</h1>
            <p className="text-muted-foreground text-sm">
              Session: {sessionId.slice(0, 12)}...
              {simulationDate && ` • Date: ${simulationDate}`}
            </p>
          </div>
        </div>
        {error && (
          <div className="text-red-500 text-sm bg-red-500/10 px-3 py-1 rounded">
            {error}
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <SimulationControls
        sessionStatus={sessionStatus}
        connectionStatus={connectionStatus}
        stats={stats}
        speedMultiplier={speedMultiplier}
        brokerType={brokerType}
        onStop={handleStop}
        onChangeSpeed={handleSpeedChange}
        isLoading={isChangingSpeed}
      />

      {/* Active Nodes Panel - Always Visible */}
      <ActiveNodesPanel
        activeNodes={activeNodes}
        pnl={pnl}
        openPositions={openPositions}
        currentTime={currentTime}
        progress={progress}
        sessionStatus={sessionStatus}
        brokerType={brokerType}
        simulationDate={simulationDate}
        speedMultiplier={speedMultiplier}
      />

      {/* Trades & Results Tabs */}
      <Tabs defaultValue="trades" className="w-full">
        <TabsList>
          <TabsTrigger value="trades" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Completed Trades ({trades.length})
          </TabsTrigger>
          <TabsTrigger value="diagnostics" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Diagnostics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trades" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Trade History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LiveTradesTable trades={trades} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagnostics" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Session Diagnostics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Total Trades</p>
                  <p className="text-2xl font-bold">{stats.total_trades}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Win Rate</p>
                  <p className="text-2xl font-bold">{stats.win_rate.toFixed(1)}%</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Active Nodes</p>
                  <p className="text-2xl font-bold">{stats.active_nodes}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Open Positions</p>
                  <p className="text-2xl font-bold">{stats.open_positions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LiveSimulationDashboard;
