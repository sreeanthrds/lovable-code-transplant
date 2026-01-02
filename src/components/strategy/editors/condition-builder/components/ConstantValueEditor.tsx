
import React from 'react';
import { 
  Expression, 
  ConstantExpression
} from '../../../utils/conditions';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface ConstantValueEditorProps {
  expression: Expression;
  updateExpression: (expr: Expression) => void;
  required?: boolean;
}

const STATUS_OPTIONS = [
  { value: 'Open', label: 'Open' },
  { value: 'Close', label: 'Close' },
  { value: 'Partially closed', label: 'Partially closed' }
];

const ConstantValueEditor: React.FC<ConstantValueEditorProps> = ({
  expression,
  updateExpression,
  required = false
}) => {
  if (expression.type !== 'constant') {
    return null;
  }

  const constantExpr = expression as ConstantExpression;
  const isEmpty = constantExpr.value === undefined || constantExpr.value === null || constantExpr.value === '';
  const showRequired = required && isEmpty;
  
  // Update constant value
  const updateConstantValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow empty string for temporary editing state
    if (value === '') {
      updateExpression({
        ...constantExpr,
        value: ''
      });
      return;
    }
    
    // Try to convert to number if possible
    const numValue = !isNaN(Number(value)) ? Number(value) : value;
    updateExpression({
      ...constantExpr,
      value: numValue
    });
  };

  // Update status value
  const updateStatusValue = (value: string) => {
    updateExpression({
      ...constantExpr,
      statusValue: value as 'Open' | 'Close' | 'Partially closed',
      value: value
    });
  };

  // Update value type
  const updateValueType = (valueType: 'number' | 'string' | 'boolean' | 'status') => {
    const defaultValues = {
      number: 0,
      string: '',
      boolean: false,
      status: 'Open'
    };
    
    updateExpression({
      ...constantExpr,
      valueType,
      value: defaultValues[valueType],
      ...(valueType === 'status' && { statusValue: 'Open' as const })
    });
  };
  
  return (
    <div className="space-y-2">
      {/* Value Type Selector */}
      <div>
        <label className="text-xs font-medium text-muted-foreground">Value Type</label>
        <Select value={constantExpr.valueType || 'number'} onValueChange={updateValueType}>
          <SelectTrigger className="h-8">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent className="bg-background border border-border shadow-lg z-50">
            <SelectItem value="number">Number</SelectItem>
            <SelectItem value="string">String</SelectItem>
            <SelectItem value="boolean">Boolean</SelectItem>
            <SelectItem value="status">Status</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Value Editor */}
      <div className="relative">
        {showRequired && (
          <span className="absolute -top-1 right-0 text-red-500 text-xs">*</span>
        )}
        
        {constantExpr.valueType === 'status' ? (
          <Select value={constantExpr.statusValue || 'Open'} onValueChange={updateStatusValue}>
            <SelectTrigger className={cn("h-8", showRequired && "border-red-300 focus:ring-red-200")}>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="bg-background border border-border shadow-lg z-50">
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            type={constantExpr.valueType === 'number' ? 'number' : 'text'}
            step={constantExpr.valueType === 'number' ? 'any' : undefined}
            value={constantExpr.value?.toString() || ''}
            onChange={updateConstantValue}
            className={cn("h-8", showRequired && "border-red-300 focus:ring-red-200")}
            placeholder={required ? "Required" : ""}
          />
        )}
      </div>
    </div>
  );
};

export default ConstantValueEditor;
