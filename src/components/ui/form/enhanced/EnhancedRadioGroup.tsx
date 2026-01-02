
import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface EnhancedRadioGroupProps {
  label: string | React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  layout?: 'vertical' | 'horizontal';
  className?: string;
  description?: string;
  tooltip?: string;
  required?: boolean;
  disabled?: boolean;
}

const EnhancedRadioGroup: React.FC<EnhancedRadioGroupProps> = ({
  label,
  value,
  onChange,
  options,
  layout = 'vertical',
  className,
  description,
  tooltip,
  required = false,
  disabled = false
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium flex items-center gap-1.5 flex-nowrap">
            {label}
            {required && (
              <span className="inline-flex h-2 w-2 rounded-full bg-red-500 flex-shrink-0" title="Required field" />
            )}
          </Label>
          
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-xs">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}
      
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className={cn(
          layout === 'horizontal' ? "flex flex-wrap gap-2 sm:gap-3" : "space-y-2",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        disabled={disabled}
      >
        {options.map(option => (
          <div key={option.value} className={cn(
            "flex items-center space-x-1 sm:space-x-2",
            layout === 'horizontal' && "flex-shrink-0"
          )}>
            <RadioGroupItem 
              value={option.value} 
              id={`option-${option.value}`}
              disabled={option.disabled || disabled}
              className="flex-shrink-0"
            />
            <Label 
              htmlFor={`option-${option.value}`}
              className="text-xs sm:text-sm cursor-pointer leading-tight"
            >
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
      
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
};

export default EnhancedRadioGroup;
