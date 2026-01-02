import React from 'react';
import { Node } from '@xyflow/react';
import { Strategy } from '@/types/live-trading-websocket';
import { Activity, Zap, TrendingUp, TrendingDown, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';

interface LiveUpdatesPanelProps {
  strategy: Strategy | null | undefined;
  node: Node | null;
}

export function LiveUpdatesPanel({ strategy, node }: LiveUpdatesPanelProps) {
  const nodeData = node?.data as Record<string, any>;
  const nodeState = strategy?.node_states?.[node?.id || ''];

  // Mock live updates - in real implementation, these would come from WebSocket
  const [updates, setUpdates] = React.useState<Array<{
    id: string;
    timestamp: string;
    type: 'tick' | 'signal' | 'execution' | 'status';
    message: string;
    value?: number;
  }>>([]);

  // Simulate live updates
  React.useEffect(() => {
    if (!strategy || !node) return;

    const interval = setInterval(() => {
      const types = ['tick', 'signal', 'status'] as const;
      const type = types[Math.floor(Math.random() * types.length)];
      
      const newUpdate = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        type,
        message: type === 'tick' 
          ? `Price update received` 
          : type === 'signal' 
            ? `Condition evaluation: ${Math.random() > 0.5 ? 'TRUE' : 'FALSE'}`
            : `Node status: ${nodeState?.status || 'waiting'}`,
        value: type === 'tick' ? Math.random() * 1000 + 18000 : undefined
      };

      setUpdates(prev => [newUpdate, ...prev].slice(0, 50));
    }, 2000);

    return () => clearInterval(interval);
  }, [strategy, node, nodeState]);

  if (!strategy || !node) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center space-y-2">
          <Activity className="w-12 h-12 mx-auto text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">Select a node to view live updates</p>
        </div>
      </div>
    );
  }

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'tick':
        return <Zap className="w-3 h-3 text-warning" />;
      case 'signal':
        return <ArrowUpRight className="w-3 h-3 text-success" />;
      case 'execution':
        return <TrendingUp className="w-3 h-3 text-primary" />;
      default:
        return <Clock className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const getUpdateBadgeClass = (type: string) => {
    switch (type) {
      case 'tick':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'signal':
        return 'bg-success/20 text-success border-success/30';
      case 'execution':
        return 'bg-primary/20 text-primary border-primary/30';
      default:
        return 'bg-muted/50 text-muted-foreground border-border/30';
    }
  };

  return (
    <div className="h-full flex flex-col bg-background/50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-warning" />
          <h3 className="text-sm font-semibold text-foreground">Live Updates</h3>
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
        </div>
        <Badge variant="outline" className="text-xs">
          {nodeData?.label || node.type}
        </Badge>
      </div>

      {/* Node Status Summary */}
      <div className="px-4 py-3 border-b border-border/30 bg-muted/20">
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-card/30 border-border/20">
            <CardContent className="p-2 text-center">
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge 
                variant="outline"
                className={`mt-1 text-xs ${
                  nodeState?.status === 'active' ? 'bg-success/20 text-success border-success/30' :
                  nodeState?.status === 'waiting' ? 'bg-warning/20 text-warning border-warning/30' :
                  'bg-muted/50 text-muted-foreground'
                }`}
              >
                {nodeState?.status || 'Idle'}
              </Badge>
            </CardContent>
          </Card>
          
          <Card className="bg-card/30 border-border/20">
            <CardContent className="p-2 text-center">
              <p className="text-xs text-muted-foreground">Signals</p>
              <p className="text-sm font-bold text-foreground mt-1">
                {Math.floor(Math.random() * 10)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/30 border-border/20">
            <CardContent className="p-2 text-center">
              <p className="text-xs text-muted-foreground">Executions</p>
              <p className="text-sm font-bold text-foreground mt-1">
                {Math.floor(Math.random() * 5)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Live Feed */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {updates.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-8 h-8 mx-auto text-muted-foreground/30 animate-pulse mb-2" />
              <p className="text-xs text-muted-foreground">Waiting for updates...</p>
            </div>
          ) : (
            updates.map((update) => (
              <div 
                key={update.id}
                className="flex items-start gap-2 p-2 rounded-lg bg-muted/20 border border-border/20 animate-fade-in"
              >
                <div className="mt-0.5">
                  {getUpdateIcon(update.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`text-[10px] px-1.5 py-0 ${getUpdateBadgeClass(update.type)}`}
                    >
                      {update.type}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">{update.timestamp}</span>
                  </div>
                  <p className="text-xs text-foreground/80 mt-0.5 truncate">
                    {update.message}
                  </p>
                  {update.value !== undefined && (
                    <p className="text-xs font-mono text-primary mt-0.5">
                      ₹{update.value.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
