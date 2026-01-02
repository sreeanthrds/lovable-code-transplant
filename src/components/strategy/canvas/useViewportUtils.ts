
import { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';

export function useViewportUtils() {
  const reactFlowInstance = useReactFlow();

  // Custom function to fit view with additional zoom out
  const fitViewWithCustomZoom = useCallback(() => {
    if (!reactFlowInstance) return;
    
    reactFlowInstance.fitView({
      padding: 0.2,
      includeHiddenNodes: false,
      duration: 800,
      minZoom: 0.3,
      maxZoom: 1.2
    });
    
    // After fitting, zoom out by an additional 15%
    setTimeout(() => {
      const { zoom } = reactFlowInstance.getViewport();
      const newZoom = zoom * 0.85; // 15% more zoomed out
      
      reactFlowInstance.setViewport(
        { 
          x: reactFlowInstance.getViewport().x, 
          y: reactFlowInstance.getViewport().y, 
          zoom: newZoom 
        }, 
        { duration: 200 }
      );
    }, 850);
  }, [reactFlowInstance]);

  // Center the strategy in the middle of the viewport
  const fitView = useCallback(() => {
    if (!reactFlowInstance) return;
    
    reactFlowInstance.fitView({
      padding: 0.2,
      includeHiddenNodes: false,
      duration: 800,
      minZoom: 0.3,
      maxZoom: 1.2
    });
    
    // After fitting, center the viewport
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
        
        // Use window dimensions to center content
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        const x = windowWidth / 2 - centerX * viewport.zoom;
        const y = windowHeight / 2 - centerY * viewport.zoom;
        
        reactFlowInstance.setViewport({ x, y, zoom: viewport.zoom }, { duration: 300 });
      }
    }, 850);
  }, [reactFlowInstance]);

  return {
    fitViewWithCustomZoom,
    fitView
  };
}
