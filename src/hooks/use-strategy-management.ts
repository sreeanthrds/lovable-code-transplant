
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  saveStrategy, 
  loadAllStrategies, 
  deleteStrategy as deleteStrategyFromStorage 
} from './strategy-store/supabase-persistence';
import { createNewStrategy } from './strategy-store/strategy-operations';
import { setSavingState } from './strategy-store/supabase-persistence';

interface Strategy {
  id: string;
  name: string;
  description: string;
  created: string;
  lastModified: string;
}

export const useStrategyManagement = () => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Load strategies from appropriate storage (Supabase or localStorage)
  const loadStrategies = useCallback(async () => {
    setIsLoading(true);
    try {
      const loadedStrategies = await loadAllStrategies();
      setStrategies(loadedStrategies);
      console.log('Loaded strategies in hook:', loadedStrategies.length);
    } catch (error) {
      console.error('Error loading strategies:', error);
      setSavingState(true, "Error loading strategies");
      setTimeout(() => setSavingState(false), 2000);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new strategy
  const createStrategy = useCallback(async (strategyName: string) => {
    if (!strategyName.trim()) {
      setSavingState(true, "Strategy name required");
      setTimeout(() => setSavingState(false), 2000);
      return;
    }

    // Check for duplicate names
    const isDuplicate = strategies.some(
      strategy => strategy.name.toLowerCase() === strategyName.trim().toLowerCase()
    );

    if (isDuplicate) {
      setSavingState(true, "Strategy name already exists");
      setTimeout(() => setSavingState(false), 2000);
      return;
    }

    try {
      setSavingState(true, "Creating strategy...");
      
      const newStrategy = createNewStrategy(strategyName);
      
      // Save the new strategy
      const success = await saveStrategy(
        newStrategy.nodes,
        newStrategy.edges,
        newStrategy.id,
        newStrategy.name
      );

      if (success) {
        setSavingState(true, "Strategy created successfully");
        
        // Navigate to strategy builder
        navigate(`/app/strategy-builder?id=${newStrategy.id}&name=${encodeURIComponent(strategyName)}`);
        
        // Refresh the strategies list
        await loadStrategies();
        
        setTimeout(() => setSavingState(false), 1500);
      } else {
        setSavingState(true, "Failed to create strategy");
        setTimeout(() => setSavingState(false), 2000);
      }
    } catch (error) {
      console.error('Error creating strategy:', error);
      setSavingState(true, "Error creating strategy");
      setTimeout(() => setSavingState(false), 2000);
    }
  }, [strategies, navigate, loadStrategies]);

  // Delete a strategy
  const deleteStrategy = useCallback(async (strategyId: string) => {
    try {
      setSavingState(true, "Deleting strategy...");
      
      const success = await deleteStrategyFromStorage(strategyId);
      
      if (success) {
        setStrategies(prevStrategies => 
          prevStrategies.filter(s => s.id !== strategyId)
        );
        
        setSavingState(true, "Strategy deleted successfully");
        setTimeout(() => setSavingState(false), 1500);
        
        return true;
      } else {
        setSavingState(true, "Failed to delete strategy");
        setTimeout(() => setSavingState(false), 2000);
        return false;
      }
    } catch (error) {
      console.error('Error deleting strategy:', error);
      setSavingState(true, "Error deleting strategy");
      setTimeout(() => setSavingState(false), 2000);
      return false;
    }
  }, []);

  // Refresh strategies list
  const refreshStrategies = useCallback(async () => {
    setSavingState(true, "Refreshing strategies...");
    await loadStrategies();
    setSavingState(true, "Strategies refreshed");
    setTimeout(() => setSavingState(false), 1500);
  }, [loadStrategies]);

  return {
    strategies,
    isLoading,
    loadStrategies,
    createStrategy,
    deleteStrategy,
    refreshStrategies
  };
};
