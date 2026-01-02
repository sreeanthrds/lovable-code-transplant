
import { useCallback, useMemo } from 'react';
import { Node } from '@xyflow/react';
import { useNodeBasicState } from './node-state/useNodeBasicState';
import { useDragDetection } from './node-state/useDragDetection';
import { useNodeUpdates } from './node-state/useNodeUpdates';
import { useThrottledNodeUpdates } from './node-state/useThrottledNodeUpdates';
import { useCustomSetNodes } from './node-state/useCustomSetNodes';
import { useCustomNodesChange } from './node-state/useCustomNodesChange';
import { useSelectedNodeUpdate } from './node-state/useSelectedNodeUpdate';
import { shouldUpdateNodes } from '../utils/performanceUtils';
import { handleError } from '../utils/errorHandling';

/**
 * Hook to manage node state with highly optimized update handling
 */
export function useNodeStateManagement(initialNodes: Node[], strategyStore: any) {
  // Basic state management
  const {
    nodes,
    setLocalNodes,
    onNodesChange,
    selectedNode,
    setSelectedNode,
    isDraggingRef
  } = useNodeBasicState(initialNodes);

  // Drag detection and handling with improved performance
  const {
    pendingNodesUpdate,
    onNodesChangeWithDragDetection
  } = useDragDetection();

  // Node update optimizations with enhanced error handling
  const {
    lastUpdateTimeRef,
    updateTimeoutRef,
    updateCycleRef,
    storeUpdateInProgressRef,
    processStoreUpdate,
    scheduleUpdate,
  } = useNodeUpdates(strategyStore);

  // Skip small position changes during drag operations
  const handleUpdateAfterDrag = useCallback((nodesToUpdate) => {
    // Add debounce to update after drag
    if (updateTimeoutRef.current !== null) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      processStoreUpdate(nodesToUpdate);
    }, 2000); // Longer delay after drag
  }, [processStoreUpdate, updateTimeoutRef]);

  // Specialized drag-aware node change handler
  const enhancedDragHandler = useCallback((changes, baseChangeHandler) => {
    onNodesChangeWithDragDetection(changes, baseChangeHandler, handleUpdateAfterDrag);
  }, [onNodesChangeWithDragDetection, handleUpdateAfterDrag]);

  // Custom node change handler with processing guards
  const { 
    customNodesChangeHandler: onNodesChangeWithProcessing,
    isProcessingChangesRef
  } = useCustomNodesChange(enhancedDragHandler, onNodesChange);

  // Custom setNodes implementation with optimizations
  const setNodes = useCustomSetNodes({
    setLocalNodes,
    isDraggingRef,
    pendingNodesUpdate,
    lastUpdateTimeRef,
    updateTimeoutRef,
    updateCycleRef,
    storeUpdateInProgressRef,
    shouldUpdateNodes,
    processStoreUpdate,
    handleError
  });

  // Process throttled updates with much less frequent execution
  useThrottledNodeUpdates({
    pendingNodesUpdate,
    lastUpdateTimeRef,
    updateTimeoutRef,
    processStoreUpdate
  });

  // Keep selected node in sync with node updates
  useSelectedNodeUpdate(nodes, selectedNode, setSelectedNode);

  // Return stable object reference to prevent re-renders
  return useMemo(() => ({
    nodes,
    setNodes,
    onNodesChange: onNodesChangeWithProcessing,
    selectedNode,
    setSelectedNode,
    isDraggingRef
  }), [nodes, setNodes, onNodesChangeWithProcessing, selectedNode, setSelectedNode]);
}
