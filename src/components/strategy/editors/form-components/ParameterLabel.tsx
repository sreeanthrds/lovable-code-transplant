
import React from 'react';
import { Label } from '@/components/ui/label';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ParameterLabelProps {
  label: string;
  description?: string;
  htmlFor?: string;
}

const ParameterLabel: React.FC<ParameterLabelProps> = ({
  label,
  description,
  htmlFor
}) => {
  return (
    <div className="flex items-center gap-2">
      <Label htmlFor={htmlFor} className="text-sm">
        {label}
      </Label>
      {description && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs text-xs">{description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default ParameterLabel;
