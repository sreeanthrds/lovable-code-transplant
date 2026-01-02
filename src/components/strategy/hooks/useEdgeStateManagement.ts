
import React, { useCallback, useRef, useEffect } from 'react';
import { Edge, useEdgesState, Connection, addEdge, Node } from '@xyflow/react';
import { validateConnection } from '../utils/flowUtils';
import { deepEqual } from '../utils/deepEqual';

/**
 * Hook to manage edge state with validation
 * CRITICAL: This hook must reliably sync edges to the store for auto-save
 */
export function useEdgeStateManagement(initialEdges: Edge[] = [], strategyStore: any) {
  const [edges, setLocalEdges, onEdgesChange] = useEdgesState(initialEdges);
  const updateCycleRef = useRef(false);
  const lastSyncedEdgesRef = useRef<string>('');
  const syncTimeoutRef = useRef<number | null>(null);

  // Cleanup function for timeouts
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current !== null) {
        window.clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = null;
      }
    };
  }, []);

  // CRITICAL: Ensure edges are always synced to store for auto-save
  // This runs whenever local edges change
  useEffect(() => {
    const edgesHash = JSON.stringify(edges.map(e => ({ id: e.id, source: e.source, target: e.target })));
    
    // Only sync if edges actually changed
    if (edgesHash !== lastSyncedEdgesRef.current) {
      // CRITICAL: Protect against syncing empty edges when we previously had edges
      // This prevents race conditions that cause edge data loss
      const hadEdgesBefore = lastSyncedEdgesRef.current && lastSyncedEdgesRef.current !== '[]';
      if (edges.length === 0 && hadEdgesBefore) {
        console.warn('⚠️ BLOCKED: Attempted to sync empty edges when edges existed before!', {
          previousHash: lastSyncedEdgesRef.current,
          currentEdgeCount: edges.length
        });
        // Don't sync empty edges to store - this protects against accidental data loss
        return;
      }
      
      console.log('🔄 Edge sync check - edges changed:', {
        edgeCount: edges.length,
        edgeIds: edges.map(e => e.id)
      });
      
      // Debounce store sync to avoid rapid updates
      if (syncTimeoutRef.current !== null) {
        window.clearTimeout(syncTimeoutRef.current);
      }
      
      syncTimeoutRef.current = window.setTimeout(() => {
        try {
          console.log('💾 Syncing edges to store:', edges.length);
          strategyStore.setEdges(edges);
          lastSyncedEdgesRef.current = edgesHash;
        } catch (error) {
          console.error('❌ Error syncing edges to store:', error);
        }
      }, 300);
    }
  }, [edges, strategyStore]);

  // Custom setEdges wrapper - simplified to be more reliable
  const setEdges = useCallback((updatedEdges: Edge[] | ((prevEdges: Edge[]) => Edge[])) => {
    // Skip if we're in an update cycle to prevent loops
    if (updateCycleRef.current) {
      console.log('⏭️ Skipping setEdges - update cycle in progress');
      return;
    }
    
    setLocalEdges((prevEdges) => {
      try {
        // Handle both functional and direct updates
        const newEdges = typeof updatedEdges === 'function'
          ? updatedEdges(prevEdges)
          : updatedEdges;
        
        // Skip if edges haven't actually changed using deep equality
        if (deepEqual(newEdges, prevEdges)) {
          return prevEdges;
        }
        
        console.log('📝 Setting local edges:', {
          prevCount: prevEdges.length,
          newCount: newEdges.length,
          newEdgeIds: newEdges.map(e => e.id)
        });
        
        return newEdges;
      } catch (error) {
        console.error('Error in setEdges:', error);
        return prevEdges;
      }
    });
  }, [setLocalEdges]);

  // Handle connections with validation
  const onConnect = useCallback(
    (params: Connection, nodes: Node[]) => {
      if (!validateConnection(params, nodes, edges)) return;
      
      // Skip if we're in an update cycle
      if (updateCycleRef.current) {
        console.log('⏭️ Skipping onConnect - update cycle in progress');
        return;
      }
      
      updateCycleRef.current = true;
      
      try {
        // Add edge to local state with animation
        const newEdge = {
          ...params,
          animated: true,
          style: { strokeWidth: 2 }
        };
        const newEdges = addEdge(newEdge, edges);
        
        console.log('🔗 New connection created:', {
          source: params.source,
          target: params.target,
          totalEdges: newEdges.length
        });
        
        setLocalEdges(newEdges);
        
        // Sync to store and add to history
        setTimeout(() => {
          try {
            strategyStore.setEdges(newEdges);
            strategyStore.addHistoryItem(strategyStore.nodes, newEdges);
            console.log('✅ Edge synced to store and history');
          } catch (error) {
            console.error('Error syncing edge to store:', error);
          } finally {
            updateCycleRef.current = false;
          }
        }, 100);
      } catch (error) {
        console.error('Error in onConnect:', error);
        updateCycleRef.current = false;
      }
    },
    [edges, setLocalEdges, strategyStore]
  );

  return {
    edges,
    setEdges,
    onEdgesChange,
    onConnect
  };
}
