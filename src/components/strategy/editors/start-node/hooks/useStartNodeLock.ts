import { useMemo, useCallback } from 'react';
import { Edge, Node } from '@xyflow/react';
import { useStrategyStore } from '@/hooks/use-strategy-store';

/**
 * Hook to determine if the Start node should be locked (frozen) for editing.
 * The Start node is locked when it has any descendants (children nodes connected to it).
 * 
 * @param nodeId - The ID of the start node
 * @returns Object with isLocked boolean, descendantCount number, and usage check functions
 */
export const useStartNodeLock = (nodeId: string) => {
  // Select edges and nodes from store
  const edges: Edge[] = useStrategyStore(state => state.edges);
  const nodes: Node[] = useStrategyStore(state => state.nodes);

  // Memoize the descendant calculation to prevent recalculating on every render
  const lockInfo = useMemo(() => {
    // Early exit if no edges
    if (!edges || edges.length === 0) {
      return {
        isLocked: false,
        descendantCount: 0,
        descendantNodeIds: [] as string[],
        descendantsJson: ''
      };
    }

    // Find all descendants of the start node using BFS
    const getDescendants = (startId: string): Set<string> => {
      const descendants = new Set<string>();
      const queue = [startId];
      const visited = new Set<string>();

      while (queue.length > 0) {
        const currentId = queue.shift()!;
        if (visited.has(currentId)) continue;
        visited.add(currentId);

        // Find all edges where current node is the source
        const outgoingEdges = edges.filter(edge => edge.source === currentId);
        
        for (const edge of outgoingEdges) {
          const targetId = edge.target;
          if (!visited.has(targetId) && targetId !== startId) {
            descendants.add(targetId);
            queue.push(targetId);
          }
        }
      }

      return descendants;
    };

    const descendantIds = getDescendants(nodeId);
    const descendantCount = descendantIds.size;
    
    // CRITICAL: Get ONLY descendant node objects, NOT the Start node
    // This ensures we search for indicator usage only in conditions/actions
    const descendantNodes = nodes.filter(n => descendantIds.has(n.id));
    
    // JSON of ONLY descendant nodes for usage search (excludes Start node)
    const descendantsJson = JSON.stringify(descendantNodes);

    return {
      isLocked: descendantCount > 0,
      descendantCount,
      descendantNodeIds: Array.from(descendantIds),
      descendantsJson
    };
  }, [nodeId, edges, nodes]);

  // Check if indicator UUID exists in descendant nodes ONLY (not Start node)
  const isIndicatorUsed = useCallback((indicatorId: string): boolean => {
    if (!lockInfo.isLocked || !lockInfo.descendantsJson) return false;
    return lockInfo.descendantsJson.includes(`"${indicatorId}"`);
  }, [lockInfo]);

  // Check if any indicator in a timeframe is used in descendants
  const isTimeframeUsed = useCallback((
    timeframeId: string, 
    indicators: Record<string, any>
  ): boolean => {
    if (!lockInfo.isLocked || !indicators) return false;
    return Object.keys(indicators).some(id => 
      lockInfo.descendantsJson.includes(`"${id}"`)
    );
  }, [lockInfo]);

  return { 
    ...lockInfo, 
    isIndicatorUsed, 
    isTimeframeUsed 
  };
};
