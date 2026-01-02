import { Node } from '@xyflow/react';

/**
 * Generate a descriptive summary of the strategy based on its nodes
 * Shows node count, types, and indicators (TI/SI)
 */
export const generateStrategyDescription = (nodes: Node[]): string => {
  if (!nodes || nodes.length === 0) {
    return 'Empty strategy';
  }
  
  // Count different node types (exclude startNode and strategy overview nodes)
  const nodeTypeCounts: { [key: string]: number } = {};
  nodes.forEach(node => {
    const type = node.type || 'unknown';
    // Skip startNode and overview nodes
    if (type !== 'startNode' && type !== 'strategyOverview' && type !== 'overviewNode') {
      nodeTypeCounts[type] = (nodeTypeCounts[type] || 0) + 1;
    }
  });
  
  // Build description parts
  const parts: string[] = [];
  
  // Count actual relevant nodes (exclude startNode and overview nodes)
  const relevantNodeCount = nodes.filter(node => {
    const type = node.type || 'unknown';
    return type !== 'startNode' && type !== 'strategyOverview' && type !== 'overviewNode';
  }).length;
  
  // Total nodes (only relevant ones)
  if (relevantNodeCount > 0) {
    parts.push(`${relevantNodeCount} node${relevantNodeCount !== 1 ? 's' : ''}`);
  }
  
  // Node types (already filtered during counting)
  const relevantTypes = Object.entries(nodeTypeCounts)
    .sort((a, b) => b[1] - a[1]); // Sort by count descending
  
  if (relevantTypes.length > 0) {
    const typeDescriptions = relevantTypes.map(([type, count]) => {
      const typeName = type.replace('Node', '').replace(/([A-Z])/g, ' $1').trim();
      return `${count} ${typeName}${count !== 1 ? 's' : ''}`;
    });
    parts.push(typeDescriptions.join(', '));
  }
  
  // Check for TI (Technical Indicators) and SI (Signal Indicators)
  const hasIndicators = nodes.some(node => 
    node.type === 'indicatorNode' || 
    (node.data && (node.data.indicatorType || node.data.indicator))
  );
  
  const hasSignals = nodes.some(node => 
    node.type === 'entrySignalNode' || 
    node.type === 'exitSignalNode' || 
    node.type === 'reEntrySignalNode' ||
    node.type === 'signalNode'
  );
  
  if (hasIndicators) {
    parts.push('TI enabled');
  }
  
  if (hasSignals) {
    parts.push('SI configured');
  }
  
  return parts.join(' • ');
};
