
import React from 'react';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface EnhancedSelectFieldProps {
  label: string;
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
  description?: string;
  tooltip?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

const EnhancedSelectField: React.FC<EnhancedSelectFieldProps> = ({
  label,
  id,
  value,
  onChange,
  options,
  className,
  description,
  tooltip,
  required = false,
  disabled = false,
  placeholder = "Select an option..."
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <Label 
          htmlFor={id} 
          className="text-base font-medium flex items-center gap-1.5 flex-nowrap"
        >
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
                <p className="max-w-xs text-sm">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
};

export default EnhancedSelectField;
