
import { useEffect } from 'react';
import { Node, Edge } from '@xyflow/react';
import { loadStrategy } from '@/hooks/strategy-store/supabase-persistence';

export interface UseInitialLocalStorageLoadProps {
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void;
  strategyStore: any;
  initialNodes: Node[];
  currentStrategyId: string;
  isInitialLoadRef: React.MutableRefObject<boolean>;
  isUpdatingFromLocalStorageRef: React.MutableRefObject<boolean>;
  onLoadComplete?: () => void;
  enabled?: boolean;
}

export function useInitialLocalStorageLoad({
  setNodes,
  setEdges,
  strategyStore,
  initialNodes,
  currentStrategyId,
  isInitialLoadRef,
  isUpdatingFromLocalStorageRef,
  onLoadComplete,
  enabled = true
}: UseInitialLocalStorageLoadProps) {
  // Initial load from Supabase/localStorage
  useEffect(() => {
    // Skip if disabled (for new strategy creation)
    if (!enabled) {
      console.log('⏭️ useInitialLocalStorageLoad disabled, skipping');
      return;
    }
    
    console.log('🔍 useInitialLocalStorageLoad effect triggered:', {
      isInitialLoadRef: isInitialLoadRef.current,
      currentStrategyId,
      hasStrategyId: !!currentStrategyId
    });
    
    if (isInitialLoadRef.current && currentStrategyId) {
      console.log(`🚀 Starting initial load for strategy: ${currentStrategyId}`);
      
      const loadAsync = async () => {
        try {
          isUpdatingFromLocalStorageRef.current = true;
          console.log('📥 Calling loadStrategy from Supabase...');
          
          // Load strategy from Supabase (with localStorage fallback)
          const loadedStrategy = await loadStrategy(currentStrategyId);
          console.log('📋 loadStrategy result:', {
            success: !!loadedStrategy,
            hasNodes: loadedStrategy?.nodes?.length > 0,
            hasEdges: loadedStrategy?.edges?.length > 0,
            strategyData: loadedStrategy,
            actualNodes: loadedStrategy?.nodes,
            nodeDetails: loadedStrategy?.nodes?.map(node => ({ id: node.id, type: node.type, isVirtual: node.data?.isVirtual }))
          });
          
          if (loadedStrategy && loadedStrategy.nodes && loadedStrategy.nodes.length > 0) {
            console.log(`✅ Found strategy data for ID ${currentStrategyId}:`, {
              nodeCount: loadedStrategy.nodes.length,
              edgeCount: loadedStrategy.edges?.length || 0,
              name: loadedStrategy.name,
              actualEdges: loadedStrategy.edges
            });
            
            console.log('🔄 Setting nodes and edges...');
            // Filter out any existing strategy overview nodes from loaded data to prevent duplicates
            const cleanedNodes = loadedStrategy.nodes.filter(node => !node.data?.isStrategyOverview);
            // Include cleaned nodes AND the single virtual overview node
            const nodesWithOverview = [...cleanedNodes, strategyStore.getStrategyOverviewNode()];
            setNodes(nodesWithOverview);
            setEdges(loadedStrategy.edges || []);
            
            console.log('🏪 Updating strategy store...');
            // Update store with combined nodes
            strategyStore.setNodes(nodesWithOverview);
            strategyStore.setEdges(loadedStrategy.edges || []);
            
            console.log('📚 Resetting history and adding initial state...');
            // Reset history and add initial state (only clean nodes, no overview nodes in history)
            strategyStore.resetHistory();
            strategyStore.addHistoryItem(cleanedNodes, loadedStrategy.edges || []);
            
            console.log(`✅ Successfully loaded strategy: ${cleanedNodes.length} clean nodes + 1 overview node, ${loadedStrategy.edges?.length || 0} edges`);
            
            // Call load complete callback for auto-arrange
            if (onLoadComplete) {
              setTimeout(() => {
                console.log('🔄 Triggering auto-arrange after load...');
                onLoadComplete();
              }, 300);
            }
          } else {
            // If no nodes were loaded, use initial nodes
            console.log(`❌ No valid strategy found for ID: ${currentStrategyId}, using initial nodes`);
            // Include both initial nodes AND the virtual overview node
            const nodesWithOverview = [...initialNodes, strategyStore.getStrategyOverviewNode()];
            setNodes(nodesWithOverview);
            setEdges([]);
            
            // Update store with combined nodes
            strategyStore.setNodes(nodesWithOverview);
            strategyStore.setEdges([]);
            
            // Reset history and add initial state (only exportable nodes in history)
            strategyStore.resetHistory();
            strategyStore.addHistoryItem(initialNodes, []);
            
            // Call load complete callback
            if (onLoadComplete) {
              setTimeout(() => {
                console.log('🔄 Triggering auto-arrange after fallback load...');
                onLoadComplete();
              }, 300);
            }
          }
        } catch (error) {
          console.error('💥 Error loading strategy:', error);
          
          // Fallback to initial nodes with virtual overview node
          const nodesWithOverview = [...initialNodes, strategyStore.getStrategyOverviewNode()];
          setNodes(nodesWithOverview);
          setEdges([]);
          
          // Update store with combined nodes
          strategyStore.setNodes(nodesWithOverview);
          strategyStore.setEdges([]);
          
          // Reset history
          strategyStore.resetHistory();
          strategyStore.addHistoryItem(initialNodes, []);
          
          // Call load complete callback even on error
          if (onLoadComplete) {
            setTimeout(() => {
              console.log('🔄 Triggering auto-arrange after error fallback...');
              onLoadComplete();
            }, 300);
          }
        } finally {
          console.log('🏁 Cleaning up loading state...');
          // Reset flags
          isInitialLoadRef.current = false;
          
          // Reset updating flag after a delay
          setTimeout(() => {
            isUpdatingFromLocalStorageRef.current = false;
            console.log('✅ Loading state cleanup complete');
          }, 200);
        }
      };
      
      loadAsync();
    } else {
      console.log('⏭️ Skipping initial load:', {
        reason: !isInitialLoadRef.current ? 'isInitialLoadRef is false' : 'no currentStrategyId',
        isInitialLoadRef: isInitialLoadRef.current,
        currentStrategyId
      });
    }
  }, [
    setNodes, 
    setEdges, 
    strategyStore, 
    initialNodes, 
    currentStrategyId, 
    isInitialLoadRef, 
    isUpdatingFromLocalStorageRef,
    onLoadComplete,
    enabled
  ]);
}
