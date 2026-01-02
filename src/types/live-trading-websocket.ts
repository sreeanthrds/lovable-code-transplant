/**
 * WebSocket Message Types for Live Trading
 */

export interface Position {
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  entry_price: number;
  current_price: number;
  pnl: number;
}

export interface NodeState {
  status: 'active' | 'waiting' | 'completed' | 'error';
}

export interface Strategy {
  strategy_id: string;
  strategy_name: string;
  status: 'running' | 'paused' | 'stopped';
  total_pnl: number;
  realized_pnl: number;
  unrealized_pnl: number;
  positions: Position[];
  node_states?: Record<string, NodeState>;
  started_at: string;
  updated_at?: string;
}

export interface WebSocketMessage {
  type: 'strategy_update' | 'pnl_update' | 'position_update' | 'trade_executed';
  strategy_id?: string; // Only in dashboard WebSocket
  data: Strategy;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'error';

export interface Trade {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  timestamp: string;
  status: 'executed' | 'pending' | 'failed';
}
