
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createNewStrategy, saveStrategyToStorage } from '../strategy-store/strategy-operations';
import { setSavingState, loadAllStrategies } from '../strategy-store/supabase-persistence';
import { Strategy } from './types';

export const useStrategyCreation = (strategies: Strategy[]) => {
  const navigate = useNavigate();

  // Create a new strategy and navigate to the builder
  const createStrategy = useCallback(async (strategyName: string): Promise<boolean> => {
    console.log('🚀 useStrategyCreation - createStrategy called with:', strategyName);
    
    if (!strategyName.trim()) {
      console.log('❌ useStrategyCreation - Empty name, returning false');
      return false;
    }

    // Check for duplicate names from database (not localStorage)
    const dbStrategies = await loadAllStrategies();
    console.log('📋 useStrategyCreation - Database strategies:', dbStrategies.map(s => s.name));
    
    const isDuplicate = dbStrategies.some(
      strategy => strategy.name.toLowerCase() === strategyName.trim().toLowerCase()
    );

    if (isDuplicate) {
      console.log('❌ useStrategyCreation - Duplicate name found in database, returning false');
      return false;
    }
    
    console.log('✅ useStrategyCreation - Validation passed, proceeding with creation');

    // Show saving indicator
    setSavingState(true);
    
    try {
      const newStrategy = createNewStrategy(strategyName);
      console.log('📝 useStrategyCreation - New strategy created:', newStrategy);
      
      if (saveStrategyToStorage(newStrategy)) {
        console.log('💾 useStrategyCreation - Strategy saved to storage successfully');
        
        // Small delay to show the saving state like auto-save
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Navigate to strategy builder with ID, name, and new flag
        const navUrl = `/app/strategy-builder?id=${newStrategy.id}&name=${encodeURIComponent(strategyName)}&new=true`;
        console.log('🧭 useStrategyCreation - Navigating to:', navUrl);
        navigate(navUrl);
        return true;
      }
      console.log('❌ useStrategyCreation - Failed to save strategy to storage');
      return false;
    } catch (error) {
      console.error('❌ useStrategyCreation - Error creating strategy:', error);
      return false;
    } finally {
      setSavingState(false);
    }
  }, [strategies, navigate]);

  return {
    createStrategy
  };
};
