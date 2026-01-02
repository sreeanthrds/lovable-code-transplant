
import React from 'react';
import { Indicator } from '../utils/categorizedIndicatorConfig';
import ParameterInputRouter from './form-components/ParameterInputRouter';

interface IndicatorFormProps {
  indicator: Indicator;
  values: Record<string, any>;
  onChange: (paramName: string, value: any) => void;
}

const IndicatorForm: React.FC<IndicatorFormProps> = ({ 
  indicator, 
  values, 
  onChange 
}) => {
  return (
    <div className="space-y-3 bg-muted/40 p-3 rounded-md mt-1">
      {indicator.parameters.map((param) => {
        // Consider most common parameters as required
        const isRequired = ['timeperiod', 'period', 'fastperiod', 'slowperiod'].includes(param.name);
        
        return (
          <ParameterInputRouter
            key={param.name}
            param={param}
            value={values[param.name]}
            onChange={(value) => onChange(param.name, value)}
            required={isRequired}
          />
        );
      })}
    </div>
  );
};

export default IndicatorForm;
