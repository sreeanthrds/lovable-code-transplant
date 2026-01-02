import React, { memo, useState } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Condition, GroupCondition } from '../../../utils/conditions';
import { Button } from '@/components/ui/button';
import { X, Copy } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import SingleConditionEditor from '../SingleConditionEditor';
import ConditionBuilder from '../ConditionBuilder';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { DragItem } from '../hooks/useDndKitConditions';

interface DndConditionItemProps {
  condition: Condition | GroupCondition;
  index: number;
  groupId: string;
  level: number;
  updateCondition: (updated: Condition | GroupCondition) => void;
  removeCondition: () => void;
  conditionContext?: 'entry' | 'exit';
  onDuplicate?: () => void;
  isDragOverlay?: boolean;
  dndKit?: any;
}

const DndConditionItem: React.FC<DndConditionItemProps> = ({
  condition,
  index,
  groupId,
  level,
  updateCondition,
  removeCondition,
  conditionContext = 'entry',
  onDuplicate,
  isDragOverlay = false,
  dndKit,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const itemId = `${groupId}-${index}`;
  const dragData: DragItem = {
    id: itemId,
    condition,
    index,
    groupId,
  };

  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    transform,
    isDragging,
  } = useDraggable({
    id: itemId,
    data: dragData,
    disabled: isDragOverlay,
  });

  // Drop zones for before, after, and inside (for groups)
  const beforeDropId = `${itemId}-before`;
  const afterDropId = `${itemId}-after`;
  const insideDropId = `${itemId}-inside`;

  const { setNodeRef: setBeforeDropRef, isOver: isOverBefore } = useDroppable({
    id: beforeDropId,
    data: { ...dragData, dropZone: 'before' },
    disabled: isDragOverlay,
  });

  const { setNodeRef: setAfterDropRef, isOver: isOverAfter } = useDroppable({
    id: afterDropId,
    data: { ...dragData, dropZone: 'after' },
    disabled: isDragOverlay,
  });

  const { setNodeRef: setInsideDropRef, isOver: isOverInside } = useDroppable({
    id: insideDropId,
    data: { ...dragData, dropZone: 'inside' },
    disabled: isDragOverlay || !('groupLogic' in condition),
  });


  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  if (isDragOverlay) {
    return (
      <div className="opacity-95 shadow-2xl border-2 border-primary/50 rounded-lg bg-background/95 backdrop-blur-sm pointer-events-none">
        <ConditionItemContent
          condition={condition}
          index={index}
          level={level}
          updateCondition={updateCondition}
          removeCondition={removeCondition}
          conditionContext={conditionContext}
          onDuplicate={onDuplicate}
          isHovered={false}
          isDragging={false}
          showActions={false}
          dndKit={dndKit}
        />
      </div>
    );
  }

  return (
    <div
      ref={setDragRef}
      style={style}
      className={cn(
        "relative transition-all duration-300 ease-out cursor-grab active:cursor-grabbing",
        isDragging && "opacity-40 scale-98",
        "hover:shadow-md"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...attributes}
      {...listeners}
    >
      {/* Cursor-based drop zones - more prominent and easier to target */}
      {dndKit?.isDragging && (
        <>
          {/* Before drop zone - larger and more visible */}
          <div
            ref={setBeforeDropRef}
            className={cn(
              "absolute -top-4 left-0 right-0 transition-all duration-200 ease-out z-30",
              "rounded-lg border-2 border-dashed flex items-center justify-center",
              isOverBefore 
                ? "h-10 bg-primary/30 border-primary shadow-lg animate-scale-in" 
                : "h-6 bg-primary/5 border-primary/30 opacity-60"
            )}
          >
            <div className={cn(
              "px-3 py-1 text-xs font-medium rounded-md transition-all duration-200",
              isOverBefore 
                ? "bg-primary text-primary-foreground shadow-md animate-fade-in" 
                : "bg-primary/10 text-primary/70"
            )}>
              {isOverBefore ? "Drop before" : "Before"}
            </div>
          </div>

          {/* After drop zone - larger and more visible */}
          <div
            ref={setAfterDropRef}
            className={cn(
              "absolute -bottom-4 left-0 right-0 transition-all duration-200 ease-out z-30",
              "rounded-lg border-2 border-dashed flex items-center justify-center",
              isOverAfter 
                ? "h-10 bg-primary/30 border-primary shadow-lg animate-scale-in" 
                : "h-6 bg-primary/5 border-primary/30 opacity-60"
            )}
          >
            <div className={cn(
              "px-3 py-1 text-xs font-medium rounded-md transition-all duration-200",
              isOverAfter 
                ? "bg-primary text-primary-foreground shadow-md animate-fade-in" 
                : "bg-primary/10 text-primary/70"
            )}>
              {isOverAfter ? "Drop after" : "After"}
            </div>
          </div>
        </>
      )}

      {/* Inside drop zone for groups - only in center area to avoid conflicts */}
      {'groupLogic' in condition && dndKit?.isDragging && (
        <div
          ref={setInsideDropRef}
          className={cn(
            "absolute top-4 left-4 right-4 bottom-4 transition-all duration-200 ease-out",
            "rounded-lg border-2 border-dashed flex items-center justify-center",
            "pointer-events-auto z-20",
            isOverInside 
              ? "bg-primary/25 border-primary shadow-xl" 
              : "bg-primary/10 border-primary/50 opacity-70"
          )}
        >
          {isOverInside && (
            <div className="px-4 py-2 text-sm font-semibold rounded-md bg-primary text-primary-foreground shadow-lg">
              Drop inside group
            </div>
          )}
        </div>
      )}

      <ConditionItemContent
        condition={condition}
        index={index}
        level={level}
        updateCondition={updateCondition}
        removeCondition={removeCondition}
        conditionContext={conditionContext}
        onDuplicate={onDuplicate}
        isHovered={isHovered}
        isDragging={isDragging}
        showActions={true}
        dndKit={dndKit}
        groupId={groupId}
      />
    </div>
  );
};

interface ConditionItemContentProps {
  condition: Condition | GroupCondition;
  index: number;
  level: number;
  updateCondition: (updated: Condition | GroupCondition) => void;
  removeCondition: () => void;
  conditionContext: 'entry' | 'exit';
  onDuplicate?: () => void;
  isHovered: boolean;
  isDragging: boolean;
  showActions: boolean;
  dndKit?: any;
  groupId?: string;
}

const ConditionItemContent: React.FC<ConditionItemContentProps> = ({
  condition,
  index,
  level,
  updateCondition,
  removeCondition,
  conditionContext,
  onDuplicate,
  isHovered,
  isDragging,
  showActions,
  dndKit,
  groupId,
}) => {
  // Render group condition
  if ('groupLogic' in condition) {
    return (
      <div className={cn(
        "relative",
        isDragging && "opacity-50"
      )}>
        <ConditionBuilder
          rootCondition={condition as GroupCondition}
          updateConditions={updateCondition}
          level={level + 1}
          allowRemove={true}
          parentUpdateFn={updateCondition}
          index={index}
          context={conditionContext}
          dndKit={dndKit}
          isNested={true}
        />
      </div>
    );
  }

  // Render single condition
  return (
    <TooltipProvider>
      <div className={cn(
        "relative",
        isDragging && "opacity-50"
      )}>
        <Card className={cn(
          "w-full min-w-fit relative overflow-visible transition-all",
          "bg-card/[0.03] backdrop-blur-md border-2 border-primary/30",
          "shadow-sm",
          isDragging && "scale-95"
        )}>
          <CardContent className="p-4 min-w-fit">
            {showActions && (
              <>
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
                          onClick={removeCondition}
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
              </>
            )}
            
            {/* Condition editor */}
            <div className="w-full">
              <SingleConditionEditor
                condition={condition as Condition}
                updateCondition={updateCondition}
                conditionContext={conditionContext}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default memo(DndConditionItem);