# Expression Types Specification

This document provides a comprehensive overview of all expression types used in the strategy condition builder system. Each expression type represents a different kind of data source or calculation that can be used in trading strategy conditions.

## Base Interface

All expressions extend the `BaseExpression` interface:

```typescript
interface BaseExpression {
  type: string;
}
```

## Expression Types

### 1. IndicatorExpression

**Type**: `indicator`

**Purpose**: References technical indicator values (moving averages, RSI, MACD, etc.)

**Properties**:
- `indicatorId: string` - Unique identifier for the indicator
- `indicatorParam: string` - Specific parameter/output of the indicator
- `indicatorFieldType: IndicatorFieldType` - Type of field ('value', 'signal', etc.)
- `indicatorParamType: IndicatorParamType` - Type of parameter ('input', 'output')
- `instrumentType?: 'TI' | 'SI'` - Trading Instrument or Support Instrument
- `timeframe?: string` - Timeframe (e.g., '1m', '5m', '15m')
- `name?: string` - Display name of the indicator
- `parameter?: string` - Parameter name
- `offset?: number` - Lookback offset (0 = current, 1 = previous, etc.)

**Example**: RSI value from 1 candle ago on 5-minute timeframe

### 2. MarketDataExpression

**Type**: `market_data`

**Purpose**: References historical market data (OHLCV)

**Properties**:
- `dataField: string` - Field name ('open', 'high', 'low', 'close', 'volume')
- `instrumentType?: 'TI' | 'SI'` - Trading Instrument or Support Instrument
- `timeframe?: string` - Timeframe (e.g., '1m', '5m', '15m')
- `field?: string` - Alias for dataField
- `offset?: number` - Lookback offset (0 = current, 1 = previous, etc.)

**Example**: Close price from 2 candles ago

### 3. LiveDataExpression

**Type**: `live_data`

**Purpose**: References real-time market data

**Properties**:
- `dataField: string` - Field name ('ltp', 'bid', 'ask', 'volume', etc.)
- `instrumentType?: 'TI' | 'SI'` - Trading Instrument or Support Instrument
- `field?: string` - Alias for dataField
- `positionId?: string` - Position-specific live data

**Example**: Current Last Traded Price (LTP)

### 4. ConstantExpression

**Type**: `constant`

**Purpose**: Static values (numbers, strings, booleans, status values)

**Properties**:
- `valueType: 'number' | 'string' | 'boolean' | 'status'` - Type of the constant
- `numberValue?: number` - Numeric value
- `stringValue?: string` - String value
- `booleanValue?: boolean` - Boolean value
- `statusValue?: 'Open' | 'Close' | 'Partially closed'` - Position status value
- `value?: any` - Generic value holder

**Examples**: 
- Number: 100
- String: "AAPL"
- Boolean: true
- Status: "Open"

### 5. TimeExpression / TimeFunctionExpression

**Type**: `time_function`

**Purpose**: Time-based conditions

**Properties**:
- `timeValue: string` - Time in HH:MM format
- `operator?: '==' | '!=' | '>' | '>=' | '<' | '<='` - Comparison operator

**Example**: Current time >= "09:30"

### 6. CurrentTimeExpression

**Type**: `current_time`

**Purpose**: References the current system time

**Properties**: None (just the type)

**Example**: Used in time comparisons for current timestamp

### 7. ComplexExpression

**Type**: `expression`

**Purpose**: Mathematical operations between two expressions

**Properties**:
- `expressionString: string` - String representation of the expression
- `operation?: '+' | '-' | '*' | '/' | '%' | '+%' | '-%'` - Mathematical operation
- `left?: Expression` - Left operand
- `right?: Expression` - Right operand

**Example**: (RSI + 10) * 2

### 8. FunctionExpression

**Type**: `function`

**Purpose**: Mathematical functions applied to multiple expressions

**Properties**:
- `functionName: 'max' | 'min'` - Function to apply
- `expressions: Expression[]` - Array of expressions to evaluate

**Example**: max(close_price, sma_20)

### 9. PositionDataExpression

**Type**: `position_data`

**Purpose**: References data from existing positions

**Properties**:
- `positionId?: string` - Which position to get data from
- `positionField: string` - Field to extract:
  - `'entryPrice'` - Entry price of position
  - `'currentPrice'` - Current price of position
  - `'quantity'` - Position quantity
  - `'status'` - Position status
  - `'trailingPositionPrice'` - Trailing stop price
  - `'instrumentName'` - Name of the instrument
  - `'instrumentType'` - Type of instrument
  - `'symbol'` - Symbol/ticker
  - `'underlyingPriceOnEntry'` - **[Options Only]** Underlying price when position was opened
  - `'underlyingPriceOnExit'` - **[Options Only]** Underlying price when position was closed
  - `'underlyingName'` - **[Options Only]** Name of underlying asset
  - `'expiryDate'` - **[Options Only]** Expiry date for options
  - `'strikePrice'` - **[Options Only]** Strike price for options
  - `'optionType'` - **[Options Only]** Option type (Call/Put)
  - `'strikeType'` - **[Options Only]** Strike type (ATM/ITM/OTM)
- `field?: string` - Alias for positionField

**Availability Notes**:
- Basic fields (entry/current price, quantity, status, etc.) are available for all instrument types
- Underlying-related fields are only available when trading instrument is **Options**
- Options-specific fields (expiry, strike, option type) are only available when trading instrument is **Options**
- Field availability is dynamically filtered based on the strategy's trading instrument configuration

**Example**: Entry price of position "POS_001"

### 10. ExternalTriggerExpression

**Type**: `external_trigger`

**Purpose**: References external trigger events

**Properties**:
- `triggerId: string` - Unique identifier for the trigger
- `triggerType?: string` - Type/category of trigger
- `parameters?: any` - Additional trigger parameters

**Example**: Webhook trigger, news event, custom signal

### 11. NodeVariableExpression

**Type**: `node_variable`

**Purpose**: References variables from other nodes in the strategy

**Properties**:
- `nodeId: string` - ID of the node containing the variable
- `variableName: string` - Name of the variable

**Example**: Result from a calculation node or condition outcome

### 12. PnLExpression

**Type**: `pnl_data`

**Purpose**: References profit and loss data

**Properties**:
- `pnlType: 'realized' | 'unrealized' | 'total'` - Type of P&L
- `scope: 'position' | 'overall'` - Scope of P&L calculation
- `positionId?: string` - Required when scope is 'position'

**Examples**:
- Total unrealized P&L across all positions
- Realized P&L for specific position

### 13. UnderlyingPnLExpression

**Type**: `underlying_pnl`

**Purpose**: References profit and loss calculated based on underlying instrument price movements (for options trading)

**Properties**:
- `pnlType: 'realized' | 'unrealized' | 'total'` - Type of underlying P&L
- `scope: 'position' | 'overall'` - Scope of underlying P&L calculation
- `positionId?: string` - Required when scope is 'position'

**Use Case**: Available only when trading instrument is options. Calculates theoretical P&L based on underlying price movement rather than actual option P&L.

**Examples**:
- Total unrealized underlying P&L across all option positions
- Realized underlying P&L for specific option position
- Underlying P&L calculation: (current_underlying_price - entry_underlying_price) * position_quantity

**Note**: This provides a cleaner signal for entry/exit decisions as underlying prices are less volatile and manipulable compared to option premiums.

### 14. TrailingVariableExpression

**Type**: `trailing_variable`

**Purpose**: References trailing variables automatically created by entry nodes for tracking position and underlying prices

**Properties**:
- `nodeId: string` - ID of the entry node that created the trailing variables
- `variableId: string` - ID of the specific trailing variable
- `trailingField: 'trailingPosition' | 'trailingUnderlying'` - Type of trailing variable:
  - `'trailingPosition'` - Tracks the best position price achieved since entry
  - `'trailingUnderlying'` - **[Options Only]** Tracks the best underlying price achieved since entry

**Automatic Creation**: Entry nodes automatically create trailing variables for each position:
- **Position Price Variable**: Always created for all instrument types
- **Underlying Price Variable**: Only created when trading instrument is Options

**Variable Naming Convention**:
- Position tracking: `"Trailing Position Price - [Position Details]"`
- Underlying tracking: `"Trailing Underlying Price - [Position Details]"` (Options only)

**Use Cases**:
- Trailing stop loss conditions based on position price movement
- Exit conditions when underlying asset retraces from its best level
- Risk management based on maximum favorable excursion

**Examples**:
- Exit when current price falls 5% below trailing position price
- Exit option when underlying price drops 2% from its trailing high
- Profit protection based on best price achieved since entry

**Note**: These variables are automatically managed by the system and update in real-time as positions move in favor of the trader.

## Condition Structure

Conditions use these expressions in comparisons:

```typescript
interface Condition {
  id: string;
  operator: ComparisonOperator; // '>' | '<' | '>=' | '<=' | '==' | '!=' | 'crosses_above' | 'crosses_below'
  lhs: Expression; // Left-hand side expression
  rhs: Expression; // Right-hand side expression
}
```

## Group Conditions

Multiple conditions can be grouped with logical operators:

```typescript
interface GroupCondition {
  id: string;
  groupLogic: 'AND' | 'OR';
  conditions: (Condition | GroupCondition)[];
}
```

## Backend Implementation Notes

1. **Expression Evaluation**: Each expression type requires specific backend logic to fetch/calculate values
2. **Caching**: Consider caching indicator values and market data to avoid redundant calculations
3. **Real-time Updates**: Live data expressions need real-time data feeds
4. **Error Handling**: Handle cases where data is unavailable (missing indicators, closed positions, etc.)
5. **Performance**: Optimize for frequent evaluation during market hours
6. **Validation**: Validate expression configurations before strategy execution

## Common Use Cases

1. **Entry Conditions**: RSI < 30 AND Close > SMA(20)
2. **Exit Conditions**: Unrealized P&L > 100 OR Current Time >= "15:30"
3. **Position Management**: Position Quantity > 0 AND Position Status == "Open"
4. **Risk Management**: Total P&L < -500 OR Live Price crosses_below Support Level