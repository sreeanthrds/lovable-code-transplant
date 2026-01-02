import React from 'react';
import { Condition, GroupCondition } from '../../../utils/conditions';
import { Card } from '@/components/ui/card';

interface DragPreviewProps {
  items: (Condition | GroupCondition)[];
  position: { x: number; y: number };
  isDragging: boolean;
}

export const DragPreview: React.FC<DragPreviewProps> = ({ items, position, isDragging }) => {
  if (!isDragging || items.length === 0) return null;

  const getItemPreview = (item: Condition | GroupCondition): string => {
    if ('groupLogic' in item) {
      return `Group (${item.conditions.length} conditions)`;
    }
    
    if (item.lhs && item.operator && item.rhs) {
      const lhsPreview = item.lhs.type === 'constant' ? 
        (item.lhs as any).value || (item.lhs as any).numberValue || (item.lhs as any).stringValue : 
        item.lhs.type;
      const rhsPreview = item.rhs.type === 'constant' ? 
        (item.rhs as any).value || (item.rhs as any).numberValue || (item.rhs as any).stringValue : 
        item.rhs.type;
      return `${lhsPreview} ${item.operator} ${rhsPreview}`;
    }
    
    return 'Condition';
  };

  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{
        left: position.x + 10,
        top: position.y + 10,
        transform: 'translate(0, 0)'
      }}
    >
      <Card className="p-3 bg-primary text-primary-foreground shadow-lg border-2 border-primary">
        <div className="text-sm font-medium">
          {items.length === 1 ? (
            getItemPreview(items[0])
          ) : (
            `${items.length} items`
          )}
        </div>
      </Card>
    </div>
  );
};