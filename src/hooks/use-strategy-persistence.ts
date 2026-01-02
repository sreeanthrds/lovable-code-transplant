import { useState, useEffect } from 'react';
import { Node, Edge } from '@xyflow/react';
import { useToast } from './use-toast';
import { v4 as uuidv4 } from 'uuid';

interface Strategy {
  id: string;
  name: string;
  lastModified: string;
  created: string;
  description?: string;
}

export function useStrategyPersistence() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStrategy, setCurrentStrategy] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const { toast } = useToast();

  // Save strategy to local storage
  const saveStrategyToLocalStorage = (
    nodes: Node[],
    edges: Edge[],
    strategyId: string,
    strategyName: string
  ) => {
    try {
      // Save the strategy data
      localStorage.setItem(`strategy_${strategyId}`, JSON.stringify({
        nodes,
        edges,
        name: strategyName,
        lastModified: new Date().toISOString()
      }));
      
      // Update or add to strategies list
      const strategiesList = JSON.parse(localStorage.getItem('strategies') || '[]');
      const existingIndex = strategiesList.findIndex((s: Strategy) => s.id === strategyId);
      
      if (existingIndex >= 0) {
        strategiesList[existingIndex] = {
          ...strategiesList[existingIndex],
          name: strategyName,
          lastModified: new Date().toISOString()
        };
      } else {
        strategiesList.push({
          id: strategyId,
          name: strategyName,
          created: new Date().toISOString(),
          lastModified: new Date().toISOString()
        });
      }
      
      localStorage.setItem('strategies', JSON.stringify(strategiesList));
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  };

  // Load strategies list
  const loadStrategiesList = async () => {
    setIsLoading(true);
    try {
      // Load from local storage
      const localStrategiesJson = localStorage.getItem('strategies');
      const strategiesList: Strategy[] = localStrategiesJson 
        ? JSON.parse(localStrategiesJson) 
        : [];
      
      setStrategies(strategiesList.sort((a, b) => 
        new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
      ));
    } catch (error) {
      console.error('Error loading strategies list:', error);
      toast({
        title: "Error loading strategies",
        description: "Could not load your strategies list.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save current nodes and edges
  const saveCurrentStrategy = async (
    nodes: Node[],
    edges: Edge[],
    strategyId?: string,
    strategyName?: string
  ) => {
    const id = strategyId || currentStrategy?.id || uuidv4(); // Use proper UUID
    const name = strategyName || currentStrategy?.name || "Untitled Strategy";
    
    const success = saveStrategyToLocalStorage(nodes, edges, id, name);
    
    if (success) {
      setCurrentStrategy({ id, name });
      toast({
        title: "Strategy saved",
        description: `"${name}" has been saved to your device.`
      });
      
      loadStrategiesList(); // Refresh the strategies list
    } else {
      toast({
        title: "Failed to save strategy",
        description: "Could not save your strategy. Please try again.",
        variant: "destructive"
      });
    }
    
    return success;
  };

  // Load a specific strategy
  const loadStrategyById = async (strategyId: string) => {
    setIsLoading(true);
    try {
      // Load from local storage
      const localData = localStorage.getItem(`strategy_${strategyId}`);
      if (localData) {
        const parsedData = JSON.parse(localData);
        
        // Find strategy name in list
        const strategy = strategies.find(s => s.id === strategyId);
        setCurrentStrategy({
          id: strategyId,
          name: strategy?.name || parsedData.name || "Untitled Strategy"
        });
        
        return {
          nodes: parsedData.nodes,
          edges: parsedData.edges,
          name: parsedData.name
        };
      }
      
      toast({
        title: "Strategy not found",
        description: "Could not load the requested strategy.",
        variant: "destructive"
      });
      return null;
    } catch (error) {
      console.error('Error loading strategy:', error);
      toast({
        title: "Error loading strategy",
        description: "Could not load the requested strategy.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a strategy
  const removeStrategy = async (strategyId: string) => {
    try {
      // Remove from local storage
      localStorage.removeItem(`strategy_${strategyId}`);
      
      // Remove from strategies list
      const strategiesList = JSON.parse(localStorage.getItem('strategies') || '[]');
      const updatedStrategies = strategiesList.filter((s: any) => s.id !== strategyId);
      localStorage.setItem('strategies', JSON.stringify(updatedStrategies));
      
      // Update local state
      setStrategies(prev => prev.filter(s => s.id !== strategyId));
      
      // If current strategy was deleted, clear it
      if (currentStrategy?.id === strategyId) {
        setCurrentStrategy(null);
      }
      
      toast({
        title: "Strategy deleted",
        description: "Your strategy has been removed."
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting strategy:', error);
      toast({
        title: "Error deleting strategy",
        description: "Could not delete the strategy.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Load strategies on mount
  useEffect(() => {
    loadStrategiesList();
  }, []);

  return {
    strategies,
    isLoading,
    currentStrategy,
    loadStrategiesList,
    saveCurrentStrategy,
    loadStrategyById,
    removeStrategy,
    setCurrentStrategy
  };
}
