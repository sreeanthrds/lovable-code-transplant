 # New Expression Types & Operators - Backend Specification
 
 This document provides detailed JSON schemas and examples for all new expression types and operators added to the condition builder system. Use this to update your backend calculation logic.
 
 ---
 
 ## Table of Contents
 
 1. [New Operators](#1-new-operators)
    - [Between / Not Between](#between--not-between)
    - [In / Not In](#in--not-in)
 2. [Math Expression (Flat Array Format)](#2-math-expression-flat-array-format)
 3. [Position Time Expression](#3-position-time-expression)
 4. [Time Offset Expression](#4-time-offset-expression)
 5. [Candle Range Expression](#5-candle-range-expression)
 6. [Aggregation Expression](#6-aggregation-expression)
 7. [List Expression](#7-list-expression)
 8. [Updated: Position Data Expression](#8-updated-position-data-expression)
 
 ---
 
 ## 1. New Operators
 
 ### Between / Not Between
 
 The `between` and `not_between` operators require **three expressions**: `lhs`, `rhs` (lower bound), and `rhsUpper` (upper bound).
 
 **Condition Schema:**
 ```typescript
 interface Condition {
   id: string;
   operator: 'between' | 'not_between' | '>' | '<' | '>=' | '<=' | '==' | '!=' | 'crosses_above' | 'crosses_below' | 'in' | 'not_in';
   lhs: Expression;        // The value being checked
   rhs: Expression;        // Lower bound (for between) or RHS value
   rhsUpper?: Expression;  // Upper bound (only for 'between' / 'not_between')
 }
 ```
 
 **Example JSON - RSI between 30 and 70:**
 ```json
 {
   "id": "cond_001",
   "operator": "between",
   "lhs": {
     "type": "indicator",
     "indicatorId": "rsi_14",
     "indicatorParam": "value",
     "indicatorFieldType": "output",
     "indicatorParamType": "output",
     "instrumentType": "TI",
     "timeframeId": "tf_5m"
   },
   "rhs": {
     "type": "constant",
     "valueType": "number",
     "numberValue": 30
   },
   "rhsUpper": {
     "type": "constant",
     "valueType": "number",
     "numberValue": 70
   }
 }
 ```
 
 **Backend Logic:**
 ```
 between:     rhs <= lhs <= rhsUpper
 not_between: lhs < rhs OR lhs > rhsUpper
 ```
 
 ---
 
 ### In / Not In
 
 The `in` and `not_in` operators check if `lhs` exists within a list of values in `rhs`.
 
 **Example JSON - Status in [Open, Partially closed]:**
 ```json
 {
   "id": "cond_002",
   "operator": "in",
   "lhs": {
     "type": "position_data",
     "vpi": "POS_001",
     "positionField": "status"
   },
   "rhs": {
     "type": "list",
     "items": [
       {
         "type": "constant",
         "valueType": "status",
         "statusValue": "Open"
       },
       {
         "type": "constant",
         "valueType": "status",
         "statusValue": "Partially closed"
       }
     ]
   }
 }
 ```
 
 **Backend Logic:**
 ```
 in:     lhs exists in rhs.items
 not_in: lhs does not exist in rhs.items
 ```
 
 ---
 
 ## 2. Math Expression (Flat Array Format)
 
 **Replaces the legacy nested `ComplexExpression` format.** Instead of binary left/right structure, uses a flat array of items where each item has an expression and an optional preceding operator.
 
 **Schema:**
 ```typescript
 interface MathExpressionItem {
   expression: Expression;
   operator?: '+' | '-' | '*' | '/' | '%' | '+%' | '-%';  // Undefined for first item
 }
 
 interface MathExpression {
   type: 'math_expression';
   items: MathExpressionItem[];
 }
 ```
 
 **Operators:**
 - `+` : Addition
 - `-` : Subtraction
 - `*` : Multiplication
 - `/` : Division
 - `%` : Modulo
 - `+%` : Add percentage (a +% b = a + (a * b / 100))
 - `-%` : Subtract percentage (a -% b = a - (a * b / 100))
 
 **Example JSON - (Close Price + 10) * 2:**
 ```json
 {
   "type": "math_expression",
   "items": [
     {
       "expression": {
         "type": "candle_data",
         "dataField": "close",
         "instrumentType": "TI",
         "timeframeId": "tf_5m",
         "offset": 0
       }
     },
     {
       "operator": "+",
       "expression": {
         "type": "constant",
         "valueType": "number",
         "numberValue": 10
       }
     },
     {
       "operator": "*",
       "expression": {
         "type": "constant",
         "valueType": "number",
         "numberValue": 2
       }
     }
   ]
 }
 ```
 
 **Example JSON - Entry Price + 5%:**
 ```json
 {
   "type": "math_expression",
   "items": [
     {
       "expression": {
         "type": "position_data",
         "vpi": "POS_001",
         "positionField": "entryPrice"
       }
     },
     {
       "operator": "+%",
       "expression": {
         "type": "constant",
         "valueType": "number",
         "numberValue": 5
       }
     }
   ]
 }
 ```
 
 **Backend Calculation Logic:**
 ```python
 def evaluate_math_expression(items):
     result = evaluate(items[0].expression)
     for item in items[1:]:
         value = evaluate(item.expression)
         match item.operator:
             case '+':  result = result + value
             case '-':  result = result - value
             case '*':  result = result * value
             case '/':  result = result / value
             case '%':  result = result % value
             case '+%': result = result + (result * value / 100)
             case '-%': result = result - (result * value / 100)
     return result
 ```
 
 ---
 
 ## 3. Position Time Expression
 
 Returns the entry or exit timestamp of a position.
 
 **Schema:**
 ```typescript
 interface PositionTimeExpression {
   type: 'position_time';
   timeField: 'entryTime' | 'exitTime';
   vpi?: string;  // Position identifier
 }
 ```
 
 **Example JSON - Position Entry Time:**
 ```json
 {
   "type": "position_time",
   "timeField": "entryTime",
   "vpi": "POS_001"
 }
 ```
 
 **Example JSON - Position Exit Time:**
 ```json
 {
   "type": "position_time",
   "timeField": "exitTime",
   "vpi": "POS_001"
 }
 ```
 
 **Backend Logic:**
 - Returns a timestamp/datetime value
 - For `entryTime`: Return the timestamp when the position was opened
 - For `exitTime`: Return the timestamp when the position was closed (null if still open)
 
 ---
 
 ## 4. Time Offset Expression
 
 Calculates a time value by adding/subtracting an offset from a base time reference.
 
 **Schema:**
 ```typescript
 interface TimeOffsetExpression {
   type: 'time_offset';
   baseTime: Expression;  // current_time, position_time, or time_function
   offsetType: 'days' | 'hours' | 'minutes' | 'seconds' | 'candles';
   offsetValue: number;
   direction: 'before' | 'after';
 }
 ```
 
 **Example JSON - 5 minutes after position entry:**
 ```json
 {
   "type": "time_offset",
   "baseTime": {
     "type": "position_time",
     "timeField": "entryTime",
     "vpi": "POS_001"
   },
   "offsetType": "minutes",
   "offsetValue": 5,
   "direction": "after"
 }
 ```
 
 **Example JSON - 2 hours before current time:**
 ```json
 {
   "type": "time_offset",
   "baseTime": {
     "type": "current_time"
   },
   "offsetType": "hours",
   "offsetValue": 2,
   "direction": "before"
 }
 ```
 
 **Example JSON - 10 candles after 09:15:**
 ```json
 {
   "type": "time_offset",
   "baseTime": {
     "type": "time_function",
     "timeValue": "09:15"
   },
   "offsetType": "candles",
   "offsetValue": 10,
   "direction": "after"
 }
 ```
 
 **Backend Logic:**
 ```python
 def evaluate_time_offset(expr, timeframe_minutes=None):
     base = evaluate(expr.baseTime)  # Returns datetime
     
     if expr.offsetType == 'candles':
         # Convert candles to time using timeframe
         offset = timedelta(minutes=expr.offsetValue * timeframe_minutes)
     else:
         offset = {
             'days': timedelta(days=expr.offsetValue),
             'hours': timedelta(hours=expr.offsetValue),
             'minutes': timedelta(minutes=expr.offsetValue),
             'seconds': timedelta(seconds=expr.offsetValue)
         }[expr.offsetType]
     
     if expr.direction == 'after':
         return base + offset
     else:
         return base - offset
 ```
 
 ---
 
 ## 5. Candle Range Expression
 
 Specifies a range of candles for use in aggregation functions.
 
 **Schema:**
 ```typescript
 interface CandleRangeExpression {
   type: 'candle_range';
   rangeType: 'by_count' | 'by_time' | 'relative' | 'to_current';
   
   // For by_count: candle indices (0 = current, 1 = previous, etc.)
   startIndex?: number;
   endIndex?: number;
   
   // For by_time: specific time range
   startTime?: string;  // HH:MM format
   endTime?: string;    // HH:MM format
   
   // For relative & to_current: reference point configuration
   referenceType?: 'time' | 'candle_number' | 'position_entry' | 'position_exit' | 'current_candle';
   referenceTime?: string;        // HH:MM if referenceType is 'time'
   referenceCandleNumber?: number; // If referenceType is 'candle_number'
   referenceVpi?: string;         // If referenceType is 'position_entry' or 'position_exit'
   
   // For relative: direction and count
   candleCount?: number;
   direction?: 'before' | 'after';
   
   // Instrument context
   instrumentType?: 'TI' | 'SI';
   timeframeId?: string;
 }
 ```
 
 ### Range Type: by_count
 
 **Example JSON - Last 10 candles (indices 0-9):**
 ```json
 {
   "type": "candle_range",
   "rangeType": "by_count",
   "startIndex": 0,
   "endIndex": 9,
   "instrumentType": "TI",
   "timeframeId": "tf_5m"
 }
 ```
 
 ### Range Type: by_time
 
 **Example JSON - Candles from 09:15 to 10:30:**
 ```json
 {
   "type": "candle_range",
   "rangeType": "by_time",
   "startTime": "09:15",
   "endTime": "10:30",
   "instrumentType": "TI",
   "timeframeId": "tf_5m"
 }
 ```
 
 ### Range Type: relative
 
 **Example JSON - 5 candles after position entry:**
 ```json
 {
   "type": "candle_range",
   "rangeType": "relative",
   "referenceType": "position_entry",
   "referenceVpi": "POS_001",
   "candleCount": 5,
   "direction": "after",
   "instrumentType": "TI",
   "timeframeId": "tf_5m"
 }
 ```
 
 **Example JSON - 3 candles before 10:00:**
 ```json
 {
   "type": "candle_range",
   "rangeType": "relative",
   "referenceType": "time",
   "referenceTime": "10:00",
   "candleCount": 3,
   "direction": "before",
   "instrumentType": "TI",
   "timeframeId": "tf_5m"
 }
 ```
 
 ### Range Type: to_current
 
 Dynamic range from a starting reference point to the current candle.
 
 **Example JSON - From 09:15 to current candle:**
 ```json
 {
   "type": "candle_range",
   "rangeType": "to_current",
   "referenceType": "time",
   "referenceTime": "09:15",
   "instrumentType": "TI",
   "timeframeId": "tf_5m"
 }
 ```
 
 **Example JSON - From candle #5 (of day) to current:**
 ```json
 {
   "type": "candle_range",
   "rangeType": "to_current",
   "referenceType": "candle_number",
   "referenceCandleNumber": 5,
   "instrumentType": "TI",
   "timeframeId": "tf_5m"
 }
 ```
 
 **Example JSON - From position entry to current candle:**
 ```json
 {
   "type": "candle_range",
   "rangeType": "to_current",
   "referenceType": "position_entry",
   "referenceVpi": "POS_001",
   "instrumentType": "TI",
   "timeframeId": "tf_5m"
 }
 ```
 
 **Backend Logic for to_current:**
 ```python
 def get_candle_range_to_current(expr, current_candle_time, timeframe):
     match expr.referenceType:
         case 'time':
             start_time = parse_time(expr.referenceTime)
         case 'candle_number':
             start_time = get_nth_candle_of_day(expr.referenceCandleNumber, timeframe)
         case 'position_entry':
             start_time = get_position_entry_time(expr.referenceVpi)
         case 'position_exit':
             start_time = get_position_exit_time(expr.referenceVpi)
     
     return get_candles_between(start_time, current_candle_time, timeframe)
 ```
 
 ---
 
 ## 6. Aggregation Expression
 
 Applies aggregation functions to a candle range or list of expressions.
 
 **Schema:**
 ```typescript
 interface AggregationExpression {
   type: 'aggregation';
   aggregationType: 'min' | 'max' | 'avg' | 'sum' | 'first' | 'last' | 'count';
   sourceType: 'candle_range' | 'expression_list';
   
   // For candle_range source
   candleRange?: CandleRangeExpression;
   ohlcvField?: 'open' | 'high' | 'low' | 'close' | 'volume';
   
   // For expression_list source
   expressions?: Expression[];
 }
 ```
 
 ### Source Type: candle_range
 
 **Example JSON - MAX High of last 20 candles:**
 ```json
 {
   "type": "aggregation",
   "aggregationType": "max",
   "sourceType": "candle_range",
   "ohlcvField": "high",
   "candleRange": {
     "type": "candle_range",
     "rangeType": "by_count",
     "startIndex": 0,
     "endIndex": 19,
     "instrumentType": "TI",
     "timeframeId": "tf_5m"
   }
 }
 ```
 
 **Example JSON - AVG Close from 09:15 to current:**
 ```json
 {
   "type": "aggregation",
   "aggregationType": "avg",
   "sourceType": "candle_range",
   "ohlcvField": "close",
   "candleRange": {
     "type": "candle_range",
     "rangeType": "to_current",
     "referenceType": "time",
     "referenceTime": "09:15",
     "instrumentType": "TI",
     "timeframeId": "tf_5m"
   }
 }
 ```
 
 **Example JSON - SUM Volume since position entry:**
 ```json
 {
   "type": "aggregation",
   "aggregationType": "sum",
   "sourceType": "candle_range",
   "ohlcvField": "volume",
   "candleRange": {
     "type": "candle_range",
     "rangeType": "to_current",
     "referenceType": "position_entry",
     "referenceVpi": "POS_001",
     "instrumentType": "TI",
     "timeframeId": "tf_5m"
   }
 }
 ```
 
 ### Source Type: expression_list
 
 **Example JSON - MIN of multiple indicator values:**
 ```json
 {
   "type": "aggregation",
   "aggregationType": "min",
   "sourceType": "expression_list",
   "expressions": [
     {
       "type": "indicator",
       "indicatorId": "sma_20",
       "indicatorParam": "value",
       "indicatorFieldType": "output",
       "indicatorParamType": "output",
       "instrumentType": "TI",
       "timeframeId": "tf_5m"
     },
     {
       "type": "indicator",
       "indicatorId": "sma_50",
       "indicatorParam": "value",
       "indicatorFieldType": "output",
       "indicatorParamType": "output",
       "instrumentType": "TI",
       "timeframeId": "tf_5m"
     },
     {
       "type": "indicator",
       "indicatorId": "sma_200",
       "indicatorParam": "value",
       "indicatorFieldType": "output",
       "indicatorParamType": "output",
       "instrumentType": "TI",
       "timeframeId": "tf_5m"
     }
   ]
 }
 ```
 
 **Backend Logic:**
 ```python
 def evaluate_aggregation(expr):
     if expr.sourceType == 'candle_range':
         candles = get_candle_range(expr.candleRange)
         values = [candle[expr.ohlcvField] for candle in candles]
     else:
         values = [evaluate(e) for e in expr.expressions]
     
     match expr.aggregationType:
         case 'min':   return min(values)
         case 'max':   return max(values)
         case 'avg':   return sum(values) / len(values)
         case 'sum':   return sum(values)
         case 'first': return values[0]
         case 'last':  return values[-1]
         case 'count': return len(values)
 ```
 
 ---
 
 ## 7. List Expression
 
 A collection of expressions, used with `in`/`not_in` operators or as input to aggregations.
 
 **Schema:**
 ```typescript
 interface ListExpression {
   type: 'list';
   items: Expression[];
 }
 ```
 
 **Example JSON - List of constant values:**
 ```json
 {
   "type": "list",
   "items": [
     {
       "type": "constant",
       "valueType": "number",
       "numberValue": 100
     },
     {
       "type": "constant",
       "valueType": "number",
       "numberValue": 200
     },
     {
       "type": "constant",
       "valueType": "number",
       "numberValue": 300
     }
   ]
 }
 ```
 
 **Example JSON - List of status values:**
 ```json
 {
   "type": "list",
   "items": [
     {
       "type": "constant",
       "valueType": "status",
       "statusValue": "Open"
     },
     {
       "type": "constant",
       "valueType": "status",
       "statusValue": "Partially closed"
     }
   ]
 }
 ```
 
 ---
 
 ## 8. Updated: Position Data Expression
 
 Added `entryTime` and `exitTime` fields.
 
 **Schema:**
 ```typescript
 interface PositionDataExpression {
   type: 'position_data';
   vpi?: string;
   positionField: 
     | 'entryPrice' 
     | 'currentPrice' 
     | 'quantity' 
     | 'status'
     | 'underlyingPriceOnEntry' 
     | 'underlyingPriceOnExit'
     | 'instrumentName' 
     | 'instrumentType' 
     | 'symbol'
     | 'expiryDate' 
     | 'strikePrice' 
     | 'optionType' 
     | 'strikeType'
     | 'underlyingName'
     | 'entryTime'   // NEW
     | 'exitTime';   // NEW
 }
 ```
 
 **Example JSON - Get entry time:**
 ```json
 {
   "type": "position_data",
   "vpi": "POS_001",
   "positionField": "entryTime"
 }
 ```
 
 **Note:** For time-based comparisons, prefer using `position_time` expression type which is more semantic. The `entryTime`/`exitTime` fields in `position_data` return raw timestamp values.
 
 ---
 
 ## Complete Condition Examples
 
 ### Example 1: RSI between 30 and 70
 ```json
 {
   "id": "cond_rsi_range",
   "operator": "between",
   "lhs": {
     "type": "indicator",
     "indicatorId": "rsi_14",
     "indicatorParam": "value",
     "indicatorFieldType": "output",
     "indicatorParamType": "output",
     "instrumentType": "TI",
     "timeframeId": "tf_5m"
   },
   "rhs": {
     "type": "constant",
     "valueType": "number",
     "numberValue": 30
   },
   "rhsUpper": {
     "type": "constant",
     "valueType": "number",
     "numberValue": 70
   }
 }
 ```
 
 ### Example 2: Exit if 15 minutes since entry
 ```json
 {
   "id": "cond_time_exit",
   "operator": ">=",
   "lhs": {
     "type": "current_time"
   },
   "rhs": {
     "type": "time_offset",
     "baseTime": {
       "type": "position_time",
       "timeField": "entryTime",
       "vpi": "POS_001"
     },
     "offsetType": "minutes",
     "offsetValue": 15,
     "direction": "after"
   }
 }
 ```
 
 ### Example 3: Close > MAX High of candles since entry
 ```json
 {
   "id": "cond_breakout",
   "operator": ">",
   "lhs": {
     "type": "candle_data",
     "dataField": "close",
     "instrumentType": "TI",
     "timeframeId": "tf_5m",
     "offset": 0
   },
   "rhs": {
     "type": "aggregation",
     "aggregationType": "max",
     "sourceType": "candle_range",
     "ohlcvField": "high",
     "candleRange": {
       "type": "candle_range",
       "rangeType": "to_current",
       "referenceType": "position_entry",
       "referenceVpi": "POS_001",
       "instrumentType": "TI",
       "timeframeId": "tf_5m"
     }
   }
 }
 ```
 
 ### Example 4: Entry price + 2% as target
 ```json
 {
   "id": "cond_target",
   "operator": ">=",
   "lhs": {
     "type": "live_data",
     "dataField": "ltp",
     "instrumentType": "TI"
   },
   "rhs": {
     "type": "math_expression",
     "items": [
       {
         "expression": {
           "type": "position_data",
           "vpi": "POS_001",
           "positionField": "entryPrice"
         }
       },
       {
         "operator": "+%",
         "expression": {
           "type": "constant",
           "valueType": "number",
           "numberValue": 2
         }
       }
     ]
   }
 }
 ```
 
 ---
 
 ## Summary of New Types
 
 | Type | `type` Value | Purpose |
 |------|--------------|---------|
 | Math Expression | `math_expression` | Chainable arithmetic operations |
 | Position Time | `position_time` | Entry/exit timestamps |
 | Time Offset | `time_offset` | Time + offset calculation |
 | Candle Range | `candle_range` | Define range of candles |
 | Aggregation | `aggregation` | MIN/MAX/AVG/SUM/FIRST/LAST/COUNT |
 | List | `list` | Collection for IN/NOT_IN checks |
 
 ## New Operators
 
 | Operator | Fields Used | Logic |
 |----------|-------------|-------|
 | `between` | lhs, rhs, rhsUpper | rhs <= lhs <= rhsUpper |
 | `not_between` | lhs, rhs, rhsUpper | lhs < rhs OR lhs > rhsUpper |
 | `in` | lhs, rhs (list) | lhs exists in rhs.items |
 | `not_in` | lhs, rhs (list) | lhs not in rhs.items |