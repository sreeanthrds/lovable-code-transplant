
import React from 'react';
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
export interface EnhancedInputFieldProps extends 
  LabelProps, 
  ValidationProps, 
  LoadingProps,
  ErrorHandlingProps {
  value: string | number | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  id?: string;
  required?: boolean;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  readOnly?: boolean; // Add readOnly prop
}

// Base input component that will be enhanced
const InputField: React.FC<EnhancedInputFieldProps> = ({
  value,
  onChange,
  placeholder,
  type = 'text',
  className,
  id,
  required = false,
  min,
  max,
  step,
  readOnly = false, // Default to false
  // Exclude HOC-specific props before passing to Input
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
  ...rest
}) => {
  // For number inputs, handle empty value differently
  let inputValue = value;
  if (type === 'number' && (value === undefined || value === null)) {
    inputValue = '';
  }

  return (
    <Input
      id={id}
      type={type}
      value={inputValue}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      min={min}
      max={max}
      step={step}
      required={required}
      readOnly={readOnly} // Pass readOnly prop to Input
      {...rest}
    />
  );
};

// Create enhanced input field with HOCs
const EnhancedInputField = composeHOC(
  withErrorHandling,
  withLoadingState,
  withFormValidation,
  withLabel
)(InputField);

export default EnhancedInputField;
