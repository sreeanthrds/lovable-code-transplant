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
  positionField: 'entryPrice' | 'currentPrice' | 'quantity' | 'status' | 'underlyingPriceOnEntry' | 'underlyingPriceOnExit' | 'instrumentName' | 'instrumentType' | 'symbol' | 'expiryDate' | 'strikePrice' | 'optionType' | 'strikeType' | 'underlyingName';
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
  | MathExpression;

// Operator types - matching the UI component's supported operators
export type ComparisonOperator = '>' | '<' | '>=' | '<=' | '==' | '!=' | 'crosses_above' | 'crosses_below';

// Condition types
export interface Condition {
  id: string;
  operator: ComparisonOperator;
  lhs: Expression;
  rhs: Expression;
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
