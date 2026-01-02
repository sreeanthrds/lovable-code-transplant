
import { Node } from '@xyflow/react';

/**
 * Initial nodes for the strategy builder
 */
export const initialNodes: Node[] = [
  {
    id: 'strategy-controller',
    type: 'startNode',
    position: { x: 250, y: 50 },
    data: { label: 'Start' }
  }
];
