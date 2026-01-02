
import React from 'react';
import OperationSelector from '@/components/ui/form/OperationSelector';
import type { MathOperation } from '@/components/ui/form/OperationSelector';
import { 
  composeHOC, 
  withLabel, 
  withFormValidation, 
  withLoadingState,
  LabelProps,
  ValidationProps,
  LoadingProps
} from '@/components/ui/hoc';

// Export the base type for consistency
export type { MathOperation } from '@/components/ui/form/OperationSelector';

// Combined props from all HOCs plus the component's own props
export interface EnhancedOperationSelectorProps extends 
  LabelProps, 
  ValidationProps, 
  LoadingProps {
  value: MathOperation;
  onValueChange: (value: MathOperation) => void;
  className?: string;
  id?: string;
}

// Create the enhanced component using composition of HOCs
const EnhancedOperationSelector = composeHOC(
  withLoadingState,
  withFormValidation,
  withLabel
)(OperationSelector);

export default EnhancedOperationSelector;
