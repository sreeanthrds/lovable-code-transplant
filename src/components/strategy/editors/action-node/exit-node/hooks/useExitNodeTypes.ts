
import { ExitOrderType } from '../types';

/**
 * Factory function to create initial types for exit node
 */
export const createDefaultTypes = () => {
  return {
    orderType: 'market' as ExitOrderType,
    limitPrice: undefined as number | undefined,
    multipleOrders: false
  };
};
