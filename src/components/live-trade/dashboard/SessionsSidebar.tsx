import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Activity, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { LiveStrategy } from '@/hooks/use-live-trade-store';

interface SessionsSidebarProps {
  strategies: LiveStrategy[];
  selectedStrategyId: string | null;
  onSelectStrategy: (strategy: LiveStrategy) => void;
}

export function SessionsSidebar({
  strategies,
  selectedStrategyId,
  onSelectStrategy
}: SessionsSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const getStatusColor = (strategy: LiveStrategy) => {
    if (strategy.isLive) return 'text-success';
    if (strategy.status === 'starting') return 'text-warning animate-pulse';
    if (strategy.status === 'completed') return 'text-blue-500';
    if (strategy.error) return 'text-destructive';
    return 'text-muted-foreground';
  };

  const getStatusBgColor = (strategy: LiveStrategy) => {
    if (strategy.isLive) return 'bg-success';
    if (strategy.status === 'starting') return 'bg-warning animate-pulse';
    if (strategy.status === 'completed') return 'bg-blue-500';
    if (strategy.error) return 'bg-destructive';
    return 'bg-muted-foreground';
  };
  
  const getStatusText = (strategy: LiveStrategy) => {
    if (strategy.isLive) return 'Running';
    if (strategy.status === 'completed') return 'Completed';
    return strategy.status;
  };

  const liveCount = strategies.filter(s => s.isLive).length;

  return (
    <TooltipProvider>
      <div 
        className={cn(
          "h-full flex flex-col border-r border-border/30 bg-background/50 backdrop-blur-sm transition-all duration-300",
          collapsed ? "w-14" : "w-60"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border/30">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Sessions</span>
              {liveCount > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-success/20 text-success font-medium">
                  {liveCount}
                </span>
              )}
            </div>
          )}
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
                  "No strategies submitted"
                )}
              </div>
            ) : (
              strategies.map((strategy) => (
                <Tooltip key={strategy.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onSelectStrategy(strategy)}
                      className={cn(
                        "w-full text-left p-2 rounded-lg transition-all duration-200",
                        "hover:bg-muted/50 border border-transparent",
                        selectedStrategyId === strategy.id
                          ? "bg-primary/10 border-primary/30"
                          : "hover:border-border/50"
                      )}
                    >
                      {collapsed ? (
                        <div className="flex flex-col items-center gap-1">
                          <div className={cn("w-2.5 h-2.5 rounded-full", getStatusBgColor(strategy))} />
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground truncate max-w-[140px]">
                              {strategy.name}
                            </span>
                            <div className={cn("w-2 h-2 rounded-full flex-shrink-0", getStatusBgColor(strategy))} />
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground capitalize">
                              {getStatusText(strategy)}
                            </span>
                            {strategy.isLive && (
                              <span className="text-success font-medium">LIVE</span>
                            )}
                            {strategy.status === 'completed' && (
                              <span className="text-blue-500 font-medium">DONE</span>
                            )}
                          </div>
                        </div>
                      )}
                    </button>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right">
                      <p className="font-medium">{strategy.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {strategy.isLive ? 'Running' : strategy.status}
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
