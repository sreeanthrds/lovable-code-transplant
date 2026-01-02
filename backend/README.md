# Trading Strategy Builder Backend

## Project Overview

This backend system serves as the execution engine for the Trading Strategy Builder application. The Trading Strategy Builder is a visual node-based editor that allows traders to create, test, and execute trading strategies without writing code.

## Project Goals

1. **Strategy Execution**: Execute trading strategies created in the visual editor against real or historical market data
2. **Technical Analysis**: Calculate technical indicators used in strategies (RSI, MACD, SMA, etc.)
3. **Signal Detection**: Process and evaluate trading signals based on conditions defined in strategy nodes
4. **Position Management**: Track and manage virtual trading positions opened by strategies
5. **Performance Analytics**: Calculate and report strategy performance metrics
6. **Alert Generation**: Process and deliver alerts configured in strategy workflows

## Architecture Overview

The backend is built as a Python FastAPI application with the following key components:

```
Trading Strategy Backend
│
├── API Layer (FastAPI) - Handles HTTP requests from the frontend
│
├── Strategy Processing
│   ├── Strategy Parser - Converts JSON strategy to executable graph
│   ├── Condition Evaluator - Evaluates signal conditions
│   └── Strategy Executor - Processes nodes in sequence
│
├── Technical Analysis
│   ├── Indicator Service - Calculates technical indicators
│   └── Market Data Service - Fetches and processes price data
│
└── Execution Engine
    ├── Position Manager - Tracks virtual positions
    ├── Order Execution - Simulates or executes trades
    └── Result Reporter - Formats and returns execution results
```

## Core Concepts

### Node Types

The frontend strategy builder uses several types of nodes that the backend must process:

1. **Start Node**: Entry point of a strategy, defines the instrument, timeframe, and technical indicators
2. **Signal Nodes**: Generate entry/exit signals based on conditions
3. **Action Nodes**: Execute trading actions (entry, exit, modify positions)
4. **Alert Nodes**: Generate notifications based on market conditions
5. **End and Force End Nodes**: Terminate strategy execution paths

### Strategy Flow

The strategy is represented as a directed graph where:
- Nodes are trading operations or decision points
- Edges define the flow of execution between nodes
- Execution follows paths from the Start Node to End Nodes

### JSON Structure

The frontend sends strategy definitions as JSON objects containing:
- Node definitions with their properties and configurations
- Edge definitions showing connections between nodes
- Strategy metadata (name, description, etc.)

## Implementation Phases

The backend implementation will follow these phases:

1. **Phase 1**: Core infrastructure setup (FastAPI application, models, dependencies)
2. **Phase 2**: Data models for strategy JSON parsing
3. **Phase 3**: Strategy parsing service to process strategy graph
4. **Phase 4**: Technical indicator calculation service
5. **Phase 5**: Strategy execution engine
6. **Phase 6**: API routes for strategy validation and execution
7. **Phase 7**: Position tracking and management
8. **Phase 8**: Backtesting capabilities
9. **Phase 9**: Real-time market data integration
10. **Phase 10**: Performance reporting and analytics

## Getting Started

### Prerequisites

- Python 3.8+
- Pip package manager
- Virtual environment tool (optional but recommended)

### Setup Instructions

```bash
# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the development server
python run.py
```

### API Documentation

Once the server is running, access the API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Integration with Frontend

The frontend communicates with this backend through REST API endpoints:
- `POST /strategies/validate` - Validate a strategy without execution
- `POST /strategies/execute` - Execute a strategy with market data
- `GET /strategies/executions/{execution_id}` - Get execution results
- `GET /strategies/executions` - List all executions

## Data Flow

1. User designs strategy in the visual editor
2. Frontend converts the visual representation to JSON
3. JSON is sent to backend for validation/execution
4. Backend processes the strategy against market data
5. Results are returned to frontend for display

## License

[Specify your license here]

See [Implementation Guide](./docs/implementation_guide.md) for detailed sprint-by-sprint implementation plan.
