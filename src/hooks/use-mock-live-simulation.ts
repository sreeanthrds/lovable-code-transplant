import { useState, useEffect, useCallback } from 'react';
import { 
  ActiveNode, 
  LivePosition, 
  LiveTrade,
  LivePnL,
  LiveSessionStats
} from '@/types/live-simulation';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

interface UseMockLiveSimulationOptions {
  sessionId: string;
  autoConnect?: boolean;
}

interface UseMockLiveSimulationReturn {
  connectionStatus: ConnectionStatus;
  error: string | null;
  activeNodes: ActiveNode[];
  openPositions: LivePosition[];
  trades: LiveTrade[];
  pnl: LivePnL;
  progress: number;
  currentTime: string;
  sessionStatus: 'running' | 'paused' | 'stopped' | 'completed';
  stats: LiveSessionStats;
  connect: () => void;
  disconnect: () => void;
  stopSession: () => Promise<void>;
  changeSpeed: (speed: number) => Promise<void>;
}

// Mock data generators
const mockSymbols = ['NIFTY24DEC23000CE', 'NIFTY24DEC22800PE', 'BANKNIFTY24DEC51000CE', 'BANKNIFTY24DEC50500PE'];

const generateMockActiveNodes = (): ActiveNode[] => [
  {
    node_id: 'entry-node-1',
    node_type: 'Entry',
    status: 'active',
    last_action: 'Monitoring price conditions',
    conditions_evaluated: {
      'RSI < 30': true,
      'Price > EMA20': false,
      'Volume Spike': true
    },
    order_info: {
      order_id: 'ORD-001',
      side: 'BUY',
      quantity: 50,
      symbol: mockSymbols[0],
      price: 245.50,
      status: 'filled'
    }
  },
  {
    node_id: 'exit-node-1',
    node_type: 'Exit',
    status: 'pending',
    last_action: 'Waiting for target/SL',
    target_info: {
      target_price: 280.00,
      current_price: 258.75,
      points_to_go: 21.25
    },
    sl_info: {
      sl_price: 230.00,
      current_price: 258.75,
      points_away: 28.75
    }
  },
  {
    node_id: 'entry-node-2',
    node_type: 'Entry',
    status: 'pending',
    last_action: 'Waiting for signal',
    conditions_evaluated: {
      'MACD Crossover': false,
      'Price > VWAP': true
    }
  }
];

const generateMockOpenPositions = (): LivePosition[] => [
  {
    position_id: 'pos-001',
    symbol: mockSymbols[0],
    side: 'BUY',
    quantity: 50,
    entry_price: 245.50,
    current_price: 258.75,
    unrealized_pnl: 662.50,
    pnl_percentage: 5.4,
    entry_time: '2024-10-28T09:32:15'
  },
  {
    position_id: 'pos-002',
    symbol: mockSymbols[2],
    side: 'SELL',
    quantity: 25,
    entry_price: 890.00,
    current_price: 875.25,
    unrealized_pnl: 368.75,
    pnl_percentage: 1.66,
    entry_time: '2024-10-28T10:15:42'
  }
];

const generateMockTrades = (): LiveTrade[] => [
  {
    position_id: 'trade-001',
    symbol: mockSymbols[1],
    side: 'BUY',
    quantity: 100,
    entry_price: 125.00,
    exit_price: 142.50,
    pnl: 1750.00,
    pnl_percentage: 14.0,
    entry_time: '2024-10-28T09:18:00',
    exit_time: '2024-10-28T09:45:30',
    exit_reason: 'Target Hit'
  },
  {
    position_id: 'trade-002',
    symbol: mockSymbols[3],
    side: 'SELL',
    quantity: 50,
    entry_price: 320.00,
    exit_price: 335.00,
    pnl: -750.00,
    pnl_percentage: -4.69,
    entry_time: '2024-10-28T09:52:10',
    exit_time: '2024-10-28T10:08:45',
    exit_reason: 'Stop Loss'
  },
  {
    position_id: 'trade-003',
    symbol: mockSymbols[0],
    side: 'BUY',
    quantity: 75,
    entry_price: 210.50,
    exit_price: 228.75,
    pnl: 1368.75,
    pnl_percentage: 8.67,
    entry_time: '2024-10-28T10:22:00',
    exit_time: '2024-10-28T11:05:15',
    exit_reason: 'Target Hit'
  }
];

export const useMockLiveSimulation = ({
  sessionId,
  autoConnect = true
}: UseMockLiveSimulationOptions): UseMockLiveSimulationReturn => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<'running' | 'paused' | 'stopped' | 'completed'>('running');
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  
  // Mock data state
  const [activeNodes, setActiveNodes] = useState<ActiveNode[]>([]);
  const [openPositions, setOpenPositions] = useState<LivePosition[]>([]);
  const [trades, setTrades] = useState<LiveTrade[]>([]);
  const [pnl, setPnl] = useState<LivePnL>({ total: 0, realized: 0, unrealized: 0, today: 0 });
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('09:15:00');

  // Calculate stats
  const stats: LiveSessionStats = {
    total_trades: trades.length,
    winning_trades: trades.filter(t => t.pnl > 0).length,
    losing_trades: trades.filter(t => t.pnl < 0).length,
    win_rate: trades.length > 0 
      ? (trades.filter(t => t.pnl > 0).length / trades.length) * 100 
      : 0,
    total_pnl: pnl.total,
    realized_pnl: pnl.realized,
    unrealized_pnl: pnl.unrealized,
    open_positions: openPositions.length,
    active_nodes: activeNodes.filter(n => n.status === 'active').length,
    pending_nodes: activeNodes.filter(n => n.status === 'pending').length
  };

  const connect = useCallback(() => {
    setConnectionStatus('connecting');
    setError(null);
    
    // Simulate connection delay
    setTimeout(() => {
      setConnectionStatus('connected');
      setActiveNodes(generateMockActiveNodes());
      setOpenPositions(generateMockOpenPositions());
      setTrades(generateMockTrades());
      
      // Calculate initial PnL from positions and trades
      const unrealizedPnl = generateMockOpenPositions().reduce((sum, p) => sum + p.unrealized_pnl, 0);
      const realizedPnl = generateMockTrades().reduce((sum, t) => sum + t.pnl, 0);
      setPnl({
        total: realizedPnl + unrealizedPnl,
        realized: realizedPnl,
        unrealized: unrealizedPnl,
        today: realizedPnl + unrealizedPnl
      });
      
      setProgress(35);
      setCurrentTime('11:15:00');
    }, 1000);
  }, []);

  const disconnect = useCallback(() => {
    setConnectionStatus('disconnected');
  }, []);

  const stopSession = useCallback(async () => {
    setSessionStatus('stopped');
  }, []);

  const changeSpeed = useCallback(async (speed: number) => {
    setSpeedMultiplier(speed);
  }, []);

  // Auto-update simulation data
  useEffect(() => {
    if (connectionStatus !== 'connected' || sessionStatus !== 'running') return;

    const interval = setInterval(() => {
      // Update current time
      setCurrentTime(prev => {
        const [hours, minutes, seconds] = prev.split(':').map(Number);
        let newSeconds = seconds + (speedMultiplier * 10);
        let newMinutes = minutes;
        let newHours = hours;
        
        if (newSeconds >= 60) {
          newMinutes += Math.floor(newSeconds / 60);
          newSeconds = newSeconds % 60;
        }
        if (newMinutes >= 60) {
          newHours += Math.floor(newMinutes / 60);
          newMinutes = newMinutes % 60;
        }
        
        // Market hours: 9:15 to 15:30
        if (newHours >= 15 && newMinutes >= 30) {
          setSessionStatus('completed');
          setProgress(100);
          return '15:30:00';
        }
        
        return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}:${String(Math.floor(newSeconds)).padStart(2, '0')}`;
      });

      // Update progress (9:15 to 15:30 = 375 minutes)
      setProgress(prev => Math.min(prev + 0.5, 100));

      // Random price fluctuations for open positions
      setOpenPositions(prev => prev.map(pos => {
        const priceChange = (Math.random() - 0.48) * 2; // Slight upward bias
        const newPrice = pos.current_price + priceChange;
        const newUnrealizedPnl = (newPrice - pos.entry_price) * pos.quantity * (pos.side === 'BUY' ? 1 : -1);
        const newPnlPercentage = ((newPrice - pos.entry_price) / pos.entry_price) * 100 * (pos.side === 'BUY' ? 1 : -1);
        
        return {
          ...pos,
          current_price: parseFloat(newPrice.toFixed(2)),
          unrealized_pnl: parseFloat(newUnrealizedPnl.toFixed(2)),
          pnl_percentage: parseFloat(newPnlPercentage.toFixed(2))
        };
      }));

      // Update PnL
      setPnl(prev => {
        const unrealizedChange = (Math.random() - 0.45) * 50;
        const newUnrealized = prev.unrealized + unrealizedChange;
        return {
          ...prev,
          unrealized: parseFloat(newUnrealized.toFixed(2)),
          total: parseFloat((prev.realized + newUnrealized).toFixed(2)),
          today: parseFloat((prev.realized + newUnrealized).toFixed(2))
        };
      });

      // Occasionally update active nodes status
      if (Math.random() > 0.8) {
        setActiveNodes(prev => prev.map(node => {
          if (node.target_info) {
            const priceMove = (Math.random() - 0.45) * 3;
            return {
              ...node,
              target_info: {
                ...node.target_info,
                current_price: parseFloat((node.target_info.current_price + priceMove).toFixed(2)),
                points_to_go: parseFloat((node.target_info.target_price - (node.target_info.current_price + priceMove)).toFixed(2))
              },
              sl_info: node.sl_info ? {
                ...node.sl_info,
                current_price: parseFloat((node.sl_info.current_price + priceMove).toFixed(2)),
                points_away: parseFloat(((node.sl_info.current_price + priceMove) - node.sl_info.sl_price).toFixed(2))
              } : undefined
            };
          }
          return node;
        }));
      }
    }, 1000 / speedMultiplier);

    return () => clearInterval(interval);
  }, [connectionStatus, sessionStatus, speedMultiplier]);

  // Auto-connect
  useEffect(() => {
    if (autoConnect && sessionId) {
      connect();
    }
    return () => disconnect();
  }, [autoConnect, sessionId, connect, disconnect]);

  return {
    connectionStatus,
    error,
    activeNodes,
    openPositions,
    trades,
    pnl,
    progress,
    currentTime,
    sessionStatus,
    stats,
    connect,
    disconnect,
    stopSession,
    changeSpeed
  };
};
