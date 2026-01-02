// Symbol registry for managing symbol lookups and relationships

export interface SymbolInfo {
  id: string; // The actual symbol name (e.g., "NIFTY", "RELIANCE")
  name: string; // Display name (same as id for now)
  type: 'stock' | 'index' | 'future' | 'option';
  exchange: string;
  sector?: string;
  underlyingSymbol?: string; // For derivatives
}

// Mock data - in real implementation this would come from API
const SYMBOL_REGISTRY: SymbolInfo[] = [
  // Indices
  { id: "NIFTY", name: "NIFTY", type: "index", exchange: "NSE" },
  { id: "BANKNIFTY", name: "BANKNIFTY", type: "index", exchange: "NSE" },
  { id: "FINNIFTY", name: "FINNIFTY", type: "index", exchange: "NSE" },
  
  // Stocks
  { id: "RELIANCE", name: "RELIANCE", type: "stock", exchange: "NSE", sector: "Energy" },
  { id: "TCS", name: "TCS", type: "stock", exchange: "NSE", sector: "IT" },
  { id: "HDFCBANK", name: "HDFCBANK", type: "stock", exchange: "NSE", sector: "Banking" },
  { id: "INFY", name: "INFY", type: "stock", exchange: "NSE", sector: "IT" },
  { id: "ICICIBANK", name: "ICICIBANK", type: "stock", exchange: "NSE", sector: "Banking" },
];

export const getSymbolInfo = (symbolId: string): SymbolInfo | undefined => {
  return SYMBOL_REGISTRY.find(s => s.id === symbolId);
};

export const getSymbolsByType = (type: 'stock' | 'index', exchange?: string): SymbolInfo[] => {
  return SYMBOL_REGISTRY.filter(s => 
    s.type === type && (!exchange || s.exchange === exchange)
  );
};

export const getSupportingSymbolOptions = (
  tradingInstrument: {
    type: 'stock' | 'futures' | 'options';
    underlyingType?: 'index' | 'indexFuture' | 'stock';
  },
  tradingSymbol: string,
  exchange: string
): SymbolInfo[] => {
  const tradingSymbolInfo = getSymbolInfo(tradingSymbol);
  
  switch (tradingInstrument.type) {
    case 'stock':
      // Stock → Show indices of same exchange
      return getSymbolsByType('index', exchange);
      
    case 'futures':
      if (tradingInstrument.underlyingType === 'stock') {
        // Stock Futures → Show underlying stock + indices
        const indices = getSymbolsByType('index', exchange);
        const underlyingStock = tradingSymbolInfo ? [tradingSymbolInfo] : [];
        return [...indices, ...underlyingStock];
      } else {
        // Index Futures → Show only the underlying index
        return tradingSymbolInfo ? [tradingSymbolInfo] : [];
      }
      
    case 'options':
      if (tradingInstrument.underlyingType === 'stock') {
        // Stock Options → Show stock futures + indices
        const indices = getSymbolsByType('index', exchange);
        // For stock options, we should show the future of that stock
        const stockFuture = tradingSymbolInfo ? [{
          ...tradingSymbolInfo,
          id: `${tradingSymbolInfo.id}_FUT`,
          name: `${tradingSymbolInfo.name} Future`,
          type: 'future' as const
        }] : [];
        return [...indices, ...stockFuture];
      } else {
        // Index Options → Show only the futures of that index
        return tradingSymbolInfo ? [{
          ...tradingSymbolInfo,
          id: `${tradingSymbolInfo.id}_FUT`,
          name: `${tradingSymbolInfo.name} Future`,
          type: 'future' as const
        }] : [];
      }
      
    default:
      return [];
  }
};

export const validateSymbolExists = (symbolId: string): boolean => {
  return SYMBOL_REGISTRY.some(s => s.id === symbolId);
};