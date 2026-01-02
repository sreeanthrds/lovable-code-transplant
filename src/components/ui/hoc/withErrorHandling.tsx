
import React, { useCallback, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { ErrorHandlingProps } from './types';

/**
 * HOC that adds error handling capabilities to any component
 */
export function withErrorHandling<P>(Component: React.ComponentType<P>) {
  const WithErrorHandling = React.forwardRef<
    HTMLElement, 
    P & ErrorHandlingProps
  >(({ 
    errorContext = 'component', 
    handleError, 
    showToasts = true,
    catchRenderErrors = false,
    ...props 
  }, ref) => {
    const [hasError, setHasError] = useState(false);
    
    const errorHandler = useCallback((error: Error) => {
      console.error(`Error in ${errorContext}:`, error);
      
      if (showToasts) {
        toast({
          title: "An error occurred",
          description: error.message || "Please try again or contact support",
          variant: "destructive",
        });
      }
      
      setHasError(true);
      
      // Call custom error handler if provided
      if (handleError) {
        handleError(error);
      }
    }, [errorContext, handleError, showToasts]);
    
    if (hasError && catchRenderErrors) {
      return (
        <div className="p-2 border border-red-300 bg-red-50 dark:bg-red-950/20 rounded text-sm text-red-600 dark:text-red-400">
          Error rendering component. Please try again.
        </div>
      );
    }
    
    // If we get here, either there's no error or we're not catching render errors
    try {
      return <Component ref={ref} {...(props as unknown as P)} />;
    } catch (error) {
      if (catchRenderErrors) {
        errorHandler(error instanceof Error ? error : new Error(String(error)));
        return (
          <div className="p-2 border border-red-300 bg-red-50 dark:bg-red-950/20 rounded text-sm text-red-600 dark:text-red-400">
            Error rendering component. Please try again.
          </div>
        );
      } else {
        throw error; // Re-throw if not catching render errors
      }
    }
  });

  WithErrorHandling.displayName = `withErrorHandling(${
    Component.displayName || Component.name || 'Component'
  })`;

  return WithErrorHandling;
}

export default withErrorHandling;
