
import { Node } from '@xyflow/react';
import { UsageReference } from './types';

/**
 * Recursively searches through conditions for an indicator
 */
export function searchConditionsForIndicator(conditions: any[], indicatorName: string): boolean {
  if (!conditions || !Array.isArray(conditions)) return false;
  
  for (const condition of conditions) {
    // Group conditions
    if (condition?.groupLogic && Array.isArray(condition.conditions)) {
      if (searchConditionsForIndicator(condition.conditions, indicatorName)) {
        return true;
      }
    }
    // Single condition with lhs/rhs
    else if (condition?.lhs || condition?.rhs) {
      // Check left-hand side expression
      if (condition.lhs?.type === 'indicator' && condition.lhs?.name === indicatorName) {
        return true;
      }
      
      // Check right-hand side expression
      if (condition.rhs?.type === 'indicator' && condition.rhs?.name === indicatorName) {
        return true;
      }
      
      // Check for complex expressions
      if (condition.lhs?.type === 'expression') {
        if (searchExpressionForIndicator(condition.lhs, indicatorName)) {
          return true;
        }
      }
      
      if (condition.rhs?.type === 'expression') {
        if (searchExpressionForIndicator(condition.rhs, indicatorName)) {
          return true;
        }
      }
    }
  }
  
  return false;
}

/**
 * Search for indicator usage in complex expressions
 */
export function searchExpressionForIndicator(expression: any, indicatorName: string): boolean {
  if (!expression) return false;
  
  // Direct indicator match
  if (expression.type === 'indicator' && expression.name === indicatorName) {
    return true;
  }
  
  // Check nested expressions (left and right sides)
  if (expression.type === 'expression') {
    return searchExpressionForIndicator(expression.left, indicatorName) || 
           searchExpressionForIndicator(expression.right, indicatorName);
  }
  
  return false;
}

/**
 * Finds all usage references for a specific indicator
 * @param indicator The indicator key to search for (e.g. "EMA_1")
 * @param nodes All nodes in the flow
 * @returns Array of usage references
 */
export function findIndicatorUsages(indicator: string, nodes: Node[]): UsageReference[] {
  if (!indicator || !nodes || !Array.isArray(nodes)) {
    return [];
  }
  
  const usages: UsageReference[] = [];
  
  for (const node of nodes) {
    // Skip the start node itself
    if (!node || node.type === 'startNode') continue;
    
    // Check signal nodes for indicator usage in conditions
    if (node.type === 'signalNode' && node.data) {
      // Check if conditions exists and is an array
      if (Array.isArray(node.data.conditions)) {
        // Find any conditions using this indicator
        const hasIndicatorInCondition = searchConditionsForIndicator(
          node.data.conditions, 
          indicator
        );
        
        if (hasIndicatorInCondition) {
          usages.push({
            nodeId: node.id,
            nodeName: node.data.label ? String(node.data.label) : 'Signal Node',
            nodeType: 'signalNode',
            context: 'Signal condition'
          });
        }
      }
    }
  }
  
  return usages;
}
