import { Node, Edge } from '@xyflow/react';

/**
 * Auto-arranges nodes in a hierarchical layout based on their connections
 */
export function autoArrangeNodes(nodes: Node[], edges: Edge[]): Node[] {
  if (nodes.length === 0) return nodes;

  // Configuration
  const HORIZONTAL_SPACING = 300;
  const VERTICAL_SPACING = 150;
  const START_X = 100;
  const START_Y = 100;

  // Create adjacency map for the graph
  const adjacencyMap = new Map<string, string[]>();
  const incomingMap = new Map<string, string[]>();
  
  nodes.forEach(node => {
    adjacencyMap.set(node.id, []);
    incomingMap.set(node.id, []);
  });

  edges.forEach(edge => {
    const sourceConnections = adjacencyMap.get(edge.source) || [];
    sourceConnections.push(edge.target);
    adjacencyMap.set(edge.source, sourceConnections);

    const targetIncoming = incomingMap.get(edge.target) || [];
    targetIncoming.push(edge.source);
    incomingMap.set(edge.target, targetIncoming);
  });

  // Find start nodes (nodes with no incoming edges)
  const startNodes = nodes.filter(node => 
    (incomingMap.get(node.id) || []).length === 0
  );

  // If no start nodes found, use the first node
  if (startNodes.length === 0 && nodes.length > 0) {
    startNodes.push(nodes[0]);
  }

  // Track positioned nodes and their levels
  const positionedNodes = new Map<string, { x: number; y: number; level: number }>();
  const visited = new Set<string>();
  const levelNodes = new Map<number, string[]>();

  // BFS to assign levels
  function assignLevels() {
    const queue: { id: string; level: number }[] = [];
    
    // Start with all start nodes at level 0
    startNodes.forEach(node => {
      queue.push({ id: node.id, level: 0 });
      visited.add(node.id);
    });

    while (queue.length > 0) {
      const { id: currentId, level } = queue.shift()!;
      
      // Add to level tracking
      if (!levelNodes.has(level)) {
        levelNodes.set(level, []);
      }
      levelNodes.get(level)!.push(currentId);

      // Process children
      const children = adjacencyMap.get(currentId) || [];
      children.forEach(childId => {
        if (!visited.has(childId)) {
          visited.add(childId);
          queue.push({ id: childId, level: level + 1 });
        }
      });
    }

    // Handle any unvisited nodes (isolated nodes)
    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        const isolatedLevel = Math.max(...Array.from(levelNodes.keys()), -1) + 1;
        if (!levelNodes.has(isolatedLevel)) {
          levelNodes.set(isolatedLevel, []);
        }
        levelNodes.get(isolatedLevel)!.push(node.id);
      }
    });
  }

  assignLevels();

  // Position nodes by level
  levelNodes.forEach((nodeIds, level) => {
    const y = START_Y + (level * VERTICAL_SPACING);
    const totalWidth = (nodeIds.length - 1) * HORIZONTAL_SPACING;
    const startX = START_X - (totalWidth / 2);

    nodeIds.forEach((nodeId, index) => {
      const x = startX + (index * HORIZONTAL_SPACING);
      positionedNodes.set(nodeId, { x, y, level });
    });
  });

  // Apply positions to nodes
  return nodes.map(node => {
    const position = positionedNodes.get(node.id);
    if (position) {
      return {
        ...node,
        position: { x: position.x, y: position.y }
      };
    }
    return node;
  });
}

/**
 * Alternative arrangement for complex graphs with better spacing
 */
export function autoArrangeNodesGrid(nodes: Node[]): Node[] {
  if (nodes.length === 0) return nodes;

  const GRID_SIZE = 250;
  const START_X = 100;
  const START_Y = 100;
  const COLS = Math.ceil(Math.sqrt(nodes.length));

  return nodes.map((node, index) => {
    const row = Math.floor(index / COLS);
    const col = index % COLS;
    
    return {
      ...node,
      position: {
        x: START_X + (col * GRID_SIZE),
        y: START_Y + (row * GRID_SIZE)
      }
    };
  });
}