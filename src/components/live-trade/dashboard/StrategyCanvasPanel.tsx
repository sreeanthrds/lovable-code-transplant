import React, { useMemo } from 'react';
import { Node } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { LiveStrategy } from '@/hooks/use-live-trade-store';

export type NodeStatus = 'active' | 'pending' | 'inactive' | 'completed' | 'error';

export interface NodeState {
  nodeId: string;
  status: NodeStatus;
  lastUpdate?: string;
  data?: Record<string, unknown>;
}

interface StrategyCanvasPanelProps {
  selectedStrategy: LiveStrategy | null;
  nodes: Node[];
  nodeStates: Record<string, NodeState>;
  selectedNodeId: string | null;
  onNodeClick: (node: Node) => void;
  isLoading?: boolean;
}

export function StrategyCanvasPanel({
  selectedStrategy,
  nodes,
  nodeStates,
  selectedNodeId,
  onNodeClick,
  isLoading = false
}: StrategyCanvasPanelProps) {
  // Filter out virtual/overview nodes for display
  const displayNodes = useMemo(() => {
    return nodes.filter(node => {
      const nodeData = node.data as Record<string, unknown> | undefined;
      // Exclude virtual, overview, and start nodes from display
      if (nodeData?.isVirtual) return false;
      if (nodeData?.isStrategyOverview) return false;
      if (node.type === 'startNode') return false;
      return true;
    });
  }, [nodes]);
  // Calculate bounds for auto-positioning
  const nodeBounds = useMemo(() => {
    if (displayNodes.length === 0) return { minX: 0, minY: 0, maxX: 800, maxY: 600 };
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    displayNodes.forEach(node => {
      const x = node.position?.x ?? 0;
      const y = node.position?.y ?? 0;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + 150);
      maxY = Math.max(maxY, y + 60);
    });
    
    return { minX, minY, maxX, maxY };
  }, [displayNodes]);

  const getNodeStatusStyles = (nodeId: string) => {
    const state = nodeStates[nodeId];
    if (!state) return 'border-border/50 bg-card/50';
    
    switch (state.status) {
      case 'active':
        return 'border-success ring-2 ring-success/40 bg-success/10 animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.3)]';
      case 'pending':
        return 'border-warning ring-2 ring-warning/40 bg-warning/10 shadow-[0_0_15px_rgba(234,179,8,0.3)]';
      case 'completed':
        return 'border-primary/50 bg-primary/5';
      case 'error':
        return 'border-destructive ring-2 ring-destructive/40 bg-destructive/10';
      default:
        return 'border-border/50 bg-card/50';
    }
  };

  const getNodeStatusBadge = (nodeId: string) => {
    const state = nodeStates[nodeId];
    if (!state) return null;
    
    const statusConfig = {
      active: { label: 'Active', className: 'bg-success/20 text-success border-success/30' },
      pending: { label: 'Pending', className: 'bg-warning/20 text-warning border-warning/30' },
      completed: { label: 'Done', className: 'bg-primary/20 text-primary border-primary/30' },
      error: { label: 'Error', className: 'bg-destructive/20 text-destructive border-destructive/30' },
      inactive: { label: 'Inactive', className: 'bg-muted text-muted-foreground border-muted' }
    };
    
    const config = statusConfig[state.status] || statusConfig.inactive;
    
    return (
      <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", config.className)}>
        {config.label}
      </Badge>
    );
  };

  if (!selectedStrategy) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-4 py-3 border-b border-border/30 bg-background/50">
          <h3 className="text-sm font-semibold text-foreground/80">Strategy Canvas</h3>
          <p className="text-xs text-muted-foreground">
            Node flow visualization
          </p>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <p className="text-sm">Select a session to view strategy flow</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-4 py-3 border-b border-border/30 bg-background/50">
          <h3 className="text-sm font-semibold text-foreground/80">Strategy Canvas</h3>
          <p className="text-xs text-muted-foreground">
            {selectedStrategy.name}
          </p>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2 text-sm">Loading strategy nodes...</span>
        </div>
      </div>
    );
  }

  if (displayNodes.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-4 py-3 border-b border-border/30 bg-background/50">
          <h3 className="text-sm font-semibold text-foreground/80">Strategy Canvas</h3>
          <p className="text-xs text-muted-foreground">
            {selectedStrategy.name}
          </p>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <p className="text-sm">No nodes available for this strategy</p>
        </div>
      </div>
    );
  }

  // Count active/pending nodes
  const activeCount = displayNodes.filter(n => nodeStates[n.id]?.status === 'active').length;
  const pendingCount = displayNodes.filter(n => nodeStates[n.id]?.status === 'pending').length;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/30 bg-background/50 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground/80">Strategy Canvas</h3>
          <p className="text-xs text-muted-foreground">
            Click on nodes to view details • {displayNodes.length} nodes
          </p>
        </div>
        
        {/* Legend & Counts */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-muted-foreground">Active {activeCount > 0 && `(${activeCount})`}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-warning" />
            <span className="text-muted-foreground">Pending {pendingCount > 0 && `(${pendingCount})`}</span>
          </div>
        </div>
      </div>
      
      {/* Canvas */}
      <ScrollArea className="flex-1">
        <div 
          className="relative p-4"
          style={{
            minWidth: nodeBounds.maxX - nodeBounds.minX + 100,
            minHeight: nodeBounds.maxY - nodeBounds.minY + 100
          }}
        >
          {displayNodes.map((node) => {
            const nodeData = node.data as Record<string, unknown>;
            const label = (nodeData?.label as string) || node.type || 'Node';
            const isSelected = selectedNodeId === node.id;
            
            return (
              <div
                key={node.id}
                className={cn(
                  "absolute p-3 rounded-lg border-2 cursor-pointer transition-all duration-300",
                  "hover:scale-105 backdrop-blur-sm",
                  getNodeStatusStyles(node.id),
                  isSelected && "ring-4 ring-primary/50"
                )}
                style={{
                  left: (node.position?.x ?? 0) - nodeBounds.minX + 20,
                  top: (node.position?.y ?? 0) - nodeBounds.minY + 20,
                  minWidth: '140px'
                }}
                onClick={() => onNodeClick(node)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="text-xs font-medium text-foreground/90 truncate flex-1">
                    {label}
                  </div>
                  {getNodeStatusBadge(node.id)}
                </div>
                
                {node.type && (
                  <div className="text-[10px] text-muted-foreground mt-1 truncate">
                    {node.type}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
