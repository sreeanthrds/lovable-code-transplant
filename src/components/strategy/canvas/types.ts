import { Node, Edge } from '@xyflow/react';
import { NodeTypesObj } from '../nodes/nodeTypes';
import { EdgeTypesObj } from '../edges/edgeTypes';

export interface ReactFlowCanvasProps {
  flowRef: React.RefObject<HTMLDivElement>;
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: any) => void;
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
  resetStrategy: () => void;
  onImportSuccess: () => void;
  onDeleteNode: (nodeId: string) => void;
  onAddNode: (type: string, position: { x: number, y: number }) => void;
  updateNodeData: (nodeId: string, newData: any) => void;
  nodeTypes: NodeTypesObj;
  edgeTypes: EdgeTypesObj;
  toggleBacktest?: () => void;
  onAutoArrange?: () => void;
  isReadOnly?: boolean;
}