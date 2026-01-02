import React, { memo } from 'react';
import { DragOverlay } from '@dnd-kit/core';
import { Condition, GroupCondition } from '../../../utils/conditions';
import DndConditionItem from './DndConditionItem';
import { useDndKitConditions } from '../hooks/useDndKitConditions';
import { cn } from '@/lib/utils';

interface DndConditionListProps {
  conditions: (Condition | GroupCondition)[];
  groupId: string;
  level: number;
  context: 'entry' | 'exit';
  onUpdateCondition: (index: number, updated: Condition | GroupCondition) => void;
  onRemoveCondition: (index: number) => void;
  onDuplicateCondition: (index: number) => void;
  dndKit: ReturnType<typeof useDndKitConditions>;
}

const DndConditionList: React.FC<DndConditionListProps> = ({
  conditions,
  groupId,
  level,
  context,
  onUpdateCondition,
  onRemoveCondition,
  onDuplicateCondition,
  dndKit,
}) => {
  return (
    <>
      <div className={cn(
        "space-y-4 pl-8 py-2 transition-all duration-300",
        dndKit.isDragging && "space-y-6"
      )}>
        {conditions.map((condition, index) => (
          <DndConditionItem
            key={condition.id}
            condition={condition}
            index={index}
            groupId={groupId}
            level={level}
            updateCondition={(updated) => onUpdateCondition(index, updated)}
            removeCondition={() => onRemoveCondition(index)}
            conditionContext={context}
            onDuplicate={() => onDuplicateCondition(index)}
            dndKit={dndKit}
          />
        ))}
      </div>

      <DragOverlay 
        dropAnimation={dndKit.dropAnimation}
        style={{ 
          cursor: 'grabbing',
          transformOrigin: '0 0',
        }}
      >
        {dndKit.activeItem ? (
          <div style={{ transform: 'translate(-50%, -50%)' }}>
            <DndConditionItem
              condition={dndKit.activeItem.condition}
              index={dndKit.activeItem.index}
              groupId={dndKit.activeItem.groupId}
              level={level}
              updateCondition={() => {}}
              removeCondition={() => {}}
              conditionContext={context}
              isDragOverlay={true}
              dndKit={dndKit}
            />
          </div>
        ) : null}
      </DragOverlay>
    </>
  );
};

export default memo(DndConditionList);