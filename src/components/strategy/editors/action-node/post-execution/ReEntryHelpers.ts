
import { 
  StopLossConfig, 
  TrailingStopConfig, 
  TakeProfitConfig 
} from '../exit-node/types';

// Helper function for re-entry updates
export function createReEntryUpdateHandler(
  feature: 'stopLoss' | 'trailingStop' | 'takeProfit',
  currentConfig: StopLossConfig | TrailingStopConfig | TakeProfitConfig,
  handler: (updates: Partial<StopLossConfig | TrailingStopConfig | TakeProfitConfig>) => void
) {
  return (updates: Partial<{ maxReEntries: number }>) => {
    handler({
      reEntry: {
        ...currentConfig.reEntry,
        ...updates
      }
    });
  };
}
