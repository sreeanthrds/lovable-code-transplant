
// Export all types and factories from the conditions module
export * from './types';
export * from './factories';
export * from './stringRepresentation';

// Explicitly export the default factory functions to ensure they're available
export { 
  createDefaultCondition, 
  createDefaultGroupCondition,
  createCondition,
  createGroupCondition,
  createConstantExpression,
  createIndicatorExpression,
  createMarketDataExpression,
  createLiveDataExpression,
  createTimeExpression,
  createCurrentTimeExpression,
  createComplexExpression,
  createPositionDataExpression,
  createExternalTriggerExpression,
  createNodeVariableExpression,
  createPnLExpression,
  createDefaultExpression,
  expressionFactoryMap,
  migrateLegacyCondition,
  migrateLegacyGroupCondition,
  createMathExpression,
  addMathExpressionItem,
  removeMathExpressionItem
} from './factories';
