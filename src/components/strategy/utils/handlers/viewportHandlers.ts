
import { ReactFlowInstance } from '@xyflow/react';

// This function specifically handles viewport adjustment after importing a strategy
export const createViewportAdjustmentHandler = (
  reactFlowInstance: ReactFlowInstance
) => {
  return () => {
    // Force a layout update after import with a slightly longer delay
    // to ensure all elements are properly loaded
    setTimeout(() => {
      if (reactFlowInstance) {
        // First fit view normally
        reactFlowInstance.fitView({
          padding: 0.2,
          includeHiddenNodes: false,
          duration: 600
        });
        
        // Then zoom out by an additional 15%
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
        }, 650); // Apply after the initial fit animation completes
      }
    }, 300);
  };
};
