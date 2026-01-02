
import { Node } from '@xyflow/react';
import { toast } from "@/hooks/use-toast";
import { handleError } from '../../../utils/errorHandling';

/**
 * Helper function to recursively clean conditions that use a deleted indicator
 * This optimized version avoids unnecessary deep copying and improves performance
 */
export const cleanNodeConditionsOfIndicator = (node: any, indicatorName: string) => {
  if (!node?.data?.conditions) return node;
  
  try {
    // Create a deep copy of the node to modify - only once at the top level
    const updatedNode = { 
      ...node, 
      data: { ...node.data }
    };
    
    const cleanCondition = (condition: any): any => {
      if (!condition) return condition;
      
      // For group conditions, recursively clean child conditions
      if (condition.groupLogic && Array.isArray(condition.conditions)) {
        // Clean each condition in the group
        const cleanedConditions = condition.conditions
          .map(cleanCondition)
          .filter(Boolean); // Remove any null/undefined results
        
        // If no conditions left, return null (this group will be removed)
        if (cleanedConditions.length === 0) {
          return null;
        }
        
        // Only create a new object if conditions have changed
        if (cleanedConditions.length !== condition.conditions.length) {
          return {
            ...condition,
            conditions: cleanedConditions
          };
        }
        
        return condition;
      } 
      
      // For single conditions, check if indicator is used in either side
      const lhsUsesDeletedIndicator = 
        condition.lhs?.type === 'indicator' && 
        condition.lhs?.name === indicatorName;
        
      const rhsUsesDeletedIndicator = 
        condition.rhs?.type === 'indicator' && 
        condition.rhs?.name === indicatorName;
      
      // If this condition uses the deleted indicator, remove it
      if (lhsUsesDeletedIndicator || rhsUsesDeletedIndicator) {
        return null;
      }
      
      // Also check complex expressions
      let conditionChanged = false;
      let updatedCondition = condition;
      
      if (condition.lhs?.type === 'expression') {
        const cleanedLhs = cleanExpression(condition.lhs, indicatorName);
        if (!cleanedLhs) {
          return null;
        }
        
        if (cleanedLhs !== condition.lhs) {
          conditionChanged = true;
          updatedCondition = { ...updatedCondition, lhs: cleanedLhs };
        }
      }
      
      if (condition.rhs?.type === 'expression') {
        const cleanedRhs = cleanExpression(condition.rhs, indicatorName);
        if (!cleanedRhs) {
          return null;
        }
        
        if (cleanedRhs !== condition.rhs) {
          conditionChanged = true;
          updatedCondition = { ...updatedCondition, rhs: cleanedRhs };
        }
      }
      
      return conditionChanged ? updatedCondition : condition;
    };
    
    // Helper to clean expressions - optimized to avoid unnecessary object creation
    const cleanExpression = (expr: any, indicatorName: string): any => {
      if (!expr) return expr;
      
      // Check if this expression directly uses the indicator
      if (expr.type === 'indicator' && expr.name === indicatorName) {
        return null;
      }
      
      // For complex expressions, check both sides
      if (expr.type === 'expression') {
        const cleanedLeft = cleanExpression(expr.left, indicatorName);
        if (!cleanedLeft) return null;
        
        const cleanedRight = cleanExpression(expr.right, indicatorName);
        if (!cleanedRight) return null;
        
        // Only create a new object if something changed
        if (cleanedLeft !== expr.left || cleanedRight !== expr.right) {
          return {
            ...expr,
            left: cleanedLeft,
            right: cleanedRight
          };
        }
        
        return expr;
      }
      
      return expr;
    };
    
    // Clean conditions more efficiently by avoiding unnecessary array creation
    const originalConditions = updatedNode.data.conditions;
    const cleanedConditions = originalConditions.map(cleanCondition).filter(Boolean);
    
    // Only update node data if conditions actually changed
    if (cleanedConditions.length !== originalConditions.length) {
      // Update the node data with cleaned conditions
      updatedNode.data.conditions = cleanedConditions.length > 0 
        ? cleanedConditions
        : [{ 
            id: `group_${Math.random().toString(36).substr(2, 9)}`,
            groupLogic: 'AND',
            conditions: []
          }];
      
      return updatedNode;
    }
    
    // If no changes were needed, return original node to maintain reference equality
    return node;
  } catch (error) {
    handleError(error, 'cleanNodeConditionsOfIndicator');
    return node; // Return original node if cleaning fails
  }
};

/**
 * Updates nodes to remove references to a deleted indicator
 * Optimized version to reduce unnecessary re-renders
 */
export const updateNodesAfterIndicatorRemoval = (
  nodes: Node[], 
  indicatorName: string,
  setNodes: (nodes: Node[]) => void
) => {
  if (!nodes || !Array.isArray(nodes) || !indicatorName || typeof setNodes !== 'function') {
    return;
  }
  
  try {
    // Track whether any nodes were actually changed
    let hasChanges = false;
    
    // Create a new array with updated nodes
    const updatedNodes = nodes.map(node => {
      if (node?.type === 'signalNode' && node.data && Array.isArray(node.data.conditions)) {
        const updatedNode = cleanNodeConditionsOfIndicator(node, indicatorName);
        
        // Check if the node was actually modified
        if (updatedNode !== node) {
          hasChanges = true;
          return updatedNode;
        }
      }
      return node;
    });
    
    // Only update if there were changes - avoid triggering re-renders unnecessarily
    if (hasChanges) {
      setNodes(updatedNodes);
      
      console.log(`Cleaned up node conditions for indicator: ${indicatorName}`);
    }
  } catch (error) {
    handleError(error, 'updateNodesAfterIndicatorRemoval');
  }
};
