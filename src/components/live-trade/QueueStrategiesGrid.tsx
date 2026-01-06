import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Trash2, FileText, CheckCircle2, XCircle, Loader2, FlaskConical, Play, Square, Activity } from 'lucide-react';
import { getAuthenticatedTradelayoutClient } from '@/lib/supabase/tradelayout-client';
import { useReadyValidation } from '@/hooks/use-ready-validation';
import { useBrokerConnections } from '@/hooks/use-broker-connections';
import { useLiveTradingApi } from '@/hooks/use-live-trading-api';
import { toast } from 'sonner';

interface QueueStrategy {
  id: string;
  user_id: string;
  strategy_id: string;
  broker_connection_id: string;
  scale: number;
  is_active: number;
  status: string;
  created_at: string;
  updated_at: string;
  // Strategy details (we'll need to fetch these separately or store in table)
  name?: string;
  description?: string;
}

interface QueueStrategiesGridProps {
  userId: string;
  mode: 'live' | 'backtest';
  onRunBacktest?: (strategies: QueueStrategy[]) => void;
  onRunStream?: (strategies: QueueStrategy[]) => void;
  onStartAll?: (strategies: QueueStrategy[]) => void;
  onStopAll?: () => void;
}

export default function QueueStrategiesGrid({
  userId,
  mode,
  onRunBacktest,
  onRunStream,
  onStartAll,
  onStopAll
}: QueueStrategiesGridProps) {
  // State from multi_strategy_queue table (single source of truth)
  const [queueStrategies, setQueueStrategies] = useState<QueueStrategy[]>([]);
  const [strategyConnections, setStrategyConnections] = useState<Record<string, string>>({});
  const [strategyScales, setStrategyScales] = useState<Record<string, number>>({});
  const [isExecutingQueue, setIsExecutingQueue] = useState(false);
  const [apiBaseUrl, setApiBaseUrl] = useState<string | null>(null);

  const { connections: brokerConnections } = useBrokerConnections();
  const { initApiUrl } = useLiveTradingApi(userId);

  // Initialize API URL
  useEffect(() => {
    const init = async () => {
      const url = await initApiUrl();
      setApiBaseUrl(url);
    };
    init();
  }, [initApiUrl]);

  // Load strategies from multi_strategy_queue table (single source of truth)
  useEffect(() => {
    if (!userId) return;

    const loadQueueStrategies = async () => {
      try {
        const client = await getAuthenticatedTradelayoutClient();
        const { data, error } = await (client as any)
          .from('multi_strategy_queue')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', 1)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setQueueStrategies(data || []);

        // Load connections and scales from the data
        const connections: Record<string, string> = {};
        const scales: Record<string, number> = {};
        
        (data || []).forEach((strategy: QueueStrategy) => {
          connections[strategy.strategy_id] = strategy.broker_connection_id;
          scales[strategy.strategy_id] = strategy.scale;
        });

        setStrategyConnections(connections);
        setStrategyScales(scales);
      } catch (error) {
        console.error('Failed to load queue strategies:', error);
        toast.error('Failed to load strategies');
      }
    };

    loadQueueStrategies();
  }, [userId]);

  // Add strategy to queue (table)
  const handleAddStrategy = async (strategyId: string, name: string) => {
    if (!userId) return;

    try {
      const client = await getAuthenticatedTradelayoutClient();
      const { error } = await (client as any)
        .from('multi_strategy_queue')
        .upsert({
          user_id: userId,
          strategy_id: strategyId,
          broker_connection_id: '', // Will need to be set
          scale: 1,
          is_active: 1,
          status: 'ready',
          name: name
        }, {
          onConflict: 'user_id,strategy_id'
        });

      if (error) throw error;

      // Reload strategies from table
      const { data } = await (client as any)
        .from('multi_strategy_queue')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', 1);

      setQueueStrategies(data || []);
      toast.success('Strategy added to queue');
    } catch (error) {
      console.error('Failed to add strategy:', error);
      toast.error('Failed to add strategy');
    }
  };

  // Remove strategy from queue (table)
  const handleRemoveStrategy = async (strategyId: string) => {
    if (!userId) return;

    try {
      const client = await getAuthenticatedTradelayoutClient();
      const { error } = await (client as any)
        .from('multi_strategy_queue')
        .update({ is_active: 0 })
        .eq('user_id', userId)
        .eq('strategy_id', strategyId);

      if (error) throw error;

      // Reload strategies from table
      const { data } = await (client as any)
        .from('multi_strategy_queue')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', 1);

      setQueueStrategies(data || []);
      toast.success('Strategy removed from queue');
    } catch (error) {
      console.error('Failed to remove strategy:', error);
      toast.error('Failed to remove strategy');
    }
  };

  // Update strategy connection
  const handleUpdateConnection = async (strategyId: string, connectionId: string) => {
    if (!userId) return;

    try {
      const client = await getAuthenticatedTradelayoutClient();
      const { error } = await (client as any)
        .from('multi_strategy_queue')
        .update({ broker_connection_id: connectionId })
        .eq('user_id', userId)
        .eq('strategy_id', strategyId);

      if (error) throw error;

      setStrategyConnections(prev => ({ ...prev, [strategyId]: connectionId }));
    } catch (error) {
      console.error('Failed to update connection:', error);
      toast.error('Failed to update connection');
    }
  };

  // Update strategy scale
  const handleUpdateScale = async (strategyId: string, scale: number) => {
    if (!userId) return;

    try {
      const client = await getAuthenticatedTradelayoutClient();
      const { error } = await (client as any)
        .from('multi_strategy_queue')
        .update({ scale })
        .eq('user_id', userId)
        .eq('strategy_id', strategyId);

      if (error) throw error;

      setStrategyScales(prev => ({ ...prev, [strategyId]: scale }));
    } catch (error) {
      console.error('Failed to update scale:', error);
      toast.error('Failed to update scale');
    }
  };

  const selectedStrategies = queueStrategies; // All strategies in queue are "selected"

  return (
    <div className="flex h-full">
      {/* Main Content Area */}
      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        {/* Mode Toggle & Queue Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant={mode === 'live' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {/* Mode switch handled by parent */}}
                  >
                    Live Trading
                  </Button>
                  <Button
                    variant={mode === 'backtest' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {/* Mode switch handled by parent */}}
                  >
                    Backtest
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  {queueStrategies.length} strategies in queue
                </div>
              </div>
              
              <div className="flex gap-2">
                {mode === 'backtest' ? (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => onRunBacktest?.(queueStrategies)}
                      disabled={queueStrategies.length === 0 || isExecutingQueue}
                      size="sm"
                      variant="outline"
                    >
                      <FlaskConical className="h-4 w-4 mr-1" />
                      Backtest{queueStrategies.length > 0 && ` (${queueStrategies.length})`}
                    </Button>
                    <Button
                      onClick={() => onRunStream?.(queueStrategies)}
                      disabled={queueStrategies.length === 0 || isExecutingQueue}
                      size="sm"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Stream{queueStrategies.length > 0 && ` (${queueStrategies.length})`}
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => onStartAll?.(queueStrategies)}
                    disabled={queueStrategies.length === 0 || isExecutingQueue}
                    size="sm"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Start All{queueStrategies.length > 0 && ` (${queueStrategies.length})`}
                  </Button>
                )}
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Strategy Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {queueStrategies.map((strategy) => (
            <QueueStrategyCard
              key={strategy.strategy_id}
              strategy={strategy}
              brokerConnections={brokerConnections}
              connectionId={strategyConnections[strategy.strategy_id]}
              scale={strategyScales[strategy.strategy_id] || 1}
              onConnectionChange={(connectionId) => handleUpdateConnection(strategy.strategy_id, connectionId)}
              onScaleChange={(scale) => handleUpdateScale(strategy.strategy_id, scale)}
              onRemove={() => handleRemoveStrategy(strategy.strategy_id)}
              mode={mode}
            />
          ))}
        </div>

        {/* Empty State */}
        {queueStrategies.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-muted-foreground text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No strategies in queue</h3>
                <p>Add strategies to the queue to get started</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Queue Strategy Card Component
function QueueStrategyCard({
  strategy,
  brokerConnections,
  connectionId,
  scale,
  onConnectionChange,
  onScaleChange,
  onRemove,
  mode
}: {
  strategy: QueueStrategy;
  brokerConnections: any[];
  connectionId?: string;
  scale: number;
  onConnectionChange: (connectionId: string) => void;
  onScaleChange: (scale: number) => void;
  onRemove: () => void;
  mode: 'live' | 'backtest';
}) {
  const { readyValidation } = useReadyValidation(strategy.strategy_id, connectionId);

  const statusBadge = () => {
    if (readyValidation.loading) {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Checking...
        </Badge>
      );
    }

    if (readyValidation.isReady) {
      return (
        <Badge className="bg-green-600 hover:bg-green-700 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          READY
        </Badge>
      );
    }

    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <XCircle className="h-3 w-3" />
        NOT READY
      </Badge>
    );
  };

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base">{strategy.name || strategy.strategy_id}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {strategy.description || `Strategy ID: ${strategy.strategy_id}`}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status</span>
          {statusBadge()}
        </div>

        {/* Broker Connection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Broker Connection</label>
          <Select value={connectionId} onValueChange={onConnectionChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select connection" />
            </SelectTrigger>
            <SelectContent>
              {brokerConnections.map((connection) => (
                <SelectItem key={connection.id} value={connection.id}>
                  {connection.name || connection.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Scale */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Scale</label>
          <Input
            type="number"
            min="1"
            value={scale}
            onChange={(e) => onScaleChange(parseInt(e.target.value) || 1)}
            placeholder="Enter scale"
          />
        </div>

        {/* Strategy Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Status: {strategy.status}</div>
          <div>Scale: {scale}x</div>
          {mode === 'backtest' && (
            <div>Mode: Backtest</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
