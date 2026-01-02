
import React from 'react';

// Define common props for HOC components
export interface LabelProps {
  label?: string;
  hideLabel?: boolean;
  labelClassName?: string;
  description?: string;
  isRequired?: boolean;
}

export interface ValidationProps {
  isRequired?: boolean;
  error?: string;
  isValid?: boolean;
}

export interface LoadingProps {
  isLoading?: boolean;
  loadingComponent?: React.ReactNode;
}

export interface ErrorHandlingProps {
  errorContext?: string;
  handleError?: (error: Error, context?: string) => void;
  showToasts?: boolean;
  catchRenderErrors?: boolean;
}
