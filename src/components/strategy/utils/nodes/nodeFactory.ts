
import { createDefaultNodeData } from './defaults/defaultNodeData';
import { Node, Edge, ReactFlowInstance } from '@xyflow/react';
import { findEmptyPosition } from './positioning/findEmptyPosition';
import { getNodeTypePrefix } from './types/nodeTypes';
import { getHighestZIndex } from './styling/nodeZIndex';

/**
 * Generate incremental node ID based on existing nodes and type
 * This follows Oracle sequence pattern - always increments from max, never reuses
 */
export function generateIncrementalNodeId(existingNodes: Node[], nodeType: string): string {
  const typePrefix = getNodeTypePrefix(nodeType);
  
  // Find existing nodes with the same prefix
  const existingNodesOfType = existingNodes.filter(node => 
    node.id.startsWith(`${typePrefix}-`)
  );
  
  // Extract numbers from existing IDs and find the highest
  const existingNumbers = existingNodesOfType
    .map(node => {
      const match = node.id.match(/-(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(num => !isNaN(num));
  
  const highestNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
  const nextNumber = highestNumber + 1;
  
  return `${typePrefix}-${nextNumber}`;
}

/**
 * Generate incremental edge ID based on existing edges
 * This follows Oracle sequence pattern - always increments from max, never reuses
 */
export function generateIncrementalEdgeId(existingEdges: Edge[]): string {
  // Find existing edges with the pattern 'e-{number}'
  const existingEdgeNumbers = existingEdges
    .filter(edge => edge.id.startsWith('e-'))
    .map(edge => {
      const match = edge.id.match(/^e-(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(num => !isNaN(num));
  
  const highestNumber = existingEdgeNumbers.length > 0 ? Math.max(...existingEdgeNumbers) : 0;
  const nextNumber = highestNumber + 1;
  
  return `e-${nextNumber}`;
}

/**
 * Regenerate VPI for a position based on the new node ID
 */
export function regenerateVPI(nodeId: string, positionIndex: number): string {
  return `${nodeId}-pos${positionIndex + 1}`;
}

/**
 * Generate a new unique VPI for positions
 */
export function generatePositionVPI(nodeId: string, positionIndex: number): string {
  return `${nodeId}-pos${positionIndex + 1}`;
}

/**
 * Generate a new unique ID for conditions
 */
export function generateConditionId(): string {
  return `cond-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
}

/**
 * Generate a new unique ID for indicators
 */
export function generateIndicatorId(): string {
  return `ind-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
}

/**
 * Recursively regenerate all unique IDs in conditions and group conditions
 */
function regenerateConditionIds(condition: any): any {
  if (!condition) return condition;
  
  // Handle group conditions
  if (condition.conditions && Array.isArray(condition.conditions)) {
    return {
      ...condition,
      id: generateConditionId(),
      conditions: condition.conditions.map(regenerateConditionIds)
    };
  }
  
  // Handle individual conditions
  if (condition.id && typeof condition.id === 'string') {
    return {
      ...condition,
      id: generateConditionId()
    };
  }
  
  return condition;
}

/**
 * Regenerate all unique IDs in node data when node is copied/pasted
 * This includes position IDs, condition IDs, indicator IDs, and VPIs
 */
export function regenerateAllUniqueIds(nodeData: any, newNodeId: string): any {
  if (!nodeData) return nodeData;

  let updatedData = { ...nodeData };

  // 1. Regenerate VPIs (remove position IDs completely)
  if (updatedData.positions && Array.isArray(updatedData.positions)) {
    updatedData.positions = updatedData.positions.map((position: any, index: number) => ({
      ...position,
      vpi: regenerateVPI(newNodeId, index),
      sourceNodeId: newNodeId // Update source node reference
    }));
  }

  // 2. Regenerate condition IDs in conditions array
  if (updatedData.conditions && Array.isArray(updatedData.conditions)) {
    updatedData.conditions = updatedData.conditions.map(regenerateConditionIds);
  }

  // 3. Regenerate condition IDs in exitConditions array
  if (updatedData.exitConditions && Array.isArray(updatedData.exitConditions)) {
    updatedData.exitConditions = updatedData.exitConditions.map(regenerateConditionIds);
  }

  // 4. Regenerate condition IDs in endConditions if it has them
  if (updatedData.endConditions) {
    ['timeBasedExit', 'positionClosure', 'stopLoss', 'target'].forEach(conditionType => {
      if (updatedData.endConditions[conditionType] && updatedData.endConditions[conditionType].conditions) {
        updatedData.endConditions[conditionType].conditions = 
          updatedData.endConditions[conditionType].conditions.map(regenerateConditionIds);
      }
    });
  }

  // 5. Regenerate indicator IDs in indicator parameters/indicators
  if (updatedData.indicatorParameters) {
    const newIndicatorParameters: any = {};
    Object.entries(updatedData.indicatorParameters).forEach(([key, value]: [string, any]) => {
      if (value && typeof value === 'object') {
        const newIndicatorId = generateIndicatorId();
        newIndicatorParameters[key] = {
          ...value,
          id: newIndicatorId
        };
      } else {
        newIndicatorParameters[key] = value;
      }
    });
    updatedData.indicatorParameters = newIndicatorParameters;
  }

  if (updatedData.indicators) {
    const newIndicators: any = {};
    Object.entries(updatedData.indicators).forEach(([key, value]: [string, any]) => {
      if (value && typeof value === 'object') {
        const newIndicatorId = generateIndicatorId();
        newIndicators[key] = {
          ...value,
          id: newIndicatorId
        };
      } else {
        newIndicators[key] = value;
      }
    });
    updatedData.indicators = newIndicators;
  }

  return updatedData;
}

/**
 * Update VPIs in node data when node is cloned/duplicated
 * @deprecated Use regenerateAllUniqueIds instead for comprehensive ID regeneration
 */
export function updateVPIsInNodeData(nodeData: any, newNodeId: string): any {
  if (!nodeData.positions || !Array.isArray(nodeData.positions)) {
    return nodeData;
  }

  const updatedPositions = nodeData.positions.map((position: any, index: number) => ({
    ...position,
    vpi: regenerateVPI(newNodeId, index)
  }));

  return {
    ...nodeData,
    positions: updatedPositions
  };
}

/**
 * Node factory for creating new nodes with consistent structure
 */
export class NodeFactory {
  /**
   * Create a new node with positioning and correct data structure
   */
  static createNode(
    type: string,
    reactFlowInstance: ReactFlowInstance,
    existingNodes: Node[],
    parentNodeId?: string
  ): { node: Node, parentNode?: Node } {
    // Find parent node if specified
    const parentNode = parentNodeId 
      ? existingNodes.find(node => node.id === parentNodeId) 
      : undefined;
    
    // Determine suggested position
    let suggestedPosition = this.getSuggestedPosition(reactFlowInstance, parentNode);
    
    // Find non-overlapping position
    const position = findEmptyPosition(existingNodes, suggestedPosition.x, suggestedPosition.y);
    
    // Generate incremental node ID
    const nodeId = generateIncrementalNodeId(existingNodes, type);
    
    // Get default data for the node type
    const defaultData = createDefaultNodeData(type, nodeId);
    
    // Set z-index
    const highestZIndex = getHighestZIndex(existingNodes);
    const newZIndex = highestZIndex + 1;
    
    // Create the node
    const newNode: Node = {
      id: nodeId,
      type: type,
      position,
      data: defaultData,
      style: { zIndex: newZIndex }
    };
    
    return { node: newNode, parentNode };
  }
  
  /**
   * Get suggested position for a new node
   */
  private static getSuggestedPosition(
    reactFlowInstance: ReactFlowInstance,
    parentNode?: Node
  ) {
    // Default to center of viewport
    const viewportCenter = reactFlowInstance.screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
    
    if (!parentNode) {
      return viewportCenter;
    }
    
    // Position child node to the right and below parent
    return {
      x: parentNode.position.x + 220,
      y: parentNode.position.y + 70
    };
  }
}
