import {
  IndicatorFieldType,
  IndicatorParamType
} from '../../editors/indicators/hooks/types';

export interface BaseExpression {
  type: string;
}

export interface IndicatorExpression extends BaseExpression {
  type: 'indicator';
  indicatorId: string;
  indicatorParam: string;
  indicatorFieldType: IndicatorFieldType;
  indicatorParamType: IndicatorParamType;
  instrumentType?: 'TI' | 'SI'; // Trading Instrument or Support Instrument
  timeframeId?: string; // Reference to TimeframeConfig.id
  timeframe?: string; // Legacy support - will be migrated to timeframeId
  name?: string;
  parameter?: string;
  offset?: number;
}

export interface MarketDataExpression extends BaseExpression {
  type: 'candle_data';
  dataField: string;
  instrumentType?: 'TI' | 'SI'; // Trading Instrument or Support Instrument
  timeframeId?: string; // Reference to TimeframeConfig.id
  timeframe?: string; // Legacy support - will be migrated to timeframeId
  field?: string;
  offset?: number;
}

export interface LiveDataExpression extends BaseExpression {
  type: 'live_data';
  dataField: string;
  instrumentType?: 'TI' | 'SI'; // Trading Instrument or Support Instrument
  field?: string;
  vpi?: string; // Add vpi property for position-specific live data
}

export interface ConstantExpression extends BaseExpression {
  type: 'constant';
  valueType: 'number' | 'string' | 'boolean' | 'status';
  numberValue?: number;
  stringValue?: string;
  booleanValue?: boolean;
  statusValue?: 'Open' | 'Close' | 'Partially closed';
  value?: any;
}

export interface TimeExpression extends BaseExpression {
  type: 'time_function';
  timeValue: string; // HH:MM format
  operator?: '==' | '!=' | '>' | '>=' | '<' | '<=';
}

export interface CurrentTimeExpression extends BaseExpression {
  type: 'current_time';
}

export interface TimeFunctionExpression extends BaseExpression {
  type: 'time_function';
  timeValue: string; // HH:MM format
  operator?: '==' | '!=' | '>' | '>=' | '<' | '<=';
}

export interface ComplexExpression extends BaseExpression {
  type: 'expression';
  expressionString: string;
  operation?: '+' | '-' | '*' | '/' | '%' | '+%' | '-%';
  left?: Expression;
  right?: Expression;
}

export interface FunctionExpression extends BaseExpression {
  type: 'function';
  functionName: 'max' | 'min';
  expressions: Expression[];
}

export interface PositionDataExpression extends BaseExpression {
  type: 'position_data';
  vpi?: string; // Which position to get data from (using VPI instead of ID)
  positionField: 'entryPrice' | 'currentPrice' | 'quantity' | 'status' | 'underlyingPriceOnEntry' | 'underlyingPriceOnExit' | 'instrumentName' | 'instrumentType' | 'symbol' | 'expiryDate' | 'strikePrice' | 'optionType' | 'strikeType' | 'underlyingName' | 'entryTime' | 'exitTime';
  field?: string;
}

// New expression type for trailing variables
export interface TrailingVariableExpression extends BaseExpression {
  type: 'trailing_variable';
  variableId?: string; // Which trailing variable to reference
  trailingField: 'trailingPosition';
}


export interface ExternalTriggerExpression extends BaseExpression {
  type: 'external_trigger';
  triggerId: string;
  triggerType?: string;
  parameters?: any;
}

export interface NodeVariableExpression extends BaseExpression {
  type: 'node_variable';
  nodeId: string;
  variableName: string;
}

export interface PnLExpression extends BaseExpression {
  type: 'pnl_data';
  pnlType: 'realized' | 'unrealized' | 'total';
  scope: 'position' | 'overall';
  vpi?: string; // Required when scope is 'position'
}

export interface UnderlyingPnLExpression extends BaseExpression {
  type: 'underlying_pnl';
  pnlType: 'realized' | 'unrealized' | 'total';
  scope: 'position' | 'overall';
  vpi?: string; // Required when scope is 'position'
}

// Math expression item for the flat array format
export interface MathExpressionItem {
  expression: Expression;
  operator?: '+' | '-' | '*' | '/' | '%' | '+%' | '-%'; // Operator before this expression (undefined for first item)
}

// New flat array-based math expression
export interface MathExpression extends BaseExpression {
  type: 'math_expression';
  items: MathExpressionItem[]; // Array of expressions with their preceding operators
}

export type Expression = 
  | IndicatorExpression
  | MarketDataExpression
  | LiveDataExpression
  | ConstantExpression
  | TimeExpression
  | CurrentTimeExpression
  | TimeFunctionExpression
  | ComplexExpression
  | FunctionExpression
  | PositionDataExpression
  | TrailingVariableExpression
  | ExternalTriggerExpression
  | NodeVariableExpression
  | PnLExpression
  | UnderlyingPnLExpression
  | MathExpression
  | PositionTimeExpression
  | TimeOffsetExpression
  | CandleRangeExpression
  | AggregationExpression
  | ListExpression;

// Operator types - matching the UI component's supported operators
export type ComparisonOperator = '>' | '<' | '>=' | '<=' | '==' | '!=' | 'crosses_above' | 'crosses_below';
 // Extended operators including 'between' which requires 3 expressions
 export type ExtendedComparisonOperator = ComparisonOperator | 'between' | 'not_between' | 'in' | 'not_in';

// Condition types
export interface Condition {
  id: string;
  operator: ExtendedComparisonOperator;
  lhs: Expression;
  rhs: Expression;
  // For 'between' operator: lhs between rhs (lower) and rhsUpper
  rhsUpper?: Expression;
}

export interface GroupCondition {
  id: string;
  groupLogic: 'AND' | 'OR';
  conditions: (Condition | GroupCondition)[];
}

// Position binding interface
export interface PositionBinding {
  vpi: string;
  instrumentDetails: {
    instrumentType: 'stocks' | 'futures' | 'options';
    vpi: string;
    positionType: string;
    orderType: string;
    quantity: number;
    multiplier?: number;
    productType?: string;
    expiry?: string;
    strikeType?: string;
    underlying?: string;
    strikePrice?: number;
    optionType?: 'CE' | 'PE';
    tradingSymbol?: string;
    exchange?: string;
  };
}

// Node variable type
export interface NodeVariable {
  id: string;
  name: string;
  label?: string;
  value?: any;
  nodeId: string;
  expression: Expression;
  positionBinding?: PositionBinding;
  positionContext?: {
    availablePositions: Array<{
      id: string;
      vpi: string;
      instrumentDetails: any;
    }>;
  };
}
 
 // Position Time Expression - for entry/exit time
 export interface PositionTimeExpression extends BaseExpression {
   type: 'position_time';
   timeField: 'entryTime' | 'exitTime';
   vpi?: string; // Which position to get time from
 }
 
 // Time Offset Expression - time + days/hours/minutes/seconds/candles
 export interface TimeOffsetExpression extends BaseExpression {
   type: 'time_offset';
   baseTime: Expression; // The reference time (current_time, position_time, time_function)
   offsetType: 'days' | 'hours' | 'minutes' | 'seconds' | 'candles';
   offsetValue: number;
   direction: 'before' | 'after';
 }
 
 // Candle Range Expression - for specifying a range of candles
 export interface CandleRangeExpression extends BaseExpression {
   type: 'candle_range';
   rangeType: 'by_count' | 'by_time' | 'relative';
   // For by_count: candles from index startIndex to endIndex (0 = current, 1 = previous)
   startIndex?: number;
   endIndex?: number;
   // For by_time: candles between startTime and endTime
   startTime?: string; // HH:MM format
   endTime?: string; // HH:MM format
   // For relative: N candles before/after a reference
   referenceType?: 'time' | 'candle_number' | 'position_entry' | 'position_exit' | 'current_candle';
   referenceTime?: string; // HH:MM if referenceType is 'time'
   referenceCandleNumber?: number; // If referenceType is 'candle_number'
   referenceVpi?: string; // If referenceType is 'position_entry' or 'position_exit'
   candleCount?: number; // Number of candles
   direction?: 'before' | 'after';
   // Instrument context
   instrumentType?: 'TI' | 'SI';
   timeframeId?: string;
 }
 
 // Aggregation Expression - min/max/avg/first/last on a list or range
 export interface AggregationExpression extends BaseExpression {
   type: 'aggregation';
   aggregationType: 'min' | 'max' | 'avg' | 'sum' | 'first' | 'last' | 'count';
   // Source can be a candle range or a list of expressions
   sourceType: 'candle_range' | 'expression_list';
   candleRange?: CandleRangeExpression;
   expressions?: Expression[];
   // For candle range, specify which field to aggregate
   ohlcvField?: 'open' | 'high' | 'low' | 'close' | 'volume';
 }
 
 // List Expression - for 'in' / 'not in' checks or aggregation input
 export interface ListExpression extends BaseExpression {
   type: 'list';
   items: Expression[];
 }
