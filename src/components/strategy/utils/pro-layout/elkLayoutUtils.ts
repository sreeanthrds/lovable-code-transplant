import ELK from 'elkjs/lib/elk.bundled.js';
import { Node, Edge } from '@xyflow/react';

const elk = new ELK();

export interface LayoutOptions {
  algorithm: 'layered' | 'force' | 'mrtree' | 'radial' | 'stress';
  direction: 'DOWN' | 'UP' | 'RIGHT' | 'LEFT';
  spacing: {
    nodeNode: number;
    edgeNode: number;
    edgeEdge: number;
  };
}

export const defaultLayoutOptions: LayoutOptions = {
  algorithm: 'mrtree',
  direction: 'DOWN',
  spacing: {
    nodeNode: 250,
    edgeNode: 100,
    edgeEdge: 50,
  },
};

/**
 * Pro layout function using ELK.js algorithms
 */
export async function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = defaultLayoutOptions
): Promise<{ nodes: Node[]; edges: Edge[] }> {
  if (nodes.length === 0) {
    return { nodes, edges };
  }

  const elkGraph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': options.algorithm,
      'elk.direction': options.direction,
      'elk.spacing.nodeNode': options.spacing.nodeNode.toString(),
      'elk.spacing.edgeNode': options.spacing.edgeNode.toString(),
      'elk.spacing.edgeEdge': options.spacing.edgeEdge.toString(),
      'elk.layered.spacing.nodeNodeBetweenLayers': '250',
      // Symmetric tree layout settings for centering parents
      'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
      'elk.layered.cycleBreaking.strategy': 'GREEDY',
      'elk.layered.layering.strategy': 'NETWORK_SIMPLEX',
      // Center parent nodes above their children
      'elk.alignment': 'CENTER',
      'elk.nodeLabels.placement': 'INSIDE V_CENTER H_CENTER',
      // Enable symmetric positioning
      'elk.layered.considerModelOrder.strategy': 'PREFER_NODES',
      'elk.layered.thoroughness': '7',
      // Force model settings for better centering
      'elk.force.model': 'FORCE_MODEL',
      'elk.stress.desired.edgeLength': '200',
    },
    children: nodes.map((node) => {
      // Get actual node dimensions with padding to prevent overlap
      const nodeWidth = node.width || node.measured?.width || 250;
      const nodeHeight = node.height || node.measured?.height || 150;
      
      // Add padding around nodes to ensure spacing
      const paddingX = 40;
      const paddingY = 40;
      
      return {
        id: node.id,
        width: nodeWidth + paddingX,
        height: nodeHeight + paddingY,
        // Don't pass existing positions to ELK - let it calculate fresh positions
      };
    }),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  try {
    const layouted = await elk.layout(elkGraph);

    const layoutedNodes = nodes.map((node) => {
      const elkNode = layouted.children?.find((n) => n.id === node.id);
      if (elkNode) {
        return {
          ...node,
          position: {
            x: elkNode.x || 0,
            y: elkNode.y || 0,
          },
        };
      }
      return node;
    });

    return {
      nodes: layoutedNodes,
      edges,
    };
  } catch (error) {
    console.error('ELK layout failed:', error);
    // Fallback to original positions
    return { nodes, edges };
  }
}

/**
 * Predefined layout configurations for different use cases
 */
export const layoutPresets = {
  hierarchical: {
    algorithm: 'layered' as const,
    direction: 'DOWN' as const,
    spacing: { nodeNode: 250, edgeNode: 100, edgeEdge: 50 },
  },
  symmetricTree: {
    algorithm: 'mrtree' as const,  // Multi-rooted tree for better symmetry
    direction: 'DOWN' as const,
    spacing: { nodeNode: 250, edgeNode: 100, edgeEdge: 50 },
  },
  forceDirected: {
    algorithm: 'force' as const,
    direction: 'DOWN' as const,
    spacing: { nodeNode: 120, edgeNode: 40, edgeEdge: 20 },
  },
  compact: {
    algorithm: 'layered' as const,
    direction: 'RIGHT' as const,
    spacing: { nodeNode: 60, edgeNode: 15, edgeEdge: 10 },
  },
  radial: {
    algorithm: 'radial' as const,
    direction: 'DOWN' as const,
    spacing: { nodeNode: 150, edgeNode: 50, edgeEdge: 25 },
  },
} as const;

/**
 * Smooth animation utility for layout changes
 */
export function animateLayoutChange(
  nodes: Node[],
  newNodes: Node[],
  duration: number = 500
): Promise<Node[]> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const startPositions = new Map(
      nodes.map((node) => [node.id, { ...node.position }])
    );
    const endPositions = new Map(
      newNodes.map((node) => [node.id, { ...node.position }])
    );

    function animate() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);

      const animatedNodes = newNodes.map((node) => {
        const startPos = startPositions.get(node.id);
        const endPos = endPositions.get(node.id);
        
        if (!startPos || !endPos) return node;

        return {
          ...node,
          position: {
            x: startPos.x + (endPos.x - startPos.x) * easeOut,
            y: startPos.y + (endPos.y - startPos.y) * easeOut,
          },
        };
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        resolve(newNodes);
      }
    }

    animate();
  });
}