
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ToolbarButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tooltip?: string;
  isActive?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ 
  icon: Icon, 
  label, 
  onClick, 
  disabled = false,
  tooltip,
  isActive = false
}) => {
  const buttonContent = (
    <button
      type="button"
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors
        ${disabled 
          ? 'bg-muted/50 text-muted-foreground cursor-not-allowed' 
          : isActive
          ? 'bg-primary text-primary-foreground cursor-pointer'
          : 'bg-muted/80 text-foreground hover:bg-muted cursor-pointer'}
      `}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </button>
  );
  
  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {buttonContent}
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return buttonContent;
};

export default ToolbarButton;
