
import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { IndicatorParameter } from '../../utils/categorizedIndicatorConfig';
import { cn } from '@/lib/utils';

interface RadioButtonParameterInputProps {
  param: IndicatorParameter;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const RadioButtonParameterInput: React.FC<RadioButtonParameterInputProps> = ({
  param,
  value,
  onChange,
  required = false
}) => {
  // Check if value is empty for validation - handle both null, undefined and empty string
  const isEmpty = value === undefined || value === null || value === '';
  const showRequired = required && isEmpty;
  
  // Ensure options is an array of strings
  const optionsArray = Array.isArray(param.options) ? param.options : [];
  
  return (
    <div className="space-y-2" key={param.name}>
      <div className="flex items-center gap-2 flex-nowrap">
        <Label className="text-sm whitespace-nowrap">
          {param.label}
        </Label>
        {param.description && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help flex-shrink-0" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">{param.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="relative">
        {showRequired && (
          <span className="absolute -top-1 right-0 text-red-500 text-xs">*</span>
        )}
        <RadioGroup
          value={value}
          onValueChange={onChange}
          className={cn(
            "flex flex-col space-y-1",
            showRequired && "border-red-300 p-2 rounded-md border"
          )}
        >
          {optionsArray.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`param-${param.name}-${option}`} />
              <Label htmlFor={`param-${param.name}-${option}`} className="text-xs">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
};

export default RadioButtonParameterInput;
