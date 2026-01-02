
import React from 'react';
import { Expression } from '../../utils/conditions';
import ExpressionEditorDialog from './ExpressionEditorDialog';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { expressionToString } from '../../utils/conditions/stringRepresentation';
import { useStrategyStore } from '@/hooks/use-strategy-store';
import { cn } from '@/lib/utils';

interface ExpressionEditorDialogTriggerProps {
  label?: string;
  expression: Expression;
  updateExpression: (expr: Expression) => void;
  currentNodeId?: string;
  currentVariableId?: string;
  required?: boolean;
  className?: string;
  restrictToConstant?: boolean;
}

const ExpressionEditorDialogTrigger: React.FC<ExpressionEditorDialogTriggerProps> = ({
  label,
  expression,
  updateExpression,
  currentNodeId,
  currentVariableId,
  required = false,
  className = "",
  restrictToConstant = false
}) => {
  const strategyStore = useStrategyStore();

  const getExpressionSummary = (expr: Expression) => {
    if (!expr || !expr.type) {
      return required ? 'Click to add expression (Required)' : 'Click to add expression';
    }
    
    // Use the same string representation logic that's used in conditions
    try {
      const startNode = strategyStore.nodes.find(node => node.type === 'startNode');
      const displayText = expressionToString(expr, startNode?.data);
      
      // Return the display text for better preview
      return displayText || `${expr.type} expression`;
    } catch (error) {
      console.error('Error formatting expression summary:', error);
      return `${expr.type || 'Unknown'} expression`;
    }
  };

  // Get detailed expression preview using the string representation utility
  const getDetailedExpressionPreview = (expr: Expression) => {
    try {
      // Find the start node to get indicator parameters for better formatting
      const startNode = strategyStore.nodes.find(node => node.type === 'startNode');
      return expressionToString(expr, startNode?.data);
    } catch (error) {
      console.error('Error formatting expression:', error);
      return getExpressionSummary(expr);
    }
  };

  // Get expression type display name
  const getExpressionTypeDisplayName = (type: string) => {
    switch (type) {
      case 'indicator': return 'Indicator';
      case 'market_data': return 'Market Data';
      case 'live_data': return 'Live Data';
      case 'constant': return 'Constant';
      case 'time_function': return 'Time Function';
      case 'current_time': return 'Current Time';
      case 'position_data': return 'Position Data';
      case 'strategy_metric': return 'Strategy Metric';
      case 'execution_data': return 'Execution Data';
      case 'external_trigger': return 'External Trigger';
      case 'expression': return 'Complex Expression';
      case 'node_variable': return 'Node Variable';
      case 'position_store_data': return 'Position Store Data';
      default: return type;
    }
  };

  const isEmpty = !expression || !expression.type;
  const showRequired = required && isEmpty;

  const triggerButton = (
    <Button
      variant="outline"
      className={cn(
        "w-full justify-start text-left h-10 px-3 font-normal",
        "bg-background border-input hover:bg-background/60",
        "transition-colors cursor-pointer",
        showRequired && "border-destructive/50 focus:ring-destructive/20"
      )}
    >
      <div className="flex items-center gap-2 w-full">
        <div className={`flex-1 text-sm ${
          isEmpty ? 'text-muted-foreground' : 'text-primary font-mono'
        } text-left truncate`}>
          {getExpressionSummary(expression)}
        </div>
        <div className="text-primary/60">
          ✎
        </div>
      </div>
    </Button>
  );

  return (
    <div className={className}>
      {label && (
        <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-0.5 flex-nowrap">
          {label}
          {required && <span className="inline-flex h-1.5 w-1.5 rounded-full bg-destructive flex-shrink-0" title="Required field" />}
        </label>
      )}
      
      {isEmpty ? (
        <ExpressionEditorDialog
          expression={expression}
          updateExpression={updateExpression}
          currentNodeId={currentNodeId}
          title={label ? `${label} - Expression Editor` : 'Expression Editor'}
          trigger={triggerButton}
          restrictToConstant={restrictToConstant}
        />
      ) : (
        <ExpressionEditorDialog
          expression={expression}
          updateExpression={updateExpression}
          currentNodeId={currentNodeId}
          currentVariableId={currentVariableId}
          title={label ? `${label} - Expression Editor` : 'Expression Editor'}
          trigger={triggerButton}
          restrictToConstant={restrictToConstant}
        />
      )}
    </div>
  );
};

export default ExpressionEditorDialogTrigger;
