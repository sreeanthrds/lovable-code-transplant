import { useEffect } from 'react';
import { useLiveTradeStore, LiveStrategy } from './use-live-trade-store';
import { Strategy, Position, ConnectionStatus } from '@/types/live-trading-websocket';

// Mock strategies to populate the dashboard
const mockStrategiesToAdd: Array<{
  id: string;
  name: string;
  description: string;
}> = [
  {
    id: 'strategy-001',
    name: 'NIFTY Momentum Scalper',
    description: 'Intraday momentum strategy for NIFTY options with RSI and VWAP filters'
  },
  {
    id: 'strategy-002',
    name: 'BankNIFTY Iron Condor',
    description: 'Non-directional options strategy with defined risk'
  },
  {
    id: 'strategy-003',
    name: 'Trend Following System',
    description: 'Multi-timeframe trend following with ATR-based stops'
  }
];

// Mock broker connections to populate the broker sidebar
export const mockBrokerConnections = [
  {
    id: 'conn-clickhouse-001',
    broker_type: 'clickhouse',
    connection_name: 'ClickHouse Simulation',
    status: 'connected',
    is_active: true,
    broker_metadata: {
      type: 'clickhouse',
      simulation_date: '2024-10-28',
      speed_multiplier: 1
    }
  },
  {
    id: 'conn-angelone-001',
    broker_type: 'angelone',
    connection_name: 'AngelOne - Demo Account',
    status: 'connected',
    is_active: true,
    broker_metadata: {
      access_token: 'mock-token',
      token_expires_at: new Date(Date.now() + 86400000).toISOString()
    }
  }
];

// Mock positions for strategies
const mockPositions: Position[] = [
  {
    symbol: 'NIFTY24DEC23000CE',
    side: 'BUY',
    quantity: 50,
    entry_price: 245.50,
    current_price: 258.75,
    pnl: 662.50
  },
  {
    symbol: 'BANKNIFTY24DEC51000CE',
    side: 'SELL',
    quantity: 25,
    entry_price: 890.00,
    current_price: 875.25,
    pnl: 368.75
  }
];

// Mock strategies for the sidebar (dashboard view) - matching Strategy interface
const mockDashboardStrategies: Strategy[] = [
  {
    strategy_id: 'strategy-001',
    strategy_name: 'NIFTY Momentum Scalper',
    status: 'running',
    total_pnl: 2450.75,
    realized_pnl: 1850.50,
    unrealized_pnl: 600.25,
    positions: mockPositions,
    started_at: new Date(Date.now() - 3600000).toISOString(),
    node_states: {
      'entry-1': { status: 'active' },
      'exit-1': { status: 'waiting' },
      'sl-1': { status: 'waiting' }
    }
  },
  {
    strategy_id: 'strategy-002',
    strategy_name: 'BankNIFTY Iron Condor',
    status: 'running',
    total_pnl: -320.00,
    realized_pnl: -320.00,
    unrealized_pnl: 0,
    positions: [],
    started_at: new Date(Date.now() - 7200000).toISOString(),
    node_states: {
      'entry-1': { status: 'completed' },
      'exit-1': { status: 'completed' }
    }
  },
  {
    strategy_id: 'strategy-003',
    strategy_name: 'Trend Following System',
    status: 'stopped',
    total_pnl: 0,
    realized_pnl: 0,
    unrealized_pnl: 0,
    positions: [],
    started_at: new Date().toISOString(),
    node_states: {}
  }
];

// Hook to initialize mock data
export const useMockDashboardData = (enableMock: boolean = true) => {
  const { liveStrategies, addToLiveTrading } = useLiveTradeStore();

  useEffect(() => {
    if (!enableMock) return;
    
    // Only add mock strategies if store is empty
    if (liveStrategies.length === 0) {
      mockStrategiesToAdd.forEach(strategy => {
        addToLiveTrading(strategy);
      });
    }
  }, [enableMock, liveStrategies.length, addToLiveTrading]);

  return {
    mockStrategies: mockDashboardStrategies,
    mockBrokerConnections
  };
};

// Mock version of useDashboardWebSocket
export const useMockDashboardWebSocket = (): {
  strategies: Strategy[];
  connectionStatus: ConnectionStatus;
  error: string | null;
  isConnected: boolean;
} => {
  return {
    strategies: mockDashboardStrategies,
    connectionStatus: 'connected',
    error: null,
    isConnected: true
  };
};

// Mock version of useBrokerConnections
export const useMockBrokerConnections = () => {
  return {
    connections: mockBrokerConnections,
    isLoading: false,
    error: null,
    refetch: () => Promise.resolve()
  };
};
