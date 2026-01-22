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
  // Select edges directly - Zustand handles referential equality for arrays
  const edges: Edge[] = useStrategyStore(state => state.edges);

  // Memoize the descendant calculation to prevent recalculating on every render
  const lockInfo = useMemo(() => {
    // Early exit if no edges
    if (!edges || edges.length === 0) {
      return {
        isLocked: false,
        descendantCount: 0,
        descendantNodeIds: [] as string[]
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

    const descendants = getDescendants(nodeId);
    const descendantCount = descendants.size;

    return {
      isLocked: descendantCount > 0,
      descendantCount,
      descendantNodeIds: Array.from(descendants)
    };
  }, [nodeId, edges]);

  return lockInfo;
};
