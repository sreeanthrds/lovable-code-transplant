import React, { memo, useCallback } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { 
  Condition, 
  GroupCondition, 
  createDefaultCondition,
  createDefaultGroupCondition
} from '../../utils/conditions';
import GroupConditionTitle from './components/GroupConditionTitle';
import ConditionActions from './components/ConditionActions';
import ConditionPreview from './components/ConditionPreview';
import DndConditionList from './components/DndConditionList';
import { Button } from '@/components/ui/button';
import { Copy, Clipboard } from 'lucide-react';
import { useConditionClipboard } from './hooks/useConditionClipboard';
import { useDndKitConditions, DropResult } from './hooks/useDndKitConditions';

interface ConditionBuilderProps {
  rootCondition: GroupCondition;
  updateConditions: (updatedCondition: GroupCondition) => void;
  level?: number;
  parentUpdateFn?: (updated: GroupCondition | Condition) => void;
  allowRemove?: boolean;
  index?: number;
  context?: 'entry' | 'exit';
  dndKit?: ReturnType<typeof useDndKitConditions>;
  isNested?: boolean;
}

const ConditionBuilder: React.FC<ConditionBuilderProps> = ({
  rootCondition,
  updateConditions,
  level = 0,
  parentUpdateFn,
  allowRemove = false,
  index = 0,
  context = 'entry',
  dndKit: parentDndKit,
  isNested = false,
}) => {
  // Use parent's DnD Kit instance for nested builders, create new for root
  const ownDndKit = useDndKitConditions();
  const dndKit = parentDndKit || ownDndKit;
  
  // Clipboard hook
  const clipboard = useConditionClipboard();
  
  // Generate unique group ID
  const groupId = `${context}-${level}-${index}`;

  const addCondition = useCallback(() => {
    const newCondition = createDefaultCondition();
    const updatedRoot = { 
      ...rootCondition,
      conditions: [...rootCondition.conditions, newCondition]
    };
    updateConditions(updatedRoot);
  }, [rootCondition, updateConditions]);

  const addGroup = useCallback(() => {
    const newGroup = createDefaultGroupCondition();
    const updatedRoot = { 
      ...rootCondition,
      conditions: [...rootCondition.conditions, newGroup]
    };
    updateConditions(updatedRoot);
  }, [rootCondition, updateConditions]);

  const updateGroupLogic = useCallback((value: string) => {
    const updatedRoot = { 
      ...rootCondition,
      groupLogic: value as 'AND' | 'OR' 
    };
    updateConditions(updatedRoot);
  }, [rootCondition, updateConditions]);

  const updateChildCondition = useCallback((index: number, updated: Condition | GroupCondition) => {
    const newConditions = [...rootCondition.conditions];
    newConditions[index] = updated;
    const updatedRoot = { ...rootCondition, conditions: newConditions };
    updateConditions(updatedRoot);
  }, [rootCondition, updateConditions]);

  const removeCondition = useCallback((index: number) => {
    if (rootCondition.conditions.length <= 1) {
      return;
    }
    
    const newConditions = [...rootCondition.conditions];
    newConditions.splice(index, 1);
    const updatedRoot = { ...rootCondition, conditions: newConditions };
    updateConditions(updatedRoot);
  }, [rootCondition, updateConditions]);

  // Global move handler that works across all nested groups
  const handleMove = useCallback((result: DropResult) => {
    const { sourceGroupId, sourceIndex, targetGroupId, targetIndex, position } = result;
    
    console.log('ConditionBuilder handleMove:', { result, level, groupId });
    
    // Pass the move up to the root level if this isn't the root handler
    if (level > 0 && parentDndKit) {
      console.log('Delegating to parent');
      return;
    }
    
    // Handle the move at root level
    handleRootLevelMove(result, rootCondition, updateConditions, context);
  }, [rootCondition, updateConditions, context, level, parentDndKit]);

  const duplicateCondition = useCallback((index: number) => {
    const conditionToDuplicate = rootCondition.conditions[index];
    const duplicatedCondition = {
      ...conditionToDuplicate,
      id: Math.random().toString(36).substr(2, 9)
    };
    
    const newConditions = [...rootCondition.conditions];
    newConditions.splice(index + 1, 0, duplicatedCondition);
    const updatedRoot = { ...rootCondition, conditions: newConditions };
    updateConditions(updatedRoot);
  }, [rootCondition, updateConditions]);

  const removeGroup = useCallback(() => {
    if (parentUpdateFn) {
      parentUpdateFn(createDefaultCondition());
    }
  }, [parentUpdateFn]);

  const handleCopyAll = useCallback(() => {
    clipboard.copyConditions(rootCondition.conditions);
  }, [clipboard, rootCondition.conditions]);

  const handlePaste = useCallback(() => {
    const pastedConditions = clipboard.pasteConditions();
    if (pastedConditions) {
      const updatedRoot = {
        ...rootCondition,
        conditions: [...rootCondition.conditions, ...pastedConditions]
      };
      updateConditions(updatedRoot);
    }
  }, [clipboard, rootCondition, updateConditions]);

  const contextClass = context === 'exit' ? 'exit-condition-builder' : 'entry-condition-builder';

  const content = (
    <div 
      className={`space-y-2 ${level > 0 ? 'condition-group' : ''} ${contextClass} relative`}
    >
      <GroupConditionTitle 
        rootCondition={rootCondition}
        level={level}
        allowRemove={allowRemove}
        updateGroupLogic={updateGroupLogic}
        removeGroup={removeGroup}
      />

      <div className={`space-y-2 ${level > 0 ? 'indent-level-' + level : ''}`}>
        <DndConditionList
          conditions={rootCondition.conditions}
          groupId={groupId}
          level={level}
          context={context}
          onUpdateCondition={updateChildCondition}
          onRemoveCondition={removeCondition}
          onDuplicateCondition={duplicateCondition}
          dndKit={dndKit}
        />

        <ConditionActions 
          addCondition={addCondition}
          addGroup={addGroup}
        />
      </div>

      {level === 0 && (
        <>
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyAll}
              disabled={rootCondition.conditions.length === 0}
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy All
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handlePaste}
              disabled={!clipboard.hasClipboardData}
            >
              <Clipboard className="h-4 w-4 mr-1" />
              Paste
            </Button>
          </div>
          
          <ConditionPreview 
            rootCondition={rootCondition} 
            contextLabel={context === 'exit' ? 'Exit when:' : 'Enter when:'}
          />
        </>
      )}
    </div>
  );

  // Only wrap with DndContext at the root level
  if (level === 0 && !isNested) {
    return (
      <DndContext
        sensors={dndKit.sensors}
        onDragStart={dndKit.handleDragStart}
        onDragOver={dndKit.handleDragOver}
        onDragEnd={(event) => dndKit.handleDragEnd(event, handleMove)}
        onDragCancel={dndKit.handleDragCancel}
        collisionDetection={closestCenter}
      >
        {content}
      </DndContext>
    );
  }

  return content;
};

// Global helper to handle moves at the root level with deep tree traversal
const handleRootLevelMove = (
  result: DropResult,
  rootCondition: GroupCondition,
  updateConditions: (condition: GroupCondition) => void,
  context: string
) => {
  const { sourceGroupId, sourceIndex, targetGroupId, targetIndex, position } = result;
  
  console.log('Root level move:', result);
  
  // Create deep clone for manipulation
  const newRoot = JSON.parse(JSON.stringify(rootCondition));
  
  // Find and extract source item
  const sourceItem = findAndExtractItem(newRoot, sourceGroupId, sourceIndex, context, 0, 0);
  
  if (!sourceItem) {
    console.error('Could not find source item');
    return;
  }
  
  console.log('Found source item:', sourceItem);
  
  // Insert item at target location
  insertItemAtTarget(newRoot, targetGroupId, targetIndex, position, sourceItem, context, 0, 0);
  
  updateConditions(newRoot);
};

// Helper to find and extract an item from the tree
const findAndExtractItem = (
  group: GroupCondition,
  searchGroupId: string,
  searchIndex: number,
  context: string,
  level: number,
  index: number
): Condition | GroupCondition | null => {
  const currentGroupId = `${context}-${level}-${index}`;
  
  if (searchGroupId === currentGroupId) {
    return group.conditions.splice(searchIndex, 1)[0] || null;
  }
  
  // Search in nested groups
  for (let i = 0; i < group.conditions.length; i++) {
    const condition = group.conditions[i];
    if ('groupLogic' in condition) {
      const found = findAndExtractItem(condition, searchGroupId, searchIndex, context, level + 1, i);
      if (found) return found;
    }
  }
  
  return null;
};

// Helper to insert item at target location
const insertItemAtTarget = (
  group: GroupCondition,
  searchGroupId: string,
  searchIndex: number,
  position: 'before' | 'after' | 'inside',
  item: Condition | GroupCondition,
  context: string,
  level: number,
  index: number
): boolean => {
  const currentGroupId = `${context}-${level}-${index}`;
  
  if (searchGroupId === currentGroupId) {
    // Ensure valid bounds
    const maxIndex = group.conditions.length;
    let insertIndex = Math.min(Math.max(0, searchIndex), maxIndex);
    
    if (position === 'after') {
      insertIndex = Math.min(insertIndex + 1, maxIndex);
    }
    
    if (position === 'inside' && 
        searchIndex < group.conditions.length && 
        'groupLogic' in group.conditions[searchIndex]) {
      // Add inside the target group
      (group.conditions[searchIndex] as GroupCondition).conditions.push(item);
    } else {
      // Add before/after - ensure we don't exceed bounds
      insertIndex = Math.min(insertIndex, group.conditions.length);
      group.conditions.splice(insertIndex, 0, item);
    }
    return true;
  }
  
  // Search in nested groups
  for (let i = 0; i < group.conditions.length; i++) {
    const condition = group.conditions[i];
    if ('groupLogic' in condition) {
      const inserted = insertItemAtTarget(condition, searchGroupId, searchIndex, position, item, context, level + 1, i);
      if (inserted) return true;
    }
  }
  
  return false;
};

export default memo(ConditionBuilder);