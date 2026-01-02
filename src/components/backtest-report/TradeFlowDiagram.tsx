import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ExecutionNode } from '@/types/backtest';
import { getNodeCategory, getNodeColor } from '@/types/backtest';
import { cn } from '@/lib/utils';
import {
  Play,
  LogIn,
  LogOut,
  Signal,
  RefreshCw,
  XCircle,
  ArrowRight
} from 'lucide-react';

interface TradeFlowDiagramProps {
  nodes: ExecutionNode[];
  onNodeClick: (node: ExecutionNode) => void;
  flowType: 'entry' | 'exit';
}

const getNodeIcon = (nodeType: string) => {
  switch (nodeType) {
    case 'StartNode':
      return Play;
    case 'EntrySignalNode':
      return Signal;
    case 'EntryNode':
      return LogIn;
    case 'ExitSignalNode':
      return Signal;
    case 'ExitNode':
      return LogOut;
    case 'ReEntrySignalNode':
      return RefreshCw;
    case 'SquareOffNode':
      return XCircle;
    default:
      return Play;
  }
};

const FlowNode: React.FC<{
  node: ExecutionNode;
  onClick: () => void;
  isLast: boolean;
}> = ({ node, onClick, isLast }) => {
  const category = getNodeCategory(node.node_type);
  const color = getNodeColor(category);
  const Icon = getNodeIcon(node.node_type);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  return (
    <div className="flex items-center">
      <Card 
        className={cn(
          "cursor-pointer transition-all hover:shadow-md hover:scale-105",
          "border-l-4 min-w-[180px]"
        )}
        style={{ borderLeftColor: color }}
        onClick={onClick}
      >
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <div 
              className="p-1.5 rounded-md"
              style={{ backgroundColor: `${color}20` }}
            >
              <Icon className="h-4 w-4" style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium truncate">{node.node_name}</span>
                {node.position?.re_entry_num !== undefined && node.position.re_entry_num > 0 && (
                  <Badge 
                    variant="outline" 
                    className="text-[10px] px-1 py-0 bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30"
                  >
                    R{node.position.re_entry_num}
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground">{formatTime(node.timestamp)}</div>
              {node.action && (
                <Badge 
                  variant="secondary" 
                  className="text-[10px] mt-1"
                >
                  {node.action.type === 'place_order' ? 'ORDER' : node.action.type.toUpperCase()}
                </Badge>
              )}
              {node.exit_result && (
                <Badge 
                  variant={parseFloat(node.exit_result.pnl) >= 0 ? 'default' : 'destructive'}
                  className="text-[10px] mt-1"
                >
                  ₹{parseFloat(node.exit_result.pnl) >= 0 ? '+' : ''}{parseFloat(node.exit_result.pnl).toFixed(2)}
                </Badge>
              )}
              {node.skip_reason?.skipped && (
                <Badge variant="outline" className="text-[10px] mt-1 text-yellow-600">
                  SKIPPED
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {!isLast && (
        <div className="px-2 flex items-center">
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
};

const TradeFlowDiagram: React.FC<TradeFlowDiagramProps> = ({ 
  nodes, 
  onNodeClick,
  flowType 
}) => {
  // Build flow from nodes - sort by timestamp and parent-child relationship
  const orderedNodes = useMemo(() => {
    if (nodes.length === 0) return [];
    
    // Build parent-child map for dependency ordering
    const childrenMap = new Map<string, string[]>();
    const parentMap = new Map<string, string>();
    
    nodes.forEach(node => {
      if (node.parent_execution_id) {
        parentMap.set(node.execution_id, node.parent_execution_id);
        
        if (!childrenMap.has(node.parent_execution_id)) {
          childrenMap.set(node.parent_execution_id, []);
        }
        childrenMap.get(node.parent_execution_id)!.push(node.execution_id);
      }
    });
    
    // Build node lookup
    const nodeMap = new Map(nodes.map(n => [n.execution_id, n]));
    
    // Sort nodes by timestamp, then by dependency order
    const sorted = [...nodes].sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      
      // First sort by timestamp
      if (timeA !== timeB) {
        return timeA - timeB;
      }
      
      // Same timestamp - check parent-child relationship
      // If A is parent of B, A comes first
      if (childrenMap.get(a.execution_id)?.includes(b.execution_id)) {
        return -1;
      }
      // If B is parent of A, B comes first
      if (childrenMap.get(b.execution_id)?.includes(a.execution_id)) {
        return 1;
      }
      
      // Check if they share a common parent path
      // Walk up parent chain to determine execution order
      const getDepth = (execId: string): number => {
        let depth = 0;
        let current = execId;
        while (parentMap.has(current)) {
          depth++;
          current = parentMap.get(current)!;
        }
        return depth;
      };
      
      const depthA = getDepth(a.execution_id);
      const depthB = getDepth(b.execution_id);
      
      // Shallower depth (closer to root) comes first
      return depthA - depthB;
    });
    
    return sorted;
  }, [nodes]);

  if (nodes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No flow data available
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Flow Header */}
      <div className="flex items-center gap-2 mb-4">
        <Badge 
          variant={flowType === 'entry' ? 'default' : 'secondary'}
          className="uppercase text-xs"
        >
          {flowType} flow
        </Badge>
        <span className="text-xs text-muted-foreground">
          Click on any node to see detailed diagnostics
        </span>
      </div>

      {/* Horizontal Scrollable Flow - contained within fixed height */}
      <div className="overflow-x-auto overflow-y-hidden pb-4 max-w-full" style={{ maxWidth: 'calc(100vw - 100px)' }}>
        <div className="flex items-center min-w-max">
          {orderedNodes.map((node, index) => (
            <FlowNode
              key={node.execution_id}
              node={node}
              onClick={() => onNodeClick(node)}
              isLast={index === orderedNodes.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: getNodeColor('start') }} />
          <span>Start</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: getNodeColor('entry-signal') }} />
          <span>Entry Signal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: getNodeColor('entry') }} />
          <span>Entry</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: getNodeColor('exit-signal') }} />
          <span>Exit Signal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: getNodeColor('exit') }} />
          <span>Exit</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: getNodeColor('re-entry-signal') }} />
          <span>Re-Entry Signal</span>
        </div>
      </div>
    </div>
  );
};

export default TradeFlowDiagram;
