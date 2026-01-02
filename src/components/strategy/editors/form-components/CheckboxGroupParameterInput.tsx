
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { IndicatorParameter } from '../../utils/categorizedIndicatorConfig';

interface CheckboxGroupParameterInputProps {
  param: IndicatorParameter;
  value: string[];
  onChange: (value: string[]) => void;
}

const CheckboxGroupParameterInput: React.FC<CheckboxGroupParameterInputProps> = ({
  param,
  value = [],
  onChange
}) => {
  // Ensure options is an array of strings
  const optionsArray = Array.isArray(param.options) ? param.options : [];

  return (
    <div className="space-y-2" key={param.name}>
      <div className="flex items-center gap-2">
        <Label className="text-sm">{param.label}</Label>
        {param.description && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">{param.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="flex flex-col gap-2 pl-1">
        {optionsArray.map((option) => (
          <div className="flex items-center space-x-2" key={option}>
            <Checkbox
              id={`param-${param.name}-${option}`}
              checked={Array.isArray(value) && value.includes(option)}
              onCheckedChange={(checked) => {
                if (checked) {
                  onChange([...value, option]);
                } else {
                  onChange(value.filter((val: string) => val !== option));
                }
              }}
            />
            <Label
              htmlFor={`param-${param.name}-${option}`}
              className="text-xs"
            >
              {option}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CheckboxGroupParameterInput;
