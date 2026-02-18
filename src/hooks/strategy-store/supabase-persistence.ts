import { strategyService } from '@/lib/supabase/services/strategy-service';
import { versionHistoryService } from '@/lib/supabase/services/version-history-service';
import { tradelayoutClient as supabase } from '@/lib/supabase/tradelayout-client';
import { Node, Edge } from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import { generateStrategyDescription } from '@/lib/utils/strategy-description';

// Helper function to validate if a string is a valid UUID
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

// Create a saving state store with message support
let savingState = {
  isSaving: false,
  message: 'Saving...',
  listeners: new Set<(state: { isSaving: boolean; message: string }) => void>()
};

export const subscribeSavingState = (callback: (state: { isSaving: boolean; message: string }) => void) => {
  savingState.listeners.add(callback);
  return () => savingState.listeners.delete(callback);
};

export const setSavingState = (isSaving: boolean, message: string = 'Saving...') => {
  savingState.isSaving = isSaving;
  savingState.message = message;
  const state = { isSaving, message };
  savingState.listeners.forEach(callback => callback(state));
};

// Get current user ID from window context (Clerk)
const getCurrentUserId = () => {
  try {
    // Access Clerk user from window context
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

// Check if user is authenticated (Clerk)
export const isAuthenticated = () => {
  try {
    const clerk = (window as any).Clerk;
    return !!(clerk && clerk.user);
  } catch (error) {
    console.error('Error checking authentication status:', error);
    return false;
  }
};

// Redirect to home page if not authenticated
const redirectToHome = () => {
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
};

// Save strategy to Supabase (requires authentication)
export const saveStrategy = async (
  nodes: Node[],
  edges: Edge[],
  strategyId: string,
  strategyName: string,
  globalVariables?: any[]
) => {
  // Check authentication first
  if (!isAuthenticated()) {
    console.warn('User not authenticated, redirecting to home');
    redirectToHome();
    return false;
  }

  try {
    // CRITICAL: Protect against saving empty edges when connected nodes exist
    // This prevents accidental data loss from race conditions
    const nonStartNonVirtualNodes = nodes.filter(n => 
      n.type !== 'startNode' && !n.data?.isVirtual && !n.data?.isStrategyOverview
    );
    
    if (edges.length === 0 && nonStartNonVirtualNodes.length > 0) {
      console.error('🚫 BLOCKED: Attempted to save empty edges with connected nodes!', {
        nodeCount: nodes.length,
        nonStartNodeCount: nonStartNonVirtualNodes.length,
        edgeCount: edges.length
      });
      // Don't save - this would cause data loss
      return false;
    }
    
    setSavingState(true, 'Saving strategy to database...');
    
    // Get current user ID
    const userId = getCurrentUserId();
    
    if (!userId) {
      console.error('No user ID available');
      setSavingState(true, 'Error: User not authenticated');
      setTimeout(() => setSavingState(false), 2000);
      return false;
    }
    
    // Ensure we always have a valid UUID
    let finalStrategyId = strategyId;
    if (!isValidUUID(strategyId)) {
      finalStrategyId = uuidv4();
      console.log(`Invalid strategy ID detected: ${strategyId}, using new UUID: ${finalStrategyId}`);
    }
    
    console.log('Saving strategy to database:', { 
      strategyId: finalStrategyId, 
      strategyName, 
      nodeCount: nodes.length, 
      edgeCount: edges.length,
      userId: userId
    });
    
    // Save to Supabase only
    const supabaseResult = await strategyService.saveStrategy({
      id: finalStrategyId,
      name: strategyName,
      nodes,
      edges,
      globalVariables: globalVariables || [],
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      description: generateStrategyDescription(nodes)
    }, userId);
    
    if (supabaseResult) {
      console.log('Successfully saved to database');
      
      // Save a version snapshot (non-blocking, don't fail if version save fails)
      versionHistoryService.saveVersion(finalStrategyId, strategyName, nodes, edges)
        .then(saved => {
          if (saved) {
            console.log('📚 Version snapshot saved');
          }
        })
        .catch(err => {
          console.warn('⚠️ Failed to save version snapshot:', err);
        });
      
      setSavingState(true, 'Strategy saved successfully');
      setTimeout(() => setSavingState(false), 1500);
      return true;
    } else {
      console.error('Failed to save to database');
      setSavingState(true, 'Error saving strategy');
      setTimeout(() => setSavingState(false), 2000);
      return false;
    }
    
  } catch (error) {
    console.error('Error saving strategy:', error);
    setSavingState(true, 'Error saving strategy');
    setTimeout(() => setSavingState(false), 2000);
    return false;
  }
};

// Load strategy from Supabase (requires authentication)
export const loadStrategy = async (strategyId: string) => {
  console.log('🔥 loadStrategy called with strategyId:', strategyId);
  
  // Check authentication first
  if (!isAuthenticated()) {
    console.warn('❌ User not authenticated, redirecting to home');
    redirectToHome();
    return null;
  }

  try {
    console.log('✅ User authenticated, proceeding with strategy loading:', strategyId);
    
    // Get current user ID
    const userId = getCurrentUserId();
    console.log('👤 Current user ID:', userId);
    
    if (!userId) {
      console.error('❌ No user ID available');
      return null;
    }
    
    // Load from Supabase only
    console.log('📡 Loading from database for user:', userId, 'strategy:', strategyId);
    const supabaseStrategy = await strategyService.getStrategyById(strategyId, userId);
    
    console.log('📋 Database load result:', {
      found: !!supabaseStrategy,
      strategy: supabaseStrategy
    });
    
    if (supabaseStrategy) {
      console.log('✅ Successfully loaded from database:', {
        id: supabaseStrategy.id,
        name: supabaseStrategy.name,
        hasStrategy: !!supabaseStrategy.strategy,
        strategyType: typeof supabaseStrategy.strategy
      });
      
      // Parse the complete strategy data
      const strategyData = typeof supabaseStrategy.strategy === 'string' 
        ? JSON.parse(supabaseStrategy.strategy) 
        : supabaseStrategy.strategy;
      
      console.log('🔍 Parsed strategy data:', {
        nodes: strategyData?.nodes?.length || 0,
        edges: strategyData?.edges?.length || 0,
        hasCompleteData: !!(strategyData?.nodes && strategyData?.edges)
      });
      
      const result = {
        nodes: strategyData?.nodes || [],
        edges: strategyData?.edges || [],
        globalVariables: strategyData?.globalVariables || [],
        name: supabaseStrategy.name
      };
      
      console.log('🎯 Returning strategy data:', result);
      return result;
    } else {
      console.log('❌ No strategy found in database for ID:', strategyId);
      return null;
    }
  } catch (error) {
    console.error('💥 Error loading strategy:', error);
    return null;
  }
};

// Delete strategy from Supabase (requires authentication)
export const deleteStrategy = async (strategyId: string) => {
  // Check authentication first
  if (!isAuthenticated()) {
    console.warn('User not authenticated, redirecting to home');
    redirectToHome();
    return false;
  }

  try {
    console.log('Deleting strategy from database:', strategyId);
    
    // Get current user ID
    const userId = getCurrentUserId();
    
    if (!userId) {
      console.error('No user ID available');
      return false;
    }
    
    // Delete from Supabase only
    const supabaseResult = await strategyService.deleteStrategy(strategyId, userId);
    if (supabaseResult) {
      console.log('Successfully deleted from database');
      return true;
    } else {
      console.error('Failed to delete from database');
      return false;
    }
  } catch (error) {
    console.error('Error deleting strategy:', error);
    return false;
  }
};

// Load all strategies from Supabase (requires authentication)
export const loadAllStrategies = async () => {
  // Check authentication first
  if (!isAuthenticated()) {
    console.warn('User not authenticated, redirecting to home');
    redirectToHome();
    return [];
  }

  try {
    console.log('Loading all strategies from database');
    
    // Get current user ID
    const userId = getCurrentUserId();
    
    if (!userId) {
      console.error('No user ID available');
      return [];
    }
    
    // Load from Supabase only
    const supabaseStrategies = await strategyService.getStrategies(userId);
    
    if (supabaseStrategies && supabaseStrategies.length > 0) {
      console.log('Loaded strategies from database:', supabaseStrategies.length);
      
      // Transform Supabase format to expected format
      return supabaseStrategies.map((strategy: any) => {
        // Parse strategy data to get nodes for description
        let description = strategy.description || '';
        
        // Always regenerate description from nodes to ensure consistency
        try {
          const strategyData = typeof strategy.strategy === 'string' 
            ? JSON.parse(strategy.strategy) 
            : strategy.strategy;
          
          if (strategyData && strategyData.nodes) {
            description = generateStrategyDescription(strategyData.nodes);
          }
        } catch (e) {
          console.error('Error parsing strategy for description:', e);
          // Fallback to existing description if parsing fails
          description = strategy.description || 'Strategy';
        }
        
        return {
          id: strategy.id,
          name: strategy.name,
          description,
          created: strategy.created_at,
          lastModified: strategy.updated_at
        };
      });
    }
    
    console.log('No strategies found in database');
    return [];
  } catch (error) {
    console.error('Error loading all strategies:', error);
    return [];
  }
};
