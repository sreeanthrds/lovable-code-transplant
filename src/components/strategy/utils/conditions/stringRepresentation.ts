
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
    
    if (!lhs || !rhs) {
      return "Incomplete condition";
    }

    const leftStr = expressionToString(lhs, nodeData);
    const rightStr = expressionToString(rhs, nodeData);
    
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
        let indicatorName = 'Unknown_Indicator';
        
        // Try to find the indicator in the nodeData
        if (expression.name && nodeData) {
          let indicatorData = null;
          
          // Search in trading instrument config
          if (nodeData.tradingInstrumentConfig?.timeframes) {
            for (const timeframe of nodeData.tradingInstrumentConfig.timeframes) {
              if (timeframe.indicators && typeof timeframe.indicators === 'object') {
                const foundIndicator = timeframe.indicators[expression.name];
                if (foundIndicator) {
                  indicatorData = foundIndicator;
                  break;
                }
              }
            }
          }
          
          // Search in supporting instrument config if not found
          if (!indicatorData && nodeData.supportingInstrumentConfig?.timeframes) {
            for (const timeframe of nodeData.supportingInstrumentConfig.timeframes) {
              if (timeframe.indicators && typeof timeframe.indicators === 'object') {
                const foundIndicator = timeframe.indicators[expression.name];
                if (foundIndicator) {
                  indicatorData = foundIndicator;
                  break;
                }
              }
            }
          }
          
          if (indicatorData) {
            indicatorName = indicatorData.display_name || normalizeExpressionIdentifier(expression.name);
          } else if (expression.name) {
            indicatorName = normalizeExpressionIdentifier(expression.name);
          }
        }
        
        // Use the new formatting function with timeframe resolution
        const indicatorTimeframeDisplay = expression.timeframeId 
          ? TimeframeResolver.getDisplayValue(expression.timeframeId)
          : expression.timeframe || '';
        
        return formatExpressionDisplayName(indicatorName, {
          instrumentType: expression.instrumentType,
          timeframe: indicatorTimeframeDisplay,
          parameter: expression.parameter,
          offset: expression.offset
        });
        
      case 'candle_data':
        // Use exact field names from MarketDataSelector dropdown: Open, High, Low, Close, Volume
        const marketDataField = expression.field || 'Close';
        
        const marketDataTimeframeDisplay = expression.timeframeId 
          ? TimeframeResolver.getDisplayValue(expression.timeframeId)
          : expression.timeframe || '';
        
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
        
      default:
        return 'Unknown Expression';
    }
  } catch (error) {
    console.error('Error formatting expression:', error);
    return 'Error';
  }
};
