
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Plus, Minus, Percent } from "lucide-react";

export type MathOperation = '+' | '-' | '*' | '/' | '%' | '+%' | '-%';

export interface OperationSelectorProps {
  /**
   * Currently selected operation
   */
  value: MathOperation;
  /**
   * Callback when operation changes
   */
  onValueChange: (value: MathOperation) => void;
  /**
   * Whether the field is required
   */
  required?: boolean;
  /**
   * Additional class names
   */
  className?: string;
  /**
   * Placeholder text
   */
  placeholder?: string;
  /**
   * Which operations to include
   */
  operations?: MathOperation[];
  /**
   * Whether the selector is disabled
   */
  disabled?: boolean;
}

/**
 * A selector component for mathematical operations
 */
const OperationSelector: React.FC<OperationSelectorProps> = ({ 
  value, 
  onValueChange,
  required = false,
  className,
  placeholder = "Operation",
  operations = ['+', '-', '*', '/', '%', '+%', '-%'],
  disabled = false
}) => {
  return (
    <Select 
      value={value} 
      onValueChange={(val) => onValueChange(val as MathOperation)}
      disabled={disabled}
    >
      <SelectTrigger 
        className={cn(
          "w-24 h-8", 
          required && !value && "border-red-300 focus:ring-red-200",
          className
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {operations.includes('+') && <SelectItem value="+">+</SelectItem>}
        {operations.includes('-') && <SelectItem value="-">-</SelectItem>}
        {operations.includes('*') && <SelectItem value="*">*</SelectItem>}
        {operations.includes('/') && <SelectItem value="/">/</SelectItem>}
        {operations.includes('%') && <SelectItem value="%">%</SelectItem>}
        {operations.includes('+%') && (
          <SelectItem value="+%">
            <div className="flex items-center">
              <Plus className="h-3 w-3 mr-1" />
              <Percent className="h-3 w-3" />
              <span className="ml-1">Increase by %</span>
            </div>
          </SelectItem>
        )}
        {operations.includes('-%') && (
          <SelectItem value="-%">
            <div className="flex items-center">
              <Minus className="h-3 w-3 mr-1" />
              <Percent className="h-3 w-3" />
              <span className="ml-1">Decrease by %</span>
            </div>
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
};

export default OperationSelector;
