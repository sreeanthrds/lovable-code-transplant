
import { Node } from '@xyflow/react';
import { UsageReference } from './types';

/**
 * Finds all usage references for a specific instrument
 * @param symbol The instrument symbol to search for
 * @param nodes All nodes in the flow
 * @returns Array of usage references
 */
export function findInstrumentUsages(symbol: string, nodes: Node[]): UsageReference[] {
  const usages: UsageReference[] = [];
  
  for (const node of nodes) {
    // Skip the start node itself
    if (node.type === 'startNode') continue;
    
    // Check action nodes using instrument
    if (node.type === 'actionNode' && node.data) {
      if (node.data.instrument === symbol) {
        usages.push({
          nodeId: node.id,
          nodeName: node.data.label ? String(node.data.label) : 'Action Node', // Fix: Ensure string type
          nodeType: 'actionNode',
          context: 'Trading instrument'
        });
      }
    }
  }
  
  return usages;
}
