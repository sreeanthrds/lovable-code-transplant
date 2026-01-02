

export interface Position {
  vpi: string; // Virtual Position ID - this IS the position ID
  vpt?: string;
  priority: number;
  positionType: 'buy' | 'sell';
  orderType: 'market' | 'limit';
  quantity: number;
  multiplier: number;
  productType: 'intraday' | 'delivery';
  limitPrice?: number;
  optionDetails?: {
    expiry: string;
    strikeType: string;
    optionType: string;
  };
  _lastUpdated?: number;
}

export type QuantityType = 'all' | 'percentage' | 'specific';
export type ExitOrderType = 'market' | 'limit';
export type TimeUnit = 'seconds' | 'minutes' | 'hours';
export type TriggerType = 'percentage' | 'points' | 'pnl';

export interface ExitOrderConfig {
  orderType: ExitOrderType;
  limitPrice?: number;
  exitByTag?: boolean;
  targetTag?: string;
  targetPositionVpi?: string;
  quantity?: QuantityType;
  partialQuantityPercentage?: number;
  specificQuantity?: number;
}

export interface ReEntryConfig {
  enabled: boolean;
  maxEntries: number;
}

export interface StopLossConfig {
  enabled: boolean;
  triggerType?: TriggerType;
  stopPercentage?: number;
  stopPoints?: number;
  stopPnl?: number;
  waitForMarket?: boolean;
  waitTime?: number;
  waitTimeUnit?: TimeUnit;
  limitBuffer?: number;
  reEntry?: ReEntryConfig;
}

export interface TrailingStopConfig {
  enabled: boolean;
  triggerType?: TriggerType;
  initialDistance?: number;
  initialPoints?: number;
  initialPnl?: number;
  stepSize?: number;
  pointsStepSize?: number;
  pnlStepSize?: number;
  waitForMarket?: boolean;
  waitTime?: number;
  waitTimeUnit?: TimeUnit;
  limitBuffer?: number;
  reEntry?: ReEntryConfig;
}

export interface TakeProfitConfig {
  enabled: boolean;
  triggerType?: TriggerType;
  targetPercentage?: number;
  targetPoints?: number;
  targetPnl?: number;
  waitForMarket?: boolean;
  waitTime?: number;
  waitTimeUnit?: TimeUnit;
  limitBuffer?: number;
  reEntry?: ReEntryConfig;
}

export interface PostExecutionConfig {
  stopLoss?: StopLossConfig;
  trailingStop?: TrailingStopConfig;
  takeProfit?: TakeProfitConfig;
}

export interface ExitNodeData {
  orderConfig: ExitOrderConfig;
  quantity?: QuantityType;
  partialQuantityPercentage?: number;
  specificQuantity?: number;
  targetPositionVpi?: string;
  reEntryEnabled?: boolean;
  reEntryConfig?: ReEntryConfig;
  postExecutionConfig?: PostExecutionConfig;
  _initialized?: boolean;
}

