import { useEffect } from 'react';
import { useStrategyStore } from '@/hooks/use-strategy-store';
import { TimeframeMigrationService } from './TimeframeMigrationService';
import { TimeframeResolver } from './TimeframeResolver';

export const useTimeframeMigration = () => {
  const strategyStore = useStrategyStore();

  useEffect(() => {
    // Initialize TimeframeResolver with current timeframes
    const startNode = strategyStore.nodes.find(node => node.type === 'startNode');
    if (startNode && startNode.data) {
      const allTimeframes = [
        ...((startNode.data as any).tradingInstrumentConfig?.timeframes || []),
        ...((startNode.data as any).supportingInstrumentConfig?.timeframes || [])
      ];
      TimeframeResolver.initialize(allTimeframes);
    }
  }, [strategyStore.nodes]);

  const migrateStrategy = () => {
    try {
      const strategyData = {
        nodes: strategyStore.nodes,
        edges: strategyStore.edges
      };

      const result = TimeframeMigrationService.migrateStrategy(strategyData);
      
      if (result.migrated) {
        // Add any created timeframes to the start node
        if (result.createdTimeframes.length > 0) {
          const startNode = strategyStore.nodes.find(node => node.type === 'startNode');
          if (startNode && startNode.data) {
            const nodeData = startNode.data as any;
            // Update trading instrument timeframes if it exists
            if (nodeData.tradingInstrumentConfig) {
              // Use direct node update from store
              const updatedNode = {
                ...startNode,
                data: {
                  ...nodeData,
                  tradingInstrumentConfig: {
                    ...nodeData.tradingInstrumentConfig,
                    timeframes: [
                      ...(nodeData.tradingInstrumentConfig.timeframes || []),
                      ...result.createdTimeframes
                    ]
                  }
                }
              };
              // Update the node in the store manually
              strategyStore.setNodes(strategyStore.nodes.map(n => 
                n.id === startNode.id ? updatedNode : n
              ));
            }
          }
        }

        // Update all nodes with migrated data
        const updatedNodes = strategyStore.nodes.map(existingNode => {
          const migratedNode = strategyData.nodes.find(n => n.id === existingNode.id);
          if (migratedNode && JSON.stringify(existingNode.data) !== JSON.stringify(migratedNode.data)) {
            return { ...existingNode, data: migratedNode.data };
          }
          return existingNode;
        });
        
        strategyStore.setNodes(updatedNodes);

        console.log('Strategy migrated successfully:', result);
      }

      return result;
    } catch (error) {
      console.error('Migration failed:', error);
      return {
        migrated: false,
        warnings: ['Migration failed: ' + error.message],
        createdTimeframes: []
      };
    }
  };

  return { migrateStrategy };
};