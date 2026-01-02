
import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

interface FieldTooltipProps {
  content: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  className?: string;
  iconClassName?: string;
  sideOffset?: number;
}

const FieldTooltip: React.FC<FieldTooltipProps> = ({
  content,
  side = 'top',
  align = 'center',
  className = '',
  iconClassName = 'h-3.5 w-3.5 text-muted-foreground cursor-help',
  sideOffset = 10,
}) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <HelpCircle className={iconClassName} />
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          align={align} 
          className={`max-w-[300px] overflow-visible z-[9999] ${className}`}
          sideOffset={sideOffset}
        >
          <p className="text-xs">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FieldTooltip;
