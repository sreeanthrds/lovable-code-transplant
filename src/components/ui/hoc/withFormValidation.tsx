
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { ValidationProps } from './types';

/**
 * HOC that adds form validation capabilities to any component
 */
export function withFormValidation<
  P extends { id?: string; className?: string }
>(Component: React.ComponentType<P>) {
  const WithFormValidation = React.forwardRef<
    HTMLElement,
    P & ValidationProps
  >(({ error, isRequired, isValid, className, ...props }, ref) => {
    const validationClass = error 
      ? 'border-destructive focus:ring-destructive/30' 
      : isValid 
        ? 'border-green-500 focus:ring-green-200' 
        : '';
        
    return (
      <div className="space-y-1 w-full">
        <Component
          ref={ref}
          className={`${className || ''} ${validationClass}`}
          {...(props as unknown as P)}
        />
        {error && (
          <div className="flex items-center text-destructive text-xs gap-1 mt-1">
            <AlertTriangle className="h-3 w-3" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  });

  WithFormValidation.displayName = `withFormValidation(${
    Component.displayName || Component.name || 'Component'
  })`;

  return WithFormValidation;
}

export default withFormValidation;
