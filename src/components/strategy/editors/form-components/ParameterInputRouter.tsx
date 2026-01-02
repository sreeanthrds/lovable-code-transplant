import React from 'react';
import { IndicatorParameter } from '../../utils/categorizedIndicatorConfig';
import NumberParameterInput from './NumberParameterInput';
import DropdownParameterInput from './DropdownParameterInput';
import CheckboxGroupParameterInput from './CheckboxGroupParameterInput';
import RadioButtonParameterInput from './RadioButtonParameterInput';
import BooleanParameterInput from './BooleanParameterInput';
import StringParameterInput from './StringParameterInput';
import TimeParameterInput from './TimeParameterInput';

interface ParameterInputRouterProps {
  param: IndicatorParameter;
  value: any;
  onChange: (value: any) => void;
  required?: boolean;
}

const ParameterInputRouter: React.FC<ParameterInputRouterProps> = ({
  param,
  value,
  onChange,
  required = false
}) => {
  // Set default value if undefined, but keep undefined/null values as is for number inputs
  const inputValue = value !== undefined ? value : 
    (param.type === 'number' ? undefined : param.default);
  
  switch (param.type) {
    case 'number':
      return (
        <NumberParameterInput 
          param={param} 
          value={inputValue} 
          onChange={onChange} 
          required={required}
        />
      );
      
    case 'dropdown':
      return (
        <DropdownParameterInput 
          param={param} 
          value={inputValue} 
          onChange={onChange} 
          required={required}
        />
      );
      
    case 'checkbox_group':
      return (
        <CheckboxGroupParameterInput 
          param={param} 
          value={inputValue || []} 
          onChange={onChange} 
        />
      );
      
    case 'radio_button':
      return (
        <RadioButtonParameterInput 
          param={param} 
          value={inputValue} 
          onChange={onChange} 
          required={required}
        />
      );
      
    case 'boolean':
      return (
        <BooleanParameterInput 
          param={param} 
          value={inputValue} 
          onChange={onChange} 
        />
      );
      
    case 'string':
      return (
        <StringParameterInput 
          param={param} 
          value={inputValue} 
          onChange={onChange} 
          required={required}
        />
      );
      
    case 'time':
      return (
        <TimeParameterInput 
          param={param} 
          value={inputValue} 
          onChange={onChange} 
          required={required}
        />
      );
      
    default:
      return null;
  }
};

export default ParameterInputRouter;
