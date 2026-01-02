
import React from 'react';
import { cn } from '@/lib/utils';

interface RequiredLabelProps {
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}

const RequiredLabel: React.FC<RequiredLabelProps> = ({
  children,
  required = false,
  className
}) => {
  return (
    <label className={cn("text-xs font-medium flex items-center gap-1.5 flex-nowrap", className)}>
      {children}
      {required && (
        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0" title="Required field" />
      )}
    </label>
  );
};

export default RequiredLabel;
