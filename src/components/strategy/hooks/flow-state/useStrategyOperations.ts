
import { useCallback } from 'react';

interface UseStrategyOperationsProps {
  validateBeforeCriticalOperation: (operationName: string) => Promise<boolean>;
}

/**
 * Hook to provide validated strategy operations
 */
export function useStrategyOperations({
  validateBeforeCriticalOperation
}: UseStrategyOperationsProps) {
  // Validate workflow on critical operations
  const validateAndRunOperation = useCallback(
    async (operation: () => void, operationName: string) => {
      const isValid = await validateBeforeCriticalOperation(operationName);
      if (isValid) {
        operation();
      }
    },
    [validateBeforeCriticalOperation]
  );

  return {
    validateAndRunOperation
  };
}
