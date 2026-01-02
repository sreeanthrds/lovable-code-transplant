import { Node } from '@xyflow/react';

/**
 * Finds an empty position on the canvas for a new node to avoid overlapping
 */
export const findEmptyPosition = (nodes: Node[], startX: number, startY: number): { x: number, y: number } => {
  // Default node dimensions - increase size to ensure more space between nodes
  const nodeWidth = 200;
  const nodeHeight = 120;
  const padding = 50; // Increased padding between nodes
  
  // Calculate effective space needed for a node
  const effectiveWidth = nodeWidth + padding;
  const effectiveHeight = nodeHeight + padding;
  
  // Start with the suggested position
  let position = { x: startX, y: startY };
  
  // Create a grid system to track occupied spaces
  const occupiedSpaces = new Map<string, boolean>();
  
  // Mark all spaces occupied by existing nodes
  nodes.forEach(node => {
    const nodeX = Math.floor(node.position.x / effectiveWidth);
    const nodeY = Math.floor(node.position.y / effectiveHeight);
    
    // Mark this grid cell and surrounding cells as occupied
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const gridKey = `${nodeX + dx},${nodeY + dy}`;
        occupiedSpaces.set(gridKey, true);
      }
    }
  });
  
  // Convert starting position to grid coordinates
  const startGridX = Math.floor(startX / effectiveWidth);
  const startGridY = Math.floor(startY / effectiveHeight);
  
  // Check if the starting position is already occupied
  const startingGridKey = `${startGridX},${startGridY}`;
  if (!occupiedSpaces.has(startingGridKey)) {
    // The suggested position is free, use it but snap to grid
    return snapToGrid({
      x: startX + (Math.random() * padding - padding/2),
      y: startY + (Math.random() * padding - padding/2)
    });
  }
  
  // Implementation of a spiral search pattern to find empty space
  let found = false;
  let radius = 1;
  let gridX = startGridX;
  let gridY = startGridY;
  
  // Spiral outward until we find an empty spot
  while (!found && radius < 20) {  // Limit search radius to prevent infinite loops
    // Try positions in a spiral pattern
    for (let layer = 1; layer <= radius; layer++) {
      // Try the four sides of the current square layer
      
      // Move right
      for (let i = 0; i < layer * 2; i++) {
        gridX++;
        const gridKey = `${gridX},${gridY}`;
        if (!occupiedSpaces.has(gridKey)) {
          found = true;
          break;
        }
      }
      if (found) break;
      
      // Move down
      for (let i = 0; i < layer * 2; i++) {
        gridY++;
        const gridKey = `${gridX},${gridY}`;
        if (!occupiedSpaces.has(gridKey)) {
          found = true;
          break;
        }
      }
      if (found) break;
      
      // Move left
      for (let i = 0; i < layer * 2; i++) {
        gridX--;
        const gridKey = `${gridX},${gridY}`;
        if (!occupiedSpaces.has(gridKey)) {
          found = true;
          break;
        }
      }
      if (found) break;
      
      // Move up
      for (let i = 0; i < layer * 2; i++) {
        gridY--;
        const gridKey = `${gridX},${gridY}`;
        if (!occupiedSpaces.has(gridKey)) {
          found = true;
          break;
        }
      }
      if (found) break;
    }
    
    radius++;
  }
  
  // Convert grid coordinates back to canvas coordinates with slight randomization
  if (found) {
    return snapToGrid({
      x: gridX * effectiveWidth + (Math.random() * padding - padding/2),
      y: gridY * effectiveHeight + (Math.random() * padding - padding/2)
    });
  }
  
  // Fallback: if no empty spot found, place far away from all nodes
  const maxX = nodes.reduce((max, node) => Math.max(max, node.position.x), 0);
  const maxY = nodes.reduce((max, node) => Math.max(max, node.position.y), 0);
  
  return snapToGrid({
    x: maxX + effectiveWidth * 2,
    y: maxY + effectiveHeight
  });
};

/**
 * Snaps a position to the nearest grid point
 */
export const snapToGrid = (position: { x: number, y: number }, gridSize: number = 15): { x: number, y: number } => {
  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize
  };
};

/**
 * Ensures a node stays within the viewable area of the canvas
 */
export const keepNodeInBounds = (
  position: { x: number, y: number },
  canvasWidth: number,
  canvasHeight: number,
  nodeWidth: number = 200,
  nodeHeight: number = 120
): { x: number, y: number } => {
  // Add some padding to keep nodes fully visible
  const padding = 20;
  
  return {
    x: Math.max(padding, Math.min(position.x, canvasWidth - nodeWidth - padding)),
    y: Math.max(padding, Math.min(position.y, canvasHeight - nodeHeight - padding))
  };
};
