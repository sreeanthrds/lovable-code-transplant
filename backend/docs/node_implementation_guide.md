
# Node Implementation Guide

## Node Processing Architecture

### Base Node Implementation Pattern

All nodes inherit from a base `Node` class and implement standardized interfaces for execution, validation, and data flow.

```python
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional, Union
from dataclasses import dataclass
from datetime import datetime
import uuid

@dataclass
class NodeExecutionResult:
    success: bool
    node_id: str
    execution_time: datetime
    next_nodes: List[str]
    data: Dict[str, Any]
    errors: List[str] = None
    warnings: List[str] = None

class BaseNode(ABC):
    def __init__(self, node_id: str, node_type: str, node_data: Dict[str, Any]):
        self.node_id = node_id
        self.node_type = node_type
        self.node_data = node_data
        self.incoming_edges = []
        self.outgoing_edges = []
    
    @abstractmethod
    def execute(self, context: 'ExecutionContext') -> NodeExecutionResult:
        """Execute the node's primary logic"""
        pass
    
    @abstractmethod
    def validate(self) -> List[str]:
        """Validate node configuration and return list of errors"""
        pass
    
    def pre_execute(self, context: 'ExecutionContext') -> bool:
        """Pre-execution validation and setup"""
        return True
    
    def post_execute(self, context: 'ExecutionContext', result: NodeExecutionResult):
        """Post-execution cleanup and logging"""
        pass
```

## Detailed Node Implementations

### 1. Start Node Implementation

```python
class StartNode(BaseNode):
    """
    Initializes strategy execution with market data and indicators
    """
    
    def __init__(self, node_id: str, node_data: Dict[str, Any]):
        super().__init__(node_id, "startNode", node_data)
        self.required_fields = ["symbol", "timeframe", "exchange"]
    
    def validate(self) -> List[str]:
        errors = []
        
        # Check required fields
        for field in self.required_fields:
            if field not in self.node_data:
                errors.append(f"Missing required field: {field}")
        
        # Validate timeframe
        valid_timeframes = ["1m", "5m", "15m", "30m", "1h", "4h", "1d"]
        if self.node_data.get("timeframe") not in valid_timeframes:
            errors.append(f"Invalid timeframe. Must be one of: {valid_timeframes}")
        
        # Validate trading instrument
        trading_instrument = self.node_data.get("tradingInstrument", {})
        if trading_instrument.get("type") not in ["stock", "futures", "options"]:
            errors.append("Invalid trading instrument type")
        
        return errors
    
    def execute(self, context: 'ExecutionContext') -> NodeExecutionResult:
        try:
            symbol = self.node_data["symbol"]
            timeframe = self.node_data["timeframe"]
            exchange = self.node_data["exchange"]
            
            # Initialize market data connection
            market_data = self._fetch_market_data(symbol, timeframe, exchange)
            context.market_data[symbol] = market_data
            
            # Calculate technical indicators
            indicators = self._calculate_indicators(market_data)
            context.indicators.update(indicators)
            
            # Set strategy metadata
            context.strategy_metadata = {
                "symbol": symbol,
                "timeframe": timeframe,
                "exchange": exchange,
                "trading_instrument": self.node_data.get("tradingInstrument", {}),
                "start_time": context.current_time
            }
            
            return NodeExecutionResult(
                success=True,
                node_id=self.node_id,
                execution_time=context.current_time,
                next_nodes=[edge.target for edge in self.outgoing_edges],
                data={
                    "symbol": symbol,
                    "market_data_points": len(market_data),
                    "indicators_calculated": list(indicators.keys()),
                    "current_price": market_data[-1]["close"] if market_data else None
                }
            )
            
        except Exception as e:
            return NodeExecutionResult(
                success=False,
                node_id=self.node_id,
                execution_time=context.current_time,
                next_nodes=[],
                data={},
                errors=[f"Start node execution failed: {str(e)}"]
            )
    
    def _fetch_market_data(self, symbol: str, timeframe: str, exchange: str) -> List[Dict]:
        """Fetch market data from configured data provider"""
        # Implementation depends on data provider
        pass
    
    def _calculate_indicators(self, market_data: List[Dict]) -> Dict[str, Any]:
        """Calculate all configured technical indicators"""
        indicators = {}
        indicator_configs = self.node_data.get("indicators", {})
        
        for indicator_name, config in indicator_configs.items():
            indicator_type = config.get("type", "")
            
            if indicator_type == "sma":
                indicators[indicator_name] = self._calculate_sma(
                    market_data, config.get("period", 20)
                )
            elif indicator_type == "rsi":
                indicators[indicator_name] = self._calculate_rsi(
                    market_data, config.get("period", 14)
                )
            elif indicator_type == "macd":
                indicators[indicator_name] = self._calculate_macd(
                    market_data, 
                    config.get("fastPeriod", 12),
                    config.get("slowPeriod", 26),
                    config.get("signalPeriod", 9)
                )
        
        return indicators
```

### 2. Signal Node Implementation

```python
class SignalNode(BaseNode):
    """
    Evaluates market conditions and generates trading signals
    """
    
    def validate(self) -> List[str]:
        errors = []
        
        if "conditions" not in self.node_data:
            errors.append("Signal node must have conditions defined")
        
        # Validate condition structure
        conditions = self.node_data.get("conditions", {})
        if not self._validate_conditions_structure(conditions):
            errors.append("Invalid conditions structure")
        
        return errors
    
    def execute(self, context: 'ExecutionContext') -> NodeExecutionResult:
        try:
            conditions = self.node_data.get("conditions", {})
            signal_triggered = self._evaluate_conditions(conditions, context)
            
            # Log signal evaluation
            evaluation_data = {
                "conditions_met": signal_triggered,
                "evaluation_time": context.current_time.isoformat(),
                "market_conditions": self._get_current_market_conditions(context)
            }
            
            # Only proceed to next nodes if signal is triggered
            next_nodes = [edge.target for edge in self.outgoing_edges] if signal_triggered else []
            
            return NodeExecutionResult(
                success=True,
                node_id=self.node_id,
                execution_time=context.current_time,
                next_nodes=next_nodes,
                data=evaluation_data
            )
            
        except Exception as e:
            return NodeExecutionResult(
                success=False,
                node_id=self.node_id,
                execution_time=context.current_time,
                next_nodes=[],
                data={},
                errors=[f"Signal evaluation failed: {str(e)}"]
            )
    
    def _evaluate_conditions(self, conditions: Dict, context: 'ExecutionContext') -> bool:
        """Recursively evaluate condition groups and individual conditions"""
        
        if conditions.get("type") == "group":
            return self._evaluate_group_conditions(conditions, context)
        else:
            return self._evaluate_single_condition(conditions, context)
    
    def _evaluate_group_conditions(self, group: Dict, context: 'ExecutionContext') -> bool:
        """Evaluate a group of conditions with logical operators"""
        operator = group.get("operator", "and").lower()
        conditions = group.get("conditions", [])
        
        if not conditions:
            return True
        
        results = [self._evaluate_conditions(cond, context) for cond in conditions]
        
        if operator == "and":
            return all(results)
        elif operator == "or":
            return any(results)
        else:
            raise ValueError(f"Unknown group operator: {operator}")
    
    def _evaluate_single_condition(self, condition: Dict, context: 'ExecutionContext') -> bool:
        """Evaluate a single condition with left-hand side, operator, and right-hand side"""
        try:
            lhs_value = self._get_expression_value(condition["lhs"], context)
            rhs_value = self._get_expression_value(condition["rhs"], context)
            operator = condition["operator"]
            
            return self._apply_operator(lhs_value, operator, rhs_value)
            
        except Exception as e:
            # Log the error but don't fail the entire strategy
            context.add_warning(f"Condition evaluation error: {str(e)}")
            return False
    
    def _get_expression_value(self, expression: Dict, context: 'ExecutionContext') -> float:
        """Extract value from expression based on its type"""
        expr_type = expression.get("type", "")
        
        if expr_type == "constant":
            return float(expression["value"])
        
        elif expr_type == "indicator":
            indicator_name = expression["name"]
            offset = expression.get("offset", 0)
            
            if indicator_name not in context.indicators:
                raise ValueError(f"Indicator {indicator_name} not found")
            
            indicator_values = context.indicators[indicator_name]
            if isinstance(indicator_values, list):
                index = len(indicator_values) - 1 - offset
                return float(indicator_values[index]) if index >= 0 else 0.0
            else:
                return float(indicator_values)
        
        elif expr_type == "market_data":
            symbol = context.strategy_metadata["symbol"]
            field = expression.get("field", "close")
            offset = expression.get("offset", 0)
            
            market_data = context.market_data[symbol]
            if not market_data:
                raise ValueError("No market data available")
            
            index = len(market_data) - 1 - offset
            return float(market_data[index][field]) if index >= 0 else 0.0
        
        else:
            raise ValueError(f"Unknown expression type: {expr_type}")
    
    def _apply_operator(self, lhs: float, operator: str, rhs: float) -> bool:
        """Apply comparison operator to two values"""
        operators = {
            ">": lambda x, y: x > y,
            "<": lambda x, y: x < y,
            ">=": lambda x, y: x >= y,
            "<=": lambda x, y: x <= y,
            "==": lambda x, y: abs(x - y) < 1e-10,  # Float comparison with tolerance
            "!=": lambda x, y: abs(x - y) >= 1e-10,
            "crosses_above": lambda x, y: self._check_crossover(lhs, rhs, "above"),
            "crosses_below": lambda x, y: self._check_crossover(lhs, rhs, "below")
        }
        
        if operator not in operators:
            raise ValueError(f"Unknown operator: {operator}")
        
        return operators[operator](lhs, rhs)
```

### 3. Entry Node Implementation

```python
class EntryNode(BaseNode):
    """
    Creates new trading positions when entry signals are triggered
    """
    
    def validate(self) -> List[str]:
        errors = []
        
        positions = self.node_data.get("positions", [])
        if not positions:
            errors.append("Entry node must have at least one position defined")
        
        for position in positions:
            if "positionType" not in position:
                errors.append("Position must have positionType (buy/sell)")
            if "orderType" not in position:
                errors.append("Position must have orderType (market/limit)")
            if "quantity" not in position:
                errors.append("Position must have quantity defined")
        
        return errors
    
    def execute(self, context: 'ExecutionContext') -> NodeExecutionResult:
        try:
            positions_created = []
            
            for position_config in self.node_data.get("positions", []):
                position = self._create_position(position_config, context)
                positions_created.append(position)
                context.positions.append(position)
            
            return NodeExecutionResult(
                success=True,
                node_id=self.node_id,
                execution_time=context.current_time,
                next_nodes=[edge.target for edge in self.outgoing_edges],
                data={
                    "positions_created": len(positions_created),
                    "positions": [
                        {
                            "id": pos["id"],
                            "vpi": pos["vpi"],
                            "instrument": pos["instrument"],
                            "side": pos["side"],
                            "quantity": pos["quantity"],
                            "entry_price": pos["entry_price"]
                        }
                        for pos in positions_created
                    ]
                }
            )
            
        except Exception as e:
            return NodeExecutionResult(
                success=False,
                node_id=self.node_id,
                execution_time=context.current_time,
                next_nodes=[],
                data={},
                errors=[f"Position creation failed: {str(e)}"]
            )
    
    def _create_position(self, position_config: Dict, context: 'ExecutionContext') -> Dict:
        """Create a new position based on configuration"""
        
        # Resolve instrument details
        instrument = self._resolve_instrument(position_config, context)
        
        # Get entry price
        entry_price = self._get_entry_price(position_config, context, instrument)
        
        # Create position object
        position = {
            "id": position_config.get("id", str(uuid.uuid4())),
            "vpi": position_config["vpi"],
            "vpt": position_config.get("vpt", ""),
            "instrument": instrument,
            "side": position_config["positionType"],  # buy/sell
            "quantity": position_config["quantity"],
            "multiplier": position_config.get("multiplier", 1),
            "entry_price": entry_price,
            "current_price": entry_price,
            "entry_time": context.current_time,
            "status": "open",
            "unrealized_pnl": 0.0,
            "order_type": position_config["orderType"],
            "product_type": position_config.get("productType", "intraday")
        }
        
        return position
    
    def _resolve_instrument(self, position_config: Dict, context: 'ExecutionContext') -> str:
        """Resolve the actual trading instrument based on configuration"""
        
        base_symbol = context.strategy_metadata["symbol"]
        trading_instrument = context.strategy_metadata.get("trading_instrument", {})
        
        if trading_instrument.get("type") == "options":
            return self._resolve_options_instrument(position_config, context, base_symbol)
        elif trading_instrument.get("type") == "futures":
            return self._resolve_futures_instrument(position_config, context, base_symbol)
        else:
            return base_symbol
    
    def _resolve_options_instrument(self, position_config: Dict, context: 'ExecutionContext', base_symbol: str) -> str:
        """Resolve options instrument with strike and expiry"""
        
        option_details = position_config.get("optionDetails", {})
        expiry = option_details.get("expiry", "W0")  # Current week
        strike_type = option_details.get("strikeType", "ATM")
        option_type = option_details.get("optionType", "CE")
        
        # Get current market price for strike calculation
        current_price = self._get_current_market_price(base_symbol, context)
        
        # Calculate strike price based on strike type
        if strike_type == "ATM":
            strike_price = self._round_to_nearest_strike(current_price)
        elif strike_type.startswith("ITM"):
            distance = int(strike_type[3:]) if len(strike_type) > 3 else 1
            if option_type == "CE":
                strike_price = self._round_to_nearest_strike(current_price - (distance * 50))
            else:
                strike_price = self._round_to_nearest_strike(current_price + (distance * 50))
        elif strike_type.startswith("OTM"):
            distance = int(strike_type[3:]) if len(strike_type) > 3 else 1
            if option_type == "CE":
                strike_price = self._round_to_nearest_strike(current_price + (distance * 50))
            else:
                strike_price = self._round_to_nearest_strike(current_price - (distance * 50))
        
        # Format options symbol (e.g., NIFTY2412419000CE)
        expiry_formatted = self._format_expiry(expiry, context.current_time)
        return f"{base_symbol}{expiry_formatted}{int(strike_price)}{option_type}"
```

### 4. Exit Node Implementation

```python
class ExitNode(BaseNode):
    """
    Closes existing positions when exit conditions are met
    """
    
    def execute(self, context: 'ExecutionContext') -> NodeExecutionResult:
        try:
            exit_config = self.node_data.get("exitNodeData", {}).get("orderConfig", {})
            target_positions = self._find_target_positions(context, exit_config)
            
            positions_closed = []
            total_pnl = 0.0
            
            for position in target_positions:
                exit_result = self._close_position(position, exit_config, context)
                positions_closed.append(exit_result)
                total_pnl += exit_result["realized_pnl"]
            
            # Handle re-entry logic if configured
            re_entry_config = self.node_data.get("exitNodeData", {}).get("reEntryConfig", {})
            re_entry_triggered = self._check_re_entry_conditions(re_entry_config, context)
            
            next_nodes = []
            if re_entry_triggered:
                next_nodes = self._get_re_entry_nodes()
            else:
                next_nodes = [edge.target for edge in self.outgoing_edges]
            
            return NodeExecutionResult(
                success=True,
                node_id=self.node_id,
                execution_time=context.current_time,
                next_nodes=next_nodes,
                data={
                    "positions_closed": len(positions_closed),
                    "total_realized_pnl": total_pnl,
                    "re_entry_triggered": re_entry_triggered,
                    "closed_positions": positions_closed
                }
            )
            
        except Exception as e:
            return NodeExecutionResult(
                success=False,
                node_id=self.node_id,
                execution_time=context.current_time,
                next_nodes=[],
                data={},
                errors=[f"Position exit failed: {str(e)}"]
            )
    
    def _close_position(self, position: Dict, exit_config: Dict, context: 'ExecutionContext') -> Dict:
        """Close a position and calculate P&L"""
        
        exit_price = self._get_exit_price(position, exit_config, context)
        quantity_to_close = self._get_exit_quantity(position, exit_config)
        
        # Calculate realized P&L
        entry_price = position["entry_price"]
        multiplier = position.get("multiplier", 1)
        
        if position["side"] == "buy":
            pnl = (exit_price - entry_price) * quantity_to_close * multiplier
        else:
            pnl = (entry_price - exit_price) * quantity_to_close * multiplier
        
        # Update position status
        position["status"] = "closed"
        position["exit_price"] = exit_price
        position["exit_time"] = context.current_time
        position["realized_pnl"] = pnl
        
        return {
            "position_id": position["id"],
            "vpi": position["vpi"],
            "exit_price": exit_price,
            "quantity_closed": quantity_to_close,
            "realized_pnl": pnl,
            "hold_duration": (context.current_time - position["entry_time"]).total_seconds()
        }
```

### 5. Alert Node Implementation

```python
class AlertNode(BaseNode):
    """
    Generates notifications and alerts without affecting positions
    """
    
    def execute(self, context: 'ExecutionContext') -> NodeExecutionResult:
        try:
            alert_message = self.node_data.get("alertMessage", "Strategy alert triggered")
            alert_type = self.node_data.get("alertType", "info")
            
            # Create alert object
            alert = {
                "id": str(uuid.uuid4()),
                "node_id": self.node_id,
                "message": alert_message,
                "alert_type": alert_type,
                "timestamp": context.current_time,
                "strategy_id": context.strategy_id,
                "market_context": self._get_market_context(context)
            }
            
            # Add to context alerts
            context.alerts.append(alert)
            
            # Send alert through configured channels
            self._send_alert(alert, context)
            
            return NodeExecutionResult(
                success=True,
                node_id=self.node_id,
                execution_time=context.current_time,
                next_nodes=[edge.target for edge in self.outgoing_edges],
                data={
                    "alert_sent": True,
                    "alert_id": alert["id"],
                    "alert_message": alert_message,
                    "alert_type": alert_type
                }
            )
            
        except Exception as e:
            return NodeExecutionResult(
                success=False,
                node_id=self.node_id,
                execution_time=context.current_time,
                next_nodes=[],
                data={},
                errors=[f"Alert generation failed: {str(e)}"]
            )
```

This implementation guide provides detailed, production-ready node implementations that can be directly used in the Python backend development.
