
import { Node, Edge } from '@xyflow/react';
import { toast } from "@/hooks/use-toast";

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  type: string;
  message: string;
  nodeId?: string;
  edgeId?: string;
}

export interface ValidationWarning {
  type: string;
  message: string;
  nodeId?: string;
  edgeId?: string;
}

/**
 * Validates the entire workflow for structural issues
 */
export const validateWorkflow = (nodes: Node[], edges: Edge[]): ValidationResult => {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: []
  };
  
  // Find start nodes
  const startNodes = nodes.filter(node => node.type === 'startNode');
  
  // Check if there's at least one start node
  if (startNodes.length === 0) {
    result.valid = false;
    result.errors.push({
      type: 'missing-start',
      message: 'Workflow must have at least one start node'
    });
  }
  
  // Check for disconnected nodes (except start nodes)
  const connectedNodeIds = new Set<string>();
  
  // Add all nodes that have connections
  edges.forEach(edge => {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  });
  
  // Find disconnected nodes (excluding start nodes which can be unconnected)
  const disconnectedNodes = nodes.filter(node => 
    node.type !== 'startNode' && !connectedNodeIds.has(node.id)
  );
  
  if (disconnectedNodes.length > 0) {
    result.warnings.push({
      type: 'disconnected-nodes',
      message: `There are ${disconnectedNodes.length} disconnected nodes in the workflow`,
    });
    
    // Add individual warnings for each disconnected node
    disconnectedNodes.forEach(node => {
      result.warnings.push({
        type: 'disconnected-node',
        message: `Node "${node.id}" is not connected to the workflow`,
        nodeId: node.id
      });
    });
  }
  
  // Check for nodes without outgoing edges (terminal nodes)
  // Only end nodes and forceEnd nodes should be terminal
  const nodesWithoutOutgoing = findNodesWithoutOutgoingEdges(nodes, edges);
  const invalidTerminalNodes = nodesWithoutOutgoing.filter(
    node => node.type !== 'endNode' && node.type !== 'forceEndNode'
  );
  
  if (invalidTerminalNodes.length > 0) {
    invalidTerminalNodes.forEach(node => {
      result.warnings.push({
        type: 'invalid-terminal',
        message: `Node "${node.id}" has no outgoing connections but is not an end node`,
        nodeId: node.id
      });
    });
  }
  
  // Check that each path from start eventually reaches an end node
  const pathsToEnd = checkPathsToEndNodes(nodes, edges);
  if (!pathsToEnd.allPathsEndProperly) {
    result.errors.push({
      type: 'incomplete-path',
      message: 'Not all paths in the workflow lead to an end node'
    });
    
    pathsToEnd.nodesWithoutPathToEnd.forEach(nodeId => {
      result.errors.push({
        type: 'no-path-to-end',
        message: `Node "${nodeId}" doesn't have a path to an end node`,
        nodeId
      });
    });
  }
  
  // ===== Additional Business Rule Validations =====
  
  // Validate signal nodes have unique priorities
  validateSignalPriorities(nodes, result);
  
  // Validate action nodes (entry, exit) reference valid positions
  validatePositionReferences(nodes, result);
  
  // Validate entry and exit nodes have valid triggers
  validateOrderNodeTriggers(nodes, edges, result);
  
  // Validate positions are not used simultaneously in entry, modify, and exit nodes
  validatePositionUsage(nodes, result);
  
  // Validate no circular dependencies
  validateCircularDependencies(nodes, edges, result);
  
  // Check for node-specific validation requirements
  const nodeValidationIssues = validateNodeData(nodes);
  result.errors.push(...nodeValidationIssues.errors);
  result.warnings.push(...nodeValidationIssues.warnings);
  
  // Update overall validity based on errors
  if (result.errors.length > 0) {
    result.valid = false;
  }
  
  return result;
};

/**
 * Validates that signal nodes have unique priorities
 */
function validateSignalPriorities(nodes: Node[], result: ValidationResult) {
  const signalNodes = nodes.filter(node => node.type === 'signalNode');
  const priorities = new Map<number, string[]>();
  
  // Collect priorities
  signalNodes.forEach(node => {
    if (node.data?.priority !== undefined) {
      const priority = Number(node.data.priority);
      if (!priorities.has(priority)) {
        priorities.set(priority, []);
      }
      priorities.get(priority)?.push(node.id);
    } else {
      // Signal without priority
      result.warnings.push({
        type: 'missing-priority',
        message: `Signal node "${node.id}" has no priority set`,
        nodeId: node.id
      });
    }
  });
  
  // Check for duplicate priorities
  priorities.forEach((nodeIds, priority) => {
    if (nodeIds.length > 1) {
      result.warnings.push({
        type: 'duplicate-priority',
        message: `Multiple signal nodes have the same priority (${priority})`,
      });
      
      nodeIds.forEach(nodeId => {
        result.warnings.push({
          type: 'duplicate-priority-detail',
          message: `Signal node "${nodeId}" shares priority ${priority} with other nodes`,
          nodeId
        });
      });
    }
  });
}

/**
 * Validates that action nodes reference valid positions
 */
function validatePositionReferences(nodes: Node[], result: ValidationResult) {
  // Track all position IDs used across the strategy
  const allVpis = new Set<string>();
  const entryVpis = new Set<string>();
  const modifyVpis = new Set<string>();
  const exitVpis = new Set<string>();
  
  // Collect all VPIs first
  nodes.forEach(node => {
    if (['entryNode', 'exitNode', 'actionNode'].includes(node.type || '')) {
      if (Array.isArray(node.data?.positions)) {
        node.data.positions.forEach((pos: any) => {
          if (pos.vpi) {
            allVpis.add(pos.vpi);
            
            if (node.type === 'entryNode') entryVpis.add(pos.vpi);
            else if (node.type === 'exitNode') exitVpis.add(pos.vpi);
            else if (node.data?.actionType === 'modify') modifyVpis.add(pos.vpi);
          }
        });
      }
    }
  });
  
  // Check if modify nodes reference existing VPIs
  modifyVpis.forEach(vpi => {
    if (!entryVpis.has(vpi)) {
      result.errors.push({
        type: 'invalid-position-reference',
        message: `Modify operation references position ${vpi} that has no entry node`
      });
    }
  });
  
  // Check if exit nodes reference existing VPIs
  exitVpis.forEach(vpi => {
    if (!entryVpis.has(vpi)) {
      result.errors.push({
        type: 'invalid-position-reference',
        message: `Exit operation references position ${vpi} that has no entry node`
      });
    }
  });
  
  // Check for positions used in multiple node types simultaneously
  allVpis.forEach(vpi => {
    let usageCount = 0;
    if (entryVpis.has(vpi)) usageCount++;
    if (modifyVpis.has(vpi)) usageCount++;
    if (exitVpis.has(vpi)) usageCount++;
    
    if (usageCount > 2) {
      result.errors.push({
        type: 'invalid-position-usage',
        message: `Position ${vpi} is used in Entry, Modify, and Exit nodes simultaneously`
      });
    }
  });
}

/**
 * Validates that order nodes have valid triggers
 */
function validateOrderNodeTriggers(nodes: Node[], edges: Edge[], result: ValidationResult) {
  // Check each order node has at least one incoming edge from a signal
  const orderNodes = nodes.filter(node => 
    ['entryNode', 'exitNode'].includes(node.type || '')
  );
  
  orderNodes.forEach(node => {
    const incomingEdges = edges.filter(edge => edge.target === node.id);
    
    if (incomingEdges.length === 0) {
      result.errors.push({
        type: 'missing-trigger',
        message: `${node.type === 'entryNode' ? 'Entry' : 'Exit'} node "${node.id}" has no trigger signal`,
        nodeId: node.id
      });
    } else {
      // Verify at least one incoming edge is from a signal node
      const hasSignalTrigger = incomingEdges.some(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        return sourceNode && ['signalNode', 'startNode'].includes(sourceNode.type || '');
      });
      
      if (!hasSignalTrigger) {
        result.errors.push({
          type: 'invalid-trigger',
          message: `${node.type === 'entryNode' ? 'Entry' : 'Exit'} node "${node.id}" must be triggered by a signal`,
          nodeId: node.id
        });
      }
    }
  });
}

/**
 * Validates that positions are not used in conflicting ways
 */
function validatePositionUsage(nodes: Node[], result: ValidationResult) {
  // Track VPIs used in different node types
  const vpiUsage = new Map<string, Set<string>>();
  
  // Collect all position usages
  nodes.forEach(node => {
    if (['entryNode', 'exitNode', 'actionNode'].includes(node.type || '')) {
      let nodeType = node.type;
      if (node.type === 'actionNode' && node.data?.actionType) {
        nodeType = node.data.actionType + 'Node';
      }
      
      if (Array.isArray(node.data?.positions)) {
        node.data.positions.forEach((pos: any) => {
          if (pos.vpi) {
            if (!vpiUsage.has(pos.vpi)) {
              vpiUsage.set(pos.vpi, new Set());
            }
            vpiUsage.get(pos.vpi)?.add(nodeType || '');
          }
        });
      }
    }
  });
  
  // Check for positions used in multiple modify nodes
  vpiUsage.forEach((usages, vpi) => {
    let modifyCount = 0;
    nodes.forEach(node => {
      if (node.type === 'actionNode' && node.data?.actionType === 'modify') {
        if (Array.isArray(node.data?.positions)) {
          if (node.data.positions.some((pos: any) => pos.vpi === vpi)) {
            modifyCount++;
          }
        }
      }
    });
    
    if (modifyCount > 1) {
      result.errors.push({
        type: 'multiple-modify',
        message: `Position ${vpi} is modified by ${modifyCount} different nodes`
      });
    }
  });
}

/**
 * Validates that there are no circular dependencies in the workflow
 */
function validateCircularDependencies(nodes: Node[], edges: Edge[], result: ValidationResult) {
  // Build an adjacency list
  const graph: Record<string, string[]> = {};
  nodes.forEach(node => {
    graph[node.id] = [];
  });
  
  edges.forEach(edge => {
    if (graph[edge.source]) {
      graph[edge.source].push(edge.target);
    }
  });
  
  // Check for cycles
  const visited = new Set<string>();
  const recStack = new Set<string>();
  const cyclePaths: string[][] = [];
  
  function isCyclic(nodeId: string, path: string[] = []): boolean {
    if (!visited.has(nodeId)) {
      visited.add(nodeId);
      recStack.add(nodeId);
      path.push(nodeId);
      
      for (const neighbor of graph[nodeId] || []) {
        if (!visited.has(neighbor) && isCyclic(neighbor, [...path])) {
          return true;
        } else if (recStack.has(neighbor)) {
          // Found a cycle
          const cyclePath = [...path, neighbor];
          cyclePaths.push(cyclePath);
          return true;
        }
      }
    }
    
    recStack.delete(nodeId);
    return false;
  }
  
  // Check each node for cycles
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      isCyclic(node.id);
    }
  }
  
  // Add errors for cycles found
  if (cyclePaths.length > 0) {
    result.errors.push({
      type: 'circular-dependency',
      message: `Strategy contains ${cyclePaths.length} circular dependencies`
    });
    
    cyclePaths.forEach((path, index) => {
      result.errors.push({
        type: 'cycle-detail',
        message: `Circular path ${index + 1}: ${path.join(' → ')}`
      });
    });
  }
}

/**
 * Finds nodes that don't have any outgoing edges
 */
const findNodesWithoutOutgoingEdges = (nodes: Node[], edges: Edge[]): Node[] => {
  const nodesWithOutgoing = new Set<string>();
  
  // Find all nodes that have outgoing edges
  edges.forEach(edge => {
    nodesWithOutgoing.add(edge.source);
  });
  
  // Return nodes that don't have outgoing edges
  return nodes.filter(node => !nodesWithOutgoing.has(node.id));
};

/**
 * Checks if all paths from start nodes eventually reach an end node
 */
const checkPathsToEndNodes = (nodes: Node[], edges: Edge[]) => {
  const result = {
    allPathsEndProperly: true,
    nodesWithoutPathToEnd: [] as string[]
  };
  
  // Create an adjacency list representation of the graph
  const graph: Record<string, string[]> = {};
  nodes.forEach(node => {
    graph[node.id] = [];
  });
  
  edges.forEach(edge => {
    if (graph[edge.source]) {
      graph[edge.source].push(edge.target);
    }
  });
  
  // Find all end nodes
  const endNodeIds = new Set(
    nodes
      .filter(node => node.type === 'endNode' || node.type === 'forceEndNode')
      .map(node => node.id)
  );
  
  // If there are no end nodes, mark all nodes as not having a path to end
  if (endNodeIds.size === 0) {
    result.allPathsEndProperly = false;
    result.nodesWithoutPathToEnd = nodes.map(node => node.id);
    return result;
  }
  
  // For each node, check if there's a path to an end node
  nodes.forEach(node => {
    if (node.type !== 'endNode' && node.type !== 'forceEndNode') {
      const visited = new Set<string>();
      const hasPathToEnd = checkPathToEnd(node.id, graph, endNodeIds, visited);
      
      if (!hasPathToEnd) {
        result.allPathsEndProperly = false;
        result.nodesWithoutPathToEnd.push(node.id);
      }
    }
  });
  
  return result;
};

/**
 * Recursive DFS to check if there's a path from start to any end node
 */
const checkPathToEnd = (
  nodeId: string, 
  graph: Record<string, string[]>, 
  endNodeIds: Set<string>,
  visited: Set<string>
): boolean => {
  // If we've already visited this node in this path, return false to avoid cycles
  if (visited.has(nodeId)) return false;
  
  // If this is an end node, we found a path
  if (endNodeIds.has(nodeId)) return true;
  
  // Mark node as visited
  visited.add(nodeId);
  
  // Check all neighbors
  for (const neighbor of graph[nodeId] || []) {
    if (checkPathToEnd(neighbor, graph, endNodeIds, visited)) {
      return true;
    }
  }
  
  return false;
};

/**
 * Validates node-specific data requirements
 */
const validateNodeData = (nodes: Node[]): { errors: ValidationError[], warnings: ValidationWarning[] } => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  nodes.forEach(node => {
    // Start node validations
    if (node.type === 'startNode') {
      if (!node.data?.symbol) {
        errors.push({
          type: 'missing-data',
          message: 'Start node is missing a symbol',
          nodeId: node.id
        });
      }
      
      if (node.data?.indicators && Array.isArray(node.data.indicators) && node.data.indicators.length === 0) {
        warnings.push({
          type: 'missing-indicators',
          message: 'Start node has no indicators configured',
          nodeId: node.id
        });
      }
    }
    
    // Signal node validations
    if (node.type === 'signalNode') {
      if (!node.data?.conditions || (Array.isArray(node.data.conditions) && node.data.conditions.length === 0)) {
        errors.push({
          type: 'missing-conditions',
          message: 'Signal node has no conditions configured',
          nodeId: node.id
        });
      }
    }
    
    // Action node validations (entry/exit)
    if (node.type === 'entryNode') {
      if (!node.data?.actionType) {
        errors.push({
          type: 'missing-action-type',
          message: 'Entry node is missing an action type',
          nodeId: node.id
        });
      }
    }
    
    if (node.type === 'exitNode') {
      if (!node.data?.exitCondition) {
        errors.push({
          type: 'missing-exit-condition',
          message: 'Exit node is missing an exit condition',
          nodeId: node.id
        });
      }
    }
  });
  
  return { errors, warnings };
};

/**
 * Shows validation results to the user as toast notifications
 */
export const showValidationResults = (results: ValidationResult): void => {
  if (results.valid) {
    toast({
      title: "Validation successful",
      description: "Your strategy workflow is valid",
      variant: "default"
    });
    return;
  }
  
  // Show errors
  if (results.errors.length > 0) {
    toast({
      title: `Strategy has ${results.errors.length} error${results.errors.length === 1 ? '' : 's'}`,
      description: results.errors[0].message,
      variant: "destructive"
    });
  }
  
  // Show warnings
  if (results.warnings.length > 0) {
    toast({
      title: `Strategy has ${results.warnings.length} warning${results.warnings.length === 1 ? '' : 's'}`,
      description: results.warnings[0].message,
      variant: "default"  // Changed from "warning" to "default"
    });
  }
};

/**
 * Validates a workflow and returns a promise that resolves to the validation result
 */
export const validateWorkflowAsync = async (nodes: Node[], edges: Edge[]): Promise<ValidationResult> => {
  // We can add more complex async validation logic here if needed
  return validateWorkflow(nodes, edges);
};
