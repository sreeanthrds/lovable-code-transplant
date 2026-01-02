
import { useCallback } from 'react';
import { Node } from '@xyflow/react';
import { UseNodeClickHandlerProps } from './types';

export const useNodeClickHandler = ({
  setSelectedNode,
  setIsPanelOpen
}: UseNodeClickHandlerProps) => {
  // Create optimized handler for immediate node click response
  return useCallback((event, node) => {
    // Immediately set panel state - no delays
    setSelectedNode(node);
    setIsPanelOpen(true);
  }, [setSelectedNode, setIsPanelOpen]);
};
