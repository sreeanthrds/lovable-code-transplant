
import React from 'react';
import { IndicatorParameter } from '../../utils/categorizedIndicatorConfig';
import { EnhancedNumberInput } from '@/components/ui/form/enhanced';

interface NumberParameterInputProps {
  param: IndicatorParameter;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  required?: boolean;
}

const NumberParameterInput: React.FC<NumberParameterInputProps> = ({
  param,
  value,
  onChange,
  required = false
}) => {
  // Extract number-specific properties safely with type checks
  const options = param.options || {};
  
  // Get min, max, step from either the options object or direct properties
  const min = typeof options === 'object' && 'min' in options 
    ? options.min as number 
    : param.min;
    
  const max = typeof options === 'object' && 'max' in options 
    ? options.max as number 
    : param.max;
    
  // Convert step to number if it's a string
  const stepValue = typeof options === 'object' && 'step' in options 
    ? options.step 
    : param.step || 1;
  
  // Ensure step is always a number
  const step = typeof stepValue === 'string' ? parseFloat(stepValue) : (stepValue as number);
  
  const placeholder = param.placeholder || `Enter ${param.name}`;
  
  // Direct pass-through to EnhancedNumberInput
  // This ensures empty values are properly handled as undefined
  return (
    <EnhancedNumberInput
      label={param.label || param.name}
      id={`param-${param.name}`}
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      step={step}
      placeholder={placeholder}
      description={param.description}
      required={required}
      readOnly={false}
    />
  );
};

export default NumberParameterInput;
