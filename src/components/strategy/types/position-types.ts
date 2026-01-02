
import { v4 as uuidv4 } from 'uuid';

// Define position type
export interface Position {
  vpi: string; // Virtual Position ID - unique across strategy (this IS the position ID)
  maxEntries?: number; // Maximum number of entries allowed for this position
  priority?: number;
  positionType?: 'buy' | 'sell';
  orderType?: 'market' | 'limit';
  limitPrice?: number;
  quantity?: number; // Changed from lots to quantity
  multiplier?: number; // New field for options/futures
  productType?: 'intraday' | 'carryForward';
  optionDetails?: {
    expiry?: string;
    strikeType?: string;
    strikeValue?: number;
    optionType?: 'CE' | 'PE';
  };
  sourceNodeId?: string;
  status?: 'active' | 'cancelled' | 'filled' | 'partial';
  isRolledOut?: boolean;
  // Add re-entry tracking information
  reEntry?: {
    enabled: boolean;
    maxEntries: number; // Renamed from maxReEntries
    currentReEntryCount?: number;
  };
  _lastUpdated?: number;
}

// Type guard to check if an object is a valid Position
export function isPosition(obj: any): obj is Position {
  return obj && typeof obj === 'object' && typeof obj.vpi === 'string';
}

// Create a default position
export function createDefaultPosition(nodeId: string): Position {
  return {
    vpi: `${nodeId}-pos1`, // VPI is the primary and only position ID
    priority: 1,
    positionType: 'buy',
    orderType: 'market',
    quantity: 1, // Changed from lots to quantity
    multiplier: 1, // Default multiplier
    productType: 'intraday',
    status: 'active',
    isRolledOut: false,
    optionDetails: {
      expiry: 'W0',
      strikeType: 'ATM',
      optionType: 'CE'
    },
    _lastUpdated: Date.now()
  };
}

// Adapt a position to any compatible type
export function adaptPosition<T>(position: Position | null): T | null {
  if (!position) return null;
  
  return {
    ...position,
    // Ensure required fields have values
    vpi: position.vpi, // VPI is the primary ID
    priority: position.priority || 1,
    positionType: position.positionType || 'buy',
    orderType: position.orderType || 'market',
    limitPrice: position.limitPrice,
    quantity: position.quantity || 1, // Changed from lots to quantity
    multiplier: position.multiplier || 1, // Default multiplier
    productType: position.productType || 'intraday',
    status: position.status || 'active',
    isRolledOut: position.isRolledOut || false,
    reEntry: position.reEntry ? {
      enabled: position.reEntry.enabled,
      maxEntries: position.reEntry.maxEntries,
      currentReEntryCount: position.reEntry.currentReEntryCount || 0
    } : undefined,
    optionDetails: position.optionDetails ? {
      expiry: position.optionDetails.expiry || 'W0',
      strikeType: position.optionDetails.strikeType || 'ATM',
      strikeValue: position.optionDetails.strikeValue,
      optionType: position.optionDetails.optionType || 'CE'
    } : undefined,
    sourceNodeId: position.sourceNodeId,
    _lastUpdated: position._lastUpdated || Date.now()
  } as unknown as T;
}
