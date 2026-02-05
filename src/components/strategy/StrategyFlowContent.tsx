
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useWebsiteTheme } from '@/hooks/use-website-theme';
import { useFlowState } from './hooks/useFlowState';
import ResponsiveFlowLayout from './layout/ResponsiveFlowLayout';
import ReactFlowCanvas from './canvas/ReactFlowCanvas';
import { ReactFlowCanvasProps } from './canvas/types';
import { createNodeTypes } from './nodes/nodeTypes';
import { createEdgeTypes } from './edges/edgeTypes';
import NodePanel from './NodePanel';
import OrphanNodeValidator from './validation/OrphanNodeValidator';
import ProToolbar from './toolbars/ProToolbar';
import '@xyflow/react/dist/style.css';
import './styles/menus.css';

interface StrategyFlowContentProps {
  isNew?: boolean;
  isReadOnly?: boolean;
}

const nodeTypesFactory = (handleDeleteNode, handleAddNode, updateNodeData) => 
  createNodeTypes(handleDeleteNode, handleAddNode, updateNodeData);

const edgeTypesFactory = () => 
  createEdgeTypes();

const StrategyFlowContent: React.FC<StrategyFlowContentProps> = ({ isNew = false, isReadOnly = false }) => {
  console.log('🎯 StrategyFlowContent rendering, isNew:', isNew, 'isReadOnly:', isReadOnly);
  
  const { theme } = useWebsiteTheme();
  const [isReady, setIsReady] = useState(false);
  
  // Initialize immediately without complex state management
  useEffect(() => {
    console.log('🔄 StrategyFlowContent initializing...');
    setIsReady(true);
    console.log('✅ StrategyFlowContent ready');
  }, []);
  
  const {
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
    handleAddNode,
    handleDeleteNode,
    updateNodeData,
    closePanel,
    resetStrategy,
    handleImportSuccess,
    handleAutoArrange,
    onNodeClick
  } = useFlowState(isNew);

  // Listen for global auto-arrange events from StrategyBuilder
  useEffect(() => {
    const handleGlobalAutoArrange = (event: CustomEvent) => {
      console.log('🔥 Global auto-arrange event received');
      const layoutType = event.detail?.layoutType || 'hierarchical';
      console.log('🎯 Using layout type:', layoutType);
      handleAutoArrange(layoutType);
    };

    const handleShowStrategyOverview = () => {
      console.log('🔥 Strategy overview event received in StrategyFlowContent');
      // Get the virtual strategy overview node from store
      const overviewNode = strategyStore.getStrategyOverviewNode();
      console.log('📋 Got strategy overview node from store:', overviewNode);
      
      // Set the node and open panel
      setSelectedNode(overviewNode);
      setIsPanelOpen(true);
      console.log('📋 Panel opened for strategy overview');
    };

    window.addEventListener('globalAutoArrange', handleGlobalAutoArrange as EventListener);
    window.addEventListener('showStrategyOverview', handleShowStrategyOverview);
    
    return () => {
      window.removeEventListener('globalAutoArrange', handleGlobalAutoArrange);
      window.removeEventListener('showStrategyOverview', handleShowStrategyOverview);
    };
  }, [handleAutoArrange, setSelectedNode, setIsPanelOpen, strategyStore]);

  // Create import callback that can directly update local state
  const handleDirectImport = useCallback((importedNodes: any[], importedEdges: any[]) => {
    console.log('Direct import triggered:', importedNodes.length, 'nodes', importedEdges.length, 'edges');
    // Filter out any existing strategy overview nodes from imported data to prevent duplicates
    const cleanedNodes = importedNodes.filter(node => !node.data?.isStrategyOverview);
    // Add the single virtual overview node to cleaned imported nodes
    const nodesWithOverview = [...cleanedNodes, strategyStore.getStrategyOverviewNode()];
    setNodes(nodesWithOverview);
    setEdges(importedEdges);
    strategyStore.resetHistory();
    strategyStore.addHistoryItem(cleanedNodes, importedEdges); // Only add exportable nodes to history
  }, [setNodes, setEdges, strategyStore]);

  // Listen for direct import events
  useEffect(() => {
    const handleDirectImportEvent = (e: CustomEvent) => {
      const { nodes: importedNodes, edges: importedEdges } = e.detail;
      handleDirectImport(importedNodes, importedEdges);
    };

    window.addEventListener('directImportTrigger', handleDirectImportEvent as EventListener);
    
    return () => {
      window.removeEventListener('directImportTrigger', handleDirectImportEvent as EventListener);
    };
  }, [handleDirectImport]);

  const nodeTypes = useMemo(() => 
    nodeTypesFactory(handleDeleteNode, handleAddNode, updateNodeData), 
    [handleDeleteNode, handleAddNode, updateNodeData]
  );
  
  const edgeTypes = useMemo(() => 
    edgeTypesFactory(), 
    []
  );

  // Check if multiple nodes are selected
  const selectedNodes = useMemo(() => {
    const selected = nodes.filter(node => node.selected);
    console.log('🎯 Selected nodes:', selected.map(n => ({id: n.id, type: n.type})));
    return selected;
  }, [nodes]);

  // Node panel component - always render when panel is open and we have a selected node
  const nodePanelComponent = useMemo(() => {
    console.log('🎨 Computing nodePanelComponent - isPanelOpen:', isPanelOpen, 'selectedNode:', selectedNode);
    console.log('🎨 Selected nodes count:', selectedNodes.length, 'nodes:', selectedNodes.map(n => n.id));
    
    // Temporarily disable multiple selection check to debug
    /*
    if (selectedNodes.length > 1) {
      console.log('🎨 Multiple nodes selected, hiding panel');
      return null;
    }
    */
    
    // Always render if panel is open and we have a selected node
    if (isPanelOpen && selectedNode) {
      console.log('🎨 Creating NodePanel component for node:', selectedNode);
      return (
        <NodePanel
          node={selectedNode}
          updateNodeData={updateNodeData}
          onClose={closePanel}
        />
      );
    }
    
    console.log('🎨 No panel component - isPanelOpen:', isPanelOpen, 'selectedNode exists:', !!selectedNode);
    return null;
  }, [isPanelOpen, selectedNode, updateNodeData, closePanel, selectedNodes.length]);

  const adaptedHandleAddNode = useCallback(
    (type: string, position: { x: number; y: number }) => {
      handleAddNode(type, position);
    },
    [handleAddNode]
  );

  const flowCanvasProps: Omit<ReactFlowCanvasProps, 'flowRef'> = useMemo(() => ({
    nodes,
    edges,
    onNodesChange: isReadOnly ? () => {} : onNodesChange, // Disable node changes in read-only mode
    onEdgesChange: isReadOnly ? () => {} : onEdgesChange, // Disable edge changes in read-only mode
    onConnect: isReadOnly ? () => {} : onConnect, // Disable connections in read-only mode
    onNodeClick,
    resetStrategy: isReadOnly ? () => {} : resetStrategy,
    onImportSuccess: isReadOnly ? () => {} : handleImportSuccess,
    onDeleteNode: isReadOnly ? () => {} : handleDeleteNode,
    onAddNode: isReadOnly ? () => {} : adaptedHandleAddNode,
    updateNodeData: isReadOnly ? () => {} : updateNodeData,
    nodeTypes,
    edgeTypes,
    onAutoArrange: handleAutoArrange,
    isReadOnly
  }), [
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeClick,
    resetStrategy,
    handleImportSuccess,
    handleDeleteNode,
    adaptedHandleAddNode,
    updateNodeData,
    nodeTypes,
    edgeTypes,
    handleAutoArrange,
    isReadOnly
  ]);

  if (!isReady) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-3"></div>
          <p className="text-sm text-muted-foreground">Loading strategy builder...</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveFlowLayout
      isPanelOpen={isPanelOpen}
      selectedNode={selectedNode}
      onClosePanel={closePanel}
      nodePanelComponent={nodePanelComponent}
    >
      <div className="relative h-full w-full">
        {/* Read-only indicator */}
        {isReadOnly && (
          <div className="absolute top-4 right-4 z-50 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-3 py-1 rounded-full text-sm font-medium border border-orange-200 dark:border-orange-700">
            Read-only
          </div>
        )}
        <ReactFlowCanvas {...flowCanvasProps} flowRef={reactFlowWrapper} />
        <OrphanNodeValidator nodes={nodes} edges={edges} />
        {!isReadOnly && <ProToolbar />}
      </div>
    </ResponsiveFlowLayout>
  );
};

export default StrategyFlowContent;
