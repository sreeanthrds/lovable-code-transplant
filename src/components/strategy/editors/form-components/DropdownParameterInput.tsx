
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { IndicatorParameter } from '../../utils/categorizedIndicatorConfig';
import { cn } from '@/lib/utils';

interface DropdownParameterInputProps {
  param: IndicatorParameter;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const DropdownParameterInput: React.FC<DropdownParameterInputProps> = ({
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
      <div className="flex items-center gap-2">
        <Label htmlFor={`param-${param.name}`} className="text-sm">
          {param.label}
        </Label>
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
      <div className="relative">
        {showRequired && (
          <span className="absolute -top-1 right-0 text-red-500 text-xs">*</span>
        )}
        <Select
          value={value}
          onValueChange={onChange}
          disabled={false}
        >
          <SelectTrigger 
            id={`param-${param.name}`} 
            className={cn(
              "h-8",
              showRequired && "border-red-300 focus:ring-red-200"
            )}
          >
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent>
            {optionsArray.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default DropdownParameterInput;
