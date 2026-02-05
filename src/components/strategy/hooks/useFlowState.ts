
import React, { useRef, useState, useCallback } from 'react';
import { useStrategyStore } from '@/hooks/use-strategy-store';
import { initialNodes } from '../utils/flowUtils';
import { useNodeStateManagement } from './useNodeStateManagement';
import { useEdgeStateManagement } from './useEdgeStateManagement';
import { useLocalStorageSync } from './useLocalStorageSync';
import { usePanelState } from './usePanelState';
import { useWorkflowValidation } from './flow-state/useWorkflowValidation';
import { useReactFlowRefs } from './flow-state/useReactFlowRefs';
import { useStrategyInitialization } from './flow-state/useStrategyInitialization';
import { useStrategyOperations } from './flow-state/useStrategyOperations';
import { useConnectHandler } from './flow-state/useConnectHandler';
import { 
  useNodeHandlers, 
  useEdgeHandlers, 
  usePanelHandlers,
  useStrategyHandlers
} from './flow-handlers';
import { useSearchParams } from 'react-router-dom';
import { autoArrangeNodes } from '../utils/nodes/autoArrange';
import { useNodeSizeObserver } from './useNodeSizeObserver';
import { useSmartAutoArrange } from './useSmartAutoArrange';

export function useFlowState(isNew: boolean = false) {
  const strategyStore = useStrategyStore();
  const [searchParams] = useSearchParams();
  const currentStrategyId = searchParams.get('id') || '';
  
  // Get refs and instance management 
  const {
    reactFlowWrapper,
    reactFlowInstance,
    updateHandlingRef
  } = useReactFlowRefs();
  
  // Node state management
  const {
    nodes,
    setNodes,
    onNodesChange,
    selectedNode,
    setSelectedNode,
    isDraggingRef
  } = useNodeStateManagement(initialNodes, strategyStore);
  
  // Edge state management with validation
  const {
    edges,
    setEdges,
    onEdgesChange,
    onConnect: baseOnConnect
  } = useEdgeStateManagement(strategyStore.edges, strategyStore);
  
  // Listen for force edge updates
  React.useEffect(() => {
    const handleForceEdgeUpdate = (event: CustomEvent) => {
      setEdges(event.detail.edges);
    };
    window.addEventListener('forceEdgeUpdate', handleForceEdgeUpdate as EventListener);
    return () => window.removeEventListener('forceEdgeUpdate', handleForceEdgeUpdate as EventListener);
  }, [setEdges]);
  
  // Panel state
  const { isPanelOpen, setIsPanelOpen } = usePanelState();
  
  // Connect handler with node awareness
  const onConnect = useConnectHandler(baseOnConnect, nodes);
  
  // Initialize with new strategy if isNew is true
  useStrategyInitialization({
    isNew,
    setNodes,
    setEdges,
    strategyStore
  });
  
  // Create auto-arrange callback for initial load
  const handleLoadComplete = useCallback(() => {
    // Use store's handleAutoArrange which uses ELK.js
    strategyStore.handleAutoArrange();
  }, [strategyStore]);
  
  // Sync with localStorage - always call hook but disable for new strategies
  const { isInitialLoadRef } = useLocalStorageSync({
    setNodes,
    setEdges,
    strategyStore,
    initialNodes,
    currentStrategyId,
    onLoadComplete: handleLoadComplete, // Trigger auto-arrange after strategy loads
    enabled: !isNew // Disable for new strategy creation
  });
  
  // Workflow validation
  const { 
    validateCurrentWorkflow,
    validateBeforeCriticalOperation,
    isWorkflowValid
  } = useWorkflowValidation();
  
  // Strategy operation handlers
  const { validateAndRunOperation } = useStrategyOperations({
    validateBeforeCriticalOperation
  });

  // Panel handlers
  const { closePanel } = usePanelHandlers({
    setIsPanelOpen,
    setSelectedNode
  });

  // Node handlers
  const {
    onNodeClick,
    handleAddNode,
    updateNodeData,
    handleDeleteNode
  } = useNodeHandlers({
    nodes,
    edges,
    reactFlowInstance,
    reactFlowWrapper,
    setSelectedNode,
    setIsPanelOpen,
    setNodes,
    setEdges,
    strategyStore,
    updateHandlingRef
  });

  // Edge handlers
  const {
    handleDeleteEdge
  } = useEdgeHandlers({
    edges,
    nodes,
    setEdges,
    strategyStore,
    updateHandlingRef
  });

  // Strategy handlers with validation
  const {
    resetStrategy,
    handleImportSuccess
  } = useStrategyHandlers({
    strategyStore,
    nodes,
    setNodes,
    setEdges,
    reactFlowInstance,
    closePanel,
    updateHandlingRef
  });

  // Auto-arrange handler (use Pro version)
  const handleAutoArrange = useCallback(async (layoutType: string = 'hierarchical') => {
    if (nodes.length === 0) {
      return;
    }
    
    try {
      // Import layout utilities
      const { getLayoutedElements, layoutPresets } = await import('../utils/pro-layout/elkLayoutUtils');
      
      // Get the selected layout preset
      const selectedLayout = layoutPresets[layoutType as keyof typeof layoutPresets] || layoutPresets.hierarchical;
      
      // Apply the selected layout to current state
      const { nodes: arrangedNodes, edges: arrangedEdges } = await getLayoutedElements(
        nodes, 
        edges, 
        selectedLayout
      );
      
      // Update local React Flow state
      setNodes(arrangedNodes);
      setEdges(arrangedEdges);
      
      // Also update the store for persistence
      strategyStore.addHistoryItem(arrangedNodes, arrangedEdges);
      
      // Fit view and center after auto-arrange
      setTimeout(() => {
        if (reactFlowInstance) {
          try {
            reactFlowInstance.fitView({
              padding: 0.2,
              includeHiddenNodes: false,
              duration: 800,
              minZoom: 0.3,
              maxZoom: 1.2
            });
            
            // Center the viewport after fitting
            setTimeout(() => {
              const nodes = reactFlowInstance.getNodes();
              if (nodes.length > 0) {
                const bounds = nodes.reduce((acc, node) => {
                  const nodeWithDimensions = {
                    ...node,
                    width: node.measured?.width || 150,
                    height: node.measured?.height || 40
                  };
                  
                  return {
                    minX: Math.min(acc.minX, nodeWithDimensions.position.x),
                    minY: Math.min(acc.minY, nodeWithDimensions.position.y),
                    maxX: Math.max(acc.maxX, nodeWithDimensions.position.x + nodeWithDimensions.width),
                    maxY: Math.max(acc.maxY, nodeWithDimensions.position.y + nodeWithDimensions.height)
                  };
                }, { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });
                
                const centerX = (bounds.minX + bounds.maxX) / 2;
                const centerY = (bounds.minY + bounds.maxY) / 2;
                
                const viewport = reactFlowInstance.getViewport();
                const windowWidth = window.innerWidth;
                const windowHeight = window.innerHeight;
                
                const x = windowWidth / 2 - centerX * viewport.zoom;
                const y = windowHeight / 2 - centerY * viewport.zoom;
                
                reactFlowInstance.setViewport({ x, y, zoom: viewport.zoom }, { duration: 300 });
              }
            }, 850);
          } catch (e) {
            console.error("Error fitting view after auto-arrange:", e);
          }
        }
      }, 300);
    } catch (error) {
      console.error('Auto-arrange failed:', error);
    }
  }, [nodes, edges, setNodes, setEdges, strategyStore, reactFlowInstance]);

  // Smart auto-arrange that triggers on node size changes
  const { triggerSmartArrange } = useSmartAutoArrange({
    onAutoArrange: handleAutoArrange,
    enabled: true
  });

  // Handle node resize events
  const handleNodesResize = useCallback((updatedNodes: any[]) => {
    setNodes(updatedNodes);
    
    // Trigger smart arrange after resize
    triggerSmartArrange('node-resize');
  }, [setNodes, triggerSmartArrange]);

  // Observe node sizes and trigger layout updates
  useNodeSizeObserver({
    nodes,
    onNodesResize: handleNodesResize,
    enabled: true
  });

  return {
    nodes,
    edges,
    selectedNode,
    isPanelOpen,
    reactFlowWrapper,
    reactFlowInstance,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNode,
    setIsPanelOpen,
    setNodes,
    setEdges,
    strategyStore,
    // Handlers
    onNodeClick,
    handleAddNode,
    handleDeleteNode,
    handleDeleteEdge,
    updateNodeData,
    closePanel,
    resetStrategy,
    handleImportSuccess,
    handleAutoArrange,
    // Undo/Redo
    undo: strategyStore.undo,
    redo: strategyStore.redo,
    // Validation
    validateCurrentWorkflow,
    validateBeforeCriticalOperation,
    isWorkflowValid,
    validateAndRunOperation
  };
}
