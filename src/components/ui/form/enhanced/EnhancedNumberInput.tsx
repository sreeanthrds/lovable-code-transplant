
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { 
  composeHOC, 
  withLabel, 
  withFormValidation, 
  withLoadingState,
  withErrorHandling,
  LabelProps,
  ValidationProps,
  LoadingProps,
  ErrorHandlingProps
} from '@/components/ui/hoc';

// Component props
export interface EnhancedNumberInputProps extends 
  LabelProps, 
  ValidationProps, 
  LoadingProps,
  ErrorHandlingProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  readOnly?: boolean;
  tooltip?: string; // Added missing tooltip property
}

// Base number input component that will be enhanced
const NumberInput: React.FC<EnhancedNumberInputProps> = ({
  value,
  onChange,
  placeholder,
  className,
  id,
  min,
  max,
  step = 1,
  required = false,
  readOnly = false,
  // Exclude HOC-specific props
  label,
  hideLabel,
  labelClassName,
  description,
  isRequired,
  error,
  isValid,
  isLoading,
  loadingComponent,
  errorContext,
  handleError,
  showToasts,
  catchRenderErrors,
  tooltip,
  ...rest
}) => {
  // State to track the input value as a string
  const [inputValue, setInputValue] = useState<string>(
    value !== undefined ? String(value) : ''
  );

  // Update the input value when the prop changes
  useEffect(() => {
    setInputValue(value !== undefined ? String(value) : '');
  }, [value]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Only call onChange if the input is valid or empty
    if (newValue === '') {
      onChange(undefined);
    } else {
      const numValue = parseFloat(newValue);
      if (!isNaN(numValue)) {
        onChange(numValue);
      }
    }
  };

  // Handle blur event to format the value
  const handleBlur = () => {
    if (inputValue === '') {
      return;
    }
    
    let numValue = parseFloat(inputValue);
    
    // Apply min/max constraints
    if (min !== undefined && numValue < min) {
      numValue = min;
    } else if (max !== undefined && numValue > max) {
      numValue = max;
    }
    
    // Update the displayed value
    setInputValue(String(numValue));
    onChange(numValue);
  };

  return (
    <Input
      id={id}
      type="number"
      value={inputValue}
      onChange={handleInputChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
      min={min}
      max={max}
      step={step}
      required={required}
      readOnly={readOnly}
      {...rest}
    />
  );
};

// Create enhanced number input with HOCs
const EnhancedNumberInput = composeHOC(
  withErrorHandling,
  withLoadingState,
  withFormValidation,
  withLabel
)(NumberInput);

export default EnhancedNumberInput;
