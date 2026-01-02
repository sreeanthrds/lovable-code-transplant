
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { IndicatorParameter } from '../../utils/categorizedIndicatorConfig';

interface BooleanParameterInputProps {
  param: IndicatorParameter;
  value: boolean;
  onChange: (value: boolean) => void;
}

const BooleanParameterInput: React.FC<BooleanParameterInputProps> = ({
  param,
  value,
  onChange
}) => {
  return (
    <div className="flex items-center justify-between space-x-2" key={param.name}>
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
      <Switch
        id={`param-${param.name}`}
        checked={value}
        onCheckedChange={onChange}
      />
    </div>
  );
};

export default BooleanParameterInput;
