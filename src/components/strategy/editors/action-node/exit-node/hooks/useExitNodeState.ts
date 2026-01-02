
import { useState, useRef } from 'react';
import { ExitOrderType, ExitNodeData } from '../types';
import { useExitNodeDefaults } from './useExitNodeDefaults';

interface UseExitNodeStateProps {
  nodeData: any;
}

/**
 * Hook to manage state for exit node
 */
export const useExitNodeState = ({ nodeData }: UseExitNodeStateProps) => {
  // Get default data
  const { defaultExitNodeData } = useExitNodeDefaults();
  
  // Track if we've done initialization
  const initializedRef = useRef(false);
  
  // Get raw exit node data from node or use default
  const rawExitNodeData = (nodeData.exitNodeData as ExitNodeData | undefined) || defaultExitNodeData;
  
  const [orderType, setOrderType] = useState<ExitOrderType>(
    rawExitNodeData.orderConfig?.orderType || 'market'
  );
  
  const [limitPrice, setLimitPrice] = useState<number | undefined>(
    rawExitNodeData.orderConfig?.limitPrice
  );
  
  // Remove multipleOrders state since it's no longer used

  return {
    initializedRef,
    orderType,
    setOrderType,
    limitPrice,
    setLimitPrice
  };
};
