
export interface BacktestingConfig {
  enabled: boolean;
  startDate: Date | null;
  endDate: Date | null;
  initialCapital: number;
  slippagePercentage: number;
  commissionPercentage: number;
  riskPerTrade: number;
  timeframe: string;
  maxOpenPositions: number;
  enableOptimization: boolean;
}

export interface Transaction {
  id: string;
  timestamp: number;
  type: 'entry' | 'exit';
  symbol: string;
  price: number;
  quantity: number;
  side: 'buy' | 'sell';
  amount: number;
  fees: number;
  pnl?: number; // Only for exit transactions
  pnlPercentage?: number; // Only for exit transactions
  exitReason?: 'take_profit' | 'stop_loss' | 'trailing_stop' | 'manual' | 'strategy_end';
}

export interface BacktestResult {
  totalReturn: number;
  winRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
  tradesCount: number;
  profitFactor: number;
  equityCurve: {
    timestamp: number;
    equity: number;
  }[];
  transactions?: Transaction[];
  monthlyReturns?: {
    month: string;
    return: number;
  }[];
}
