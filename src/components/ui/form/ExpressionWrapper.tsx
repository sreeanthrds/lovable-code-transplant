
import React, { ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface ExpressionWrapperProps {
  /**
   * The label for the expression
   */
  label: string;
  /**
   * The child components to render
   */
  children: ReactNode;
  /**
   * Whether the field is required
   */
  required?: boolean;
  /**
   * Additional class names for the container
   */
  className?: string;
  /**
   * Additional class names for the label
   */
  labelClassName?: string;
  /**
   * Additional element to render next to the label
   */
  labelAdornment?: ReactNode;
  /**
   * Whether to show the label
   */
  showLabel?: boolean;
}

/**
 * A wrapper component for expressions with consistent styling
 */
const ExpressionWrapper: React.FC<ExpressionWrapperProps> = ({
  label,
  children,
  required = false,
  className,
  labelClassName,
  labelAdornment,
  showLabel = true
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {showLabel && (
        <div className="flex items-center justify-between">
          <Label className={cn("text-xs flex items-center gap-1.5 flex-nowrap", labelClassName)}>
            {label}
            {required && (
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-destructive flex-shrink-0" title="Required field" />
            )}
          </Label>
          {labelAdornment && (
            <div>{labelAdornment}</div>
          )}
        </div>
      )}
      
      {children}
    </div>
  );
};

export default ExpressionWrapper;
