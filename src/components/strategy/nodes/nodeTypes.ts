
import { NodeTypes } from '@xyflow/react';
import { createNodeTypes as createNodeTypesImplementation } from './nodeTypes.tsx';

// Export the type of the object returned by createNodeTypes function
export type NodeTypesObj = NodeTypes;

// Re-export the implementation from the .tsx file
export const createNodeTypes = createNodeTypesImplementation;
