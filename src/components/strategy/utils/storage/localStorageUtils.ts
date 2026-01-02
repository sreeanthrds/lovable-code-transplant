
/**
 * Re-export all storage utilities from their modular files
 */

// Main operations
export { saveStrategyToLocalStorage } from './operations/saveStrategy';
export { loadStrategyFromLocalStorage, loadStrategyById } from './operations/loadStrategy';
export { getStrategiesList } from './operations/listStrategies';
export { deleteStrategy } from './operations/deleteStrategy';

// Utils and models (export for testing or advanced use)
export { sanitizeForStorage } from './utils/sanitizeUtils';
export { createStrategyObject } from './utils/strategyModel';
export type { StrategyData, StrategyMetadata } from './utils/strategyModel';
