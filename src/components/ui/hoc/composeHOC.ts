
import React from 'react';

/**
 * Utility to compose multiple HOCs into a single HOC
 */
export function composeHOC<P>(...hocs: Array<(Component: React.ComponentType<any>) => React.ComponentType<any>>) {
  return (BaseComponent: React.ComponentType<P>) => {
    return hocs.reduceRight(
      (enhanced, hoc) => hoc(enhanced),
      BaseComponent
    );
  };
}

export default composeHOC;
