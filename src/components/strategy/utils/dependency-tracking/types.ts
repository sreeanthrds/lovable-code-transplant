
/**
 * Type definitions for dependency tracking
 */

// Reference to where an indicator is used
export interface UsageReference {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  context: string;
}
