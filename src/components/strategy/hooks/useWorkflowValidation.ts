
import { useCallback } from 'react';
import { Node, Edge, useReactFlow } from '@xyflow/react';
import { validateWorkflow, showValidationResults, ValidationResult } from '../utils/validation/workflowValidation';
import { toast } from '@/hooks/use-toast';

/**
 * Hook that provides workflow validation functionality
 */
export const useWorkflowValidation = () => {
  const { getNodes, getEdges } = useReactFlow();
  
  /**
   * Validates the current workflow and shows results to the user
   */
  const validateCurrentWorkflow = useCallback((): ValidationResult => {
    const nodes = getNodes();
    const edges = getEdges();
    
    const results = validateWorkflow(nodes, edges);
    showValidationResults(results);
    
    return results;
  }, [getNodes, getEdges]);
  
  /**
   * Validates the workflow before executing a critical operation
   * Returns true if validation passes or if user confirms despite warnings
   */
  const validateBeforeCriticalOperation = useCallback(
    async (operationName: string): Promise<boolean> => {
      const nodes = getNodes();
      const edges = getEdges();
      
      const results = validateWorkflow(nodes, edges);
      
      if (results.valid && results.warnings.length === 0) {
        return true;
      }
      
      // If there are errors, always block the operation
      if (results.errors.length > 0) {
        toast({
          title: `Cannot ${operationName}`,
          description: `Fix ${results.errors.length} error(s) before continuing`,
          variant: "destructive"
        });
        return false;
      }
      
      // If there are only warnings, show confirmation dialog
      if (results.warnings.length > 0) {
        toast({
          title: "Strategy has warnings",
          description: `There are ${results.warnings.length} warning(s) in your strategy`,
          variant: "default"  // Changed from "warning" to "default"
        });
        
        // In a real implementation, we would show a confirmation dialog here
        // For now, we'll return true to allow the operation to proceed
        return true;
      }
      
      return true;
    },
    [getNodes, getEdges]
  );
  
  /**
   * Quick validation that doesn't show UI feedback
   * Returns true if the workflow is valid (no errors)
   */
  const isWorkflowValid = useCallback((): boolean => {
    const nodes = getNodes();
    const edges = getEdges();
    
    const results = validateWorkflow(nodes, edges);
    return results.errors.length === 0;
  }, [getNodes, getEdges]);
  
  return {
    validateCurrentWorkflow,
    validateBeforeCriticalOperation,
    isWorkflowValid
  };
};
