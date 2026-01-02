import React from 'react';
import { cn } from '@/lib/utils';

interface DropIndicatorProps {
  position: 'before' | 'after' | 'inside';
  isVisible: boolean;
}

const DropIndicator: React.FC<DropIndicatorProps> = ({ position, isVisible }) => {
  if (!isVisible) return null;

  const baseClasses = "absolute w-full transition-opacity duration-200";
  
  const positionClasses = {
    before: "top-0 -translate-y-1/2 h-0.5 bg-primary",
    after: "bottom-0 translate-y-1/2 h-0.5 bg-primary", 
    inside: "inset-0 border-2 border-primary border-dashed bg-primary/10 rounded"
  };

  return (
    <div className={cn(
      baseClasses,
      positionClasses[position],
      isVisible ? "opacity-100" : "opacity-0"
    )} />
  );
};

export default DropIndicator;