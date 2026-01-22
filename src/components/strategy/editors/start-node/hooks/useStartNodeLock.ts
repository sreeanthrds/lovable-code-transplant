import { useMemo } from 'react';
import { Edge } from '@xyflow/react';
import { useStrategyStore } from '@/hooks/use-strategy-store';

/**
 * Hook to determine if the Start node should be locked (frozen) for editing.
 * The Start node is locked when it has any descendants (children nodes connected to it).
 * 
 * @param nodeId - The ID of the start node
 * @returns Object with isLocked boolean and descendantCount number
 */
export const useStartNodeLock = (nodeId: string) => {
  // Use a stable selector that extracts just the edges array
  const edges = useStrategyStore(state => state.edges);

  const lockInfo = useMemo(() => {
    // Find all descendants of the start node using BFS
    const getDescendants = (startId: string, edgeList: Edge[]): Set<string> => {
      const descendants = new Set<string>();
      const queue = [startId];
      const visited = new Set<string>();

      while (queue.length > 0) {
        const currentId = queue.shift()!;
        if (visited.has(currentId)) continue;
        visited.add(currentId);

        // Find all edges where current node is the source
        const outgoingEdges = edgeList.filter(edge => edge.source === currentId);
        
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

    const descendants = getDescendants(nodeId, edges);
    const descendantCount = descendants.size;

    // Debug logging
    console.log(`[useStartNodeLock] nodeId: ${nodeId}, edges: ${edges.length}, descendants: ${descendantCount}`);

    return {
      isLocked: descendantCount > 0,
      descendantCount,
      descendantNodeIds: Array.from(descendants)
    };
  }, [nodeId, edges]);

  return lockInfo;
};
