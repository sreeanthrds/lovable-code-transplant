import { Node, Edge } from '@xyflow/react';
import { flatIndicatorConfig } from '../categorizedIndicatorConfig';
import { saveStrategyToLocalStorage } from '../storage/operations/saveStrategy';
import { setSavingState } from '@/hooks/strategy-store/supabase-persistence';
import { getCurrentUserId } from './encryption/userIdUtils';
import { groupConditionToString, expressionToString, GroupCondition, Expression } from '../conditions';

const getIndicatorDisplayName = (key: string, parameters: Record<string, any>) => {
  const baseName = key.split('_')[0];
  const displayParams = { ...parameters };
  delete displayParams.indicator_name;
  const paramList = Object.values(displayParams).join(',');
  return `${baseName}(${paramList})`;
};

// Generate preview strings for conditions
const generateConditionPreview = (conditions: GroupCondition[], startNodeData?: any): string => {
  if (!conditions || conditions.length === 0) return '';
  
  try {
    return conditions
      .map(condition => groupConditionToString(condition, startNodeData))
      .filter(str => str && !str.includes('Error') && !str.includes('Incomplete'))
      .join(' | ');
  } catch (error) {
    console.error('Error generating condition preview:', error);
    return '';
  }
};

// Generate preview string for a single expression
const generateExpressionPreview = (expression: Expression, startNodeData?: any): string => {
  if (!expression) return '';
  
  try {
    return expressionToString(expression, startNodeData);
  } catch (error) {
    console.error('Error generating expression preview:', error);
    return '';
  }
};

const transformNodeForExport = (node: Node, startNodeData?: any) => {
  const transformedNode = { ...node };
  
  // Add indicator display names
  if (
    transformedNode.data && 
    transformedNode.data.indicatorParameters && 
    transformedNode.data.indicators &&
    Array.isArray(transformedNode.data.indicators)
  ) {
    const indicatorParams = transformedNode.data.indicatorParameters as Record<string, Record<string, any>>;
    
    const indicatorDisplayMap = Object.fromEntries(
      transformedNode.data.indicators.map(indicator => {
        const params = indicatorParams[indicator];
        
        const baseName = indicator.split('_')[0];
        if (params) {
          params.indicator_name = baseName;
        }
        
        const displayName = getIndicatorDisplayName(indicator, params);
        
        return [indicator, displayName];
      })
    );
    
    transformedNode.data.indicators = transformedNode.data.indicators.map(
      indicator => indicatorDisplayMap[indicator] || indicator
    );
  }
  
  // Add condition previews for nodes with conditions
  if (transformedNode.data) {
    // Entry conditions preview
    if (transformedNode.data.entryConditions && Array.isArray(transformedNode.data.entryConditions)) {
      const preview = generateConditionPreview(transformedNode.data.entryConditions, startNodeData);
      if (preview) {
        transformedNode.data.entryConditionsPreview = preview;
      }
    }
    
    // Exit conditions preview
    if (transformedNode.data.exitConditions && Array.isArray(transformedNode.data.exitConditions)) {
      const preview = generateConditionPreview(transformedNode.data.exitConditions, startNodeData);
      if (preview) {
        transformedNode.data.exitConditionsPreview = preview;
      }
    }
    
    // Re-entry conditions preview
    if (transformedNode.data.reEntryConditions && Array.isArray(transformedNode.data.reEntryConditions)) {
      const preview = generateConditionPreview(transformedNode.data.reEntryConditions, startNodeData);
      if (preview) {
        transformedNode.data.reEntryConditionsPreview = preview;
      }
    }
    
    // Re-entry exit conditions preview
    if (transformedNode.data.reEntryExitConditions && Array.isArray(transformedNode.data.reEntryExitConditions)) {
      const preview = generateConditionPreview(transformedNode.data.reEntryExitConditions, startNodeData);
      if (preview) {
        transformedNode.data.reEntryExitConditionsPreview = preview;
      }
    }
    
    // Generic conditions preview (for signal nodes)
    if (transformedNode.data.conditions && Array.isArray(transformedNode.data.conditions)) {
      const preview = generateConditionPreview(transformedNode.data.conditions, startNodeData);
      if (preview) {
        transformedNode.data.conditionsPreview = preview;
      }
    }
    
    // Expression previews for nodes with individual expressions
    if (transformedNode.data.expression) {
      const preview = generateExpressionPreview(transformedNode.data.expression as Expression, startNodeData);
      if (preview) {
        transformedNode.data.expressionPreview = preview;
      }
    }
    
    // Target expression preview (for target price nodes, etc.)
    if (transformedNode.data.targetExpression) {
      const preview = generateExpressionPreview(transformedNode.data.targetExpression as Expression, startNodeData);
      if (preview) {
        transformedNode.data.targetExpressionPreview = preview;
      }
    }
    
    // Stop loss expression preview
    if (transformedNode.data.stopLossExpression) {
      const preview = generateExpressionPreview(transformedNode.data.stopLossExpression as Expression, startNodeData);
      if (preview) {
        transformedNode.data.stopLossExpressionPreview = preview;
      }
    }
    
    // Take profit expression preview
    if (transformedNode.data.takeProfitExpression) {
      const preview = generateExpressionPreview(transformedNode.data.takeProfitExpression as Expression, startNodeData);
      if (preview) {
        transformedNode.data.takeProfitExpressionPreview = preview;
      }
    }
  }
  
  return transformedNode;
};

export const exportStrategyToFile = (strategy: any) => {
  try {
    // Find start node to get indicator parameters for condition previews
    const startNode = strategy.nodes.find((n: Node) => n.type === 'startNode');
    const startNodeData = startNode?.data;
    
    const transformedNodes = strategy.nodes.map((node: Node) => transformNodeForExport(node, startNodeData));
    
    const exportStrategy = {
      nodes: transformedNodes, 
      edges: strategy.edges,
      name: strategy.name,
      id: strategy.id,
      lastModified: strategy.lastModified,
      created: strategy.created,
      description: strategy.description,
      // Added metadata for downstream processing
      userId: getCurrentUserId(),
      strategyId: strategy.id,
    };
    
    const blob = new Blob([JSON.stringify(exportStrategy, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tradelayout-strategy-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
    
    // No toast notification, just log success
    console.log('Strategy exported successfully');
  } catch (error) {
    console.error("Export error:", error);
    // No toast notification, just log error
  }
};

export const importStrategyFromEvent = async (
  event: React.ChangeEvent<HTMLInputElement>,
  setNodes: (nodes: Node[]) => void,
  setEdges: (edges: Edge[]) => void,
  addHistoryItem: (nodes: Node[], edges: Edge[]) => void,
  resetHistory: () => void,
  currentStrategyId?: string | null,
  currentStrategyName?: string | null
): Promise<boolean> => {
  return new Promise((resolve) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.error("No file selected for import");
      // No toast notification, just log error
      resolve(false);
      return;
    }
    
    if (!currentStrategyId) {
      console.error("Cannot import strategy without target strategy ID");
      // No toast notification, just log error
      resolve(false);
      return;
    }
    
    console.log("File selected for import:", file.name);
    console.log(`Importing to strategy ID: ${currentStrategyId} - ${currentStrategyName || 'Unnamed'}`);
    
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        // Show saving indicator for import
        setSavingState(true);
        
        const result = e.target?.result as string;
        if (!result) {
          console.error("FileReader result is empty");
          // No toast notification, just log error
          setSavingState(false);
          resolve(false);
          return;
        }
        
        console.log("File content loaded, attempting to parse JSON");
        const imported = JSON.parse(result);
        
        if (!imported) {
          console.error("Parsed result is null or undefined");
          // No toast notification, just log error
          setSavingState(false);
          resolve(false);
          return;
        }
        
        console.log("Checking for nodes and edges in imported data");
        if (imported.nodes && imported.edges) {
          console.log(`Found ${imported.nodes.length} nodes and ${imported.edges.length} edges in imported file`);
          console.log("Edges from import:", JSON.stringify(imported.edges));
          
          // Deep clone to avoid reference issues
          const nodes = JSON.parse(JSON.stringify(imported.nodes));
          const edges = JSON.parse(JSON.stringify(imported.edges));
          
          const validatedNodes = nodes.map((node: Node) => ({
            ...node,
            id: node.id || `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: node.type || 'default',
            position: node.position || { x: 0, y: 0 },
            data: node.data || {}
          }));
          
          const validatedEdges = edges.map((edge: Edge) => ({
            ...edge,
            id: edge.id || `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            source: edge.source || '',
            target: edge.target || '',
            type: edge.type || 'default'
          }));
          
          console.log("Validated edges:", JSON.stringify(validatedEdges));
          
          if (validatedEdges.some((edge: Edge) => !edge.source || !edge.target)) {
            console.error("Invalid edge connections found");
            // No toast notification, just log error
            setSavingState(false);
            resolve(false);
            return;
          }
          
          // Use the current strategy ID and name for isolation
          const strategyId = currentStrategyId;
          const strategyName = currentStrategyName || imported.name || "Imported Strategy";
          
          // CRITICAL: First completely remove the existing strategy data
          console.log(`Removing existing strategy data for ID: ${strategyId}`);
          localStorage.removeItem(`strategy_${strategyId}`);
          
          // Then save the imported strategy directly to localStorage with the current ID
          console.log(`Saving imported strategy with ${validatedNodes.length} nodes and ${validatedEdges.length} edges directly to localStorage with ID: ${strategyId}`);
          saveStrategyToLocalStorage(validatedNodes, validatedEdges, strategyId, strategyName);
          
          // Wait for localStorage operations to complete
          await new Promise(r => setTimeout(r, 100));
          
          // Now clear existing app state before setting new nodes and edges
          console.log("Clearing existing nodes and edges before setting new ones");
          setNodes([]);
          await new Promise(r => setTimeout(r, 200));
          setEdges([]);
          await new Promise(r => setTimeout(r, 200));
          
          // Reset history for this specific strategy
          resetHistory();
          
          // Wait for changes to propagate
          await new Promise(r => setTimeout(r, 300));
          
          // Set the new nodes first
          console.log(`Setting ${validatedNodes.length} nodes`);
          setNodes(validatedNodes);
          
          // Wait for nodes to be set
          await new Promise(r => setTimeout(r, 400));
          
          // Then set edges with explicit logging
          console.log(`Setting ${validatedEdges.length} edges:`, JSON.stringify(validatedEdges));
          setEdges(validatedEdges);
          
          // Add to history after a longer delay
          setTimeout(() => {
            try {
              console.log("Adding imported strategy to history with edges:", validatedEdges.length);
              addHistoryItem(validatedNodes, validatedEdges);
              
              // No toast notification, just log success
              console.log(`Strategy imported successfully as "${strategyName}"`);
              
              // Force reload the strategy by triggering a storage event
              // This ensures all components update consistently
              console.log("Dispatching storage event to notify components of the import");
              window.dispatchEvent(new StorageEvent('storage', {
                key: `strategy_${strategyId}`,
                newValue: localStorage.getItem(`strategy_${strategyId}`)
              }));
              
              console.log("Import process completed successfully");
              setSavingState(false);
              resolve(true);
            } catch (e) {
              console.error("Error in final import steps:", e);
              setSavingState(false);
              resolve(false);
            }
          }, 600);
        } else {
          console.error("Missing nodes or edges in imported data", imported);
          // No toast notification, just log error
          setSavingState(false);
          resolve(false);
        }
      } catch (error) {
        console.error("Import parsing error:", error);
        // No toast notification, just log error
        setSavingState(false);
        resolve(false);
      }
    };
    
    reader.onerror = (error) => {
      console.error("FileReader error:", error);
      // No toast notification, just log error
      setSavingState(false);
      resolve(false);
    };
    
    reader.readAsText(file);
  });
};
