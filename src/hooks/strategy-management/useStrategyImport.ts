import { useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { saveStrategyToStorage } from '../strategy-store/strategy-operations';
import { formatIndicatorName } from '@/components/strategy/utils/indicatorHelpers';
import { v4 as uuidv4 } from 'uuid';

export const useStrategyImport = () => {
  // Import strategy from JSON file with user ID and strategy ID updates
  const importStrategy = useCallback((strategyData: any, finalName?: string): boolean => {
    try {
      // Validate the imported data
      if (!strategyData || !strategyData.nodes || !strategyData.edges || !strategyData.name) {
        console.error("Invalid strategy data for import:", strategyData);
        toast({
          title: "Invalid strategy format",
          description: "The imported file does not contain valid strategy data.",
          variant: "destructive"
        });
        return false;
      }
      
      console.log(`Importing strategy: ${strategyData.name} with ${strategyData.nodes.length} nodes and ${strategyData.edges?.length || 0} edges`);
      
      // Process nodes to migrate old format to new format
      const processedNodes = strategyData.nodes.map((node: any) => {
        if (node.type === 'startNode' && node.data) {
          // Handle migration from old format to new UUID-based format
          if (Array.isArray(node.data.indicators) && node.data.indicatorParameters) {
            console.log("Migrating from old indicator format to new UUID-based format");
            
            // Convert old format to new format with UUIDs
            const newIndicators: Record<string, any> = {};
            
            // Use indicatorParameters as the source of truth
            if (typeof node.data.indicatorParameters === 'object' && node.data.indicatorParameters !== null) {
              Object.entries(node.data.indicatorParameters).forEach(([key, params]) => {
                if (params && typeof params === 'object') {
                  const indicatorId = uuidv4();
                  const indicatorName = (params as any).indicator_name || key.split('_')[0];
                  const displayName = formatIndicatorName(indicatorName, params);
                  
                  newIndicators[indicatorId] = {
                    display_name: displayName,
                    indicator_name: indicatorName,
                    ...(params as object)
                  };
                }
              });
            }
            
            // Update node data to new format
            node.data = {
              ...node.data,
              indicators: newIndicators
            };
            
            // Remove the old fields
            delete node.data.indicatorParameters;
          }
          // If indicators is already an object, keep it as is
          else if (typeof node.data.indicators === 'object' && !Array.isArray(node.data.indicators) && node.data.indicators !== null) {
            // Check if it's already in new format (has display_name)
            const firstIndicator = Object.values(node.data.indicators)[0] as any;
            if (firstIndicator && !firstIndicator.display_name) {
              // Convert to new format with display names
              const convertedIndicators: Record<string, any> = {};
              Object.entries(node.data.indicators).forEach(([key, params]) => {
                if (params && typeof params === 'object') {
                  const indicatorId = uuidv4();
                  const indicatorName = (params as any).indicator_name || key.split('_')[0];
                  const displayName = formatIndicatorName(indicatorName, params);
                  
                  convertedIndicators[indicatorId] = {
                    display_name: displayName,
                    indicator_name: indicatorName,
                    ...(params as object)
                  };
                }
              });
              node.data.indicators = convertedIndicators;
            }
          }
          // If indicators is still an array, convert to empty object
          else if (Array.isArray(node.data.indicators)) {
            node.data.indicators = {};
          }
        }
        return node;
      });
      
      // Generate a new UUID for the imported strategy to prevent overwriting
      const newStrategy = {
        ...strategyData,
        nodes: processedNodes,
        id: uuidv4(), // Always generate new UUID for imported strategy
        name: finalName || strategyData.name, // Use provided name or original name
        lastModified: new Date().toISOString(),
        created: new Date().toISOString(),
        // Remove any existing userId/strategyId to ensure fresh import
        userId: undefined,
        strategyId: undefined
      };
      
      // Save the imported strategy
      if (saveStrategyToStorage(newStrategy)) {
        toast({
          title: "Strategy imported",
          description: `Imported strategy: ${newStrategy.name}`
        });
        return true;
      } else {
        toast({
          title: "Import failed",
          description: "Failed to save the imported strategy.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error("Error importing strategy:", error);
      toast({
        title: "Import failed",
        description: "An error occurred while importing the strategy.",
        variant: "destructive"
      });
      return false;
    }
  }, []);

  return {
    importStrategy
  };
};
