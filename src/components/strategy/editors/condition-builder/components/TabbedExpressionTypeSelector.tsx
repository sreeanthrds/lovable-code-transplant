import React, { useState } from 'react';
import { Expression } from '../../../utils/conditions';
import { useStrategyStore } from '@/hooks/use-strategy-store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  TrendingUp, 
  Clock, 
  Calculator, 
  DollarSign, 
  Activity,
  Hash,
  Zap,
  Database,
  ChevronDown,
  Edit3,
  Timer,
  BarChart3,
  List
} from 'lucide-react';

interface TabbedExpressionTypeSelectorProps {
  expression: Expression;
  updateExpression: (expr: Expression) => void;
  restrictToConstant?: boolean;
}

const TabbedExpressionTypeSelector: React.FC<TabbedExpressionTypeSelectorProps> = ({
  expression,
  updateExpression,
  restrictToConstant = false
}) => {
  const nodes = useStrategyStore(state => state.nodes);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Listen for window resize to update mobile state
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Check if trading instrument is options
  const isOptionsTrading = React.useMemo(() => {
    const startNode = nodes.find(node => node.type === 'startNode');
    return (startNode?.data as any)?.tradingInstrument?.type === 'options';
  }, [nodes]);

  const handleTypeChange = (newType: string) => {
    // Default expressions for each type
    const defaultExpressions: Record<string, Partial<Expression>> = {
      constant: {
        type: 'constant',
        valueType: 'number',
        numberValue: 0,
        value: 0
      },
      indicator: {
        type: 'indicator',
        name: '',
        parameter: null,
        offset: 0,
        instrumentType: 'TI',
        timeframe: '1m'
      },
      candle_data: {
        type: 'candle_data',
        dataField: ''
        // Don't pre-fill values for progressive disclosure
      },
      live_data: {
        type: 'live_data',
        field: 'mark',
        instrumentType: 'TI'
      },
      time_function: {
        type: 'time_function',
        timeValue: '09:15'
      },
      current_time: {
        type: 'current_time'
      },
      position_data: {
        type: 'position_data',
        positionField: 'quantity'
      },
      external_trigger: {
        type: 'external_trigger',
        triggerType: 'webhook'
      },
      expression: {
        type: 'expression',
        operation: '+',
        left: {
          type: 'constant',
          valueType: 'number',
          numberValue: 0,
          value: 0
        },
        right: {
          type: 'constant',
          valueType: 'number',
          numberValue: 0,
          value: 0
        }
      },
      math_expression: {
        type: 'math_expression',
        items: [{
          expression: {
            type: 'constant',
            valueType: 'number',
            numberValue: 0,
            value: 0
          }
        }]
      },
      node_variable: {
        type: 'node_variable',
        nodeId: '',
        variableName: ''
      },
      pnl_data: {
        type: 'pnl_data',
        pnlType: 'unrealized',
        scope: 'overall'
      },
      underlying_pnl: {
        type: 'underlying_pnl',
        pnlType: 'unrealized',
        scope: 'overall'
      },
      trailing_variable: {
        type: 'trailing_variable',
        trailingField: 'trailingPosition'
      },
      function: {
        type: 'function',
        functionName: 'max',
        expressions: []
      },
      position_time: {
        type: 'position_time',
        timeField: 'entryTime'
      },
      time_offset: {
        type: 'time_offset',
        offsetType: 'minutes',
        offsetValue: 0,
        direction: 'after',
        baseTime: { type: 'current_time' }
      },
      candle_range: {
        type: 'candle_range',
        rangeType: 'by_count',
        startIndex: 0,
        endIndex: 5,
        instrumentType: 'TI'
      },
      aggregation: {
        type: 'aggregation',
        aggregationType: 'max',
        sourceType: 'candle_range',
        ohlcvField: 'close'
      },
      list: {
        type: 'list',
        items: []
      }
    };

    const newExpression = {
      ...defaultExpressions[newType],
      type: newType
    } as Expression;

    updateExpression(newExpression);
  };

  // Expression type categories with icons and descriptions
  const expressionCategories = {
    market: {
      label: 'Candles, Indicators and LTP',
      icon: TrendingUp,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50/70 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-900/50',
      borderColor: 'border-blue-200 dark:border-blue-800',
      iconBg: 'bg-blue-100 dark:bg-blue-900/50',
      options: [
        {
          type: 'indicator',
          label: 'Technical Indicators',
          description: 'RSI, SMA, EMA, Bollinger Bands, etc.',
          icon: Activity
        },
        {
          type: 'candle_data',
          label: 'Candle Data',
          description: 'Open, High, Low, Close, Volume data',
          icon: TrendingUp
        },
        {
          type: 'live_data',
          label: 'Live Market Data',
          description: 'Real-time bid, ask, mark prices',
          icon: Zap
        }
      ]
    },
    trading: {
      label: 'Trading & Positions',
      icon: DollarSign,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50/70 hover:bg-green-100 dark:bg-green-950/30 dark:hover:bg-green-900/50',
      borderColor: 'border-green-200 dark:border-green-800',
      iconBg: 'bg-green-100 dark:bg-green-900/50',
      options: [
        {
          type: 'position_data',
          label: 'Position Data',
          description: 'Quantity, entry price, current value',
          icon: DollarSign
        },
        {
          type: 'trailing_variable',
          label: 'Trailing Variables',
          description: 'Dynamic trailing stop values',
          icon: TrendingUp
        },
        {
          type: 'pnl_data',
          label: 'P&L Data',
          description: 'Profit & loss calculations',
          icon: DollarSign
        },
        ...(isOptionsTrading ? [{
          type: 'underlying_pnl',
          label: 'Underlying P&L',
          description: 'Underlying instrument P&L',
          icon: DollarSign
        }] : [])
      ]
    },
    time: {
      label: 'Time Conditions',
      icon: Clock,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50/70 hover:bg-purple-100 dark:bg-purple-950/30 dark:hover:bg-purple-900/50',
      borderColor: 'border-purple-200 dark:border-purple-800',
      iconBg: 'bg-purple-100 dark:bg-purple-900/50',
      options: [
        {
          type: 'time_function',
          label: 'Specific Time',
          description: 'Compare with specific time (e.g., 9:15 AM)',
          icon: Clock
        },
        {
          type: 'current_time',
          label: 'Current Time',
          description: 'Current market time',
          icon: Clock
        },
        {
          type: 'position_time',
          label: 'Position Entry/Exit Time',
          description: 'Entry or exit time of a position',
          icon: Timer
        },
        {
          type: 'time_offset',
          label: 'Time Offset',
          description: 'Time +/- days/hours/minutes/candles',
          icon: Timer
        }
      ]
    },
    candles: {
      label: 'Candle Ranges & Aggregations',
      icon: BarChart3,
      color: 'text-cyan-600 dark:text-cyan-400',
      bgColor: 'bg-cyan-50/70 hover:bg-cyan-100 dark:bg-cyan-950/30 dark:hover:bg-cyan-900/50',
      borderColor: 'border-cyan-200 dark:border-cyan-800',
      iconBg: 'bg-cyan-100 dark:bg-cyan-900/50',
      options: [
        {
          type: 'candle_range',
          label: 'Candle Range',
          description: 'Range of candles by count, time, or relative to reference',
          icon: BarChart3
        },
        {
          type: 'aggregation',
          label: 'Aggregation (Min/Max/Avg)',
          description: 'Min, Max, Avg, Sum, First, Last on candle range or list',
          icon: Calculator
        }
      ]
    },
    advanced: {
      label: 'Math & Variables',
      icon: Calculator,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50/70 hover:bg-orange-100 dark:bg-orange-950/30 dark:hover:bg-orange-900/50',
      borderColor: 'border-orange-200 dark:border-orange-800',
      iconBg: 'bg-orange-100 dark:bg-orange-900/50',
      options: [
        {
          type: 'math_expression',
          label: 'Math Expression',
          description: 'Combine expressions with +, -, ×, ÷ operations',
          icon: Calculator
        },
        {
          type: 'node_variable',
          label: 'Node Variables',
          description: 'Variables from other nodes',
          icon: Database
        },
        {
          type: 'list',
          label: 'List',
          description: 'List of values for aggregation or membership check',
          icon: List
        }
      ]
    },
    values: {
      label: 'Values',
      icon: Hash,
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-50/70 hover:bg-gray-100 dark:bg-gray-950/30 dark:hover:bg-gray-900/50',
      borderColor: 'border-gray-200 dark:border-gray-800',
      iconBg: 'bg-gray-100 dark:bg-gray-900/50',
      options: [
        {
          type: 'constant',
          label: 'Constant',
          description: 'Fixed numeric or text values',
          icon: Hash
        }
      ]
    }
  };

  // Filter categories if restricted to constant
  const availableCategories = restrictToConstant 
    ? { values: expressionCategories.values }
    : expressionCategories;

  const getSelectedType = () => expression?.type || '';

  const getSelectedOption = () => {
    for (const category of Object.values(availableCategories)) {
      const option = category.options.find(opt => opt.type === getSelectedType());
      if (option) return option;
    }
    return null;
  };

  const selectedOption = getSelectedOption();

  // Mobile: Flatten all options into a single list with category headers
  const getFlattenedOptions = () => {
    const flattened: Array<{ type: 'category' | 'option', data: any }> = [];
    
    Object.entries(availableCategories).forEach(([key, category]) => {
      flattened.push({ type: 'category', data: category });
      category.options.forEach(option => {
        flattened.push({ type: 'option', data: { ...option, categoryColor: category.color } });
      });
    });
    
    return flattened;
  };

  return (
    <div className="p-3 border border-violet-200 rounded-lg bg-violet-50/50 dark:border-violet-800 dark:bg-violet-950/30">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-violet-100 dark:bg-violet-900/50 border border-violet-200 dark:border-violet-700 flex items-center justify-center">
            <Edit3 className="h-3 w-3 text-violet-600 dark:text-violet-400" />
          </div>
          <label className="text-sm font-medium text-violet-700 dark:text-violet-400">
            Expression Type
            {restrictToConstant && <span className="text-orange-500 ml-1">(Values only)</span>}
          </label>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-between h-auto p-3 bg-background border-violet-300 dark:border-violet-700 hover:border-violet-500 dark:hover:border-violet-500 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-violet-500/20 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                {selectedOption ? (
                  <>
                    <selectedOption.icon className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    <div className="text-left">
                      <div className="font-medium text-sm text-violet-700 dark:text-violet-300">{selectedOption.label}</div>
                      <div className="text-xs text-violet-600 dark:text-violet-400 hidden sm:block">{selectedOption.description}</div>
                    </div>
                  </>
                ) : (
                  <span className="text-violet-600 dark:text-violet-400">Select expression type...</span>
                )}
              </div>
              <ChevronDown className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </Button>
          </DropdownMenuTrigger>
        
        <DropdownMenuContent className={`${isMobile ? 'w-[calc(100vw-2rem)]' : 'w-80'} max-h-[400px] overflow-y-auto bg-background`}>
          {isMobile ? (
            // Mobile: Single flat list with category separators
            getFlattenedOptions().map((item, index) => {
              if (item.type === 'category') {
                return (
                  <div key={`category-${index}`}>
                    {index > 0 && <DropdownMenuSeparator />}
                    <DropdownMenuLabel className="flex items-center gap-2 py-3">
                      <item.data.icon className={`h-4 w-4 ${item.data.color}`} />
                      <span className="font-medium">{item.data.label}</span>
                    </DropdownMenuLabel>
                  </div>
                );
              } else {
                const option = item.data;
                return (
                  <DropdownMenuItem
                    key={option.type}
                    onClick={() => handleTypeChange(option.type)}
                    className="flex items-start gap-3 p-4 cursor-pointer min-h-[60px] command-item-mobile"
                  >
                    <option.icon className={`h-5 w-5 flex-shrink-0 mt-1 ${option.categoryColor}`} />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{option.label}</div>
                      <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{option.description}</div>
                    </div>
                  </DropdownMenuItem>
                );
              }
            })
          ) : (
            // Desktop: Sub-menu structure
            Object.entries(availableCategories).map(([key, category]) => (
              <DropdownMenuSub key={key}>
                <DropdownMenuSubTrigger className="flex items-center gap-2">
                  <category.icon className={`h-4 w-4 ${category.color}`} />
                  <span>{category.label}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-80 bg-popover border border-border shadow-xl rounded-lg p-2">
                  {category.options.map((option) => (
                    <DropdownMenuItem
                      key={option.type}
                      onClick={() => handleTypeChange(option.type)}
                      className={`flex items-center gap-3 p-3 cursor-pointer rounded-md transition-all duration-200 group border-0 ${category.bgColor}`}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-md ${category.iconBg} border ${category.borderColor} flex items-center justify-center group-hover:scale-105 transition-all duration-200`}>
                        <option.icon className={`h-4 w-4 ${category.color} group-hover:scale-110 transition-transform duration-200`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium text-sm ${category.color} mb-0.5`}>
                          {option.label}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-2 leading-4">
                          {option.description}
                        </div>
                      </div>
                      <div className={`w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-current opacity-30 transition-colors duration-200 ${category.color}`} />
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            ))
          )}
        </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default TabbedExpressionTypeSelector;