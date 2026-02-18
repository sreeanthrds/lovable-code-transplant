
import { Node, Edge } from '@xyflow/react';
import { GlobalVariable } from '@/hooks/strategy-store/types';

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
  globalVariables?: GlobalVariable[];
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
  existingCreationDate?: string,
  globalVariables?: GlobalVariable[]
): StrategyData => {
  const now = new Date().toISOString();
  
  return {
    nodes,
    edges,
    globalVariables: globalVariables || [],
    id: strategyId,
    name: strategyName,
    lastModified: now,
    created: existingCreationDate || now,
    description: "Trading strategy created with TradeLayout"
  };
};
