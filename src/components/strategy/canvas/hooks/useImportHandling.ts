import { useCallback, useEffect, useRef } from 'react';
import { Node, Edge } from '@xyflow/react';

interface UseImportHandlingProps {
  nodes: Node[];
  edges: Edge[];
  currentStrategyId: string;
  fitView: () => void;
  onImportSuccess: () => void;
  setFlowKey: (key: string) => void;
}

export function useImportHandling({
  nodes,
  edges,
  currentStrategyId,
  fitView,
  onImportSuccess,
  setFlowKey
}: UseImportHandlingProps) {
  const importInProgressRef = useRef(false);
  const lastImportRef = useRef(0);
  const reactFlowInstanceRef = useRef<any>(null);

  // Track node/edge changes to detect major updates
  const nodesLengthRef = useRef(nodes.length);
  const edgesLengthRef = useRef(edges.length);

  useEffect(() => {
    nodesLengthRef.current = nodes.length;
    edgesLengthRef.current = edges.length;
  }, [nodes.length, edges.length]);

  // Log current state for debugging
  useEffect(() => {
    console.log(`Current state: ${nodes.length} nodes, ${edges.length} edges`);
    if (edges.length > 0) {
      console.log("Current edges:", JSON.stringify(edges));
    }
  }, [nodes.length, edges.length]);

  // Handle import success with improved viewport fitting
  const handleImportSuccessCallback = useCallback(() => {
    // Prevent import handling if too recent (throttle)
    const now = Date.now();
    if (now - lastImportRef.current < 1000) {
      console.log("Import success handler called too soon, skipping");
      return;
    }
    
    // Update last import timestamp
    lastImportRef.current = now;
    
    // Prevent duplicate processing
    if (importInProgressRef.current) {
      console.log("Import already in progress, skipping additional callbacks");
      return;
    }
    
    importInProgressRef.current = true;
    console.log(`Import success handler called for strategy: ${currentStrategyId}`);
    console.log(`Current nodes: ${nodes.length}, edges: ${edges.length}`);
    
    // Force remount of ReactFlow to ensure clean state
    console.log('Forcing ReactFlow remount after import');
    setFlowKey(`flow-${currentStrategyId}-${Date.now()}`);
    
    // Set a timeout to ensure we have the latest nodes/edges
    setTimeout(() => {
      if (reactFlowInstanceRef.current) {
        console.log("Fitting view after import");
        try {
          fitView();
        } catch (e) {
          console.error("Error fitting view:", e);
        }
      }
      
      // Release import flag
      setTimeout(() => {
        importInProgressRef.current = false;
        
        // Call the parent's import success handler
        onImportSuccess();
        
        // Log the current state after import for debugging
        console.log(`After import: ${nodes.length} nodes, ${edges.length} edges`);
        if (edges.length > 0) {
          console.log("Edges after import:", JSON.stringify(edges));
        }
      }, 500);
    }, 500);
  }, [fitView, onImportSuccess, nodes.length, edges.length, currentStrategyId, setFlowKey]);

  // Listen for storage events to reload current strategy
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      const strategyKey = `strategy_${currentStrategyId}`;
      if (e.key === strategyKey && e.newValue) {
        console.log(`Storage event detected for current strategy: ${strategyKey}`);
        console.log('Triggering ReactFlow remount and import success handler');
        setFlowKey(`flow-${currentStrategyId}-${Date.now()}`);
        // Also trigger the import success handler for immediate UI update
        handleImportSuccessCallback();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentStrategyId, handleImportSuccessCallback, setFlowKey]);

  // Reset import flags when strategy changes
  useEffect(() => {
    importInProgressRef.current = false;
    lastImportRef.current = 0;
  }, [currentStrategyId]);

  return {
    reactFlowInstanceRef,
    handleImportSuccessCallback
  };
}