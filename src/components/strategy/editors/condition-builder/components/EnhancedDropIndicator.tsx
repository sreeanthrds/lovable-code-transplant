import React from 'react';
import { cn } from '@/lib/utils';

interface EnhancedDropIndicatorProps {
  position: 'before' | 'after' | 'inside';
  isVisible: boolean;
  isValidDrop?: boolean;
  isActive?: boolean;
}

const EnhancedDropIndicator: React.FC<EnhancedDropIndicatorProps> = ({ 
  position, 
  isVisible, 
  isValidDrop = true,
  isActive = false 
}) => {
  if (!isVisible) return null;

  const baseClasses = "absolute transition-all duration-300 z-10";
  
  const positionClasses = {
    before: cn(
      "top-0 -translate-y-1/2 left-0 right-0 h-1",
      "bg-gradient-to-r from-transparent via-primary to-transparent",
      isActive && "animate-pulse"
    ),
    after: cn(
      "bottom-0 translate-y-1/2 left-0 right-0 h-1", 
      "bg-gradient-to-r from-transparent via-primary to-transparent",
      isActive && "animate-pulse"
    ),
    inside: cn(
      "inset-0 border-2 border-dashed rounded-md",
      isValidDrop 
        ? "border-primary bg-primary/10 animate-fade-in" 
        : "border-destructive bg-destructive/10",
      isActive && "border-solid shadow-lg"
    )
  };

  const indicatorClass = cn(
    baseClasses,
    positionClasses[position],
    !isValidDrop && "opacity-60"
  );

  return (
    <div className={indicatorClass}>
      {position === 'inside' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={cn(
            "px-2 py-1 rounded text-xs font-medium",
            isValidDrop 
              ? "bg-primary text-primary-foreground" 
              : "bg-destructive text-destructive-foreground"
          )}>
            {isValidDrop ? 'Drop here' : 'Invalid drop'}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedDropIndicator;