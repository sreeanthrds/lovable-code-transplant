
import { useCallback, useRef } from 'react';
import { Node } from '@xyflow/react';

/**
 * Hook to create a memoized connect handler
 */
export function useConnectHandler(baseOnConnect: Function, nodes: Node[]) {
  const onConnectMemoizedRef = useRef<Function | null>(null);
  
  // Create onConnect handler with nodes that doesn't recreate on every render
  const onConnect = useCallback((params) => {
    // Store the current handler in a ref to avoid recreating it constantly
    onConnectMemoizedRef.current = (params) => baseOnConnect(params, nodes);
    return onConnectMemoizedRef.current(params);
  }, [baseOnConnect, nodes]);
  
  return onConnect;
}
