import React from 'react';
import { cn } from '@/lib/utils';

interface DropZoneProps {
  position: 'before' | 'after' | 'inside';
  isActive: boolean;
  isValid: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({ position, isActive, isValid }) => {
  if (!isActive) return null;

  if (position === 'inside') {
    return (
      <div className={cn(
        "absolute inset-0 border-2 border-dashed rounded-md z-10",
        isValid 
          ? "border-primary bg-primary/10" 
          : "border-destructive bg-destructive/10"
      )}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={cn(
            "px-2 py-1 rounded text-xs font-medium",
            isValid 
              ? "bg-primary text-primary-foreground" 
              : "bg-destructive text-destructive-foreground"
          )}>
            {isValid ? 'Drop inside group' : 'Invalid drop'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "absolute left-0 right-0 h-1 z-10",
      position === 'before' ? "top-0 -translate-y-1/2" : "bottom-0 translate-y-1/2",
      "bg-gradient-to-r from-transparent via-primary to-transparent"
    )} />
  );
};