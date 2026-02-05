import {
  Expression,
  IndicatorExpression,
  MarketDataExpression,
  LiveDataExpression,
  ConstantExpression,
  TimeExpression,
  CurrentTimeExpression,
  ComplexExpression,
  FunctionExpression,
  PositionDataExpression,
  ExternalTriggerExpression,
  NodeVariableExpression,
  PnLExpression,
  UnderlyingPnLExpression,
  Condition,
  GroupCondition,
  ExtendedComparisonOperator,
  MathExpression,
  MathExpressionItem,
  PositionTimeExpression,
  TimeOffsetExpression,
  CandleRangeExpression,
  ListExpression
} from './types';

// Expression factory functions
export const createIndicatorExpression = (
  indicatorId: string = '',
  indicatorParam: string = '',
  indicatorFieldType: any = 'value',
  indicatorParamType: any = 'input'
): IndicatorExpression => ({
  type: 'indicator',
  indicatorId,
  indicatorParam,
  indicatorFieldType,
  indicatorParamType,
  name: '',
  parameter: '',
  offset: 0
});

export const createMarketDataExpression = (): MarketDataExpression => ({
  type: 'candle_data',
  dataField: '', // Start empty for progressive disclosure
  // Don't set instrumentType, timeframe, field, or offset - let user select step by step
});

export const createLiveDataExpression = (
  dataField: string = 'ltp'
): LiveDataExpression => ({
  type: 'live_data',
  dataField,
  field: dataField,
  instrumentType: 'TI' // Default to Trading Instrument
});

export const createConstantExpression = (
  valueType: 'number' | 'string' | 'boolean' = 'number',
  value: any = 0
): ConstantExpression => {
  const expr: ConstantExpression = {
    type: 'constant',
    valueType,
    value
  };

  // Set the appropriate typed value based on valueType
  if (valueType === 'number') {
    expr.numberValue = typeof value === 'number' ? value : 0;
  } else if (valueType === 'string') {
    expr.stringValue = typeof value === 'string' ? value : '';
  } else if (valueType === 'boolean') {
    expr.booleanValue = typeof value === 'boolean' ? value : false;
  }

  return expr;
};

export const createTimeExpression = (
  timeValue: string = '09:00',
  operator: '==' | '!=' | '>' | '>=' | '<' | '<=' = '>='
): TimeExpression => ({
  type: 'time_function',
  timeValue,
  operator
});

export const createCurrentTimeExpression = (): CurrentTimeExpression => ({
  type: 'current_time'
});

export const createComplexExpression = (
  operation?: '+' | '-' | '*' | '/' | '%' | '+%' | '-%',
  left?: Expression,
  right?: Expression
): ComplexExpression => ({
  type: 'expression',
  expressionString: '',
  operation,
  left: left || createConstantExpression('number', 0),
  right: right || createConstantExpression('number', 0)
});

export const createFunctionExpression = (
  functionName: 'max' | 'min' = 'max',
  expressions: Expression[] = []
): FunctionExpression => ({
  type: 'function',
  functionName,
  expressions: expressions.length > 0 ? expressions : [createConstantExpression('number', 0), createConstantExpression('number', 0)]
});

export const createPositionDataExpression = (
  positionField: 'entryPrice' | 'currentPrice' | 'quantity' | 'status' | 'underlyingPriceOnEntry' | 'underlyingPriceOnExit' | 'instrumentName' | 'instrumentType' | 'symbol' | 'expiryDate' | 'strikePrice' | 'optionType' | 'strikeType' | 'underlyingName' = 'entryPrice',
  vpi: string = ''
): PositionDataExpression => ({
  type: 'position_data',
  positionField,
  vpi: vpi || undefined,
  field: positionField
});


export const createExternalTriggerExpression = (
  triggerId: string = '',
  triggerType: string = '',
  parameters: any = {}
): ExternalTriggerExpression => ({
  type: 'external_trigger',
  triggerId,
  triggerType,
  parameters
});

export const createNodeVariableExpression = (
  nodeId: string = '',
  variableName: string = ''
): NodeVariableExpression => ({
  type: 'node_variable',
  nodeId,
  variableName
});

export const createPnLExpression = (
  pnlType: 'realized' | 'unrealized' | 'total' = 'unrealized',
  scope: 'position' | 'overall' = 'overall',
  vpi?: string
): PnLExpression => ({
  type: 'pnl_data',
  pnlType,
  scope,
  vpi
});

export const createUnderlyingPnLExpression = (
  pnlType: 'realized' | 'unrealized' | 'total' = 'unrealized',
  scope: 'position' | 'overall' = 'overall',
  vpi?: string
): UnderlyingPnLExpression => ({
  type: 'underlying_pnl',
  pnlType,
  scope,
  vpi
});

// Position Time Expression factory
export const createPositionTimeExpression = (
  timeField: 'entryTime' | 'exitTime' = 'entryTime',
  vpi?: string
): PositionTimeExpression => ({
  type: 'position_time',
  timeField,
  vpi
});

// Time Offset Expression factory
export const createTimeOffsetExpression = (
  baseTime?: Expression,
  offsetType: 'days' | 'hours' | 'minutes' | 'seconds' | 'candles' = 'minutes',
  offsetValue: number = 0,
  direction: 'before' | 'after' = 'after'
): TimeOffsetExpression => ({
  type: 'time_offset',
  baseTime: baseTime || createCurrentTimeExpression(),
  offsetType,
  offsetValue,
  direction
});

// Candle Range Expression factory
export const createCandleRangeExpression = (
  rangeType: 'by_count' | 'by_time' | 'relative' = 'by_count'
): CandleRangeExpression => ({
  type: 'candle_range',
  rangeType,
  startIndex: 0,
  endIndex: 5,
  instrumentType: 'TI'
});


// List Expression factory
export const createListExpression = (
  items?: Expression[]
): ListExpression => ({
  type: 'list',
  items: items || [createConstantExpression('number', 0)]
});

// Math expression factory - creates flat array based expression
export const createMathExpression = (
  items?: MathExpressionItem[]
): MathExpression => ({
  type: 'math_expression',
  items: items || [{
    expression: createConstantExpression('number', 0)
  }]
});

// Helper to add a new item to math expression
export const addMathExpressionItem = (
  mathExpr: MathExpression,
  operator: '+' | '-' | '*' | '/' | '%' | '+%' | '-%' = '+',
  expression?: Expression
): MathExpression => ({
  ...mathExpr,
  items: [
    ...mathExpr.items,
    {
      operator,
      expression: expression || createConstantExpression('number', 0)
    }
  ]
});

// Helper to remove an item from math expression
export const removeMathExpressionItem = (
  mathExpr: MathExpression,
  index: number
): MathExpression => {
  const newItems = [...mathExpr.items];
  newItems.splice(index, 1);
  
  // If we removed the first item, clear the operator from the new first item
  if (index === 0 && newItems.length > 0) {
    newItems[0] = { ...newItems[0], operator: undefined };
  }
  
  return {
    ...mathExpr,
    items: newItems.length > 0 ? newItems : [{
      expression: createConstantExpression('number', 0)
    }]
  };
};

// Migration function to convert legacy conditions
export const migrateLegacyCondition = (condition: any): Condition => {
  const migratedCondition: Condition = {
    id: condition.id || `condition-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    operator: condition.operator || '>',
    lhs: condition.lhs || condition.expressionA || createConstantExpression('number', 0),
    rhs: condition.rhs || condition.expressionB || createConstantExpression('number', 0)
  };

  console.log('Migrated legacy condition:', { 
    original: condition, 
    migrated: migratedCondition 
  });

  return migratedCondition;
};

// Migration function for group conditions
export const migrateLegacyGroupCondition = (groupCondition: any): GroupCondition => {
  const migratedGroup: GroupCondition = {
    id: groupCondition.id || `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    groupLogic: groupCondition.groupLogic || 'AND',
    conditions: (groupCondition.conditions || []).map((cond: any) => {
      if ('groupLogic' in cond) {
        return migrateLegacyGroupCondition(cond);
      } else {
        return migrateLegacyCondition(cond);
      }
    })
  };

  console.log('Migrated legacy group condition:', { 
    original: groupCondition, 
    migrated: migratedGroup 
  });

  return migratedGroup;
};

// Condition factory functions - ensures new conditions always use lhs/rhs
export const createCondition = (
  operator: ExtendedComparisonOperator = '>',
  lhs?: Expression,
  rhs?: Expression,
  rhsUpper?: Expression
): Condition => ({
  id: `condition-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  operator,
  lhs: lhs || createConstantExpression('number', 0),
  rhs: rhs || createConstantExpression('number', 0),
  rhsUpper: rhsUpper
});

export const createGroupCondition = (
  groupLogic: 'AND' | 'OR' = 'AND',
  conditions: (Condition | GroupCondition)[] = []
): GroupCondition => ({
  id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  groupLogic,
  conditions
});

// Default factory functions for backwards compatibility
export const createDefaultCondition = (): Condition => {
  return createCondition('>', createConstantExpression('number', 0), createConstantExpression('number', 0));
};

export const createDefaultGroupCondition = (): GroupCondition => {
  return createGroupCondition('AND', [createDefaultCondition()]);
};

// Expression factory map with new PnL and Underlying PnL expressions
export const expressionFactoryMap: Record<string, () => Expression> = {
  constant: () => createConstantExpression('number', 0),
  indicator: () => createIndicatorExpression(),
  candle_data: () => createMarketDataExpression(),
  live_data: () => createLiveDataExpression(),
  time_function: () => createTimeExpression(),
  current_time: () => createCurrentTimeExpression(),
  expression: () => createComplexExpression(),
  function: () => createFunctionExpression(),
  position_data: () => createPositionDataExpression(),
  external_trigger: () => createExternalTriggerExpression(),
  node_variable: () => createNodeVariableExpression(),
  pnl_data: () => createPnLExpression(),
  underlying_pnl: () => createUnderlyingPnLExpression(),
  math_expression: () => createMathExpression(),
  position_time: () => createPositionTimeExpression(),
  time_offset: () => createTimeOffsetExpression(),
  candle_range: () => createCandleRangeExpression(),
  list: () => createListExpression()
};

// Helper function to create default expressions
export const createDefaultExpression = (type: string): Expression => {
  const factory = expressionFactoryMap[type];
  if (!factory) {
    console.warn(`Unknown expression type: ${type}, defaulting to constant`);
    return createConstantExpression('number', 0);
  }
  return factory();
};
