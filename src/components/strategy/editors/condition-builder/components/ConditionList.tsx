import React, { useCallback } from 'react';
import { Condition, GroupCondition } from '../../../utils/conditions';
import ConditionItem from './ConditionItem';
import { DropZone } from './DropZone';
import { useDragAndDrop, DropTarget } from '../hooks/useDragAndDrop';

interface ConditionListProps {
  conditions: (Condition | GroupCondition)[];
  groupId: string;
  level: number;
  context: 'entry' | 'exit';
  onUpdateCondition: (index: number, updated: Condition | GroupCondition) => void;
  onRemoveCondition: (index: number) => void;
  onDuplicateCondition: (index: number) => void;
  onMove: (items: (Condition | GroupCondition)[], from: { groupId: string; indices: number[] }, to: DropTarget) => void;
  dragDrop: ReturnType<typeof useDragAndDrop>;
}

export const ConditionList: React.FC<ConditionListProps> = ({
  conditions,
  groupId,
  level,
  context,
  onUpdateCondition,
  onRemoveCondition,
  onDuplicateCondition,
  onMove,
  dragDrop
}) => {
  const handleDragStart = useCallback((index: number, e: React.DragEvent) => {
    const indicesToDrag = [index];
    
    const itemsToDrag = indicesToDrag.map(i => conditions[i]);
    
    dragDrop.startDrag(
      itemsToDrag,
      indicesToDrag,
      groupId,
      { x: e.clientX, y: e.clientY }
    );

    // Set data for cross-component drops
    e.dataTransfer.setData('application/json', JSON.stringify({
      sourceGroupId: groupId,
      sourceIndices: indicesToDrag,
      items: itemsToDrag
    }));
  }, [conditions, groupId, dragDrop]);

  const handleDragOver = useCallback((index: number, e: React.DragEvent, position: 'before' | 'after' | 'inside') => {
    e.preventDefault();
    
    const target: DropTarget = { groupId, index, position };
    
    if (dragDrop.isValidDrop(target)) {
      dragDrop.setDropTargetZone(target);
      dragDrop.updateDragPosition({ x: e.clientX, y: e.clientY });
    }
  }, [groupId, dragDrop]);

  const handleDrop = useCallback((index: number, e: React.DragEvent, position: 'before' | 'after' | 'inside') => {
    e.preventDefault();
    
    const target: DropTarget = { groupId, index, position };
    
    // Try to get data from other components
    try {
      const transferData = JSON.parse(e.dataTransfer.getData('application/json'));
      if (transferData.sourceGroupId && transferData.sourceIndices && transferData.items) {
        onMove(transferData.items, 
          { groupId: transferData.sourceGroupId, indices: transferData.sourceIndices }, 
          target);
        return;
      }
    } catch (e) {
      // Fall through to local drop handling
    }
    
    // Handle local drops
    dragDrop.executeDrop(target, onMove);
  }, [groupId, dragDrop, onMove]);

  const handleDragEnd = useCallback(() => {
    dragDrop.endDrag();
  }, [dragDrop]);

  const handleDragLeave = useCallback(() => {
    dragDrop.setDropTargetZone(null);
  }, [dragDrop]);

  return (
    <div className="space-y-3">
      {conditions.map((condition, index) => {
        const currentPath = [index];
        const isDraggedItem = dragDrop.dragState?.sourceGroupId === groupId && 
                            dragDrop.dragState?.sourceIndices.includes(index);
        
        const isDropTarget = dragDrop.dropTarget?.groupId === groupId && 
                           dragDrop.dropTarget?.index === index;
        
        return (
          <div key={condition.id} className="relative">
            <ConditionItem
              condition={condition}
              index={index}
              level={level}
              updateCondition={(updated) => onUpdateCondition(index, updated)}
              removeCondition={() => onRemoveCondition(index)}
              onDuplicate={() => onDuplicateCondition(index)}
              onDragStart={(e) => handleDragStart(index, e)}
              onDragOver={(e, position) => handleDragOver(index, e, position)}
              onDrop={(e, position) => handleDrop(index, e, position)}
              onDragEnd={handleDragEnd}
              onDragLeave={handleDragLeave}
              isDragging={isDraggedItem}
              isDragOver={isDropTarget}
              dropPosition={dragDrop.dropTarget?.position || null}
              isValidDrop={dragDrop.dropTarget ? dragDrop.isValidDrop(dragDrop.dropTarget) : true}
              currentPath={currentPath}
              conditionContext={context}
              onCrossGroupMove={() => {}} // Not used in new implementation
            />
            
            {isDropTarget && dragDrop.dropTarget && (
              <DropZone
                position={dragDrop.dropTarget.position}
                isActive={true}
                isValid={dragDrop.isValidDrop(dragDrop.dropTarget)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};