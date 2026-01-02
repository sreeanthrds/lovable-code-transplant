
import { Node, Edge } from '@xyflow/react';

/**
 * Creates a new edge between two nodes
 */
export const createEdgeBetweenNodes = (
  sourceNode: Node,
  targetNode: Node,
  edgeType: string = 'default'
): Edge => {
  return {
    id: `e-${sourceNode.id}-${targetNode.id}`,
    source: sourceNode.id,
    target: targetNode.id,
    type: edgeType,
    animated: true, // Enable animation by default
    style: {
      strokeWidth: 2
    }
  };
};
