import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { IndicatorParameter } from '../../utils/categorizedIndicatorConfig';
import { cn } from '@/lib/utils';

interface TimeParameterInputProps {
  param: IndicatorParameter;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const TimeParameterInput: React.FC<TimeParameterInputProps> = ({
  param,
  value,
  onChange,
  required = false
}) => {
  const isEmpty = !value || value === '';
  const showRequired = required && isEmpty;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 flex-nowrap">
        <Label htmlFor={param.name} className="text-xs font-medium text-muted-foreground">
          {param.label}
        </Label>
        {showRequired && (
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0" title="Required field" />
        )}
      </div>
      <Input
        id={param.name}
        type="time"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-8",
          showRequired && "border-red-300 focus:ring-red-200"
        )}
      />
      {param.description && (
        <p className="text-xs text-muted-foreground">{param.description}</p>
      )}
    </div>
  );
};

export default TimeParameterInput;