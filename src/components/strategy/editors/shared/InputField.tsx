
import React from 'react';
import { EnhancedInputField } from '@/components/ui/form/enhanced';
import { EnhancedNumberInput } from '@/components/ui/form/enhanced';

interface InputFieldProps {
  label: string;
  id: string;
  value: string | number | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  required?: boolean;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  description?: string;
  readOnly?: boolean; // Added readOnly property
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  id,
  value,
  onChange,
  placeholder,
  type = 'text',
  className,
  required = false,
  min,
  max,
  step,
  description,
  readOnly = false // Default to false
}) => {
  // If this is a number field, use our EnhancedNumberInput
  if (type === 'number') {
    // Convert string numbers to actual numbers
    const minValue = min !== undefined ? Number(min) : undefined;
    const maxValue = max !== undefined ? Number(max) : undefined;
    const stepValue = step !== undefined ? Number(step) : undefined;
    
    // Convert value to number if it's not undefined or empty
    let numValue: number | undefined;
    
    if (typeof value === 'number') {
      numValue = value;
    } else if (value !== undefined && value !== '') {
      numValue = Number(value);
      if (isNaN(numValue)) numValue = undefined;
    } else {
      numValue = undefined;
    }
    
    // Create a handler that wraps the original onChange
    const handleNumberChange = (newValue: number | undefined) => {
      // Simulate an input event to maintain compatibility
      const simulatedEvent = {
        target: {
          value: newValue !== undefined ? newValue.toString() : '',
          id,
          type: 'number'
        }
      } as React.ChangeEvent<HTMLInputElement>;
      
      onChange(simulatedEvent);
    };
    
    return (
      <EnhancedNumberInput
        label={label}
        id={id}
        value={numValue}
        onChange={handleNumberChange}
        min={minValue}
        max={maxValue}
        step={stepValue}
        placeholder={placeholder}
        className={className}
        tooltip={description}
        required={required}
        readOnly={readOnly} // Pass readOnly prop
      />
    );
  }
  
  // For non-number fields, use EnhancedInputField
  return (
    <EnhancedInputField
      label={label}
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      className={className}
      required={required}
      description={description}
      readOnly={readOnly} // Pass readOnly prop
    />
  );
};

export default InputField;
