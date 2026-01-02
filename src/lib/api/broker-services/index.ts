/**
 * Broker API Services Index
 */

import { angelOneApiService } from './angel-one-api';
import { zerodhaApiService } from './zerodha-api';

// Broker service factory
export const getBrokerApiService = (brokerId: string) => {
  switch (brokerId) {
    case 'angel-one':
      return angelOneApiService;
    case 'zerodha':
      return zerodhaApiService;
    default:
      throw new Error(`Broker API service not implemented for: ${brokerId}`);
  }
};

// Supported brokers with API implementation
export const SUPPORTED_API_BROKERS = ['angel-one', 'zerodha'];