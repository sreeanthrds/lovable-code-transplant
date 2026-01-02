
# Trading Strategy Builder - System Architecture

## High-Level Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React Frontend │◄────►  Python Backend │◄────►  Market Data    │
│  (Strategy UI)  │     │  (Execution)    │     │  Providers      │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Frontend Architecture

The frontend is built with React, providing a visual node-based editor for creating trading strategies:

- **Node Panel**: Library of node types users can add to strategies
- **Flow Canvas**: Interactive workspace for connecting nodes
- **Node Editors**: Configuration panels for each node type
- **Strategy Toolbars**: Tools for saving, importing, and executing strategies

## Backend Architecture

The backend is built with Python FastAPI, designed to parse and execute trading strategies:

### Core Services

1. **Strategy Parser Service**
   - Parses JSON strategy definition
   - Builds directed graph representation
   - Validates strategy structure and connections

2. **Technical Indicator Service**
   - Calculates technical indicators (MA, RSI, MACD, etc.)
   - Manages indicator parameters and values
   - Provides indicators for condition evaluation

3. **Strategy Execution Service**
   - Processes strategy nodes in sequence
   - Evaluates signal conditions
   - Tracks execution state
   - Generates execution results

4. **Signal Evaluation Service**
   - Evaluates conditions in signal nodes
   - Handles comparison operations
   - Processes complex nested condition groups

### Supporting Services

1. **Market Data Service**
   - Fetches historical price data
   - Provides real-time price feeds
   - Standardizes data formats

2. **Position Management Service**
   - Tracks virtual positions
   - Manages position lifecycle
   - Calculates position P&L

3. **Result Reporting Service**
   - Formats execution results
   - Calculates performance metrics
   - Generates execution reports

## Data Flow

1. **Strategy Creation**
   - User designs strategy in the visual editor
   - Strategy is saved as JSON representation

2. **Strategy Validation**
   - Backend validates strategy structure
   - Checks for required settings
   - Ensures proper node connections

3. **Strategy Execution**
   - Backend fetches market data
   - Processes start node configuration
   - Calculates technical indicators
   - Evaluates signal nodes
   - Executes action nodes
   - Tracks positions and alerts

4. **Result Processing**
   - Backend compiles execution results
   - Calculates performance metrics
   - Returns results to frontend

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/strategies/validate` | POST | Validate a strategy without execution |
| `/strategies/execute` | POST | Execute a strategy with market data |
| `/strategies/executions/{id}` | GET | Get execution results |
| `/strategies/executions` | GET | List all executions |
| `/market-data/{symbol}` | GET | Get market data for a symbol |
| `/indicators/calculate` | POST | Calculate indicators independently |

## Security Considerations

- Authentication required for all API endpoints
- Rate limiting for API requests
- Input validation for all parameters
- Secure handling of API keys for market data providers
