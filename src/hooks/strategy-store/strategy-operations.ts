
import { Node, Edge } from '@xyflow/react';
import { toast } from '@/hooks/use-toast';
import { initialNodes } from '@/components/strategy/utils/nodes/initialNodes';
import { v4 as uuidv4 } from 'uuid';

// Core operations for strategy persistence
export interface StrategyData {
  id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
  created: string;
  lastModified: string;
  description?: string;
}

export interface StrategyMetadata {
  id: string;
  name: string;
  created: string;
  lastModified: string;
  description?: string;
}

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

// Create a new strategy with initial nodes
export const createNewStrategy = (name: string = 'Untitled Strategy'): StrategyData => {
  const now = new Date().toISOString();
  const id = uuidv4(); // Use proper UUID instead of timestamp-based ID
  
  return {
    id,
    name,
    nodes: JSON.parse(JSON.stringify(initialNodes)),
    edges: [],
    created: now,
    lastModified: now,
    description: 'New trading strategy'
  };
};

// Save strategy to local storage (user-specific)
export const saveStrategyToStorage = (strategy: StrategyData): boolean => {
  try {
    // Get current user ID - required for user-specific storage
    const userId = getCurrentUserId();
    if (!userId) {
      console.warn('No authenticated user, cannot save strategy');
      return false;
    }
    
    // Update last modified time
    const updatedStrategy = {
      ...strategy,
      lastModified: new Date().toISOString()
    };
    
    // Save the complete strategy (user-specific)
    const strategyKey = `user_${userId}_strategy_${strategy.id}`;
    localStorage.setItem(strategyKey, JSON.stringify(updatedStrategy));
    
    // Update the strategies list (user-specific)
    updateStrategiesList(updatedStrategy, userId);
    
    return true;
  } catch (error) {
    console.error('Error saving strategy:', error);
    return false;
  }
};

// Load strategy from local storage (user-specific)
export const loadStrategyFromStorage = (strategyId: string): StrategyData | null => {
  try {
    // Get current user ID - required for user-specific storage
    const userId = getCurrentUserId();
    if (!userId) {
      console.warn('No authenticated user, cannot load strategy');
      return null;
    }
    
    const strategyKey = `user_${userId}_strategy_${strategyId}`;
    const strategyJson = localStorage.getItem(strategyKey);
    
    if (!strategyJson) {
      console.log(`No strategy found with ID: ${strategyId} for user: ${userId}`);
      return null;
    }
    
    const strategy = JSON.parse(strategyJson) as StrategyData;
    
    // Validate the loaded strategy has the expected structure
    if (!strategy.id || !Array.isArray(strategy.nodes) || !Array.isArray(strategy.edges)) {
      console.error('Invalid strategy format:', strategy);
      return null;
    }
    
    // Log successful loading for debugging
    console.log(`Successfully loaded strategy: ${strategy.name} (${strategy.id}) for user: ${userId}`);
    
    return strategy;
  } catch (error) {
    console.error('Error loading strategy:', error);
    return null;
  }
};

// Delete strategy from storage (user-specific)
export const deleteStrategyFromStorage = (strategyId: string): boolean => {
  try {
    // Get current user ID - required for user-specific storage
    const userId = getCurrentUserId();
    if (!userId) {
      console.warn('No authenticated user, cannot delete strategy');
      return false;
    }
    
    // Remove the strategy data (user-specific)
    const strategyKey = `user_${userId}_strategy_${strategyId}`;
    localStorage.removeItem(strategyKey);
    
    // Remove creation date (user-specific)
    const createdKey = `user_${userId}_strategy_${strategyId}_created`;
    localStorage.removeItem(createdKey);
    
    // Update strategies list (user-specific)
    const strategiesList = getStrategiesList();
    const updatedStrategies = strategiesList.filter(s => s.id !== strategyId);
    const strategiesKey = `user_${userId}_strategies`;
    localStorage.setItem(strategiesKey, JSON.stringify(updatedStrategies));
    
    return true;
  } catch (error) {
    console.error('Error deleting strategy:', error);
    return false;
  }
};

// Get list of all strategies (user-specific)
export const getStrategiesList = (): StrategyMetadata[] => {
  try {
    // Get current user ID - required for user-specific storage
    const userId = getCurrentUserId();
    if (!userId) {
      console.warn('No authenticated user, cannot load strategies');
      return [];
    }
    
    const strategiesKey = `user_${userId}_strategies`;
    const strategiesJson = localStorage.getItem(strategiesKey);
    if (!strategiesJson) return [];
    
    const strategies = JSON.parse(strategiesJson);
    if (!Array.isArray(strategies)) {
      console.warn('Strategies list is not an array, resetting');
      return [];
    }
    
    return strategies;
  } catch (error) {
    console.error('Error loading strategies list:', error);
    return [];
  }
};

// Update the strategies list when a strategy is saved or modified (user-specific)
const updateStrategiesList = (strategy: StrategyData, userId: string): void => {
  try {
    // Extract metadata for the strategies list
    const strategyMetadata: StrategyMetadata = {
      id: strategy.id,
      name: strategy.name,
      created: strategy.created,
      lastModified: strategy.lastModified,
      description: strategy.description
    };
    
    const strategiesList = getStrategiesList();
    const existingIndex = strategiesList.findIndex(s => s.id === strategy.id);
    
    if (existingIndex >= 0) {
      // Update existing strategy
      strategiesList[existingIndex] = strategyMetadata;
    } else {
      // Add new strategy
      strategiesList.push(strategyMetadata);
    }
    
    // Save updated list (user-specific)
    const strategiesKey = `user_${userId}_strategies`;
    localStorage.setItem(strategiesKey, JSON.stringify(strategiesList));
  } catch (error) {
    console.error('Error updating strategies list:', error);
  }
};
