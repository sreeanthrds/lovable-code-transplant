
import { useEffect, useState, useRef } from 'react';
import { useReactFlow } from '@xyflow/react';
import { StartNodeData } from './types';

export const useStartNodeSymbol = (initialInstrument?: string) => {
  const { getNodes } = useReactFlow();
  const [startNodeSymbol, setStartNodeSymbol] = useState<string | undefined>(initialInstrument);
  const fetchIntervalRef = useRef<number | null>(null);
  const shouldFetchRef = useRef(true);
  
  // Get the start node symbol to display with reduced polling
  useEffect(() => {
    // Initial fetch
    if (shouldFetchRef.current) {
      const nodes = getNodes();
      const startNode = nodes.find(node => node.type === 'startNode');
      if (startNode && startNode.data) {
        const startData = startNode.data as StartNodeData;
        setStartNodeSymbol(startData.symbol);
      }
    }
    
    // Set up a very infrequent polling (every 5 seconds)
    if (fetchIntervalRef.current === null) {
      fetchIntervalRef.current = window.setInterval(() => {
        if (shouldFetchRef.current) {
          const nodes = getNodes();
          const startNode = nodes.find(node => node.type === 'startNode');
          if (startNode && startNode.data) {
            const startData = startNode.data as StartNodeData;
            if (startData.symbol !== startNodeSymbol) {
              setStartNodeSymbol(startData.symbol);
            }
          }
        }
      }, 5000);
    }
    
    // Cleanup
    return () => {
      if (fetchIntervalRef.current !== null) {
        window.clearInterval(fetchIntervalRef.current);
        fetchIntervalRef.current = null;
      }
    };
  }, []);  // Empty dependency array to run only once on mount
  
  // Update local symbol if data.instrument changes
  useEffect(() => {
    if (initialInstrument && initialInstrument !== startNodeSymbol) {
      setStartNodeSymbol(initialInstrument);
      // Temporarily pause fetching to avoid conflicts
      shouldFetchRef.current = false;
      setTimeout(() => {
        shouldFetchRef.current = true;
      }, 1000);
    }
  }, [initialInstrument]);
  
  return startNodeSymbol;
};
