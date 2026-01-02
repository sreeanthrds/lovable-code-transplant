import { useState, useEffect, useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { strategyService } from '@/lib/supabase/services/strategy-service';
import { useClerkUser } from '@/hooks/useClerkUser';

interface UseStrategyNodesResult {
  nodes: Node[];
  edges: Edge[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useStrategyNodes(strategyId: string | null): UseStrategyNodesResult {
  const { userId } = useClerkUser();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNodes = useCallback(async () => {
    if (!strategyId || !userId) {
      console.log('📊 Strategy Nodes: No strategyId or userId, clearing nodes');
      setNodes([]);
      setEdges([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('📊 Strategy Nodes: Fetching strategy', { strategyId, userId });
      
      const strategyData = await strategyService.getStrategyById(strategyId, userId);
      
      if (!strategyData) {
        console.log('📊 Strategy Nodes: Strategy not found');
        setNodes([]);
        setEdges([]);
        return;
      }

      // Extract nodes and edges from strategy JSON
      const strategy = strategyData.strategy as { nodes?: Node[]; edges?: Edge[] } | null;
      
      if (strategy?.nodes) {
        console.log('📊 Strategy Nodes: Loaded', strategy.nodes.length, 'nodes');
        setNodes(strategy.nodes);
      } else {
        console.log('📊 Strategy Nodes: No nodes in strategy');
        setNodes([]);
      }

      if (strategy?.edges) {
        console.log('📊 Strategy Nodes: Loaded', strategy.edges.length, 'edges');
        setEdges(strategy.edges);
      } else {
        setEdges([]);
      }
    } catch (err) {
      console.error('❌ Strategy Nodes: Error loading strategy', err);
      setError(err instanceof Error ? err.message : 'Failed to load strategy nodes');
      setNodes([]);
      setEdges([]);
    } finally {
      setIsLoading(false);
    }
  }, [strategyId, userId]);

  useEffect(() => {
    fetchNodes();
  }, [fetchNodes]);

  return {
    nodes,
    edges,
    isLoading,
    error,
    refetch: fetchNodes
  };
}
