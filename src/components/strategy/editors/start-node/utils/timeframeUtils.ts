import { TimeframeConfig } from '../../action-node/types';

export const parseTimeframe = (timeframe: string): { unit: string; number: number } => {
  const match = timeframe.match(/^(\d+)([mhd])$/);
  if (!match) {
    return { unit: 'minutes', number: 1 };
  }
  
  const [, numberStr, unitChar] = match;
  const number = parseInt(numberStr, 10);
  
  const unitMap: Record<string, string> = {
    'm': 'minutes',
    'h': 'hours', 
    'd': 'days',
    'w': 'weeks'
  };
  
  return {
    unit: unitMap[unitChar] || 'minutes',
    number
  };
};

export const createTimeframeId = (timeframe: string): string => {
  return `tf_${timeframe}`;
};

export const formatTimeframeDisplay = (timeframeConfig: TimeframeConfig): string => {
  return timeframeConfig.timeframe;
};

export const validateTimeframe = (timeframe: string): string | null => {
  const validTimeframes = [
    '1m', '2m', '3m', '4m', '5m', '10m', '15m', '30m',
    '1h', '2h', '3h', '1d', '1w'
  ];
  
  if (!validTimeframes.includes(timeframe)) {
    return "Invalid timeframe format";
  }
  
  return null;
};

export const checkDuplicateTimeframe = (
  timeframes: TimeframeConfig[],
  newTimeframe: string,
  excludeId?: string
): boolean => {
  return timeframes.some(tf => 
    tf.id !== excludeId &&
    tf.timeframe === newTimeframe
  );
};