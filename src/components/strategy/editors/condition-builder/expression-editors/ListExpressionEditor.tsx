import React from 'react';
import { Expression, ListExpression, createConstantExpression } from '../../../utils/conditions';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import ExpressionEditorDialogTrigger from '../ExpressionEditorDialogTrigger';
import { RadioGroupField } from '../../shared';

interface ListExpressionEditorProps {
  expression: Expression;
  updateExpression: (expr: Expression) => void;
  currentNodeId?: string;
  required?: boolean;
}

const ListExpressionEditor: React.FC<ListExpressionEditorProps> = ({
  expression,
  updateExpression,
  currentNodeId,
  required = false
}) => {
  if (expression.type !== 'list') {
    return null;
  }

  const listExpr = expression as ListExpression;

  const aggregationOptions = [
    { value: 'none', label: 'None (Raw List)' },
    { value: 'min', label: 'Min' },
    { value: 'max', label: 'Max' },
    { value: 'avg', label: 'Average' },
    { value: 'sum', label: 'Sum' },
    { value: 'first', label: 'First' },
    { value: 'last', label: 'Last' },
    { value: 'count', label: 'Count' }
  ];

  const updateField = (field: string, value: any) => {
    updateExpression({ ...listExpr, [field]: value });
  };

  const addItem = () => {
    const newItems = [...(listExpr.items || []), createConstantExpression('number', 0)];
    updateExpression({ ...listExpr, items: newItems });
  };

  const removeItem = (index: number) => {
    const newItems = [...(listExpr.items || [])];
    newItems.splice(index, 1);
    updateExpression({ ...listExpr, items: newItems.length > 0 ? newItems : [createConstantExpression('number', 0)] });
  };

  const updateItem = (index: number, newExpr: Expression) => {
    const newItems = [...(listExpr.items || [])];
    newItems[index] = newExpr;
    updateExpression({ ...listExpr, items: newItems });
  };

  return (
    <div className="space-y-3">
      {/* Aggregation */}
      <div className="p-3 border border-violet-200 rounded-lg bg-violet-50/50 dark:border-violet-800 dark:bg-violet-950/30">
        <RadioGroupField
          label="Aggregation"
          value={listExpr.aggregationType || 'none'}
          onChange={(v) => updateField('aggregationType', v)}
          options={aggregationOptions}
          layout="horizontal"
        />
      </div>

      {/* List Items */}
      <div className="p-3 border border-purple-200 rounded-lg bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/30">
        <div className="text-sm font-medium text-purple-700 dark:text-purple-400 mb-3">
          List Items
        </div>
        <div className="space-y-2">
          {(listExpr.items || []).map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-6">{index + 1}.</span>
              <div className="flex-1">
                <ExpressionEditorDialogTrigger
                  expression={item}
                  updateExpression={(newExpr) => updateItem(index, newExpr)}
                  currentNodeId={currentNodeId}
                />
              </div>
              {(listExpr.items?.length || 0) > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(index)}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={addItem}
            className="w-full mt-2"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Item
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ListExpressionEditor;