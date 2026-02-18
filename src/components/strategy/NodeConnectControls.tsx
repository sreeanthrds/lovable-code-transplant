
import React, { useState, useCallback, memo } from 'react';
import { Play, Activity, SlidersHorizontal, StopCircle, AlertTriangle, Plus, ShoppingCart, LogOut, Bell, TrendingUp, TrendingDown, RotateCcw, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';

interface NodeConnectControlsProps {
  showOn: 'start' | 'signal' | 'action';
  onAddNode: (type: string, parentNodeId: string) => void;
  parentNodeId: string;
}

// Define node types with icons and labels
const nodeTypeIcons = {
  startNode: { icon: Play, label: 'Start Node', color: 'rgb(72, 187, 178)' },
  entrySignalNode: { icon: TrendingUp, label: 'Condition Node', color: 'rgb(34, 197, 94)' },
  reEntrySignalNode: { icon: RotateCcw, label: 'Re-Entry Condition Node', color: 'rgb(139, 92, 246)' },
  actionNode: { icon: SlidersHorizontal, label: 'Action Node', color: 'rgb(59, 130, 246)' },
  entryNode: { icon: ShoppingCart, label: 'Entry Node', color: 'rgb(6, 182, 212)' },
  exitNode: { icon: LogOut, label: 'Exit Node', color: 'rgb(240, 128, 128)' },
  alertNode: { icon: Bell, label: 'Alert Node', color: 'rgb(59, 130, 246)' },
  squareOffNode: { icon: Square, label: 'Square Off Node', color: 'rgb(204, 251, 52)' },
  endNode: { icon: StopCircle, label: 'End Node', color: 'rgb(239, 68, 68)' },
  forceEndNode: { icon: AlertTriangle, label: 'Force End Node', color: 'rgb(239, 68, 68)' }
};

const NodeConnectControls = memo(({ showOn, onAddNode, parentNodeId }: NodeConnectControlsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Different node type options based on the current node type - hide alert, end, and force end nodes
  const nodeOptions = React.useMemo(() => {
    if (showOn === 'start') {
      return [
        { value: 'entrySignalNode', label: 'Condition Node' },
        { value: 'reEntrySignalNode', label: 'Re-Entry Condition Node' },
        { value: 'entryNode', label: 'Entry Node' },
        { value: 'exitNode', label: 'Exit Node' },
        { value: 'squareOffNode', label: 'Square Off Node' }
      ];
    } else {
      return [
        { value: 'entrySignalNode', label: 'Condition Node' },
        { value: 'reEntrySignalNode', label: 'Re-Entry Condition Node' },
        { value: 'entryNode', label: 'Entry Node' },
        { value: 'exitNode', label: 'Exit Node' },
        { value: 'squareOffNode', label: 'Square Off Node' }
      ];
    }
  }, [showOn]);

  const handleAddNode = useCallback((type: string, e: React.MouseEvent) => {
    // Prevent event bubbling up to parent elements
    e.preventDefault();
    e.stopPropagation();
    
    // Call the onAddNode function with parent node ID
    onAddNode(type, parentNodeId);
    
    // Close the dropdown
    setIsOpen(false);
  }, [onAddNode, parentNodeId]);

  // Auto-close the dropdown when the mouse leaves
  const handleMouseLeave = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <div className="absolute right-0 top-1/2 -mr-4 -mt-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild onMouseEnter={() => setIsOpen(true)}>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full shadow-md bg-background border-primary hover:bg-primary/10"
            title="Add connected node"
            type="button"
            onClick={(e) => e.stopPropagation()}
          >
            <Plus className="h-4 w-4 text-primary" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          sideOffset={8}
          onMouseLeave={handleMouseLeave}
          className="p-1 min-w-[3rem] w-auto"
        >
          <TooltipProvider delayDuration={200}>
            {nodeOptions.map((option) => {
              const NodeIcon = nodeTypeIcons[option.value as keyof typeof nodeTypeIcons]?.icon || Activity;
              const iconColor = nodeTypeIcons[option.value as keyof typeof nodeTypeIcons]?.color || "rgb(72, 187, 178)";
              
              return (
                <Tooltip key={option.value}>
                  <TooltipTrigger asChild>
                    <DropdownMenuItem 
                      onClick={(e) => handleAddNode(option.value, e)}
                      className="cursor-pointer py-2 px-2 flex justify-center hover:bg-accent"
                    >
                      <NodeIcon className="h-5 w-5" style={{ color: iconColor }} />
                    </DropdownMenuItem>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {option.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
});

NodeConnectControls.displayName = 'NodeConnectControls';

export default NodeConnectControls;
