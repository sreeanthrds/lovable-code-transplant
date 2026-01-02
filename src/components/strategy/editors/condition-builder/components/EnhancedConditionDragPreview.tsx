import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Condition, GroupCondition } from '../../../utils/conditions';
import { cn } from '@/lib/utils';

interface EnhancedConditionDragPreviewProps {
  conditions: (Condition | GroupCondition)[];
  position: { x: number; y: number };
  isDragging: boolean;
}

const EnhancedConditionDragPreview: React.FC<EnhancedConditionDragPreviewProps> = ({ 
  conditions, 
  position, 
  isDragging 
}) => {
  if (!isDragging || conditions.length === 0) return null;

  const isMultiple = conditions.length > 1;
  const mainCondition = conditions[0];

  const getExpressionValue = (expr: any): string => {
    if (!expr) return 'Value';
    
    switch (expr.type) {
      case 'constant':
        return expr.value ?? expr.numberValue ?? expr.stringValue ?? expr.booleanValue ?? 'Value';
      case 'indicator':
        return expr.name || `${expr.indicatorId}.${expr.indicatorParam}`;
      case 'market_data':
        return expr.dataField || expr.field || 'Market Data';
      case 'time_function':
        return expr.timeValue || 'Time';
      default:
        return expr.type || 'Value';
    }
  };

  const getConditionPreview = (condition: Condition | GroupCondition) => {
    if ('groupLogic' in condition) {
      return `${condition.groupLogic} Group (${condition.conditions.length} conditions)`;
    } else {
      const left = getExpressionValue(condition.lhs);
      const operator = condition.operator || '==';
      const right = getExpressionValue(condition.rhs);
      return `${left} ${operator} ${right}`;
    }
  };

  return (
    <div 
      className="fixed pointer-events-none z-50 animate-fade-in"
      style={{
        left: position.x + 10,
        top: position.y + 10,
        transform: 'rotate(2deg)',
      }}
    >
      <Card className={cn(
        "shadow-xl border-2 border-primary bg-background/95 backdrop-blur-sm",
        "transition-all duration-200 animate-scale-in"
      )}>
        <CardContent className="p-3 min-w-[200px]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
            <span className="text-sm font-medium text-foreground">
              Moving {isMultiple ? `${conditions.length} conditions` : 'condition'}
            </span>
          </div>
          
          <div className="text-xs text-muted-foreground">
            {getConditionPreview(mainCondition)}
            {isMultiple && (
              <div className="mt-1">
                <Badge variant="secondary" className="text-xs">
                  +{conditions.length - 1} more
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedConditionDragPreview;