
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface TypeOption {
  /**
   * The value of the type
   */
  value: string;
  /**
   * The display label for the type
   */
  label: string;
  /**
   * Optional icon component
   */
  icon?: React.ReactNode;
}

export interface TypeSelectorProps {
  /**
   * Currently selected type
   */
  value: string;
  /**
   * Available type options
   */
  options: TypeOption[];
  /**
   * Callback when type changes
   */
  onValueChange: (value: string) => void;
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
   * Whether the selector is disabled
   */
  disabled?: boolean;
}

/**
 * A generic selector component for various types of data
 */
const TypeSelector: React.FC<TypeSelectorProps> = ({
  value,
  options,
  onValueChange,
  required = false,
  className,
  placeholder = "Select type",
  disabled = false
}) => {
  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger
        className={cn(
          "h-8",
          required && !value && "border-red-300 focus:ring-red-200",
          className
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.icon ? (
              <div className="flex items-center">
                {option.icon}
                <span className="ml-2">{option.label}</span>
              </div>
            ) : (
              option.label
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default TypeSelector;
