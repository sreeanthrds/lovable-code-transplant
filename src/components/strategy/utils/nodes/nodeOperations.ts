
import { Node, ReactFlowInstance } from '@xyflow/react';
import { toast } from "@/hooks/use-toast";
import { findEmptyPosition } from './positioning/findEmptyPosition';
import { getHighestZIndex } from './styling/nodeZIndex';
import { getNodeTypePrefix } from './types/nodeTypes';
import { createDefaultNodeData } from './defaults/defaultNodeData';
import { initialNodes } from './initialNodes';

/**
 * Adds a new node to the canvas
 */
export const addNode = (
  type: string, 
  reactFlowInstance: ReactFlowInstance,
  reactFlowWrapper: React.RefObject<HTMLDivElement>,
  nodes: Node[],
  parentNodeId?: string
): { node: Node, parentNode?: Node } => {
  // Get the viewport center position
  const viewport = reactFlowInstance.getViewport();
  
  // Calculate center of the visible area in flow coordinates
  const visibleCenter = reactFlowInstance.screenToFlowPosition({
    x: (reactFlowWrapper.current?.clientWidth || 800) / 2,
    y: (reactFlowWrapper.current?.clientHeight || 600) / 2,
  });
  
  // Default to center of viewport
  let suggestedPosition = { ...visibleCenter };
  
  // Find parent node if specified
  const parentNode = parentNodeId ? nodes.find(node => node.id === parentNodeId) : undefined;
  
  // If there's a parent node, suggest a position relative to it
  if (parentNode) {
    // Position child node to the right and slightly below parent
    suggestedPosition.x = parentNode.position.x + 220;  // More distance to the right
    suggestedPosition.y = parentNode.position.y + 70;   // More distance below
  }
  
  // Find an empty position based on the suggested one - consider existing nodes
  const position = findEmptyPosition(nodes, suggestedPosition.x, suggestedPosition.y);
  
  const typePrefix = getNodeTypePrefix(type);
  const existingNodesOfType = nodes.filter(node => node.id.startsWith(typePrefix));
  const nodeCount = existingNodesOfType.length + 1;
  
  const nodeId = `${typePrefix}-${nodeCount}`;
  
  // Get the default data for this node type
  const defaultData = createDefaultNodeData(type, nodeId);
  
  // Get the highest z-index and increase it by 1
  const highestZIndex = getHighestZIndex(nodes);
  const newZIndex = highestZIndex + 1;
  
  const newNode = {
    id: nodeId,
    type: type as any,
    position,
    data: defaultData,
    style: { zIndex: newZIndex }
  };
  
  console.log('Created new node:', newNode);
  
  return { node: newNode, parentNode };
};

// Export initialNodes from the new location
export { initialNodes };
