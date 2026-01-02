
import { useState, useCallback } from 'react';

/**
 * Optimized hook to manage the node configuration panel state
 * with immediate updates for better responsiveness
 */
export function usePanelState() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  
  // Optimized setter for immediate response
  const setIsPanelOpenStable = useCallback((isOpen: boolean) => {
    // Use React's synchronous update for immediate UI response
    setIsPanelOpen(isOpen);
  }, []);
  
  return {
    isPanelOpen,
    setIsPanelOpen: setIsPanelOpenStable
  };
}
