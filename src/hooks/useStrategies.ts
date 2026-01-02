
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { strategyService } from '@/lib/supabase/services/strategy-service';
import { setSavingState } from '@/hooks/strategy-store/supabase-persistence';
import { cleanupOrphanedStrategies } from '@/hooks/strategy-store/cleanup-local-storage';

export interface Strategy {
  id: string;
  name: string;
  description: string;
  lastModified: string;
  created: string;
  returns?: number;
}

export const useStrategies = (userId?: string) => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load strategies from Supabase database
  const loadStrategies = async () => {
    if (!userId) {
      console.log('No userId provided, skipping strategy fetch');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      console.log('Fetching strategies from database for user:', userId);
      const dbStrategies = await strategyService.getStrategies(userId);
      console.log('Fetched strategies from database:', dbStrategies.length, dbStrategies);

      // Format dates for display
      const formattedStrategies = dbStrategies.map((strategy: any) => ({
        id: strategy.id,
        name: strategy.name,
        description: strategy.description || '',
        lastModified: strategy.updated_at 
          ? format(new Date(strategy.updated_at), 'MMM d, yyyy')
          : format(new Date(), 'MMM d, yyyy'),
        created: strategy.created_at
          ? format(new Date(strategy.created_at), 'MMM d, yyyy')
          : format(new Date(), 'MMM d, yyyy')
      }));
      
      setStrategies(formattedStrategies);
      
      // Clean up orphaned localStorage entries
      const dbIds = dbStrategies.map((s: any) => s.id);
      cleanupOrphanedStrategies(dbIds);
    } catch (error) {
      console.error("Error loading strategies from database:", error);
      setSavingState(true, "Error loading strategies");
      setTimeout(() => setSavingState(false), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStrategies();
  }, [userId]);

  const handleDeleteStrategy = async (id: string) => {
    if (!userId) return false;
    
    setSavingState(true, "Deleting strategy...");
    
    try {
      const success = await strategyService.deleteStrategy(id, userId);
      if (success) {
        setStrategies(prevStrategies => prevStrategies.filter(strategy => strategy.id !== id));
        
        // Show success message briefly
        setSavingState(true, "Strategy deleted successfully");
        setTimeout(() => setSavingState(false), 1500);
      } else {
        setSavingState(true, "Failed to delete strategy");
        setTimeout(() => setSavingState(false), 2000);
      }
      return success;
    } catch (error) {
      console.error("Error deleting strategy:", error);
      setSavingState(true, "Error deleting strategy");
      setTimeout(() => setSavingState(false), 2000);
      return false;
    }
  };

  const refreshStrategies = async () => {
    setSavingState(true, "Refreshing strategies...");
    await loadStrategies();
    
    // Show success message briefly
    setTimeout(() => {
      setSavingState(true, "Strategies refreshed");
      setTimeout(() => setSavingState(false), 1500);
    }, 500);
  };

  return {
    strategies,
    isLoading,
    refreshStrategies,
    deleteStrategy: handleDeleteStrategy
  };
};
