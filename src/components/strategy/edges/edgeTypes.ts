
import { EdgeTypes } from '@xyflow/react';
import { createEdgeTypes as createEdgeTypesImplementation } from './edgeTypes.tsx';

// Export the type of the object returned by createEdgeTypes function
export type EdgeTypesObj = EdgeTypes;

// Re-export the implementation from the .tsx file
export const createEdgeTypes = createEdgeTypesImplementation;
