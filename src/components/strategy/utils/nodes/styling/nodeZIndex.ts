
import { Node } from '@xyflow/react';

/**
 * Finds the highest z-index in the existing nodes
 */
export const getHighestZIndex = (nodes: Node[]): number => {
  let highestZIndex = 0;
  
  nodes.forEach(node => {
    const nodeZIndex = node.style?.zIndex ? parseInt(node.style.zIndex.toString()) : 0;
    if (nodeZIndex > highestZIndex) {
      highestZIndex = nodeZIndex;
    }
  });
  
  return highestZIndex;
};
