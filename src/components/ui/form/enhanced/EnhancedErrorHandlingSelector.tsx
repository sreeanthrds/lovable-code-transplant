
import React from 'react';
import OperationSelector from '@/components/ui/form/OperationSelector';
import type { MathOperation } from '@/components/ui/form/OperationSelector';
import { 
  composeHOC, 
  withLabel, 
  withFormValidation, 
  withLoadingState,
  withErrorHandling,
  LabelProps,
  ValidationProps,
  LoadingProps,
  ErrorHandlingProps
} from '@/components/ui/hoc';

// Combined props from all HOCs plus the component's own props
export interface EnhancedErrorHandlingSelectorProps extends 
  LabelProps, 
  ValidationProps, 
  LoadingProps,
  ErrorHandlingProps {
  value: MathOperation;
  onValueChange: (value: string) => void;
  className?: string;
  id?: string;
}

// Create the enhanced component using composition of HOCs
const EnhancedErrorHandlingSelector = composeHOC(
  withErrorHandling,
  withLoadingState,
  withFormValidation,
  withLabel
)(OperationSelector);

export default EnhancedErrorHandlingSelector;
