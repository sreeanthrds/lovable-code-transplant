
import React from 'react';
import { Expression } from '../../../utils/conditions';
import { useStrategyStore } from '@/hooks/use-strategy-store';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Variable } from 'lucide-react';

interface GlobalVariableExpressionEditorProps {
  expression: Expression;
  updateExpression: (expr: Expression) => void;
}

const GlobalVariableExpressionEditor: React.FC<GlobalVariableExpressionEditorProps> = ({
  expression,
  updateExpression
}) => {
  const globalVariables = useStrategyStore(state => state.globalVariables);

  const selectedId = (expression as any).globalVariableId || '';

  const handleChange = (varId: string) => {
    const gv = globalVariables.find((v: any) => v.id === varId);
    if (gv) {
      updateExpression({
        ...expression,
        type: 'global_variable',
        globalVariableId: gv.id,
        globalVariableName: gv.name
      } as Expression);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Variable className="h-4 w-4 text-primary" />
        <Label className="text-xs font-medium">Global Variable</Label>
      </div>
      {globalVariables.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No global variables defined. Add them via the Variables button in the toolbar.
        </p>
      ) : (
        <Select value={selectedId} onValueChange={handleChange}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Select global variable..." />
          </SelectTrigger>
          <SelectContent>
            {globalVariables.map((gv: any) => (
              <SelectItem key={gv.id} value={gv.id} className="text-xs">
                {gv.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default GlobalVariableExpressionEditor;
