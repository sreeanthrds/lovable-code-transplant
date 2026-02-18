
import React, { useState, useEffect } from 'react';
import { Expression } from '../../utils/conditions';
import ExpressionEditor from './ExpressionEditor';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Edit3 } from 'lucide-react';
import { expressionToString } from '../../utils/conditions/stringRepresentation';
import { useStrategyStore } from '@/hooks/use-strategy-store';
import { useTimeframeMigration } from '../../utils/timeframe-migration/useTimeframeMigration';

interface ExpressionEditorDialogProps {
  expression: Expression;
  updateExpression: (expr: Expression) => void;
  currentNodeId?: string;
  currentVariableId?: string;
  title?: string;
  trigger?: React.ReactNode;
  restrictToConstant?: boolean;
}

const ExpressionEditorDialog: React.FC<ExpressionEditorDialogProps> = ({
  expression,
  updateExpression,
  currentNodeId,
  currentVariableId,
  title = "Expression Editor",
  trigger,
  restrictToConstant = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localExpression, setLocalExpression] = useState<Expression>(expression);
  const strategyStore = useStrategyStore();
  
  // Initialize TimeframeResolver to ensure timeframes are loaded
  useTimeframeMigration();

  // Update local expression when prop changes
  useEffect(() => {
    setLocalExpression(expression);
  }, [expression]);

  const handleSave = () => {
    updateExpression(localExpression);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setLocalExpression(expression); // Reset to original
    setIsOpen(false);
  };

  const getExpressionPreview = (expr: Expression) => {
    if (!expr || !expr.type) return 'No expression';
    
    // Use the same string representation logic
    try {
      const startNode = strategyStore.nodes.find(node => node.type === 'startNode');
      return expressionToString(expr, startNode?.data);
    } catch (error) {
      console.error('Error formatting expression preview:', error);
      
      // Fallback to basic type information
      switch (expr.type) {
        case 'constant':
          return `Value: ${expr.value || 'Empty'}`;
        case 'indicator':
          return `Indicator: ${expr.name ? 'Selected' : 'None selected'}`;
        case 'candle_data':
          return `Candle Data: ${expr.field || 'None selected'}`;
        case 'live_data':
          return `Live Data: ${expr.field || 'None selected'}`;
        case 'time_function':
          return `Time: ${expr.timeValue || 'None set'}`;
        case 'current_time':
          return 'Current Time';
        case 'position_data':
          return `Position: ${expr.positionField || 'None selected'}`;
        case 'external_trigger':
          return `External: ${expr.triggerType || 'None selected'}`;
        case 'expression':
          return `Complex: ${expr.operation || 'No operation'}`;
        case 'node_variable':
          return `Variable: ${expr.variableName || 'None selected'}`;
        case 'global_variable':
          return `Global: ${(expr as any).globalVariableName || 'None selected'}`;
        case 'pnl_data':
          return `P&L: ${expr.pnlType || 'unrealized'} (${expr.scope || 'overall'})`;
        default:
          return `Unknown type: ${(expr as any).type || 'No type'}`;
      }
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
      return getExpressionPreview(expr);
    }
  };

  const defaultTrigger = (
    <Button
      variant="outline"
      size="sm"
      className="w-full justify-start text-left h-auto p-2 min-h-[40px]"
      onClick={() => setIsOpen(true)}
    >
      <div className="flex items-center gap-2 w-full">
        <Edit3 className="h-3 w-3 flex-shrink-0" />
        <div className="flex-1 text-xs text-muted-foreground text-left truncate">
          {getExpressionPreview(expression)}
        </div>
      </div>
    </Button>
  );

  return (
    <>
      {trigger ? (
        <div onClick={() => setIsOpen(true)}>
          {trigger}
        </div>
      ) : (
        defaultTrigger
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              {title}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-auto p-1">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Configure your expression with more space and better organization.
              </div>
              
              <div className="border-2 border-blue-400/25 dark:border-blue-500/20 rounded-lg p-4 bg-white/[0.04] dark:bg-white/[0.03] backdrop-blur-[8px] shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
              <ExpressionEditor
                expression={localExpression}
                updateExpression={setLocalExpression}
                currentNodeId={currentNodeId}
                currentVariableId={currentVariableId}
                restrictToConstant={restrictToConstant}
              />
              </div>
              
              {/* Enhanced Expression Preview */}
              <div className="bg-white/[0.02] dark:bg-white/[0.015] border-2 border-blue-400/20 dark:border-blue-500/15 backdrop-blur-[6px] rounded-lg p-4 space-y-3 shadow-[0_1px_6px_rgba(0,0,0,0.3)]">
                <div className="text-sm font-medium text-muted-foreground">Expression Preview:</div>
                
                {/* Detailed formatted expression */}
                <div className="bg-background/50 border border-border rounded p-3">
                  <div className="text-sm font-mono text-foreground">
                    {getDetailedExpressionPreview(localExpression)}
                  </div>
                </div>
                
                {/* Expression type and basic info */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-medium text-muted-foreground">Type: </span>
                    <span className="capitalize">{localExpression.type || 'None'}</span>
                  </div>
                  {localExpression.type === 'constant' && (
                    <div>
                      <span className="font-medium text-muted-foreground">Value Type: </span>
                      <span className="capitalize">{localExpression.valueType || 'number'}</span>
                    </div>
                  )}
                  {localExpression.type === 'indicator' && localExpression.offset && (
                    <div>
                      <span className="font-medium text-muted-foreground">Offset: </span>
                      <span>{localExpression.offset} candles</span>
                    </div>
                  )}
                  {localExpression.type === 'candle_data' && localExpression.offset && (
                    <div>
                      <span className="font-medium text-muted-foreground">Offset: </span>
                      <span>{localExpression.offset} candles</span>
                    </div>
                  )}
                </div>
                
                {/* Complex expression breakdown */}
                {localExpression.type === 'expression' && localExpression.left && localExpression.right && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Expression Breakdown:</div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-background/50 border border-border rounded p-2">
                        <div className="font-medium mb-1">Left:</div>
                        <div className="font-mono">{getDetailedExpressionPreview(localExpression.left)}</div>
                      </div>
                      <div className="bg-background/50 border border-border rounded p-2 text-center">
                        <div className="font-medium mb-1">Operation:</div>
                        <div className="font-mono text-lg">{localExpression.operation || '?'}</div>
                      </div>
                      <div className="bg-background/50 border border-border rounded p-2">
                        <div className="font-medium mb-1">Right:</div>
                        <div className="font-mono">{getDetailedExpressionPreview(localExpression.right)}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="!flex-row gap-2 px-2 sm:px-6">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              className="flex-1 text-sm"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              className="flex-1 text-sm"
            >
              Save Expression
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExpressionEditorDialog;
