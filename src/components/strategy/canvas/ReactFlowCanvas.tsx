import React, { useCallback } from 'react';
import { ReactFlow, Controls } from '@xyflow/react';
import { useDragHandling } from './useDragHandling';
import { useViewportUtils } from './useViewportUtils';
import { useReactFlowState } from './hooks/useReactFlowState';
import { useImportHandling } from './hooks/useImportHandling';
import { useViewportCentering } from './hooks/useViewportCentering';
import { ReactFlowCanvasProps } from './types';
import TopToolbar from '../toolbars/TopToolbar';

import '../styles/index.css';
import './ReactFlowCanvas.css';

const ReactFlowCanvas: React.FC<ReactFlowCanvasProps> = ({
  flowRef,
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onImportSuccess,
  onAddNode,
  nodeTypes,
  edgeTypes,
  toggleBacktest,
  onAutoArrange
}) => {
  const { fitView } = useViewportUtils();
  const { flowKey, setFlowKey, currentStrategyId } = useReactFlowState();
  
  const { reactFlowInstanceRef } = useImportHandling({
    nodes,
    edges,
    currentStrategyId,
    fitView,
    onImportSuccess,
    setFlowKey
  });

  const {
    onDragOver,
    onDrop,
    handleNodesChange: internalHandleNodesChange
  } = useDragHandling(onAddNode);

  // Use viewport centering hook
  useViewportCentering({ reactFlowInstanceRef });

  // Wrap onNodesChange to use enhanced node change handler
  const wrappedNodesChange = useCallback((changes: any) => {
    internalHandleNodesChange(changes, onNodesChange);
  }, [internalHandleNodesChange, onNodesChange]);

  // Handle backtest panel toggle
  const handleToggleBacktest = useCallback(() => {
    if (toggleBacktest) {
      toggleBacktest();
    }
  }, [toggleBacktest]);
  
  // Update instance ref when initialized
  const handleInit = useCallback((instance: any) => {
    reactFlowInstanceRef.current = instance;
    
    // Force fit view and center nodes on init with better settings
    setTimeout(() => {
      try {
        if (nodes.length > 0) {
          instance.fitView({
            padding: 0.3,
            includeHiddenNodes: false,
            minZoom: 0.2,
            maxZoom: 1.5,
            duration: 800
          });
        } else {
          // Default center if no nodes
          instance.setCenter(300, 200, { zoom: 1.0 });
        }
      } catch (e) {
        console.error("Error in initial fit view:", e);
      }
    }, 300);
  }, [flowKey, reactFlowInstanceRef, nodes, nodeTypes, edges, edgeTypes]);

  return (
    <div className="strategy-flow-container relative h-full w-full">
      <div 
        className="h-full w-full" 
        ref={flowRef} 
        onDragOver={onDragOver} 
        onDrop={onDrop}
      >
        <ReactFlow
          key={flowKey}
          nodes={nodes}
          edges={edges}
          onNodesChange={wrappedNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onInit={handleInit}
          fitView
          minZoom={0.01}
          maxZoom={10}
          snapToGrid
          snapGrid={[15, 15]}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          proOptions={{ hideAttribution: true }}
          // Pro Multi-Selection Features  
          multiSelectionKeyCode={['Meta', 'Control']}
          selectNodesOnDrag={false}
          // Enhanced selection behavior - allow proper multi-selection
          panOnDrag={[1, 2]} // Allow panning with left and middle mouse buttons
          selectionKeyCode={['Shift']} // Box selection with Shift
          deleteKeyCode={null} // Disable keyboard delete, use mouse only
          panOnScroll={true} // Enable pan on scroll
          zoomOnScroll={true} // Enable zoom on scroll
          zoomOnPinch={true} // Enable zoom on pinch
          className="strategy-flow"
          style={{ width: '100%', height: '100%' }}
          // Remove all default arrow markers
          defaultEdgeOptions={{
            markerEnd: undefined,
            markerStart: undefined,
            style: { markerEnd: 'none', markerStart: 'none' }
          }}
        >
          <Controls 
            showInteractive={false} 
            showZoom={false}
            showFitView={false}
            position="bottom-center" 
          />
          <TopToolbar />
        </ReactFlow>
      </div>
    </div>
  );
};

export default ReactFlowCanvas;