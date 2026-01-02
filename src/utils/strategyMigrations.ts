/**
 * Migration utilities for strategy data
 * Migrates maxReEntries to maxEntries across all strategy data
 */

export const migrateMaxReEntriesToMaxEntries = (strategyData: any): any => {
  if (!strategyData) return strategyData;
  
  const migratedData = JSON.parse(JSON.stringify(strategyData));
  
  // Migrate nodes
  if (Array.isArray(migratedData.nodes)) {
    migratedData.nodes = migratedData.nodes.map((node: any) => {
      if (!node.data) return node;
      
      // Migrate position maxEntries in entry nodes
      if (node.data.positions && Array.isArray(node.data.positions)) {
        node.data.positions = node.data.positions.map((pos: any) => {
          // Set default maxEntries if not present
          if (pos.maxEntries === undefined) {
            pos.maxEntries = 1;
          }
          
          // Migrate reEntry config
          if (pos.reEntry) {
            if (pos.reEntry.maxReEntries !== undefined && pos.reEntry.maxEntries === undefined) {
              pos.reEntry.maxEntries = pos.reEntry.maxReEntries;
              delete pos.reEntry.maxReEntries;
            }
          }
          return pos;
        });
      }
      
      // Migrate retryConfig in re-entry nodes
      if (node.data.retryConfig) {
        if (node.data.retryConfig.maxReEntries !== undefined && node.data.retryConfig.maxEntries === undefined) {
          node.data.retryConfig.maxEntries = node.data.retryConfig.maxReEntries;
          delete node.data.retryConfig.maxReEntries;
        }
      }
      
      // Migrate exitNodeData post-execution configs
      if (node.data.exitNodeData?.postExecutionConfig) {
        const postExec = node.data.exitNodeData.postExecutionConfig;
        
        ['stopLoss', 'trailingStop', 'takeProfit'].forEach(feature => {
          if (postExec[feature]?.reEntry) {
            if (postExec[feature].reEntry.maxReEntries !== undefined && postExec[feature].reEntry.maxEntries === undefined) {
              postExec[feature].reEntry.maxEntries = postExec[feature].reEntry.maxReEntries;
              delete postExec[feature].reEntry.maxReEntries;
            }
          }
        });
      }
      
      // Migrate reEntryConfig
      if (node.data.reEntryConfig) {
        if (node.data.reEntryConfig.maxReEntries !== undefined && node.data.reEntryConfig.maxEntries === undefined) {
          node.data.reEntryConfig.maxEntries = node.data.reEntryConfig.maxReEntries;
          delete node.data.reEntryConfig.maxReEntries;
        }
      }
      
      return node;
    });
  }
  
  console.log('📦 Strategy migrated: maxReEntries -> maxEntries');
  return migratedData;
};
