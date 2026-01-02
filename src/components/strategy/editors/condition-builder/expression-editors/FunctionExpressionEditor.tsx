import React from 'react';
import { Expression, FunctionExpression } from '../../../utils/conditions';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createConstantExpression } from '../../../utils/conditions/factories';
import ExpressionEditorDialogTrigger from '../ExpressionEditorDialogTrigger';
import { cn } from '@/lib/utils';
import { Plus, Trash2 } from 'lucide-react';

interface FunctionExpressionEditorProps {
  expression: Expression;
  updateExpression: (expr: Expression) => void;
  required?: boolean;
  currentNodeId?: string;
}

const FunctionExpressionEditor: React.FC<FunctionExpressionEditorProps> = ({
  expression,
  updateExpression,
  required = false,
  currentNodeId
}) => {
  if (expression.type !== 'function') {
    return null;
  }

  const functionExpr = expression as FunctionExpression;
  
  // Ensure we have at least 2 expressions for min/max
  const expressions = functionExpr.expressions.length >= 2 
    ? functionExpr.expressions 
    : [
        functionExpr.expressions[0] || createConstantExpression('number', 0),
        functionExpr.expressions[1] || createConstantExpression('number', 0)
      ];

  // Update function name
  const updateFunctionName = (functionName: 'max' | 'min') => {
    updateExpression({
      ...functionExpr,
      functionName
    });
  };

  // Update specific expression in the list
  const updateExpressionAt = (index: number, expr: Expression) => {
    const newExpressions = [...expressions];
    newExpressions[index] = expr;
    updateExpression({
      ...functionExpr,
      expressions: newExpressions
    });
  };

  // Add new expression to the list
  const addExpression = () => {
    const newExpressions = [...expressions, createConstantExpression('number', 0)];
    updateExpression({
      ...functionExpr,
      expressions: newExpressions
    });
  };

  // Remove expression from the list (minimum 2 expressions)
  const removeExpression = (index: number) => {
    if (expressions.length <= 2) return;
    
    const newExpressions = expressions.filter((_, i) => i !== index);
    updateExpression({
      ...functionExpr,
      expressions: newExpressions
    });
  };

  return (
    <div className={cn(
      "space-y-4 border border-border rounded-md p-4 mt-2 w-full",
      required && !functionExpr.functionName && "border-red-300"
    )}>
      {/* Function selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Function</label>
        <Select 
          value={functionExpr.functionName || ''} 
          onValueChange={updateFunctionName}
        >
          <SelectTrigger className={cn(
            "w-full",
            required && !functionExpr.functionName && "border-red-300"
          )}>
            <SelectValue placeholder="Select function..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="max">Max (Maximum)</SelectItem>
            <SelectItem value="min">Min (Minimum)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Expression list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Expressions</label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addExpression}
            className="h-8 px-2"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>

        {expressions.map((expr, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="flex-1">
              <ExpressionEditorDialogTrigger
                label={`Expression ${index + 1}`}
                expression={expr}
                updateExpression={(newExpr) => updateExpressionAt(index, newExpr)}
                required={required}
                currentNodeId={currentNodeId}
              />
            </div>
            {expressions.length > 2 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeExpression(index)}
                className="h-8 w-8 p-0 mt-6"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FunctionExpressionEditor;