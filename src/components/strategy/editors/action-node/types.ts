
export interface Position {
  vpi: string; // Virtual Position ID - unique across strategy (this IS the position ID)
  vpt: string; // Virtual Position Tag - user-defined label
  maxEntries?: number; // Maximum number of entries allowed for this position
  priority: number; // Execution priority (positions ordered by this)
  positionType?: 'buy' | 'sell';
  orderType?: 'market' | 'limit';
  limitPrice?: number;
  quantity?: number; // Changed from lots to quantity
  multiplier?: number; // New field for options/futures
  productType?: 'intraday' | 'carryForward';
  optionDetails?: {
    expiry?: string;
    strikeType?: 'ATM' | 'ITM1' | 'ITM2' | 'ITM3' | 'ITM4' | 'ITM5' | 'ITM6' | 'ITM7' | 'ITM8' | 'ITM9' | 'ITM10' | 'ITM11' | 'ITM12' | 'ITM13' | 'ITM14' | 'ITM15' | 'OTM0' | 'OTM1' | 'OTM2' | 'OTM3' | 'OTM4' | 'OTM5' | 'OTM6' | 'OTM7' | 'OTM8' | 'OTM9' | 'OTM10' | 'OTM11' | 'OTM12' | 'OTM13' | 'OTM14' | 'OTM15' | 'premium';
    strikeValue?: number;
    optionType?: 'CE' | 'PE';
  };
  _lastUpdated?: number; // Timestamp for forcing updates
}

export interface NodeData {
  label?: string;
  actionType?: 'entry' | 'exit' | 'alert';
  instrument?: string;
  positions: Position[];
  _lastUpdated?: number; // Timestamp for forcing updates
}

export interface TimeframeConfig {
  timeframe: string; // e.g., '5m', '1h', '1d'
  id: string; // Generated unique ID for this timeframe
  indicators: Record<string, any>; // Indicators for this timeframe
  unit: string; // e.g., 'minutes', 'hours', 'days'
  number: number; // e.g., 5, 1, 1
}

export interface SymbolConfig {
  symbol: string; // Actual symbol name (e.g., "NIFTY", "RELIANCE")
  type: 'stock' | 'futures' | 'options' | 'index';
  underlyingType?: 'index' | 'indexFuture' | 'stock';
  timeframes: TimeframeConfig[];
  contractMonth?: string; // For futures: M0, M1, M2
  expiry_type?: string; // For MCX futures: M0 (current), M1 (next), M2 (month after next)
}

export interface StartNodeData {
  label?: string;
  exchange?: string;
  tradingInstrument?: {
    type: 'stock' | 'futures' | 'options';
    underlyingType?: 'index' | 'indexFuture' | 'stock';
  };
  
  // New multi-symbol structure
  tradingInstrumentConfig?: SymbolConfig;
  supportingInstrumentConfig?: SymbolConfig;
}
