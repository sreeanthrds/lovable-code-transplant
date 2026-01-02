
import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Strategy } from './types';
import { getStrategiesList } from '../strategy-store/strategy-operations';

export const useStrategiesList = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [strategies, setStrategies] = useState<Strategy[]>([]);

  // Load strategies list from storage
  const loadStrategies = useCallback(() => {
    setIsLoading(true);
    try {
      const rawStrategies = getStrategiesList();
      
      // Format dates for display and ensure all fields match the Strategy interface
      const formattedStrategies = rawStrategies.map(strategy => ({
        id: strategy.id,
        name: strategy.name,
        // Ensure description is always a string, using an empty string as fallback
        description: strategy.description || "",
        lastModified: strategy.lastModified 
          ? format(new Date(strategy.lastModified), 'MMM d, yyyy')
          : format(new Date(), 'MMM d, yyyy'),
        created: strategy.created
          ? format(new Date(strategy.created), 'MMM d, yyyy')
          : format(new Date(), 'MMM d, yyyy')
      }));
      
      setStrategies(formattedStrategies);
    } catch (error) {
      console.error("Error loading strategies:", error);
      toast({
        title: "Error loading strategies",
        description: "There was a problem loading your strategies.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh the strategies list
  const refreshStrategies = useCallback(() => {
    loadStrategies();
    toast({
      title: "Strategies refreshed",
      description: "Your strategies list has been refreshed."
    });
  }, [loadStrategies]);

  return {
    strategies,
    isLoading,
    loadStrategies,
    refreshStrategies,
    setStrategies
  };
};
