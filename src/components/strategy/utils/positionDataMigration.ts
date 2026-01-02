/**
 * Utility functions to migrate old position data format to VPI-only format
 */

export const cleanupPositionData = (nodeData: any): any => {
  if (!nodeData) return nodeData;

  const cleanedData = { ...nodeData };

  // Clean up positions array - remove id field, ensure vpi exists
  if (cleanedData.positions && Array.isArray(cleanedData.positions)) {
    cleanedData.positions = cleanedData.positions.map((position: any, index: number) => {
      const cleanedPosition = { ...position };
      
      // Remove the old id field completely
      delete cleanedPosition.id;
      
      // Ensure VPI exists and is properly formatted
      if (!cleanedPosition.vpi || cleanedPosition.vpi.startsWith('pos-')) {
        // Generate a proper VPI if missing or has old format
        cleanedPosition.vpi = `${nodeData.id || 'node'}-pos${index + 1}`;
      }
      
      return cleanedPosition;
    });
  }

  // Clean up any position references in expressions
  if (cleanedData.conditions) {
    cleanedData.conditions = cleanupConditionPositionReferences(cleanedData.conditions);
  }

  // Clean up variables if they exist
  if (cleanedData.variables && Array.isArray(cleanedData.variables)) {
    cleanedData.variables = cleanedData.variables.map((variable: any) => {
      return cleanupVariablePositionReferences(variable);
    });
  }

  return cleanedData;
};

const cleanupConditionPositionReferences = (condition: any): any => {
  if (!condition) return condition;

  // Handle GroupCondition
  if (condition.conditions && Array.isArray(condition.conditions)) {
    return {
      ...condition,
      conditions: condition.conditions.map((cond: any) => cleanupConditionPositionReferences(cond))
    };
  }

  // Handle single Condition
  if (condition.lhs) {
    condition.lhs = cleanupExpressionPositionReferences(condition.lhs);
  }
  if (condition.rhs) {
    condition.rhs = cleanupExpressionPositionReferences(condition.rhs);
  }

  return condition;
};

const cleanupExpressionPositionReferences = (expression: any): any => {
  if (!expression) return expression;

  const cleanedExpression = { ...expression };

  // Remove positionId references from position-related expressions
  if (expression.type === 'position_data' || 
      expression.type === 'pnl_data' || 
      expression.type === 'underlying_pnl' ||
      expression.type === 'live_data') {
    
    // Remove the old positionId field
    delete cleanedExpression.positionId;
    
    // Ensure vpi is used instead
    // Note: We can't auto-generate VPI here without context, 
    // so we'll leave it as is if vpi exists
  }

  // Handle complex expressions recursively
  if (expression.left) {
    cleanedExpression.left = cleanupExpressionPositionReferences(expression.left);
  }
  if (expression.right) {
    cleanedExpression.right = cleanupExpressionPositionReferences(expression.right);
  }
  if (expression.expressions && Array.isArray(expression.expressions)) {
    cleanedExpression.expressions = expression.expressions.map((expr: any) => 
      cleanupExpressionPositionReferences(expr)
    );
  }

  return cleanedExpression;
};

const cleanupVariablePositionReferences = (variable: any): any => {
  if (!variable) return variable;

  const cleanedVariable = { ...variable };

  // Clean up the expression in the variable
  if (cleanedVariable.expression) {
    cleanedVariable.expression = cleanupExpressionPositionReferences(cleanedVariable.expression);
  }

  // Clean up position binding
  if (cleanedVariable.positionBinding) {
    const cleanedBinding = { ...cleanedVariable.positionBinding };
    
    // Remove positionId from binding
    if (cleanedBinding.instrumentDetails) {
      delete cleanedBinding.instrumentDetails.positionId;
    }
    
    cleanedVariable.positionBinding = cleanedBinding;
  }

  return cleanedVariable;
};

/**
 * Apply cleanup to node data when loading
 */
export const migrateNodeData = (nodeData: any): any => {
  return cleanupPositionData(nodeData);
};