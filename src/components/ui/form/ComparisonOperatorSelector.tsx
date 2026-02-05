
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type ComparisonOperator = '>' | '<' | '>=' | '<=' | '==' | '!=' | 'crosses_above' | 'crosses_below' | 'between' | 'not_between' | 'in' | 'not_in';

export interface ComparisonOperatorSelectorProps {
  /**
   * Currently selected operator
   */
  value: ComparisonOperator;
  /**
   * Callback when operator changes
   */
  onValueChange: (value: ComparisonOperator) => void;
  /**
   * Whether the field is required
   */
  required?: boolean;
  /**
   * Additional class names
   */
  className?: string;
  /**
   * Which operators to include
   */
  operators?: ComparisonOperator[];
  /**
   * Whether the selector is disabled
   */
  disabled?: boolean;
}

/**
 * A selector component for comparison operators
 */
const ComparisonOperatorSelector: React.FC<ComparisonOperatorSelectorProps> = ({
  value,
  onValueChange,
  required = false,
  className,
  operators = ['>', '<', '>=', '<=', '==', '!='],
  disabled = false
}) => {
  return (
    <Select
      value={value}
      onValueChange={(val) => onValueChange(val as ComparisonOperator)}
      disabled={disabled}
    >
      <SelectTrigger
        className={cn(
          "w-auto min-w-[4rem] font-semibold",
          required && !value && "border-destructive/50 focus:ring-destructive/20",
          className
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {operators.includes('>') && <SelectItem value=">">{'>'}</SelectItem>}
        {operators.includes('<') && <SelectItem value="<">{'<'}</SelectItem>}
        {operators.includes('>=') && <SelectItem value=">=">{'≥'}</SelectItem>}
        {operators.includes('<=') && <SelectItem value="<=">{'≤'}</SelectItem>}
        {operators.includes('==') && <SelectItem value="==">{'='}</SelectItem>}
        {operators.includes('!=') && <SelectItem value="!=">{'≠'}</SelectItem>}
        {operators.includes('crosses_above') && <SelectItem value="crosses_above">{'↗'}</SelectItem>}
        {operators.includes('crosses_below') && <SelectItem value="crosses_below">{'↘'}</SelectItem>}
        {operators.includes('between') && <SelectItem value="between">{'between'}</SelectItem>}
        {operators.includes('not_between') && <SelectItem value="not_between">{'not between'}</SelectItem>}
        {operators.includes('in') && <SelectItem value="in">{'in'}</SelectItem>}
        {operators.includes('not_in') && <SelectItem value="not_in">{'not in'}</SelectItem>}
      </SelectContent>
    </Select>
  );
};

export default ComparisonOperatorSelector;
