
import { useCallback, useRef, useEffect } from 'react';
import { Node } from '@xyflow/react';
import { toast } from "@/hooks/use-toast";
import { useNodeClickHandler } from './useNodeClickHandler';
import { useAddNodeHandler } from './useAddNodeHandler';
import { useUpdateNodeHandler } from './useUpdateNodeHandler';
import { useDeleteNodeHandler } from './useDeleteNodeHandler';
import { UseNodeHandlersProps } from './types';

export const useNodeHandlers = ({
  nodes,
  edges,
  reactFlowInstance,
  reactFlowWrapper,
  setSelectedNode,
  setIsPanelOpen,
  setNodes,
  setEdges,
  strategyStore,
  updateHandlingRef
}: UseNodeHandlersProps) => {
  // Create stable refs to latest values
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  const storeRef = useRef(strategyStore);
  const instanceRef = useRef(reactFlowInstance);
  
  // Update refs when dependencies change
  useEffect(() => {
    nodesRef.current = nodes;
    edgesRef.current = edges;
    storeRef.current = strategyStore;
    instanceRef.current = reactFlowInstance;
  }, [nodes, edges, strategyStore, reactFlowInstance]);

  // Optimized node click handler - immediate response
  const onNodeClick = useNodeClickHandler({
    setSelectedNode,
    setIsPanelOpen
  });

  const handleAddNode = useAddNodeHandler({
    reactFlowWrapper,
    reactFlowInstance: instanceRef, 
    nodes,
    nodesRef,
    edgesRef,
    setNodes,
    setEdges,
    strategyStore: storeRef,
    updateHandlingRef
  });

  const updateNodeData = useUpdateNodeHandler({
    nodesRef,
    setNodes,
    strategyStore: storeRef,
    updateHandlingRef,
    setEdges
  });
  
  const handleDeleteNode = useDeleteNodeHandler({
    nodesRef,
    edgesRef,
    setNodes,
    setEdges,
    strategyStore: storeRef,
    updateHandlingRef
  });

  return {
    onNodeClick,
    handleAddNode,
    updateNodeData,
    handleDeleteNode
  };
};
