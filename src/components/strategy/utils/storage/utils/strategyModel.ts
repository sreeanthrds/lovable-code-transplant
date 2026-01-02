
import { Node, Edge } from '@xyflow/react';

/**
 * Type definitions for strategy data structures
 */

export interface StrategyMetadata {
  id: string;
  name: string;
  lastModified: string;
  created: string;
  description: string;
}

export interface StrategyData extends StrategyMetadata {
  nodes: Node[];
  edges: Edge[];
  userId?: string | null;
  strategyId?: string;
}

/**
 * Creates a complete strategy object from nodes, edges, and metadata
 */
export const createStrategyObject = (
  nodes: Node[], 
  edges: Edge[], 
  strategyId: string, 
  strategyName: string,
  existingCreationDate?: string
): StrategyData => {
  const now = new Date().toISOString();
  
  return {
    nodes,
    edges,
    id: strategyId,
    name: strategyName,
    lastModified: now,
    created: existingCreationDate || now,
    description: "Trading strategy created with TradeLayout"
  };
};
