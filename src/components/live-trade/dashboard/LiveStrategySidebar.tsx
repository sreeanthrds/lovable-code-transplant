import React, { useState } from 'react';
import { Strategy, ConnectionStatus } from '@/types/live-trading-websocket';
import { ChevronLeft, ChevronRight, Activity, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface LiveStrategySidebarProps {
  strategies: Strategy[];
  selectedStrategyId: string | null;
  onSelectStrategy: (strategyId: string, strategyName: string, nodes?: any[]) => void;
  connectionStatus: ConnectionStatus;
}

export function LiveStrategySidebar({
  strategies,
  selectedStrategyId,
  onSelectStrategy,
  connectionStatus
}: LiveStrategySidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'text-success';
      case 'paused':
        return 'text-warning';
      case 'stopped':
        return 'text-muted-foreground';
      default:
        return 'text-muted-foreground';
    }
  };

  const getConnectionColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-success';
      case 'connecting':
      case 'reconnecting':
        return 'bg-warning animate-pulse';
      case 'disconnected':
      case 'error':
        return 'bg-destructive';
      default:
        return 'bg-muted';
    }
  };

  return (
    <TooltipProvider>
      <div 
        className={cn(
          "h-full flex flex-col border-r border-border/30 bg-background/50 backdrop-blur-sm transition-all duration-300",
          collapsed ? "w-14" : "w-56"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border/30">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Sessions</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <div className={cn("w-2 h-2 rounded-full", getConnectionColor())} />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Strategy List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {strategies.length === 0 ? (
              <div className={cn(
                "text-xs text-muted-foreground text-center py-4",
                collapsed && "px-1"
              )}>
                {collapsed ? (
                  <Circle className="w-3 h-3 mx-auto text-muted-foreground/50" />
                ) : (
                  "No active sessions"
                )}
              </div>
            ) : (
              strategies.map((strategy) => (
                <Tooltip key={strategy.strategy_id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onSelectStrategy(strategy.strategy_id, strategy.strategy_name)}
                      className={cn(
                        "w-full text-left p-2 rounded-lg transition-all duration-200",
                        "hover:bg-muted/50 border border-transparent",
                        selectedStrategyId === strategy.strategy_id
                          ? "bg-primary/10 border-primary/30"
                          : "hover:border-border/50"
                      )}
                    >
                      {collapsed ? (
                        <div className="flex flex-col items-center gap-1">
                          <Circle className={cn("w-2 h-2", getStatusColor(strategy.status))} />
                          <span className={cn(
                            "text-[10px] font-medium",
                            strategy.total_pnl >= 0 ? "text-success" : "text-destructive"
                          )}>
                            {strategy.total_pnl >= 0 ? '+' : ''}{strategy.total_pnl.toFixed(0)}
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground truncate max-w-[120px]">
                              {strategy.strategy_name}
                            </span>
                            <Circle className={cn("w-2 h-2 flex-shrink-0", getStatusColor(strategy.status))} />
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              {strategy.positions.length} pos
                            </span>
                            <span className={cn(
                              "font-medium",
                              strategy.total_pnl >= 0 ? "text-success" : "text-destructive"
                            )}>
                              {strategy.total_pnl >= 0 ? '+' : ''}{strategy.total_pnl.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                    </button>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right">
                      <p className="font-medium">{strategy.strategy_name}</p>
                      <p className="text-xs text-muted-foreground">
                        P&L: {strategy.total_pnl >= 0 ? '+' : ''}{strategy.total_pnl.toFixed(2)}
                      </p>
                    </TooltipContent>
                  )}
                </Tooltip>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
}
