
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface IndicatorParameterSelectorProps {
  parameter: string | undefined;
  parameters: string[];
  onParameterChange: (value: string) => void;
  required?: boolean;
}

const IndicatorParameterSelector: React.FC<IndicatorParameterSelectorProps> = ({
  parameter,
  parameters,
  onParameterChange,
  required = false
}) => {
  const isEmpty = !parameter;
  const showRequired = required && isEmpty;
  
  return (
    <div className="relative">
      {showRequired && (
        <span className="absolute -top-1 right-0 text-red-500 text-xs">*</span>
      )}
      <Select
        value={parameter}
        onValueChange={onParameterChange}
      >
        <SelectTrigger 
          className={cn(
            "h-8 mt-1", 
            showRequired && "border-red-300 focus:ring-red-200"
          )}
        >
          <SelectValue placeholder="Select parameter" />
        </SelectTrigger>
        <SelectContent>
          {parameters.map((param) => (
            <SelectItem key={param} value={param}>
              {param}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default IndicatorParameterSelector;
