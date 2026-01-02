import React from 'react';
import { Expression, TrailingVariableExpression } from '../../../utils/conditions';
import { useStrategyStore } from '@/hooks/use-strategy-store';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RadioGroupField } from '../../shared';

interface TrailingVariableExpressionEditorProps {
  expression: Expression;
  updateExpression: (expr: Expression) => void;
  required?: boolean;
}

const TrailingVariableExpressionEditor: React.FC<TrailingVariableExpressionEditorProps> = ({
  expression,
  updateExpression,
  required = false
}) => {
  if (expression.type !== 'trailing_variable') {
    return null;
  }

  const trailingExpr = expression as TrailingVariableExpression;
  const nodes = useStrategyStore(state => state.nodes);
  
  // Extract all trailing variables from entry nodes
  const trailingVariables = React.useMemo(() => {
    const allVariables: any[] = [];
    
    nodes.forEach(node => {
      if (node.type === 'entryNode' && Array.isArray(node.data?.trailingVariables)) {
        node.data.trailingVariables.forEach((variable: any) => {
          if (variable.id && variable.name) {
            allVariables.push({
              ...variable,
              sourceNodeId: node.id
            });
          }
        });
      }
    });
    
    return allVariables;
  }, [nodes]);
  
  const updateVariableId = (value: string) => {
    updateExpression({
      ...trailingExpr,
      variableId: value
    });
  };
  
  const updateField = (value: string) => {
    updateExpression({
      ...trailingExpr,
      trailingField: value as 'trailingPosition'
    });
  };
  
  // Trailing variable fields - simplified to just trailing position
  const trailingFields = [
    { value: 'trailingPosition', label: 'Trailing Position' }
  ];
  
  return (
    <div className="space-y-4">
      {/* Trailing Variable Selection - Keep as dropdown since it's dynamic data */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-400">
            Select Trailing Variable
          </label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">
                  This trailing variable is only valid as long as the position is open, otherwise it will be null
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Select 
          value={trailingExpr.variableId || ''} 
          onValueChange={updateVariableId}
        >
          <SelectTrigger className={cn(
            "h-10",
            required && !trailingExpr.variableId && "border-red-300 focus:ring-red-200"
          )}>
            <SelectValue placeholder="Choose trailing variable..." />
          </SelectTrigger>
          <SelectContent className="max-h-60 bg-background border z-50">
            {trailingVariables.map(variable => {
              // Find the corresponding position to get VPI/VPT
              const sourceNode = nodes.find(node => node.id === variable.sourceNodeId);
              const position = sourceNode && Array.isArray(sourceNode.data?.positions) 
                ? sourceNode.data.positions.find((pos: any) => pos.vpi === variable.positionId)
                : null;
              
              if (!position) return null;
              
              const trailTypeLabel = variable.config?.trailType === 'underlying' 
                ? ' (Underlying Price)' 
                : ' (Position Price)';
              
              return (
                <SelectItem key={variable.id} value={variable.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{variable.name.replace(/_Position$|_Underlying$/, '')}{trailTypeLabel}</span>
                    <span className="text-xs text-muted-foreground">
                      Position: {position.vpi}
                      {position.vpt && ` (${position.vpt})`}
                    </span>
                  </div>
                </SelectItem>
              );
            })}
            {trailingVariables.length === 0 && (
              <SelectItem value="_no_variables" disabled>
                No trailing variables available
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Field Selection with Enhanced Styling */}
      <div className="p-3 border border-purple-200 rounded-lg bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/30">
        <RadioGroupField
          label={
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-purple-100 dark:bg-purple-900/50 border border-purple-200 dark:border-purple-700 flex items-center justify-center">
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">📍</span>
              </div>
              <span className="text-sm font-medium text-purple-700 dark:text-purple-400">Trailing Field</span>
            </div>
          }
          value={trailingExpr.trailingField || ''}
          onChange={updateField}
          options={trailingFields}
          layout="horizontal"
          className="space-y-3"
        />
      </div>
    </div>
  );
};

export default TrailingVariableExpressionEditor;