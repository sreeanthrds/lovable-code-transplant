import { useEffect } from 'react';

interface UseViewportCenteringProps {
  reactFlowInstanceRef: React.MutableRefObject<any>;
}

export function useViewportCentering({ reactFlowInstanceRef }: UseViewportCenteringProps) {
  // Listen for center viewport events (triggered by undo/redo)
  useEffect(() => {
    const handleCenterViewport = () => {
      if (reactFlowInstanceRef.current) {
        console.log('🎯 Centering viewport after undo/redo');
        try {
          reactFlowInstanceRef.current.fitView({
            padding: 0.2,
            includeHiddenNodes: false,
            duration: 800,
            minZoom: 0.3,
            maxZoom: 1.2
          });
          
          // Center the viewport after fitting
          setTimeout(() => {
            const nodes = reactFlowInstanceRef.current.getNodes();
            if (nodes.length > 0) {
              const bounds = nodes.reduce((acc: any, node: any) => {
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
              
              const viewport = reactFlowInstanceRef.current.getViewport();
              const windowWidth = window.innerWidth;
              const windowHeight = window.innerHeight;
              
              const x = windowWidth / 2 - centerX * viewport.zoom;
              const y = windowHeight / 2 - centerY * viewport.zoom;
              
              reactFlowInstanceRef.current.setViewport({ x, y, zoom: viewport.zoom }, { duration: 300 });
            }
          }, 850);
        } catch (e) {
          console.error("Error centering viewport:", e);
        }
      }
    };

    window.addEventListener('centerViewport', handleCenterViewport);
    
    return () => {
      window.removeEventListener('centerViewport', handleCenterViewport);
    };
  }, [reactFlowInstanceRef]);
}