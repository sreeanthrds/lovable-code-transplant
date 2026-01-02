import React, { useState, useEffect, useCallback } from 'react';
import { Node } from '@xyflow/react';
import { Activity, Clock, Zap, AlertCircle, TrendingUp, ChevronLeft, ChevronRight, Radio } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NodeState, NodeStatus } from './StrategyCanvasPanel';

interface LiveUpdate {
  id: string;
  nodeId?: string;
  timestamp: string;
  type: 'tick' | 'signal' | 'execution' | 'status';
  message: string;
  value?: string | number;
}

interface LiveNodeUpdatesPanelProps {
  node: Node | null;
  nodeState: NodeState | null;
  liveUpdates: LiveUpdate[];
}

export function LiveNodeUpdatesPanel({ 
  node, 
  nodeState,
  liveUpdates 
}: LiveNodeUpdatesPanelProps) {
  // Navigation state: null = live mode (latest), number = viewing specific index
  const [viewingIndex, setViewingIndex] = useState<number | null>(null);
  
  // Reset to live mode when node changes
  useEffect(() => {
    setViewingIndex(null);
  }, [node?.id]);

  // Auto-scroll to live when new updates come in (only in live mode)
  useEffect(() => {
    if (viewingIndex === null && liveUpdates.length > 0) {
      // Already in live mode, nothing to do
    }
  }, [liveUpdates.length, viewingIndex]);

  const isLiveMode = viewingIndex === null;
  const currentIndex = isLiveMode ? 0 : viewingIndex;
  const currentUpdate = liveUpdates[currentIndex];

  const goToPrevious = useCallback(() => {
    if (liveUpdates.length === 0) return;
    const newIndex = isLiveMode ? 1 : Math.min(viewingIndex + 1, liveUpdates.length - 1);
    if (newIndex < liveUpdates.length) {
      setViewingIndex(newIndex);
    }
  }, [isLiveMode, viewingIndex, liveUpdates.length]);

  const goToNext = useCallback(() => {
    if (viewingIndex === null || viewingIndex <= 0) {
      setViewingIndex(null); // Go to live
      return;
    }
    setViewingIndex(viewingIndex - 1);
  }, [viewingIndex]);

  const goToLive = useCallback(() => {
    setViewingIndex(null);
  }, []);

  const jumpToUpdate = useCallback((index: number) => {
    if (index === 0) {
      setViewingIndex(null); // Latest = live mode
    } else {
      setViewingIndex(index);
    }
  }, []);

  if (!node) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center text-muted-foreground">
          <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Select a node to view live updates</p>
        </div>
      </div>
    );
  }

  const nodeData = node.data as Record<string, unknown>;
  const label = (nodeData?.label as string) || node.type || 'Node';

  const getStatusBadge = (status: NodeStatus) => {
    const config = {
      active: { label: 'Active', className: 'bg-success/20 text-success border-success/30' },
      pending: { label: 'Pending', className: 'bg-warning/20 text-warning border-warning/30' },
      completed: { label: 'Completed', className: 'bg-primary/20 text-primary border-primary/30' },
      error: { label: 'Error', className: 'bg-destructive/20 text-destructive border-destructive/30' },
      inactive: { label: 'Inactive', className: 'bg-muted text-muted-foreground' }
    };
    
    return (
      <Badge variant="outline" className={cn("text-xs", config[status]?.className || config.inactive.className)}>
        {config[status]?.label || 'Unknown'}
      </Badge>
    );
  };

  const getUpdateIcon = (type: LiveUpdate['type']) => {
    switch (type) {
      case 'tick':
        return <Activity className="w-3 h-3 text-primary" />;
      case 'signal':
        return <Zap className="w-3 h-3 text-warning" />;
      case 'execution':
        return <TrendingUp className="w-3 h-3 text-success" />;
      case 'status':
        return <AlertCircle className="w-3 h-3 text-muted-foreground" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const getUpdateBadgeStyle = (type: LiveUpdate['type']) => {
    switch (type) {
      case 'tick':
        return 'bg-primary/20 text-primary';
      case 'signal':
        return 'bg-warning/20 text-warning';
      case 'execution':
        return 'bg-success/20 text-success';
      case 'status':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatFullTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  // Filter updates for this specific node
  const nodeUpdates = liveUpdates;

  const canGoPrevious = nodeUpdates.length > 1 && (isLiveMode || viewingIndex < nodeUpdates.length - 1);
  const canGoNext = !isLiveMode && viewingIndex > 0;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/30 bg-background/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground/80">Live Updates</h3>
          </div>
          {nodeState && getStatusBadge(nodeState.status)}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {label} • Real-time tick data
        </p>
      </div>

      {/* Navigation Controls */}
      {nodeUpdates.length > 0 && (
        <div className="px-3 py-2 border-b border-border/30 bg-muted/30">
          <div className="flex items-center justify-between gap-2">
            {/* Previous/Next buttons */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={goToPrevious}
                disabled={!canGoPrevious}
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-0.5" />
                Prev
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={goToNext}
                disabled={!canGoNext && isLiveMode}
              >
                Next
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Button>
            </div>

            {/* Current position indicator */}
            <div className="flex-1 text-center">
              {currentUpdate && (
                <span className="text-[10px] text-muted-foreground">
                  {formatFullTime(currentUpdate.timestamp)}
                </span>
              )}
            </div>

            {/* Live button */}
            <Button
              variant={isLiveMode ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-7 px-2 text-xs gap-1",
                isLiveMode && "bg-success hover:bg-success/90 text-success-foreground"
              )}
              onClick={goToLive}
            >
              <Radio className={cn("w-3 h-3", isLiveMode && "animate-pulse")} />
              Live
            </Button>
          </div>

          {/* Position indicator bar */}
          {nodeUpdates.length > 1 && (
            <div className="mt-2 flex items-center gap-1">
              <span className="text-[9px] text-muted-foreground w-8">
                {isLiveMode ? 'Now' : `${viewingIndex + 1}/${nodeUpdates.length}`}
              </span>
              <div className="flex-1 h-1 bg-border/50 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-200",
                    isLiveMode ? "bg-success" : "bg-primary"
                  )}
                  style={{ 
                    width: `${((nodeUpdates.length - currentIndex) / nodeUpdates.length) * 100}%` 
                  }}
                />
              </div>
              <span className="text-[9px] text-muted-foreground w-8 text-right">
                {nodeUpdates.length}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Current Update Detail (when viewing history) */}
      {currentUpdate && !isLiveMode && (
        <div className="px-3 py-2 border-b border-border/30 bg-primary/5">
          <div className="flex items-start gap-2">
            {getUpdateIcon(currentUpdate.type)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Badge 
                  variant="secondary" 
                  className={cn("text-[10px] px-1.5 py-0", getUpdateBadgeStyle(currentUpdate.type))}
                >
                  {currentUpdate.type}
                </Badge>
                <span className="text-[10px] text-muted-foreground font-medium">
                  Viewing: {formatTime(currentUpdate.timestamp)}
                </span>
              </div>
              <p className="text-xs text-foreground">{currentUpdate.message}</p>
              {currentUpdate.value !== undefined && (
                <p className={cn(
                  "text-sm font-semibold mt-1",
                  typeof currentUpdate.value === 'number' && currentUpdate.value >= 0 ? "text-success" : "text-destructive"
                )}>
                  {typeof currentUpdate.value === 'number' ? (
                    <>
                      {currentUpdate.value >= 0 ? '+' : ''}
                      {currentUpdate.value.toFixed(2)}
                    </>
                  ) : currentUpdate.value}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Node Status Summary */}
      {nodeState && (
        <div className="px-4 py-3 border-b border-border/30 bg-muted/20">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className={cn(
                "text-sm font-medium capitalize",
                nodeState.status === 'active' && "text-success",
                nodeState.status === 'pending' && "text-warning",
                nodeState.status === 'error' && "text-destructive"
              )}>
                {nodeState.status}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Last Update</p>
              <p className="text-sm font-medium text-foreground">
                {nodeState.lastUpdate ? new Date(nodeState.lastUpdate).toLocaleTimeString() : '--'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Updates</p>
              <p className="text-sm font-medium text-foreground">{nodeUpdates.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Live Feed - Clickable updates */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {nodeUpdates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-6 h-6 mx-auto mb-2 opacity-50" />
              <p className="text-xs">Waiting for updates...</p>
              {nodeState?.status === 'inactive' && (
                <p className="text-xs mt-1">Node is inactive</p>
              )}
            </div>
          ) : (
            nodeUpdates.map((update, index) => {
              const isSelected = (isLiveMode && index === 0) || (!isLiveMode && index === viewingIndex);
              return (
                <button 
                  key={update.id}
                  onClick={() => jumpToUpdate(index)}
                  className={cn(
                    "w-full text-left flex items-start gap-2 p-2 rounded-lg border transition-all",
                    isSelected 
                      ? "bg-primary/10 border-primary/30 ring-1 ring-primary/20" 
                      : "bg-card/50 border-border/20 hover:bg-card/80 hover:border-border/40"
                  )}
                >
                  <div className="mt-0.5">
                    {getUpdateIcon(update.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Badge 
                        variant="secondary" 
                        className={cn("text-[10px] px-1.5 py-0", getUpdateBadgeStyle(update.type))}
                      >
                        {update.type}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {formatTime(update.timestamp)}
                      </span>
                      {index === 0 && isLiveMode && (
                        <Badge variant="outline" className="text-[9px] px-1 py-0 bg-success/10 text-success border-success/30">
                          Live
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-foreground/80 truncate">{update.message}</p>
                    {update.value !== undefined && (
                      <p className={cn(
                        "text-xs font-medium mt-0.5",
                        typeof update.value === 'number' && update.value >= 0 ? "text-success" : "text-destructive"
                      )}>
                        {typeof update.value === 'number' ? (
                          <>
                            {update.value >= 0 ? '+' : ''}
                            {update.value.toFixed(2)}
                          </>
                        ) : update.value}
                      </p>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
