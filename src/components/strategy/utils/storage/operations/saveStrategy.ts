
import { Node, Edge } from '@xyflow/react';
import { GlobalVariable } from '@/hooks/strategy-store/types';
import { sanitizeForStorage } from '../utils/sanitizeUtils';
import { createStrategyObject, StrategyData } from '../utils/strategyModel';
import { v4 as uuidv4 } from 'uuid';
import { useClerkUser } from '@/hooks/useClerkUser';

// Track if a save operation is in progress to avoid parallel operations
let saveInProgress = false;

// Create a debounced version of save to prevent excessive writes
let saveTimeout: number | null = null;

/**
 * Helper function to validate if a string is a valid UUID
 */
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
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
 * Saves the current strategy to localStorage only (no Supabase to avoid UUID errors)
 * Now user-specific to prevent cross-user access
 */
export const saveStrategyToLocalStorage = async (
  nodes: Node[], 
  edges: Edge[], 
  strategyId?: string, 
  strategyName?: string,
  globalVariables?: GlobalVariable[]
) => {
  // Get current user ID - required for user-specific storage
  const userId = getCurrentUserId();
  if (!userId) {
    console.warn('No authenticated user, cannot save strategy');
    return;
  }

  // Ensure we always have a proper UUID - never use timestamp-based IDs
  let finalStrategyId = strategyId;
  
  // If no ID provided or if the ID is not a valid UUID, generate a new one
  if (!finalStrategyId || !isValidUUID(finalStrategyId)) {
    finalStrategyId = uuidv4();
    console.log(`Generated new UUID for strategy: ${finalStrategyId}`);
  }
  
  const finalStrategyName = strategyName || "Untitled Strategy";
  
  console.log(`Saving strategy with valid UUID: ${finalStrategyId} for user: ${userId}`);
  
  // Cancel any pending save operations
  if (saveTimeout !== null) {
    window.clearTimeout(saveTimeout);
  }
  
  // If a save is already in progress, defer this save
  if (saveInProgress) {
    saveTimeout = window.setTimeout(() => {
      saveStrategyToLocalStorage(nodes, edges, finalStrategyId, finalStrategyName, globalVariables);
    }, 1000);
    return;
  }
  
  // Debounce the save operation
  saveTimeout = window.setTimeout(async () => {
    saveInProgress = true;
    
    try {
      // Only save if we have valid nodes and edges
      if (!Array.isArray(nodes) || !Array.isArray(edges)) {
        console.warn('Invalid nodes or edges provided to saveStrategyToLocalStorage');
        saveInProgress = false;
        saveTimeout = null;
        return;
      }
      
      // Save only to local storage with user-specific key
      saveLocalOnly(nodes, edges, finalStrategyId, finalStrategyName, userId, globalVariables);
      
    } catch (error) {
      console.error('Failed to save strategy:', error);
      // Still try to save locally as fallback
      saveLocalOnly(nodes, edges, finalStrategyId, finalStrategyName, userId, globalVariables);
    } finally {
      saveInProgress = false;
      saveTimeout = null;
    }
  }, 500);
};

/**
 * Save only to localStorage with user-specific keys
 */
const saveLocalOnly = (
  nodes: Node[], 
  edges: Edge[], 
  strategyId: string, 
  strategyName: string,
  userId: string,
  globalVariables?: GlobalVariable[]
) => {
  try {
    // Deep clone to avoid reference issues
    const clonedNodes = JSON.parse(JSON.stringify(nodes));
    const clonedEdges = JSON.parse(JSON.stringify(edges));
    
    // Sanitize to remove circular references
    const sanitizedNodes = sanitizeForStorage(clonedNodes);
    const sanitizedEdges = sanitizeForStorage(clonedEdges);
    
    // Get existing creation date if available (user-specific)
    const existingCreationDate = localStorage.getItem(`user_${userId}_strategy_${strategyId}_created`);
    
    // Create the complete strategy object (matches export format)
    const strategyData = createStrategyObject(
      sanitizedNodes, 
      sanitizedEdges, 
      strategyId, 
      strategyName,
      existingCreationDate,
      globalVariables
    );

    // Enrich with metadata for compatibility
    (strategyData as any).userId = userId;
    (strategyData as any).strategyId = strategyId;
    
    // Save the creation date if it's the first time (user-specific)
    if (!existingCreationDate) {
      localStorage.setItem(`user_${userId}_strategy_${strategyId}_created`, strategyData.created);
    }
    
    // Save to the user-specific strategy key
    const strategyKey = `user_${userId}_strategy_${strategyId}`;
    localStorage.setItem(strategyKey, JSON.stringify(strategyData));
    console.log(`Saved strategy to localStorage with user-specific key: ${strategyKey}`);
    
    // Update strategies list (user-specific)
    updateStrategiesList(strategyData, userId);
    
    console.log('Strategy saved successfully for user:', userId);
  } catch (error) {
    console.error('Failed to save strategy locally:', error);
  }
};

/**
 * Update the strategies list in localStorage (user-specific)
 */
const updateStrategiesList = (strategyData: StrategyData, userId: string) => {
  let strategies = [];
  try {
    const strategiesKey = `user_${userId}_strategies`;
    const savedStrategiesList = localStorage.getItem(strategiesKey);
    if (savedStrategiesList) {
      try {
        strategies = JSON.parse(savedStrategiesList);
      } catch (e) {
        console.error('Failed to parse strategies list:', e);
        strategies = [];
      }
    }
  } catch (e) {
    console.error('Failed to get strategies list:', e);
    strategies = [];
  }
  
  // Extract metadata for the strategies list
  const strategyMetadata = {
    id: strategyData.id,
    name: strategyData.name,
    lastModified: strategyData.lastModified,
    created: strategyData.created,
    description: strategyData.description
  };
  
  // Check if strategy already exists in the list
  const existingIndex = strategies.findIndex((s: any) => s.id === strategyData.id);
  if (existingIndex >= 0) {
    // Update existing strategy metadata
    strategies[existingIndex] = strategyMetadata;
    console.log(`Updated existing strategy in list at index ${existingIndex}`);
  } else {
    // Add new strategy to list
    strategies.push(strategyMetadata);
    console.log(`Added new strategy to list, now contains ${strategies.length} strategies`);
  }
  
  // Save updated strategies list (user-specific)
  const strategiesKey = `user_${userId}_strategies`;
  localStorage.setItem(strategiesKey, JSON.stringify(strategies));
  console.log('Saved updated strategies list to localStorage for user:', userId);
};
