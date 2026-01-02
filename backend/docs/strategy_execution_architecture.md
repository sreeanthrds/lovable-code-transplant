
# Strategy Execution Architecture

## Overview

The Trading Strategy Builder backend is designed to execute visual node-based trading strategies against real market data. This document provides comprehensive architecture and implementation details for the Python backend system.

## Core Architecture Principles

### 1. Strategy as Directed Graph
- Each strategy is represented as a directed acyclic graph (DAG)
- Nodes represent operations (signals, actions, decisions)
- Edges represent execution flow and data dependencies
- Graph traversal determines execution order

### 2. Node-Based Execution Engine
- Each node type has a dedicated processor class
- Nodes maintain state during execution
- Data flows between nodes through standardized interfaces
- Execution context maintains global strategy state

### 3. Real-Time Data Integration
- Market data streams are abstracted through data providers
- Technical indicators are calculated in real-time
- Position tracking and P&L calculation
- Alert and notification system

## Node Type Architecture

### Base Node Interface

```python
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from datetime import datetime

@dataclass
class ExecutionContext:
    strategy_id: str
    current_time: datetime
    market_data: Dict[str, Any]
    indicators: Dict[str, Any]
    positions: List[Dict[str, Any]]
    alerts: List[Dict[str, Any]]
    execution_state: Dict[str, Any]

class BaseNode(ABC):
    def __init__(self, node_id: str, node_data: Dict[str, Any]):
        self.node_id = node_id
        self.node_data = node_data
        self.node_type = self.__class__.__name__
        
    @abstractmethod
    def execute(self, context: ExecutionContext) -> Dict[str, Any]:
        """Execute the node logic and return results"""
        pass
    
    @abstractmethod
    def validate(self) -> List[str]:
        """Validate node configuration, return list of errors"""
        pass
```

### 1. Start Node

**Purpose**: Initialize strategy execution with instrument settings and technical indicators

**Data Structure**:
```python
{
    "id": "start-123456",
    "type": "startNode",
    "data": {
        "label": "NIFTY Options Strategy",
        "symbol": "NIFTY",
        "timeframe": "5MIN",
        "exchange": "NSE",
        "tradingInstrument": {
            "type": "options",
            "underlyingType": "index"
        },
        "indicators": {
            "sma_20": {
                "type": "sma",
                "period": 20,
                "source": "close"
            },
            "rsi_14": {
                "type": "rsi",
                "period": 14,
                "overbought": 70,
                "oversold": 30
            }
        }
    }
}
```

**Implementation**:
```python
class StartNode(BaseNode):
    def execute(self, context: ExecutionContext) -> Dict[str, Any]:
        # Initialize market data connection
        symbol = self.node_data["symbol"]
        timeframe = self.node_data["timeframe"]
        
        # Fetch historical and real-time data
        market_data = self.fetch_market_data(symbol, timeframe)
        
        # Calculate technical indicators
        indicators = self.calculate_indicators(market_data)
        
        # Update context
        context.market_data = market_data
        context.indicators = indicators
        
        return {
            "success": True,
            "next_nodes": self.get_connected_nodes(),
            "data": {
                "symbol": symbol,
                "timeframe": timeframe,
                "market_data_points": len(market_data),
                "indicators_calculated": list(indicators.keys())
            }
        }
    
    def calculate_indicators(self, market_data: List[Dict]) -> Dict[str, Any]:
        indicators = {}
        for indicator_name, config in self.node_data.get("indicators", {}).items():
            if config["type"] == "sma":
                indicators[indicator_name] = self.calculate_sma(
                    market_data, config["period"], config["source"]
                )
            elif config["type"] == "rsi":
                indicators[indicator_name] = self.calculate_rsi(
                    market_data, config["period"]
                )
        return indicators
```

### 2. Signal Nodes

**Purpose**: Evaluate market conditions and generate trading signals

**Data Structure**:
```python
{
    "id": "signal-123456",
    "type": "signalNode",
    "data": {
        "label": "RSI Oversold Signal",
        "conditions": {
            "type": "group",
            "operator": "and",
            "conditions": [
                {
                    "id": "cond-1",
                    "lhs": {
                        "type": "indicator",
                        "name": "rsi_14",
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
    }
}
```

**Implementation**:
```python
class SignalNode(BaseNode):
    def execute(self, context: ExecutionContext) -> Dict[str, Any]:
        conditions = self.node_data.get("conditions", {})
        signal_triggered = self.evaluate_conditions(conditions, context)
        
        return {
            "success": True,
            "signal_triggered": signal_triggered,
            "next_nodes": self.get_connected_nodes() if signal_triggered else [],
            "data": {
                "conditions_met": signal_triggered,
                "evaluation_time": context.current_time.isoformat()
            }
        }
    
    def evaluate_conditions(self, conditions: Dict, context: ExecutionContext) -> bool:
        if conditions["type"] == "group":
            return self.evaluate_group_conditions(conditions, context)
        else:
            return self.evaluate_single_condition(conditions, context)
    
    def evaluate_single_condition(self, condition: Dict, context: ExecutionContext) -> bool:
        lhs_value = self.get_expression_value(condition["lhs"], context)
        rhs_value = self.get_expression_value(condition["rhs"], context)
        operator = condition["operator"]
        
        return self.apply_operator(lhs_value, operator, rhs_value)
```

### 3. Entry Nodes

**Purpose**: Create new trading positions when signals are triggered

**Data Structure**:
```python
{
    "id": "entry-123456",
    "type": "entryNode",
    "data": {
        "label": "Buy NIFTY Call",
        "actionType": "entry",
        "positions": [
            {
                "id": "pos-123456",
                "vpi": "entry-123456-pos1",
                "vpt": "nifty-call-long",
                "priority": 1,
                "positionType": "buy",
                "orderType": "market",
                "quantity": 1,
                "multiplier": 50,
                "productType": "intraday",
                "optionDetails": {
                    "expiry": "W0",
                    "strikeType": "ATM",
                    "optionType": "CE"
                }
            }
        ]
    }
}
```

**Implementation**:
```python
class EntryNode(BaseNode):
    def execute(self, context: ExecutionContext) -> Dict[str, Any]:
        positions_created = []
        
        for position_config in self.node_data.get("positions", []):
            # Calculate actual instrument details
            instrument = self.resolve_instrument(position_config, context)
            
            # Create position entry
            position = {
                "id": position_config["id"],
                "vpi": position_config["vpi"],
                "vpt": position_config.get("vpt", ""),
                "instrument": instrument,
                "position_type": position_config["positionType"],
                "quantity": position_config["quantity"],
                "entry_price": self.get_entry_price(position_config, context),
                "entry_time": context.current_time,
                "status": "open"
            }
            
            positions_created.append(position)
            context.positions.append(position)
        
        return {
            "success": True,
            "positions_created": len(positions_created),
            "next_nodes": self.get_connected_nodes(),
            "data": {
                "positions": positions_created
            }
        }
    
    def resolve_instrument(self, position_config: Dict, context: ExecutionContext) -> str:
        if "optionDetails" in position_config:
            return self.resolve_options_instrument(position_config, context)
        else:
            return context.market_data["symbol"]
```

### 4. Exit Nodes

**Purpose**: Close existing positions when exit conditions are met

**Data Structure**:
```python
{
    "id": "exit-123456",
    "type": "exitNode",
    "data": {
        "label": "Exit Position",
        "actionType": "exit",
        "exitNodeData": {
            "orderConfig": {
                "orderType": "market",
                "quantity": "all"
            },
            "reEntryConfig": {
                "enabled": true,
                "groupNumber": 1,
                "maxReEntries": 2
            }
        }
    }
}
```

**Implementation**:
```python
class ExitNode(BaseNode):
    def execute(self, context: ExecutionContext) -> Dict[str, Any]:
        order_config = self.node_data.get("exitNodeData", {}).get("orderConfig", {})
        positions_closed = []
        
        # Find positions to close
        target_positions = self.find_target_positions(context)
        
        for position in target_positions:
            # Calculate exit details
            exit_price = self.get_exit_price(order_config, context)
            pnl = self.calculate_pnl(position, exit_price)
            
            # Close position
            position["status"] = "closed"
            position["exit_price"] = exit_price
            position["exit_time"] = context.current_time
            position["pnl"] = pnl
            
            positions_closed.append(position)
        
        # Handle re-entry logic
        re_entry_triggered = self.check_re_entry_conditions()
        next_nodes = self.get_next_nodes(re_entry_triggered)
        
        return {
            "success": True,
            "positions_closed": len(positions_closed),
            "re_entry_triggered": re_entry_triggered,
            "next_nodes": next_nodes,
            "data": {
                "closed_positions": positions_closed,
                "total_pnl": sum(p["pnl"] for p in positions_closed)
            }
        }
```

### 5. Alert Nodes

**Purpose**: Generate notifications and alerts without affecting positions

**Data Structure**:
```python
{
    "id": "alert-123456",
    "type": "alertNode",
    "data": {
        "label": "RSI Alert",
        "actionType": "alert",
        "alertMessage": "RSI crossed below 30 - Potential oversold condition",
        "alertType": "info"
    }
}
```

**Implementation**:
```python
class AlertNode(BaseNode):
    def execute(self, context: ExecutionContext) -> Dict[str, Any]:
        alert = {
            "id": f"alert-{uuid.uuid4()}",
            "node_id": self.node_id,
            "message": self.node_data.get("alertMessage", "Strategy alert"),
            "alert_type": self.node_data.get("alertType", "info"),
            "timestamp": context.current_time,
            "market_data": {
                "price": context.market_data.get("close"),
                "indicators": {k: v[-1] if isinstance(v, list) else v 
                             for k, v in context.indicators.items()}
            }
        }
        
        context.alerts.append(alert)
        
        return {
            "success": True,
            "alert_generated": True,
            "next_nodes": self.get_connected_nodes(),
            "data": alert
        }
```

## Strategy Execution Engine

### Core Components

```python
class StrategyExecutor:
    def __init__(self, strategy_json: Dict[str, Any]):
        self.strategy = strategy_json
        self.nodes = self.parse_nodes()
        self.edges = self.parse_edges()
        self.execution_graph = self.build_execution_graph()
    
    def execute(self, market_data_stream):
        context = ExecutionContext(
            strategy_id=self.strategy["id"],
            current_time=datetime.now(),
            market_data={},
            indicators={},
            positions=[],
            alerts=[],
            execution_state={}
        )
        
        # Start with the start node
        current_nodes = self.find_start_nodes()
        
        while current_nodes:
            next_nodes = []
            
            for node_id in current_nodes:
                node = self.nodes[node_id]
                result = node.execute(context)
                
                if result["success"]:
                    next_nodes.extend(result.get("next_nodes", []))
            
            current_nodes = next_nodes
        
        return self.generate_execution_report(context)
```

## Data Provider Integration

### Market Data Interface

```python
class MarketDataProvider(ABC):
    @abstractmethod
    def get_historical_data(self, symbol: str, timeframe: str, periods: int) -> List[Dict]:
        pass
    
    @abstractmethod
    def get_real_time_data(self, symbol: str) -> Dict:
        pass
    
    @abstractmethod
    def subscribe_to_stream(self, symbol: str, callback: callable) -> str:
        pass

class NSEDataProvider(MarketDataProvider):
    def get_historical_data(self, symbol: str, timeframe: str, periods: int) -> List[Dict]:
        # Implementation for NSE data fetching
        pass
    
    def get_real_time_data(self, symbol: str) -> Dict:
        # Implementation for real-time NSE data
        pass
```

## Position Management

```python
class PositionManager:
    def __init__(self):
        self.positions = {}
        self.position_history = []
    
    def create_position(self, position_data: Dict) -> str:
        position_id = position_data["id"]
        self.positions[position_id] = position_data
        return position_id
    
    def close_position(self, position_id: str, exit_price: float) -> Dict:
        position = self.positions[position_id]
        pnl = self.calculate_pnl(position, exit_price)
        
        position["status"] = "closed"
        position["exit_price"] = exit_price
        position["pnl"] = pnl
        
        self.position_history.append(position.copy())
        del self.positions[position_id]
        
        return position
    
    def calculate_pnl(self, position: Dict, exit_price: float) -> float:
        entry_price = position["entry_price"]
        quantity = position["quantity"]
        multiplier = position.get("multiplier", 1)
        
        if position["position_type"] == "buy":
            return (exit_price - entry_price) * quantity * multiplier
        else:
            return (entry_price - exit_price) * quantity * multiplier
```

## API Endpoints

### Strategy Execution API

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class StrategyExecutionRequest(BaseModel):
    strategy: Dict[str, Any]
    execution_mode: str = "backtest"  # backtest, paper, live
    start_date: Optional[str] = None
    end_date: Optional[str] = None

@app.post("/strategies/execute")
async def execute_strategy(request: StrategyExecutionRequest):
    try:
        executor = StrategyExecutor(request.strategy)
        
        if request.execution_mode == "backtest":
            result = executor.backtest(request.start_date, request.end_date)
        elif request.execution_mode == "paper":
            result = executor.paper_trade()
        else:
            result = executor.live_trade()
        
        return {
            "execution_id": result["execution_id"],
            "status": "completed",
            "results": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/strategies/executions/{execution_id}")
async def get_execution_results(execution_id: str):
    # Return execution results and performance metrics
    pass
```

## Performance Metrics

```python
class PerformanceCalculator:
    def calculate_metrics(self, positions: List[Dict], market_data: List[Dict]) -> Dict:
        closed_positions = [p for p in positions if p["status"] == "closed"]
        
        total_pnl = sum(p["pnl"] for p in closed_positions)
        winning_trades = [p for p in closed_positions if p["pnl"] > 0]
        losing_trades = [p for p in closed_positions if p["pnl"] < 0]
        
        win_rate = len(winning_trades) / len(closed_positions) if closed_positions else 0
        avg_win = sum(p["pnl"] for p in winning_trades) / len(winning_trades) if winning_trades else 0
        avg_loss = sum(p["pnl"] for p in losing_trades) / len(losing_trades) if losing_trades else 0
        
        return {
            "total_pnl": total_pnl,
            "total_trades": len(closed_positions),
            "winning_trades": len(winning_trades),
            "losing_trades": len(losing_trades),
            "win_rate": win_rate,
            "avg_win": avg_win,
            "avg_loss": avg_loss,
            "profit_factor": abs(avg_win / avg_loss) if avg_loss != 0 else float('inf'),
            "max_drawdown": self.calculate_max_drawdown(closed_positions)
        }
```

This architecture provides a comprehensive foundation for implementing the strategy execution backend with real market data integration.
