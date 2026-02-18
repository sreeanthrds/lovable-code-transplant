
import { Node, Edge } from '@xyflow/react';
import { toast } from 'sonner';
import { StrategyData } from '../utils/strategyModel';

/**
 * Migrate market_data expressions to candle_data
 */
const migrateExpressionType = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  
  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => migrateExpressionType(item));
  }
  
  // Handle objects with type property
  if (obj.type === 'market_data') {
    obj.type = 'candle_data';
  }
  
  // Recursively process all properties
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      obj[key] = migrateExpressionType(obj[key]);
    }
  });
  
  return obj;
};

/**
 * Get current user ID from Clerk
 */
const getCurrentUserId = () => {
  try {
    const clerk = (window as any).Clerk;
    if (clerk && clerk.user) {
      return clerk.user.id;
    }
    return null;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
};

/**
 * Loads a strategy from localStorage with user-specific key
 * NOTE: This function now only works with user-specific strategy IDs
 */
export const loadStrategyFromLocalStorage = (strategyId: string): StrategyData | null => {
  try {
    if (!strategyId) {
      console.warn('No strategy ID provided to loadStrategyFromLocalStorage');
      return null;
    }
    
    // Get current user ID - required for user-specific storage
    const userId = getCurrentUserId();
    if (!userId) {
      console.warn('No authenticated user, cannot load strategy');
      return null;
    }
    
    // Only load from the user-specific strategy key
    const strategyKey = `user_${userId}_strategy_${strategyId}`;
    const savedStrategy = localStorage.getItem(strategyKey);
    
    if (!savedStrategy) {
      console.log(`No saved strategy found with key: ${strategyKey}`);
      return null;
    }
    
    console.log(`Loading strategy from localStorage key: ${strategyKey}`);
    let parsed = JSON.parse(savedStrategy) as StrategyData;
    
    // Migrate market_data to candle_data
    const migrated = migrateExpressionType(parsed);
    
    // Save the migrated version back to localStorage
    localStorage.setItem(strategyKey, JSON.stringify(migrated));
    console.log('Migrated market_data to candle_data and saved back to localStorage');
    
    // Validate the structure before returning
    if (Array.isArray(migrated.nodes) && Array.isArray(migrated.edges)) {
      console.log(`Successfully loaded strategy: ${migrated.name} (${migrated.id}) for user: ${userId}`);
      return migrated;
    } else {
      console.warn('Invalid strategy structure in localStorage');
      return null;
    }
  } catch (error) {
    console.error('Failed to load strategy:', error);
    toast.error("Failed to load saved strategy");
    return null;
  }
};

/**
 * Loads a specific strategy by ID with user verification
 */
export const loadStrategyById = (strategyId: string): { nodes: Node[], edges: Edge[], name: string, globalVariables?: any[] } | null => {
  try {
    if (!strategyId) {
      console.warn('No strategy ID provided to loadStrategyById');
      return null;
    }
    
    // Get current user ID - required for user-specific storage
    const userId = getCurrentUserId();
    if (!userId) {
      console.warn('No authenticated user, cannot load strategy');
      return null;
    }
    
    const strategyKey = `user_${userId}_strategy_${strategyId}`;
    const savedStrategy = localStorage.getItem(strategyKey);
    
    if (!savedStrategy) {
      console.log(`No saved strategy found with key: ${strategyKey}`);
      return null;
    }
    
    console.log(`Loading strategy from localStorage key: ${strategyKey}`);
    let parsed = JSON.parse(savedStrategy) as StrategyData;
    
    // Migrate market_data to candle_data
    const migrated = migrateExpressionType(parsed);
    
    // Save the migrated version back to localStorage
    localStorage.setItem(strategyKey, JSON.stringify(migrated));
    console.log('Migrated market_data to candle_data and saved back to localStorage');
    
    // Validate the structure before returning
    if (Array.isArray(migrated.nodes) && Array.isArray(migrated.edges) && migrated.name) {
      console.log(`Successfully loaded strategy: ${migrated.name} (${migrated.id}) for user: ${userId}`);
      return {
        nodes: migrated.nodes,
        edges: migrated.edges,
        name: migrated.name,
        globalVariables: migrated.globalVariables || []
      };
    } else {
      console.warn('Invalid strategy structure in localStorage');
      return null;
    }
  } catch (error) {
    console.error(`Failed to load strategy ${strategyId}:`, error);
    toast.error("Failed to load strategy");
    return null;
  }
};
