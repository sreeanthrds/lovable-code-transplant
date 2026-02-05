import { useState, useEffect, useRef } from 'react';
import { useReactFlow } from '@xyflow/react';
import { StartNodeData } from '../types';
import { getLotSize } from '../utils/lotSizeRegistry';

interface UseStartNodeDataProps {
  nodeId: string;
  updateNodeData: (id: string, data: any) => void;
  initialInstrument?: string;
}

export const useStartNodeData = ({ 
  nodeId, 
  updateNodeData, 
  initialInstrument 
}: UseStartNodeDataProps) => {
  const { getNodes } = useReactFlow();
  const [startNodeSymbol, setStartNodeSymbol] = useState<string | undefined>(initialInstrument);
  const [startNodeExchange, setStartNodeExchange] = useState<string | undefined>(undefined);
  const [hasOptionTrading, setHasOptionTrading] = useState(false);
  const [isSymbolMissing, setIsSymbolMissing] = useState(false);
  
  // Use refs to track state without causing re-renders
  const previousSymbolRef = useRef<string | undefined>(startNodeSymbol);
  const previousInstrumentTypeRef = useRef<string | undefined>(undefined);
  const nodeUpdateMadeRef = useRef(false);
  const isComponentMountedRef = useRef(true);
  
  // Clean up on unmount
  useEffect(() => {
    isComponentMountedRef.current = true;
    
    return () => {
      isComponentMountedRef.current = false;
    };
  }, []);
  
  // Use a single effect for start node data with proper cleanup
  useEffect(() => {
    let isMounted = true;
    let timeoutId: number | null = null;
    
    // One-time fetch function with optimized logic
    const fetchStartNodeData = () => {
      if (!isMounted) return;
      
      try {
        const nodes = getNodes();
        const startNode = nodes.find(node => node.type === 'startNode');
        
        if (startNode?.data) {
          const data = startNode.data as StartNodeData;
          
          // Check for options trading - check both old and new structure for robustness
          const optionsEnabled = 
            data.tradingInstrumentConfig?.type === 'options' || 
            data.tradingInstrument?.type === 'options';
          
          // Only make updates when the state actually changes
          if (hasOptionTrading !== optionsEnabled) {
            setHasOptionTrading(optionsEnabled || false);
          }
          
          // Get trading symbol and exchange from new structure
          const tradingSymbol = data.tradingInstrumentConfig?.symbol;
          const exchange = data.exchange;
          
          // Update exchange if it changed
          if (exchange !== startNodeExchange) {
            setStartNodeExchange(exchange);
          }
          
          // Check symbol missing state
          const newSymbolMissingState = Boolean(initialInstrument && !tradingSymbol);
          if (isSymbolMissing !== newSymbolMissingState) {
            setIsSymbolMissing(newSymbolMissingState);
          }
          
          // Only update symbol if it changed
          if (tradingSymbol !== previousSymbolRef.current) {
            previousSymbolRef.current = tradingSymbol;
            
            if (isMounted) {
              setStartNodeSymbol(tradingSymbol);
              
              // Update node data only when there's a meaningful change
              if (tradingSymbol && !nodeUpdateMadeRef.current) {
                updateNodeData(nodeId, { instrument: tradingSymbol });
                nodeUpdateMadeRef.current = true;
                
                // Check if we need to auto-set lot size/multiplier
                const lotSize = getLotSize(tradingSymbol, exchange);
                if (lotSize !== undefined) {
                  // Get current node to update positions with lot size
                  const currentNode = nodes.find(node => node.id === nodeId);
                  if (currentNode?.data?.positions && Array.isArray(currentNode.data.positions)) {
                    const updatedPositions = currentNode.data.positions.map((position: any) => ({
                      ...position,
                      multiplier: lotSize
                    }));
                    
                    updateNodeData(nodeId, { 
                      positions: updatedPositions,
                      _lastUpdated: Date.now()
                    });
                  }
                }
                
                // Reset update flag after a short delay
                setTimeout(() => {
                  nodeUpdateMadeRef.current = false;
                }, 500);
              }
            }
          }
          
          // Handle instrument type change - add/remove optionDetails for positions
          const currentInstrumentType = data.tradingInstrumentConfig?.type;
          if (previousInstrumentTypeRef.current !== currentInstrumentType && 
              !nodeUpdateMadeRef.current) {
            
            // Get current node data to check if it has positions
            const currentNode = nodes.find(node => node.id === nodeId);
            if (currentNode?.data?.positions && Array.isArray(currentNode.data.positions)) {
              let needsPositionUpdate = false;
              const updatedPositions = currentNode.data.positions.map((position: any) => {
                if (currentInstrumentType === 'options' && !position.optionDetails) {
                  // Add default option details when switching TO options
                  needsPositionUpdate = true;
                  // Use M0 for MCX (monthly), W0 for others (weekly)
                  const defaultExpiry = exchange === 'MCX' ? 'M0' : 'W0';
                  return {
                    ...position,
                    optionDetails: {
                      expiry: defaultExpiry,
                      strikeType: 'ATM',
                      optionType: 'CE'
                    }
                  };
                } else if (currentInstrumentType !== 'options' && position.optionDetails) {
                  // Remove option details when switching FROM options
                  needsPositionUpdate = true;
                  const { optionDetails, ...positionWithoutOptions } = position;
                  return positionWithoutOptions;
                }
                return position;
              });
              
              if (needsPositionUpdate) {
                updateNodeData(nodeId, { 
                  positions: updatedPositions,
                  _lastUpdated: Date.now()
                });
                nodeUpdateMadeRef.current = true;
                
                setTimeout(() => {
                  nodeUpdateMadeRef.current = false;
                }, 500);
              }
            }
          }
          
          // Update instrument type reference
          previousInstrumentTypeRef.current = currentInstrumentType;
        }
      } catch (error) {
        console.error('Error fetching start node data:', error);
      }
    };
    
    // Run once immediately
    fetchStartNodeData();
    
    // Set up polling with longer interval (5 seconds)
    const pollInterval = 5000;
    
    // Use recursive timeout instead of interval for better cleanup
    const schedulePoll = () => {
      if (!isMounted) return;
      
      timeoutId = window.setTimeout(() => {
        fetchStartNodeData();
        schedulePoll();
      }, pollInterval);
    };
    
    schedulePoll();
    
    // Cleanup function
    return () => {
      isMounted = false;
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [nodeId, updateNodeData, getNodes, initialInstrument, hasOptionTrading, isSymbolMissing]);
  
  return { startNodeSymbol, startNodeExchange, hasOptionTrading, isSymbolMissing };
};
