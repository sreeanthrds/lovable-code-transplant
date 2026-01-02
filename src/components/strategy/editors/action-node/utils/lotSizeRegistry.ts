/**
 * Lot size registry for various instruments
 */

export interface LotSizeInfo {
  symbol: string;
  lotSize: number;
  exchange: 'NFO' | 'BFO' | 'MCX' | 'NSE' | 'BSE';
}

// NFO (NSE F&O) - Indices
const NFO_LOT_SIZES: LotSizeInfo[] = [
  { symbol: 'NIFTY', lotSize: 75, exchange: 'NFO' },
  { symbol: 'BANKNIFTY', lotSize: 35, exchange: 'NFO' },
  { symbol: 'FINNIFTY', lotSize: 65, exchange: 'NFO' },
  { symbol: 'MIDCPNIFTY', lotSize: 140, exchange: 'NFO' },
  { symbol: 'NIFTYNXT50', lotSize: 25, exchange: 'NFO' },
];

// BFO (BSE F&O) - Indices
const BFO_LOT_SIZES: LotSizeInfo[] = [
  { symbol: 'SENSEX', lotSize: 20, exchange: 'BFO' },
  { symbol: 'BANKEX', lotSize: 30, exchange: 'BFO' },
  { symbol: 'SENSEX50', lotSize: 75, exchange: 'BFO' },
];

// MCX - Commodities (quantities)
const MCX_LOT_SIZES: LotSizeInfo[] = [
  { symbol: 'CRUDEOIL', lotSize: 100, exchange: 'MCX' },
  { symbol: 'CRUDEOILM', lotSize: 10, exchange: 'MCX' },
  { symbol: 'NATURALGAS', lotSize: 1250, exchange: 'MCX' },
  { symbol: 'NATURALGAS_MINI', lotSize: 250, exchange: 'MCX' },
  { symbol: 'GOLD', lotSize: 1, exchange: 'MCX' },
  { symbol: 'GOLDM', lotSize: 100, exchange: 'MCX' },
  { symbol: 'SILVER', lotSize: 30, exchange: 'MCX' },
  { symbol: 'SILVERM', lotSize: 5, exchange: 'MCX' },
];

const LOT_SIZE_REGISTRY = [...NFO_LOT_SIZES, ...BFO_LOT_SIZES, ...MCX_LOT_SIZES];

/**
 * Get lot size for a given symbol
 */
export const getLotSize = (symbol: string, exchange?: string): number | undefined => {
  if (!symbol) return undefined;
  
  const normalizedSymbol = symbol.toUpperCase().trim();
  
  // If exchange is specified, filter by exchange first
  if (exchange) {
    const normalizedExchange = exchange.toUpperCase();
    const found = LOT_SIZE_REGISTRY.find(
      entry => entry.symbol === normalizedSymbol && 
               entry.exchange === normalizedExchange
    );
    if (found) return found.lotSize;
  }
  
  // Otherwise, search across all exchanges
  const found = LOT_SIZE_REGISTRY.find(entry => entry.symbol === normalizedSymbol);
  return found?.lotSize;
};

/**
 * Check if a symbol has a predefined lot size
 */
export const hasLotSize = (symbol: string): boolean => {
  return getLotSize(symbol) !== undefined;
};

/**
 * Get all symbols that have predefined lot sizes for a given exchange
 */
export const getSymbolsWithLotSizes = (exchange?: 'NFO' | 'BFO' | 'MCX'): string[] => {
  if (exchange) {
    return LOT_SIZE_REGISTRY
      .filter(entry => entry.exchange === exchange)
      .map(entry => entry.symbol);
  }
  return LOT_SIZE_REGISTRY.map(entry => entry.symbol);
};
