
import { GroupCondition, Condition, Expression } from './types';
import { 
  formatExpressionDisplayName, 
  normalizeExpressionIdentifier, 
  formatNodeVariableReference 
} from '../expressionNaming';
import { TimeframeResolver } from '../timeframe-migration/TimeframeResolver';

export const groupConditionToString = (condition: GroupCondition, nodeData?: any): string => {
  if (!condition || !condition.conditions) {
    return "No conditions defined";
  }

  if (condition.conditions.length === 0) {
    return "No conditions defined";
  }

  try {
    const conditionStrings = condition.conditions.map(cond => {
      if ('groupLogic' in cond) {
        return `(${groupConditionToString(cond, nodeData)})`;
      } else {
        return conditionToString(cond, nodeData);
      }
    });

    return conditionStrings.join(` ${condition.groupLogic} `);
  } catch (error) {
    console.error('Error formatting condition:', error);
    return "Error formatting condition";
  }
};

export const conditionToString = (condition: Condition, nodeData?: any): string => {
  try {
    const lhs = condition.lhs;
    const rhs = condition.rhs;
    const rhsUpper = condition.rhsUpper;
    
    if (!lhs || !rhs) {
      return "Incomplete condition";
    }

    const leftStr = expressionToString(lhs, nodeData);
    const rightStr = expressionToString(rhs, nodeData);
    
    // Handle between operator
    if ((condition.operator === 'between' || condition.operator === 'not_between') && rhsUpper) {
      const upperStr = expressionToString(rhsUpper, nodeData);
      const op = condition.operator === 'between' ? 'between' : 'not between';
      return `${leftStr} ${op} ${rightStr} AND ${upperStr}`;
    }
    
    return `${leftStr} ${condition.operator} ${rightStr}`;
  } catch (error) {
    console.error('Error formatting single condition:', error);
    return "Error formatting condition";
  }
};

export const expressionToString = (expression: Expression, nodeData?: any): string => {
  try {
    switch (expression.type) {
      case 'constant':
        if (expression.value !== undefined) {
          return expression.value.toString();
        }
        if (expression.numberValue !== undefined) {
          return expression.numberValue.toString();
        }
        if (expression.stringValue !== undefined) {
          return expression.stringValue;
        }
        if (expression.booleanValue !== undefined) {
          return expression.booleanValue.toString();
        }
        return '0';
        
      case 'indicator':
        // Get the display name from the start node's indicators data
        let indicatorName = 'Indicator';
        let indicatorTimeframeDisplay = '';
        
        // Use indicatorId as the primary key to look up the indicator
        const indicatorKey = expression.indicatorId || expression.name;
        
        // Try to find the indicator in the nodeData
        if (indicatorKey && nodeData) {
          let indicatorData = null;
          
          // Search in trading instrument config
          if (nodeData.tradingInstrumentConfig?.timeframes) {
            for (const timeframe of nodeData.tradingInstrumentConfig.timeframes) {
              if (timeframe.indicators && typeof timeframe.indicators === 'object') {
                const foundIndicator = timeframe.indicators[indicatorKey];
                if (foundIndicator) {
                  indicatorData = foundIndicator;
                  // Get the actual timeframe display value directly from the timeframe config
                  indicatorTimeframeDisplay = timeframe.timeframe || '';
                  break;
                }
              }
            }
          }
          
          // Search in supporting instrument config if not found
          if (!indicatorData && nodeData.supportingInstrumentConfig?.timeframes) {
            for (const timeframe of nodeData.supportingInstrumentConfig.timeframes) {
              if (timeframe.indicators && typeof timeframe.indicators === 'object') {
                const foundIndicator = timeframe.indicators[indicatorKey];
                if (foundIndicator) {
                  indicatorData = foundIndicator;
                  // Get the actual timeframe display value directly from the timeframe config
                  indicatorTimeframeDisplay = timeframe.timeframe || '';
                  break;
                }
              }
            }
          }
          
          if (indicatorData) {
            // Use display_name or indicator_name from the indicator data
            indicatorName = indicatorData.display_name || indicatorData.indicator_name || indicatorKey;
          } else if (indicatorKey) {
            // Fallback: extract indicator type from the key (e.g., "RSI_tf_1m_default" -> "RSI")
            indicatorName = normalizeExpressionIdentifier(indicatorKey);
          }
        } else if (indicatorKey) {
          indicatorName = normalizeExpressionIdentifier(indicatorKey);
        }
        
        // Fallback to TimeframeResolver if we didn't get the timeframe from nodeData
        if (!indicatorTimeframeDisplay && expression.timeframeId) {
          indicatorTimeframeDisplay = TimeframeResolver.getDisplayValue(expression.timeframeId);
        } else if (!indicatorTimeframeDisplay) {
          indicatorTimeframeDisplay = expression.timeframe || '';
        }
        
        // Add parameter to display (e.g., RSI.value, MACD.signal)
        const paramDisplay = expression.indicatorParam || expression.parameter;
        
        return formatExpressionDisplayName(indicatorName, {
          instrumentType: expression.instrumentType,
          timeframe: indicatorTimeframeDisplay,
          parameter: paramDisplay,
          offset: expression.offset
        });
        
      case 'candle_data':
        // Use exact field names from MarketDataSelector dropdown: Open, High, Low, Close, Volume
        const marketDataField = expression.field || 'Close';
        
        // Try to get timeframe display from nodeData first
        let marketDataTimeframeDisplay = '';
        if (expression.timeframeId && nodeData) {
          // Search in trading instrument config
          const tradingTimeframes = nodeData.tradingInstrumentConfig?.timeframes || [];
          const supportingTimeframes = nodeData.supportingInstrumentConfig?.timeframes || [];
          const allTimeframes = [...tradingTimeframes, ...supportingTimeframes];
          
          const matchedTimeframe = allTimeframes.find((tf: any) => tf.id === expression.timeframeId);
          if (matchedTimeframe) {
            marketDataTimeframeDisplay = matchedTimeframe.timeframe || '';
          }
        }
        
        // Fallback to TimeframeResolver
        if (!marketDataTimeframeDisplay && expression.timeframeId) {
          marketDataTimeframeDisplay = TimeframeResolver.getDisplayValue(expression.timeframeId);
        } else if (!marketDataTimeframeDisplay) {
          marketDataTimeframeDisplay = expression.timeframe || '';
        }
        
        return formatExpressionDisplayName(marketDataField, {
          instrumentType: expression.instrumentType,
          timeframe: marketDataTimeframeDisplay,
          offset: expression.offset
        });
        
      case 'live_data':
        // Use exact field names from LiveDataSelector - "LTP" instead of "mark"
        let liveDataField = expression.field || 'LTP';
        
        if (liveDataField === 'mark') {
          liveDataField = 'LTP';
        }
        
        return formatExpressionDisplayName(liveDataField, {
          instrumentType: expression.instrumentType
        });
        
      case 'time_function':
        // Handle the simplified TimeExpression
        if ('timeValue' in expression && expression.timeValue) {
          return `${expression.timeValue}`;
        }
        return 'Time';
        
      case 'current_time':
        return 'Current Time';
        
      case 'position_data':
        // Get the field name from either field or positionField
        let positionDataField = expression.field || expression.positionField || 'Position Data';
        
        // Format field names for better readability
        const fieldDisplayNames: { [key: string]: string } = {
          'entryPrice': 'Entry Price',
          'currentPrice': 'Current Price',
          'quantity': 'Quantity',
          'status': 'Status',
          'underlyingPriceOnEntry': 'Underlying Price on Entry',
          'underlyingPriceOnExit': 'Underlying Price on Exit',
          'instrumentName': 'Instrument Name',
          'instrumentType': 'Instrument Type',
          'symbol': 'Symbol',
          'expiryDate': 'Expiry Date',
          'strikePrice': 'Strike Price',
          'optionType': 'Option Type',
          'strikeType': 'Strike Type',
          'underlyingName': 'Underlying Name'
        };
        
        const displayFieldName = fieldDisplayNames[positionDataField] || positionDataField;
        
        // Include position VPI if specified
        if (expression.vpi) {
          return `${displayFieldName} (${expression.vpi})`;
        }
        
        return displayFieldName;
        
        
      case 'external_trigger':
        return expression.triggerType || expression.triggerId || 'External Trigger';
        
      case 'node_variable':
        return formatNodeVariableReference(expression.nodeId, expression.variableName);
        
      case 'global_variable':
        return `Global(${(expression as any).globalVariableName || 'undefined'})`;
        
      case 'pnl_data':
        const pnlTypeLabel = expression.pnlType === 'realized' ? 'Realized' : 
                            expression.pnlType === 'unrealized' ? 'Unrealized' : 'Total';
        
        if (expression.scope === 'overall') {
          return `${pnlTypeLabel} P&L (Overall)`;
        } else {
          // For position scope, show the VPI if available
          const vpi = expression.vpi;
          if (vpi && vpi !== '_any') {
            return `${pnlTypeLabel} P&L (${vpi})`;
          }
          return `${pnlTypeLabel} P&L (Position)`;
        }

      case 'expression':
        if (expression.left && expression.right && expression.operation) {
          return `(${expressionToString(expression.left, nodeData)} ${expression.operation} ${expressionToString(expression.right, nodeData)})`;
        }
        return expression.expressionString || 'Complex Expression';

      case 'function':
        if (expression.functionName && expression.expressions && expression.expressions.length > 0) {
          const expressionStrs = expression.expressions.map(expr => expressionToString(expr, nodeData));
          return `${expression.functionName}(${expressionStrs.join(', ')})`;
        }
        return 'Function Expression';
        
      case 'math_expression':
        if (expression.items && expression.items.length > 0) {
          const itemStrs = expression.items.map((item, index) => {
            const exprStr = expressionToString(item.expression, nodeData);
            if (index === 0) {
              return exprStr;
            }
            return `${item.operator || '+'} ${exprStr}`;
          });
          return `(${itemStrs.join(' ')})`;
        }
        return 'Math Expression';
      
      case 'position_time':
        const timeField = expression.timeField === 'entryTime' ? 'Entry Time' : 'Exit Time';
        if (expression.vpi) {
          return `${timeField} (${expression.vpi})`;
        }
        return timeField;
      
      case 'time_offset':
        const baseStr = expression.baseTime ? expressionToString(expression.baseTime, nodeData) : 'Current Time';
        const offsetVal = expression.offsetValue || 0;
        const offsetUnit = expression.offsetType || 'minutes';
        const dir = expression.direction === 'before' ? 'before' : 'after';
        return `${offsetVal} ${offsetUnit} ${dir} ${baseStr}`;
      
      case 'candle_range':
        // Build range string based on type
        let rangeStr = '';
        if (expression.rangeType === 'by_count') {
          rangeStr = `[${expression.startIndex ?? 0}:${expression.endIndex ?? 5}]`;
        } else if (expression.rangeType === 'by_time') {
          rangeStr = `[${expression.startTime || '09:15'}-${expression.endTime || '15:30'}]`;
        } else if (expression.rangeType === 'relative') {
          const refType = expression.referenceType || 'entry';
          const count = expression.candleCount || 5;
          const dir = expression.direction || 'after';
          rangeStr = `[${count} ${dir} ${refType}]`;
        } else if (expression.rangeType === 'to_current') {
          const refType = expression.referenceType || 'entry';
          rangeStr = `[${refType} → now]`;
        } else {
          rangeStr = `[0:5]`;
        }
        
        // Get field name (OHLCV) - capitalize first letter
        const candleField = expression.ohlcvField 
          ? expression.ohlcvField.charAt(0).toUpperCase() + expression.ohlcvField.slice(1) 
          : 'Close';
        
        // Get aggregation function
        const aggregation = expression.aggregationType || 'none';
        const aggDisplay = aggregation !== 'none' ? aggregation.charAt(0).toUpperCase() + aggregation.slice(1) : '';
        
        // Get timeframe display - same logic as candle_data
        let candleRangeTfDisplay = '';
        if (expression.timeframeId && nodeData) {
          const tradingTimeframes = nodeData.tradingInstrumentConfig?.timeframes || [];
          const supportingTimeframes = nodeData.supportingInstrumentConfig?.timeframes || [];
          const allTimeframes = [...tradingTimeframes, ...supportingTimeframes];
          const matchedTimeframe = allTimeframes.find((tf: any) => tf.id === expression.timeframeId);
          if (matchedTimeframe) {
            candleRangeTfDisplay = matchedTimeframe.timeframe || '';
          }
        }
        if (!candleRangeTfDisplay && expression.timeframeId) {
          candleRangeTfDisplay = TimeframeResolver.getDisplayValue(expression.timeframeId);
        }
        
        // Use formatExpressionDisplayName for consistent formatting with candle_data
        // Format: TI.1m.High[1:5].Max or TI.1m.High[1:5] (if no aggregation)
        const baseDisplayName = formatExpressionDisplayName(candleField, {
          instrumentType: expression.instrumentType,
          timeframe: candleRangeTfDisplay
        });
        
        // Append range and aggregation
        let candleRangeDisplay = `${baseDisplayName}${rangeStr}`;
        if (aggDisplay) {
          candleRangeDisplay += `.${aggDisplay}`;
        }
        
        return candleRangeDisplay;
      
      
      case 'list':
        if (expression.items && expression.items.length > 0) {
          const itemStrs = expression.items.map(e => expressionToString(e, nodeData));
          return `[${itemStrs.join(', ')}]`;
        }
        return '[]';
      
      default:
        return 'Unknown Expression';
    }
  } catch (error) {
    console.error('Error formatting expression:', error);
    return 'Error';
  }
};
