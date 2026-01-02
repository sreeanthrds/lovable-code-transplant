import React from 'react';
import { Card } from '@/components/ui/card';

interface ConditionDragPreviewProps {
  count: number;
  position: { x: number; y: number };
}

const ConditionDragPreview: React.FC<ConditionDragPreviewProps> = ({ count, position }) => {
  return (
    <div 
      className="fixed pointer-events-none z-50"
      style={{
        left: position.x + 10,
        top: position.y + 10,
      }}
    >
      <Card className="p-2 bg-primary text-primary-foreground shadow-lg">
        <span className="text-sm font-medium">
          Moving {count} condition{count !== 1 ? 's' : ''}
        </span>
      </Card>
    </div>
  );
};

export default ConditionDragPreview;