import advancedMomentum from './indicators/advanced_momentum.json';
import advancedTrend from './indicators/advanced_trend.json';
import advancedVolatility from './indicators/advanced_volatility.json';
import advancedVolume from './indicators/advanced_volume.json';
import candles from './indicators/candles.json';
import chartTypes from './indicators/chart_types.json';
import ichimoku from './indicators/ichimoku.json';
import momentum from './indicators/momentum.json';
import movingAverages from './indicators/moving_averages.json';
import overlap from './indicators/overlap.json';
import performance from './indicators/performance.json';
import pivots from './indicators/pivots.json';
import statistics from './indicators/statistics.json';
import trend from './indicators/trend.json';
import volatility from './indicators/volatility.json';
import volume from './indicators/volume.json';

export interface IndicatorParameter {
  name: string;
  type: string;
  label: string;
  default?: any;
  options?: string[] | Array<{ value: string; label: string }>;
  description?: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}

export interface Indicator {
  name: string;
  function_name: string;
  display_name: string;
  description: string;
  parameters: IndicatorParameter[];
  outputs: string[];
}

export interface IndicatorCategory {
  category: string;
  indicators: Indicator[];
}

// Combine all categories
export const categorizedIndicators: IndicatorCategory[] = [
  movingAverages as IndicatorCategory,
  momentum as IndicatorCategory,
  overlap as IndicatorCategory,
  trend as IndicatorCategory,
  volatility as IndicatorCategory,
  volume as IndicatorCategory,
  advancedMomentum as IndicatorCategory,
  advancedTrend as IndicatorCategory,
  advancedVolatility as IndicatorCategory,
  advancedVolume as IndicatorCategory,
  candles as IndicatorCategory,
  chartTypes as IndicatorCategory,
  ichimoku as IndicatorCategory,
  pivots as IndicatorCategory,
  performance as IndicatorCategory,
  statistics as IndicatorCategory
];

// Create flat config for backward compatibility
export const flatIndicatorConfig: Record<string, Indicator> = {};

categorizedIndicators.forEach(category => {
  category.indicators.forEach(indicator => {
    flatIndicatorConfig[indicator.function_name] = indicator;
  });
});
