
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  loadStrategyFromStorage,
  deleteStrategyFromStorage,
  saveStrategyToStorage
} from '../strategy-store/strategy-operations';
import { setSavingState } from '../strategy-store/supabase-persistence';

export const useStrategyOperations = (
  setStrategies: React.Dispatch<React.SetStateAction<any[]>>
) => {
  const navigate = useNavigate();
  
  // Open an existing strategy
  const openStrategy = useCallback((strategyId: string) => {
    const strategy = loadStrategyFromStorage(strategyId);
    if (strategy) {
      // Fix: Properly encode the strategy name to prevent URL issues
      const encodedName = encodeURIComponent(strategy.name);
      // Navigate to strategy builder with both ID and name
      navigate(`/app/strategy-builder?id=${strategyId}&name=${encodedName}`);
    } else {
      setSavingState(true, "Failed to open strategy - it may have been deleted");
      setTimeout(() => setSavingState(false), 2000);
    }
  }, [navigate]);
  
  // Delete a strategy
  const deleteStrategy = useCallback(async (strategyId: string) => {
    setSavingState(true, "Deleting strategy...");
    
    try {
      const success = deleteStrategyFromStorage(strategyId);
      if (success) {
        setStrategies(prevStrategies => prevStrategies.filter(s => s.id !== strategyId));
        
        setSavingState(true, "Strategy deleted successfully");
        setTimeout(() => setSavingState(false), 1500);
        
        return true;
      } else {
        setSavingState(true, "Failed to delete strategy");
        setTimeout(() => setSavingState(false), 2000);
        return false;
      }
    } catch (error) {
      console.error("Error deleting strategy:", error);
      setSavingState(true, "Error deleting strategy");
      setTimeout(() => setSavingState(false), 2000);
      return false;
    }
  }, [setStrategies]);

  return {
    openStrategy,
    deleteStrategy
  };
};
