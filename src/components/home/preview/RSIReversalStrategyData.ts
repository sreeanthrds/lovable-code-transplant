import { Node, Edge } from '@xyflow/react';

// RSI Reversal Strategy - Static JSON data for homepage preview
// This is a real 19-node strategy for demonstrating the visual programming canvas

export const rsiReversalEdges: Edge[] = [
  {
    id: "xy-edge__strategy-controller-entry-condition-1",
    style: { strokeWidth: 2 },
    source: "strategy-controller",
    target: "entry-condition-1",
    animated: true
  },
  {
    id: "xy-edge__strategy-controller-entry-condition-2",
    style: { strokeWidth: 2 },
    source: "strategy-controller",
    target: "entry-condition-2",
    animated: true
  },
  {
    id: "xy-edge__strategy-controller-square-off-1",
    style: { strokeWidth: 2 },
    source: "strategy-controller",
    target: "square-off-1",
    animated: true
  },
  {
    id: "xy-edge__entry-condition-1-entry-2",
    style: { strokeWidth: 2 },
    source: "entry-condition-1",
    target: "entry-2",
    animated: true
  },
  {
    id: "xy-edge__entry-condition-2-entry-3",
    style: { strokeWidth: 2 },
    source: "entry-condition-2",
    target: "entry-3",
    animated: true
  },
  {
    id: "xy-edge__entry-2-exit-condition-1",
    style: { strokeWidth: 2 },
    source: "entry-2",
    target: "exit-condition-1",
    animated: true
  },
  {
    id: "xy-edge__entry-2-exit-condition-2",
    style: { strokeWidth: 2 },
    source: "entry-2",
    target: "exit-condition-2",
    animated: true
  },
  {
    id: "xy-edge__entry-3-exit-condition-3",
    style: { strokeWidth: 2 },
    source: "entry-3",
    target: "exit-condition-3",
    animated: true
  },
  {
    id: "xy-edge__entry-3-exit-condition-4",
    style: { strokeWidth: 2 },
    source: "entry-3",
    target: "exit-condition-4",
    animated: true
  },
  {
    id: "xy-edge__exit-condition-1-exit-2",
    style: { strokeWidth: 2 },
    source: "exit-condition-1",
    target: "exit-2",
    animated: true
  },
  {
    id: "xy-edge__exit-condition-2-exit-3",
    style: { strokeWidth: 2 },
    source: "exit-condition-2",
    target: "exit-3",
    animated: true
  },
  {
    id: "xy-edge__exit-condition-3-exit-5",
    style: { strokeWidth: 2 },
    source: "exit-condition-3",
    target: "exit-5",
    animated: true
  },
  {
    id: "xy-edge__exit-condition-4-exit-6",
    style: { strokeWidth: 2 },
    source: "exit-condition-4",
    target: "exit-6",
    animated: true
  },
  {
    id: "xy-edge__exit-2-re-entry-signal-1",
    style: { strokeWidth: 2 },
    source: "exit-2",
    target: "re-entry-signal-1",
    animated: true
  },
  {
    id: "e-re-entry-signal-1-entry-2",
    style: { strokeWidth: 2 },
    source: "re-entry-signal-1",
    target: "entry-2",
    animated: true
  },
  {
    id: "xy-edge__exit-3-re-entry-signal-2",
    style: { strokeWidth: 2 },
    source: "exit-3",
    target: "re-entry-signal-2",
    animated: true
  },
  {
    id: "xy-edge__exit-5-re-entry-signal-3",
    style: { strokeWidth: 2 },
    source: "exit-5",
    target: "re-entry-signal-3",
    animated: true
  },
  {
    id: "xy-edge__exit-6-re-entry-signal-4",
    style: { strokeWidth: 2 },
    source: "exit-6",
    target: "re-entry-signal-4",
    animated: true
  },
  {
    id: "e-re-entry-signal-2-entry-2",
    style: { strokeWidth: 2 },
    source: "re-entry-signal-2",
    target: "entry-2",
    animated: true
  },
  {
    id: "e-re-entry-signal-3-entry-3",
    style: { strokeWidth: 2 },
    source: "re-entry-signal-3",
    target: "entry-3",
    animated: true
  },
  {
    id: "e-re-entry-signal-4-entry-3",
    style: { strokeWidth: 2 },
    source: "re-entry-signal-4",
    target: "entry-3",
    animated: true
  }
];

export const rsiReversalNodes: Node[] = [
  // Level 0: Start Node (top center)
  {
    id: "strategy-controller",
    data: {
      label: "Start",
      exchange: "NSE",
      tradingInstrument: {
        type: "options",
        underlyingType: "index"
      },
      tradingInstrumentConfig: {
        type: "options",
        symbol: "NIFTY",
        timeframes: [
          {
            id: "1m",
            unit: "minutes",
            number: 1,
            timeframe: "1m",
            indicators: {
              rsi_1764509210372: {
                length: 14,
                price_field: "close",
                display_name: "rsi(14,close)",
                indicator_name: "rsi"
              }
            }
          }
        ]
      }
    },
    type: "startNode",
    position: { x: 600, y: 0 }
  },
  // Level 1: Square Off (left branch) and Entry Signals
  {
    id: "square-off-1",
    data: {
      label: "Square off off",
      message: "Strategy forcibly stopped - all positions closed",
      endConditions: {
        timeBasedExit: {
          enabled: true,
          exitAtMarketClose: true,
          minutesBeforeClose: 5
        },
        positionClosure: {
          orderType: "market",
          forceClose: true
        }
      }
    },
    type: "squareOffNode",
    position: { x: 0, y: 280 }
  },
  {
    id: "entry-condition-1",
    data: {
      label: "Entry condition - Bullish",
      variables: [
        {
          id: "var-1764509521541",
          name: "SignalLow",
          nodeId: "entry-condition-1",
          expressionPreview: "Previous[TI.tf_1m.Low]"
        }
      ],
      conditionsPreview: "Current Time >= 09:17 AND Previous[TI.tf_1m.rsi(14,close)] < 30 AND TI.underlying_ltp > Previous[TI.tf_1m.High]"
    },
    type: "entrySignalNode",
    position: { x: 350, y: 280 }
  },
  {
    id: "entry-condition-2",
    data: {
      label: "Entry condition - Bearish",
      variables: [
        {
          id: "var-1764509521541",
          name: "SignalHigh",
          nodeId: "entry-condition-1",
          expressionPreview: "Previous[TI.tf_1m.High]"
        }
      ],
      conditionsPreview: "Current Time > 09:17 AND Previous[TI.1m.rsi(14,close)] > 70 AND TI.underlying_ltp < Previous[TI.1m.Low]"
    },
    type: "entrySignalNode",
    position: { x: 850, y: 280 }
  },
  // Level 2: Entry Nodes
  {
    id: "entry-2",
    data: {
      label: "Entry 2 - Bullish",
      positions: [
        {
          vpi: "entry-2-pos1",
          priority: 1,
          quantity: 1,
          orderType: "market",
          maxEntries: 9,
          multiplier: 75,
          productType: "intraday",
          positionType: "sell",
          optionDetails: {
            expiry: "W1",
            optionType: "PE",
            strikeType: "ATM"
          }
        }
      ],
      actionType: "entry",
      instrument: "NIFTY"
    },
    type: "entryNode",
    position: { x: 350, y: 520 }
  },
  {
    id: "entry-3",
    data: {
      label: "Entry 3 - Bearish",
      positions: [
        {
          vpi: "entry-3-pos1",
          priority: 1,
          quantity: 1,
          orderType: "market",
          maxEntries: 10,
          multiplier: 75,
          productType: "intraday",
          positionType: "sell",
          optionDetails: {
            expiry: "W1",
            optionType: "CE",
            strikeType: "ATM"
          }
        }
      ],
      actionType: "entry",
      instrument: "NIFTY"
    },
    type: "entryNode",
    position: { x: 850, y: 520 }
  },
  // Level 3: Exit Signal Nodes (Target & SL for each entry)
  {
    id: "exit-condition-1",
    data: {
      label: "Exit condition - Target",
      conditionsPreview: "Previous[TI.tf_1m.rsi(14,close)] > 70",
      hasReEntryExitConditions: true,
      reEntryExitConditionsPreview: "Previous[TI.tf_1m.rsi(14,close)] > 70"
    },
    type: "exitSignalNode",
    position: { x: 200, y: 760 }
  },
  {
    id: "exit-condition-2",
    data: {
      label: "Exit condition - SL",
      conditionsPreview: "Previous[TI.tf_1m.rsi(14,close)] < 30 AND Previous[TI.tf_1m.Close] < entry_condition_1.SignalLow",
      hasReEntryExitConditions: true,
      reEntryExitConditionsPreview: "Previous[TI.tf_1m.rsi(14,close)] < 30 AND Previous[TI.tf_1m.Close] < re_entry_signal_2.SignalLow"
    },
    type: "exitSignalNode",
    position: { x: 500, y: 760 }
  },
  {
    id: "exit-condition-3",
    data: {
      label: "Exit condition - Target",
      conditionsPreview: "Previous[TI.tf_1m.rsi(14,close)] < 30",
      hasReEntryExitConditions: true,
      reEntryExitConditionsPreview: "Previous[TI.tf_1m.rsi(14,close)] < 30"
    },
    type: "exitSignalNode",
    position: { x: 700, y: 760 }
  },
  {
    id: "exit-condition-4",
    data: {
      label: "Exit condition - SL",
      conditionsPreview: "Previous[TI.tf_1m.rsi(14,close)] > 70 AND Previous[TI.tf_1m.Close] > entry_condition_2.SignalHigh",
      hasReEntryExitConditions: true,
      reEntryExitConditionsPreview: "Previous[TI.tf_1m.rsi(14,close)] > 70 AND Previous[TI.tf_1m.Close] > re_entry_signal_4.SignalHigh"
    },
    type: "exitSignalNode",
    position: { x: 1000, y: 760 }
  },
  // Level 4: Exit Nodes
  {
    id: "exit-2",
    data: {
      label: "Exit 2 - Target",
      exitType: "specific",
      actionType: "exit",
      instrument: "NIFTY",
      exitNodeData: {
        orderConfig: {
          orderType: "market",
          targetPositionVpi: "entry-2-pos1"
        },
        reEntryConfig: {
          enabled: false,
          maxReEntries: 1
        }
      }
    },
    type: "exitNode",
    position: { x: 200, y: 1000 }
  },
  {
    id: "exit-3",
    data: {
      label: "Exit 3 - SL",
      exitType: "specific",
      actionType: "exit",
      instrument: "NIFTY",
      exitNodeData: {
        orderConfig: {
          orderType: "market",
          targetPositionVpi: "entry-2-pos1"
        },
        reEntryConfig: {
          enabled: false,
          maxReEntries: 1
        }
      }
    },
    type: "exitNode",
    position: { x: 500, y: 1000 }
  },
  {
    id: "exit-5",
    data: {
      label: "Exit 5 - Target",
      exitType: "specific",
      actionType: "exit",
      exitNodeData: {
        orderConfig: {
          quantity: "all",
          orderType: "market",
          targetPositionVpi: "entry-3-pos1"
        },
        reEntryConfig: {
          enabled: false,
          maxReEntries: 1
        }
      }
    },
    type: "exitNode",
    position: { x: 700, y: 1000 }
  },
  {
    id: "exit-6",
    data: {
      label: "Exit 6 - SL",
      exitType: "specific",
      actionType: "exit",
      exitNodeData: {
        orderConfig: {
          orderType: "market",
          targetPositionVpi: "entry-3-pos1"
        },
        reEntryConfig: {
          enabled: false,
          maxReEntries: 1
        }
      }
    },
    type: "exitNode",
    position: { x: 1000, y: 1000 }
  },
  // Level 5: Re-Entry Signal Nodes (loop back to entries)
  {
    id: "re-entry-signal-1",
    data: {
      label: "Re-Entry - Target",
      conditionsPreview: "Previous[TI.tf_1m.rsi(14,close)] < 30 AND TI.underlying_ltp > Previous[TI.tf_1m.High]",
      retryConfig: {
        maxEntries: 9,
        groupNumber: 1,
        maxReEntries: 10
      },
      targetEntryNodeId: "entry-2"
    },
    type: "reEntrySignalNode",
    position: { x: 200, y: 1240 }
  },
  {
    id: "re-entry-signal-2",
    data: {
      label: "Re-Entry - SL",
      variables: [
        {
          id: "var-1764510043919",
          name: "SignalLow",
          nodeId: "re-entry-signal-1",
          expressionPreview: "Previous[TI.tf_1m.Low]"
        }
      ],
      conditionsPreview: "Previous[TI.tf_1m.rsi(14,close)] < 30 AND TI.underlying_ltp > Previous[TI.tf_1m.High]",
      retryConfig: {
        maxEntries: 9,
        groupNumber: 1,
        maxReEntries: 10
      },
      targetEntryNodeId: "entry-2"
    },
    type: "reEntrySignalNode",
    position: { x: 500, y: 1240 }
  },
  {
    id: "re-entry-signal-3",
    data: {
      label: "Re-Entry - Target",
      conditionsPreview: "Previous[TI.tf_1m.rsi(14,close)] > 70 AND TI.underlying_ltp < Previous[TI.tf_1m.Low]",
      retryConfig: {
        maxEntries: 10,
        groupNumber: 1,
        maxReEntries: 10
      },
      targetEntryNodeId: "entry-3"
    },
    type: "reEntrySignalNode",
    position: { x: 700, y: 1240 }
  },
  {
    id: "re-entry-signal-4",
    data: {
      label: "Re-Entry - SL",
      variables: [
        {
          id: "var-1764537100109",
          name: "SignalHigh",
          nodeId: "re-entry-signal-4",
          expressionPreview: "Previous[TI.tf_1m.High]"
        }
      ],
      conditionsPreview: "Previous[TI.tf_1m.rsi(14,close)] > 70 AND TI.underlying_ltp < Previous[TI.tf_1m.Low]",
      retryConfig: {
        maxEntries: 10,
        groupNumber: 1,
        maxReEntries: 10
      },
      targetEntryNodeId: "entry-3"
    },
    type: "reEntrySignalNode",
    position: { x: 1000, y: 1240 }
  }
];

// Strategy metadata
export const rsiReversalStrategyInfo = {
  name: "RSI Reversal Strategy",
  description: "A complete trading strategy using RSI indicator for bullish and bearish entries with target and stop-loss exits, plus re-entry logic.",
  instrument: "NIFTY",
  exchange: "NSE",
  nodeCount: 18,
  edgeCount: 21
};
