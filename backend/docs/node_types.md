
# Trading Strategy Node Types

This document describes the various node types used in the Trading Strategy Builder and how they are processed by the backend.

## Start Node

The Start Node is the entry point of every strategy and defines the core settings.

### Data Structure
```json
{
  "id": "start-123456",
  "type": "startNode",
  "data": {
    "label": "My NIFTY Strategy",
    "timeframe": "5MIN",
    "exchange": "NSE",
    "symbol": "NIFTY",
    "tradingInstrument": {
      "type": "options",
      "underlyingType": "index"
    },
    "indicators": ["sma_1", "rsi_1"],
    "indicatorParameters": {
      "sma_1": {
        "period": 20,
        "source": "close"
      },
      "rsi_1": {
        "period": 14,
        "overbought": 70,
        "oversold": 30
      }
    }
  }
}
```

### Processing Logic
1. The backend fetches market data for the specified symbol and timeframe
2. Technical indicators are calculated using the provided parameters
3. Indicator values are made available to downstream nodes

## Signal Node

Signal Nodes generate trading signals based on conditions.

### Data Structure
```json
{
  "id": "signal-123456",
  "type": "signalNode",
  "data": {
    "label": "RSI Oversold",
    "conditions": [
      {
        "groupLogic": "AND",
        "conditions": [
          {
            "lhs": {
              "type": "indicator",
              "name": "rsi_1",
              "offset": 0
            },
            "operator": "<",
            "rhs": {
              "type": "constant",
              "value": 30
            }
          }
        ]
      }
    ]
  }
}
```

### Processing Logic
1. The backend evaluates the conditions using market data and calculated indicators
2. If conditions are met, execution proceeds to connected nodes
3. If conditions are not met, the execution path is terminated

## Entry Node

Entry Nodes create trading positions when conditions are met.

### Data Structure
```json
{
  "id": "entry-123456",
  "type": "entryNode",
  "data": {
    "label": "Buy NIFTY",
    "positions": [
      {
        "id": "pos-123456",
        "vpi": "vpi-123456",
        "vpt": "long-position",
        "positionType": "buy",
        "orderType": "market",
        "lots": 1,
        "productType": "intraday"
      }
    ]
  }
}
```

### Processing Logic
1. The backend creates virtual positions based on the configuration
2. Position details are tracked in the execution state
3. Entry prices are determined from market data

## Exit Node

Exit Nodes close trading positions when conditions are met.

### Data Structure
```json
{
  "id": "exit-123456",
  "type": "exitNode",
  "data": {
    "label": "Close Position",
    "exitType": "all",
    "positions": [
      {
        "id": "exit-pos-123456",
        "vpi": "vpi-123456",
        "positionType": "sell",
        "orderType": "market",
        "lots": 1
      }
    ]
  }
}
```

### Processing Logic
1. The backend identifies positions to close based on VPI/VPT
2. Position exit prices are determined from market data
3. P&L is calculated for closed positions

## Alert Node

Alert Nodes generate notifications without affecting positions.

### Data Structure
```json
{
  "id": "alert-123456",
  "type": "alertNode",
  "data": {
    "label": "RSI Alert",
    "alertMessage": "RSI is below 30, market might be oversold",
    "alertType": "info"
  }
}
```

### Processing Logic
1. The backend generates an alert with the specified message
2. Alert details are included in the execution results
3. No position changes are made

## Modify Node

Modify Nodes adjust existing positions (e.g., move stop loss).

### Data Structure
```json
{
  "id": "modify-123456",
  "type": "modifyNode",
  "data": {
    "label": "Adjust Stop Loss",
    "modifyType": "stopLoss",
    "positions": [
      {
        "id": "mod-pos-123456",
        "vpi": "vpi-123456",
        "stopLoss": {
          "type": "price",
          "value": 17500
        }
      }
    ]
  }
}
```

### Processing Logic
1. The backend identifies positions to modify based on VPI/VPT
2. Position parameters are updated as specified
3. Modified position details are included in execution results

## End Node

End Nodes represent normal termination of a strategy path.

### Data Structure
```json
{
  "id": "end-123456",
  "type": "endNode",
  "data": {
    "label": "End Strategy"
  }
}
```

### Processing Logic
1. The backend marks the execution path as complete
2. No further nodes are processed on this path

## Force End Node

Force End Nodes terminate the strategy and close all positions.

### Data Structure
```json
{
  "id": "forceend-123456",
  "type": "forceEndNode",
  "data": {
    "label": "Force End Strategy",
    "closePositions": true
  }
}
```

### Processing Logic
1. The backend terminates all execution paths
2. All open positions are closed if `closePositions` is true
3. Execution is considered complete

## Processing Flow

Nodes are processed in the order determined by the strategy graph:

1. The Start Node initializes strategy execution
2. Signal Nodes determine which paths to follow
3. Action Nodes (Entry, Exit, Modify) manage positions
4. Alert Nodes generate notifications
5. End Nodes terminate execution paths

Each node's output becomes the input for connected nodes, forming a complete execution flow.
