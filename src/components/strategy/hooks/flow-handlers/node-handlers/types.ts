
import { Node, Edge } from '@xyflow/react';
import { MutableRefObject } from 'react';

export interface UseNodeHandlersProps {
  nodes: Node[];
  edges: any[];
  reactFlowInstance: any;
  reactFlowWrapper: React.RefObject<HTMLDivElement>;
  setSelectedNode: (node: Node | null) => void;
  setIsPanelOpen: (isOpen: boolean) => void;
  setNodes: (nodes: Node[] | ((nds: Node[]) => Node[])) => void;
  setEdges: (edges: any[] | ((eds: any[]) => any[])) => void;
  strategyStore: any;
  updateHandlingRef: React.MutableRefObject<boolean>;
}

export interface UseNodeClickHandlerProps {
  setSelectedNode: (node: Node | null) => void;
  setIsPanelOpen: (isOpen: boolean) => void;
}

export interface UseAddNodeHandlerProps {
  reactFlowWrapper: React.RefObject<HTMLDivElement>;
  reactFlowInstance: MutableRefObject<any>;
  nodes: Node[];
  nodesRef: MutableRefObject<Node[]>;
  edgesRef: MutableRefObject<any[]>;
  setNodes: (nodes: Node[] | ((nds: Node[]) => Node[])) => void;
  setEdges: (edges: any[] | ((eds: any[]) => any[])) => void;
  strategyStore: MutableRefObject<any>;
  updateHandlingRef: React.MutableRefObject<boolean>;
}

export interface UseUpdateNodeHandlerProps {
  nodesRef: MutableRefObject<Node[]>;
  setNodes: (nodes: Node[] | ((nds: Node[]) => Node[])) => void;
  strategyStore: MutableRefObject<any>;
  updateHandlingRef: React.MutableRefObject<boolean>;
  setEdges: (edges: any[] | ((eds: any[]) => any[])) => void;
}

export interface UseDeleteNodeHandlerProps {
  nodesRef: MutableRefObject<Node[]>;
  edgesRef: MutableRefObject<any[]>;
  setNodes: (nodes: Node[] | ((nds: Node[]) => Node[])) => void;
  setEdges: (edges: any[] | ((eds: any[]) => any[])) => void;
  strategyStore: MutableRefObject<any>;
  updateHandlingRef: React.MutableRefObject<boolean>;
}

// Add interface for the exit node data with reEntryConfig
export interface ExitNodeReEntryConfig {
  enabled?: boolean;
  groupNumber?: number;
  maxReEntries?: number;
}

export interface ExitNodeData {
  exitNodeData?: {
    reEntryConfig?: ExitNodeReEntryConfig;
  };
  linkedRetryNodeId?: string;
  reEntryConfig?: ExitNodeReEntryConfig; // Add this property directly to ensure compatibility
}
