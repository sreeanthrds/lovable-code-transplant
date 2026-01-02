
export interface TrailingConfig {
  enabled: boolean;
  priceMove: number; // Amount instrument must move in favor
  trailPrice: number; // Amount to move stop loss
  units: 'points' | 'percentage'; // Unified units for both price move and trail price
  trailType: 'position' | 'underlying'; // What to trail - position price or underlying instrument price
}

export interface TrailingVariable {
  id: string;
  name: string; // Pattern: Trailing_{position_id}
  type: 'trailing';
  positionId: string;
  config: TrailingConfig;
}

export interface Position {
  id: string;  // Auto-generated unique ID
  vpi: string; // Virtual Position ID - unique across strategy
  vpt: string; // Virtual Position Tag - user-defined label
  priority: number; // Execution priority (positions ordered by this)
  positionType?: 'buy' | 'sell';
  orderType?: 'market' | 'limit';
  limitPrice?: number;
  lots?: number;
  productType?: 'intraday' | 'carryForward';
  optionDetails?: {
    expiry?: string;
    strikeType?: 'ATM' | 'ITM1' | 'ITM2' | 'ITM3' | 'ITM4' | 'ITM5' | 'ITM6' | 'ITM7' | 'ITM8' | 'ITM9' | 'ITM10' | 'ITM11' | 'ITM12' | 'ITM13' | 'ITM14' | 'ITM15' | 'OTM1' | 'OTM2' | 'OTM3' | 'OTM4' | 'OTM5' | 'OTM6' | 'OTM7' | 'OTM8' | 'OTM9' | 'OTM10' | 'OTM11' | 'OTM12' | 'OTM13' | 'OTM14' | 'OTM15' | 'premium';
    strikeValue?: number;
    optionType?: 'CE' | 'PE';
  };
  sourceNodeId?: string;
  trailingConfig?: TrailingConfig;
  _lastUpdated?: number; // Timestamp for forcing updates
}

export interface ActionNodeData {
  label: string; // Make label required
  actionType: 'entry' | 'exit' | 'alert' | 'modify';
  instrument?: string;
  symbol?: string;
  requiresSymbol?: boolean;
  positions?: Position[];
  updateNodeData?: (id: string, data: Partial<ActionNodeData>) => void;
  _lastUpdated?: number; // Timestamp for forcing updates
  targetPositionId?: string;
  targetNodeId?: string;
  modifications?: Record<string, any>;
  exitOrderConfig?: any;
}

export interface StartNodeData {
  symbol?: string;
  timeframe?: string;
  exchange?: string;
  tradingInstrument?: {
    type: 'stock' | 'futures' | 'options';
    underlyingType?: 'index' | 'indexFuture' | 'stock';
  };
  indicators?: string[];
  indicatorParameters?: Record<string, Record<string, any>>;
}
