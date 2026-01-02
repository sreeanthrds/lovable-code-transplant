
import React from 'react';
import { LoadingProps } from './types';

/**
 * HOC that adds loading state visualization to any component
 */
export function withLoadingState<P>(Component: React.ComponentType<P>) {
  const WithLoadingState = React.forwardRef<
    HTMLElement,
    P & LoadingProps
  >(({ isLoading, loadingComponent, ...props }, ref) => {
    if (isLoading) {
      return loadingComponent ? (
        <>{loadingComponent}</>
      ) : (
        <div className="flex items-center justify-center h-full w-full min-h-[40px]">
          <div className="h-5 w-5 border-t-2 border-primary animate-spin rounded-full" />
        </div>
      );
    }

    return <Component ref={ref} {...(props as unknown as P)} />;
  });

  WithLoadingState.displayName = `withLoadingState(${
    Component.displayName || Component.name || 'Component'
  })`;

  return WithLoadingState;
}

export default withLoadingState;
