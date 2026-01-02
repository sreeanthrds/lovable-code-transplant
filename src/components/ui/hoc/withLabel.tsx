
import React from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { LabelProps } from './types';

/**
 * HOC that adds a label to any component
 */
export function withLabel<P>(Component: React.ComponentType<P>) {
  const WithLabel = (props: P & LabelProps) => {
    const { 
      label, 
      hideLabel, 
      labelClassName, 
      description, 
      isRequired, 
      ...componentProps 
    } = props;

    if (hideLabel || !label) {
      return <Component {...(componentProps as unknown as P)} />;
    }

    return (
      <div className="space-y-1.5 w-full min-w-0">
        {label && !hideLabel && (
          <Label 
            className={cn("text-sm text-left flex items-center gap-1", labelClassName)}
          >
            <span className="truncate whitespace-nowrap text-left min-w-0">{label}</span>
            {isRequired && <span className="text-destructive flex-shrink-0">*</span>}
          </Label>
        )}
        <Component {...(componentProps as unknown as P)} />
        {description && (
          <p className="text-xs text-muted-foreground truncate">{description}</p>
        )}
      </div>
    );
  };

  WithLabel.displayName = `withLabel(${
    Component.displayName || Component.name || 'Component'
  })`;

  return WithLabel;
}

export default withLabel;
