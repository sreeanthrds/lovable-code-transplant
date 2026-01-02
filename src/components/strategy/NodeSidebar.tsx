
import React, { useCallback, memo } from 'react';
import { ShoppingCart, LogOut, StopCircle, AlertTriangle, Activity, Play, Edit, TrendingUp, TrendingDown, Square } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';

interface NodeSidebarProps {
  onAddNode: (type: string, parentNodeId?: string) => void;
}

interface NodeTypeItem {
  type: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  hoverColor: string;
}

const nodeTypes: NodeTypeItem[] = [
  {
    type: 'startNode',
    label: 'Start Node',
    description: 'Entry point of the strategy',
    icon: <Play className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />,
    color: 'border-emerald-500 dark:border-emerald-400 bg-emerald-500/10 dark:bg-emerald-400/10',
    hoverColor: 'hover:bg-emerald-500/20 dark:hover:bg-emerald-400/20'
  },
  {
    type: 'entrySignalNode',
    label: 'Entry Signal',
    description: 'Detect entry conditions',
    icon: <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
    color: 'border-emerald-600 dark:border-emerald-400 bg-emerald-600/10 dark:bg-emerald-400/10',
    hoverColor: 'hover:bg-emerald-600/20 dark:hover:bg-emerald-400/20'
  },
  {
    type: 'exitSignalNode',
    label: 'Exit Signal',
    description: 'Detect exit conditions',
    icon: <TrendingDown className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
    color: 'border-amber-600 dark:border-amber-400 bg-amber-600/10 dark:bg-amber-400/10',
    hoverColor: 'hover:bg-amber-600/20 dark:hover:bg-amber-400/20'
  },
  {
    type: 'entryNode',
    label: 'Entry Node',
    description: 'Execute buy/sell orders',
    icon: <ShoppingCart className="h-5 w-5 text-green-600 dark:text-green-400" />,
    color: 'border-green-600 dark:border-green-400 bg-green-600/10 dark:bg-green-400/10',
    hoverColor: 'hover:bg-green-600/20 dark:hover:bg-green-400/20'
  },
  {
    type: 'modifyNode',
    label: 'Modify Node',
    description: 'Update existing positions',
    icon: <Edit className="h-5 w-5 text-orange-600 dark:text-orange-400" />,
    color: 'border-orange-600 dark:border-orange-400 bg-orange-600/10 dark:bg-orange-400/10',
    hoverColor: 'hover:bg-orange-600/20 dark:hover:bg-orange-400/20'
  },
  {
    type: 'exitNode',
    label: 'Exit Node',
    description: 'Close positions',
    icon: <LogOut className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
    color: 'border-amber-600 dark:border-amber-400 bg-amber-600/10 dark:bg-amber-400/10',
    hoverColor: 'hover:bg-amber-600/20 dark:hover:bg-amber-400/20'
  },
  {
    type: 'alertNode',
    label: 'Alert Node',
    description: 'Send alerts',
    icon: <AlertTriangle className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
    color: 'border-purple-600 dark:border-purple-400 bg-purple-600/10 dark:bg-purple-400/10',
    hoverColor: 'hover:bg-purple-600/20 dark:hover:bg-purple-400/20'
  },
  {
    type: 'squareOffNode',
    label: 'Square Off',
    description: 'Close all positions and stop strategy',
    icon: <Square className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
    color: 'border-amber-600 dark:border-amber-400 bg-amber-600/10 dark:bg-amber-400/10',
    hoverColor: 'hover:bg-amber-600/20 dark:hover:bg-amber-400/20'
  },
  {
    type: 'endNode',
    label: 'End Node',
    description: 'End a strategy branch',
    icon: <StopCircle className="h-5 w-5 text-rose-600 dark:text-rose-500" />,
    color: 'border-rose-600 dark:border-rose-500 bg-rose-600/10 dark:bg-rose-500/10',
    hoverColor: 'hover:bg-rose-600/20 dark:hover:bg-rose-500/20'
  }
];

const NodeSidebar = memo(({ onAddNode }: NodeSidebarProps) => {
  const handleNodeClick = useCallback((type: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddNode(type);  // Call without second parameter when adding from sidebar
  }, [onAddNode]);

  const handleDragStart = useCallback((event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  return (
    <div className="h-full overflow-auto py-4 flex flex-col items-center">
      <h3 className="font-medium text-xs uppercase tracking-wider mb-4 text-center text-muted-foreground">Strategy Nodes</h3>
      
      <div className="space-y-6">
        <TooltipProvider delayDuration={200}>
          {nodeTypes.map((nodeType) => (
            <Tooltip key={nodeType.type}>
              <TooltipTrigger asChild>
                <div
                  className={`flex justify-center items-center w-10 h-10 rounded-full ${nodeType.color} ${nodeType.hoverColor} cursor-grab transition-all hover:scale-105 hover:shadow-md`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, nodeType.type)}
                  onClick={(e) => handleNodeClick(nodeType.type, e)}
                >
                  {nodeType.icon}
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div className="space-y-1">
                  <p className="font-medium text-sm">{nodeType.label}</p>
                  <p className="text-xs text-muted-foreground">{nodeType.description}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
    </div>
  );
});

NodeSidebar.displayName = 'NodeSidebar';

export default NodeSidebar;
