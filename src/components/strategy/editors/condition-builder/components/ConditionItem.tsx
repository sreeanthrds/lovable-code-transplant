
import React, { memo, useState, useRef } from 'react';
import { Condition, GroupCondition } from '../../../utils/conditions';
import { Button } from '@/components/ui/button';
import { 
  X, 
  Copy, 
  ChevronUp, 
  ChevronDown, 
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import SingleConditionEditor from '../SingleConditionEditor';
import ConditionBuilder from '../ConditionBuilder';
import { Card, CardContent } from '@/components/ui/card';
import DropIndicator from './DropIndicator';
import EnhancedDropIndicator from './EnhancedDropIndicator';
import { cn } from '@/lib/utils';

interface ConditionItemProps {
  condition: Condition | GroupCondition;
  index: number;
  level: number;
  updateCondition: (updated: Condition | GroupCondition) => void;
  removeCondition: () => void;
  conditionContext?: 'entry' | 'exit';
  // Enhanced Drag & Drop props
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent, position: 'before' | 'after' | 'inside') => void;
  onDrop?: (e: React.DragEvent, position: 'before' | 'after' | 'inside') => void;
  onDragEnd?: () => void;
  onDragLeave?: () => void;
  isDragOver?: boolean;
  dropPosition?: 'before' | 'after' | 'inside' | null;
  isDragging?: boolean;
  isValidDrop?: boolean;
  currentPath?: number[];
  dragPreviewRef?: React.RefObject<HTMLDivElement>;
  // Quick actions
  onDuplicate?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  // Cross-group move callback
  onCrossGroupMove?: (sourceIndices: number[], sourceLevel: number) => void;
}

const ConditionItem: React.FC<ConditionItemProps> = ({
  condition,
  index,
  level,
  updateCondition,
  removeCondition,
  conditionContext = 'entry',
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onDragLeave,
  isDragOver = false,
  dropPosition = null,
  isDragging = false,
  isValidDrop = true,
  currentPath = [],
  dragPreviewRef,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
  onCrossGroupMove,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);

  // Safety check for condition
  if (!condition) {
    console.error('ConditionItem: condition is null or undefined');
    return (
      <div className="text-red-500 text-sm p-2 border border-red-300 rounded">
        Error: Invalid condition
      </div>
    );
  }

  const handleUpdateCondition = (updated: Condition | GroupCondition) => {
    try {
      console.log('ConditionItem updating condition:', updated);
      updateCondition(updated);
    } catch (error) {
      console.error('Error in ConditionItem updateCondition:', error);
    }
  };

  const handleRemoveCondition = () => {
    try {
      console.log('ConditionItem removing condition');
      removeCondition();
    } catch (error) {
      console.error('Error in ConditionItem removeCondition:', error);
    }
  };

  // Enhanced drag handlers with better position detection
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', ''); // Required for some browsers
    
    // Create custom drag image
    if (dragPreviewRef?.current) {
      e.dataTransfer.setDragImage(dragPreviewRef.current, 0, 0);
    }
    
    onDragStart?.(e);
  };

  const calculateDropPosition = (e: React.DragEvent, element: HTMLElement): 'before' | 'after' | 'inside' => {
    const rect = element.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    
    // For group conditions, prefer 'inside' when in middle area
    if ('groupLogic' in condition) {
      if (y < height * 0.25) return 'before';
      if (y > height * 0.75) return 'after';
      return 'inside';
    }
    
    // For single conditions, use before/after based on top/bottom half
    return y < height / 2 ? 'before' : 'after';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const position = calculateDropPosition(e, e.currentTarget as HTMLElement);
    onDragOver?.(e, position);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const position = calculateDropPosition(e, e.currentTarget as HTMLElement);
    onDrop?.(e, position);
  };

  const handleDragEnd = () => {
    onDragEnd?.();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only trigger if we're actually leaving the element (not entering a child)
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      onDragLeave?.();
    }
  };

  // Render group condition
  if ('groupLogic' in condition) {
    return (
      <div 
        ref={dragRef}
        className={cn(
          "relative",
          isDragging && "opacity-50"
        )}
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragEnd={handleDragEnd}
        onDragLeave={handleDragLeave}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <EnhancedDropIndicator 
          position={dropPosition || 'before'} 
          isVisible={isDragOver}
          isValidDrop={isValidDrop}
          isActive={isDragOver && dropPosition !== null}
        />
        
        {/* Selection checkbox for groups - REMOVED */}
        
        <ConditionBuilder
          rootCondition={condition as GroupCondition}
          updateConditions={handleUpdateCondition}
          level={level + 1}
          allowRemove={true}
          parentUpdateFn={updateCondition}
          index={index}
          context={conditionContext}
        />
      </div>
    );
  } else {
    // Render single condition
    return (
      <TooltipProvider>
        <div 
          ref={dragRef}
          className={cn(
            "relative mb-3",
            isDragging && "opacity-50"
          )}
          draggable
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
          onDragLeave={handleDragLeave}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <EnhancedDropIndicator 
            position={dropPosition || 'before'} 
            isVisible={isDragOver}
            isValidDrop={isValidDrop}
            isActive={isDragOver && dropPosition !== null}
          />
          
          <Card className={cn(
            "bg-muted/40 border-border w-full min-w-fit relative overflow-visible transition-all",
            isDragOver && "ring-2 ring-blue-400 bg-blue-50/50",
            isDragging && "opacity-50 scale-95"
          )}>
            <CardContent className="p-3 min-w-fit">
              {/* Selection checkbox - REMOVED */}

              {/* Floating action buttons on hover */}
              {isHovered && (
                <div className="absolute -top-2 -right-2 z-20 flex items-center gap-1 bg-background border border-border rounded-md p-1 shadow-lg">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={onDuplicate}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Duplicate condition</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleRemoveCondition}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete condition</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}
              
              {/* Condition editor */}
              <div className="w-full">
                <SingleConditionEditor
                  condition={condition as Condition}
                  updateCondition={handleUpdateCondition}
                  conditionContext={conditionContext}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </TooltipProvider>
    );
  }
};

// Use memo to prevent unnecessary re-renders
export default memo(ConditionItem);
