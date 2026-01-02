
import { useState, useEffect, useCallback } from 'react';
import { Position, NodeData } from '../types';
import { toast } from "@/hooks/use-toast";
import { useReactFlow } from '@xyflow/react';

interface UsePositionManagementProps {
  nodeData: NodeData;
  nodeId: string;
  updateNodeData: (id: string, data: any) => void;
}

export const usePositionManagement = ({
  nodeData,
  nodeId,
  updateNodeData
}: UsePositionManagementProps) => {
  const { getNodes } = useReactFlow();
  
  // Check if current instrument is options - use tradingInstrumentConfig as source of truth
  const isOptionsTrading = () => {
    const nodes = getNodes();
    const startNode = nodes.find(node => node.type === 'startNode');
    const startNodeData = startNode?.data as { tradingInstrumentConfig?: { type: string } };
    return startNodeData?.tradingInstrumentConfig?.type === 'options';
  };

  // Generate a VPI (Virtual Position ID) - this IS the position ID
  const generateVPI = () => {
    const nodePrefix = nodeId; // Already has the format we need (e.g., "entry-1")
    const positionCount = (nodeData?.positions?.length || 0) + 1;
    return `${nodePrefix}-pos${positionCount}`;
  };

  // Create a default position
  const createDefaultPosition = (): Position => {
    // Get next available priority
    const nextPriority = (nodeData?.positions?.length || 0) + 1;
    
    const newPosition: Position = {
      vpi: generateVPI(), // VPI is the primary and only position ID
      vpt: '',
      priority: nextPriority,
      positionType: 'buy', // Explicitly typed as 'buy'
      orderType: 'market',
      quantity: 1, // Changed from lots to quantity
      multiplier: 1, // Default multiplier set to 1
      productType: 'intraday'
    };
    
    // Add optionDetails if we're trading options - ensure proper structure
    if (isOptionsTrading()) {
      // Get exchange from start node to determine default expiry
      const nodes = getNodes();
      const startNode = nodes.find(node => node.type === 'startNode');
      const exchange = startNode?.data?.exchange;
      const defaultExpiry = exchange === 'MCX' ? 'M0' : 'W0';
      
      newPosition.optionDetails = {
        expiry: defaultExpiry,
        strikeType: 'ATM',
        optionType: 'CE'
      };
    }
    
    console.log("Created default position:", newPosition);
    return newPosition;
  };

  // Fix corrupted option details and ensure proper structure
  const fixOptionDetails = (position: Position): Position => {
    if (!isOptionsTrading()) {
      // Remove option details if not trading options
      const { optionDetails, ...positionWithoutOptions } = position;
      return positionWithoutOptions;
    }
    
    // Check if option details are corrupted, missing, or have invalid structure
    const hasCorruptedOptionDetails = (
      !position.optionDetails || 
      typeof position.optionDetails !== 'object' ||
      (position.optionDetails as any)._type !== undefined || // Check for corruption marker
      (position.optionDetails as any).value !== undefined || // Check for corruption marker
      !position.optionDetails.expiry ||
      !position.optionDetails.strikeType ||
      !position.optionDetails.optionType
    );
    
    if (hasCorruptedOptionDetails) {
      console.log('Fixing corrupted option details for position:', position.vpi);
      return {
        ...position,
        optionDetails: {
          expiry: 'W0',
          strikeType: 'ATM',
          optionType: 'CE'
        }
      };
    }
    
    return position;
  };

  // Initialize positions with proper option details when options trading is detected
  useEffect(() => {
    // Only run this effect if we have positions and the component is mounted
    if (!nodeData?.positions || nodeData.positions.length === 0) {
      return;
    }

    let needsUpdate = false;
    const updatedPositions = nodeData.positions.map(position => {
      let fixedPosition = position;
      
      // If options trading is enabled but position doesn't have proper option details, add them
      if (isOptionsTrading() && (!position.optionDetails || 
          typeof position.optionDetails !== 'object' ||
          (position.optionDetails as any)._type !== undefined ||
          (position.optionDetails as any).value !== undefined ||
          !position.optionDetails.expiry ||
          !position.optionDetails.strikeType ||
          !position.optionDetails.optionType)) {
        
        fixedPosition = {
          ...position,
          optionDetails: {
            expiry: 'W0',
            strikeType: 'ATM',
            optionType: 'CE'
          }
        };
        needsUpdate = true;
        console.log('Added/fixed option details for position:', position.vpi);
      } 
      // If not options trading but position has option details, remove them
      else if (!isOptionsTrading() && position.optionDetails) {
        const { optionDetails, ...positionWithoutOptions } = position;
        fixedPosition = positionWithoutOptions;
        needsUpdate = true;
        console.log('Removed option details for non-options position:', position.vpi);
      }
      
      return fixedPosition;
    });

    if (needsUpdate) {
      console.log("Updating positions with proper option details structure");
      updateNodeData(nodeId, { 
        positions: updatedPositions,
        _lastUpdated: Date.now()
      });
    }
  }, [nodeData?.positions, nodeId, updateNodeData]);
  
  // State for selected position
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(
    nodeData?.positions?.length > 0 ? nodeData.positions[0] : null
  );

  // Update selected position when positions change
  useEffect(() => {
    console.log("usePositionManagement: positions changed", nodeData?.positions);
    
    if (nodeData?.positions?.length > 0) {
      const currentSelected = selectedPosition ? 
        nodeData.positions.find(p => p.vpi === selectedPosition.vpi) : null;
        
      // If current selected position still exists, update it with latest data
      if (currentSelected) {
        setSelectedPosition(currentSelected);
      } else {
        // Otherwise select the first position
        setSelectedPosition(nodeData.positions[0]);
      }
    } else {
      setSelectedPosition(null);
    }
  }, [nodeData.positions, selectedPosition]);

  // Handler for position changes
  const handlePositionChange = useCallback((positionVpi: string, updates: Partial<Position>) => {
    if (!nodeData.positions) return;
    
    console.log("Updating position:", positionVpi, updates);
    
    // Create a deep copy of the positions array to ensure React detects the changes
    const updatedPositions = nodeData.positions.map(pos => {
      if (pos.vpi === positionVpi) {
        // Merge updates with deep handling for nested objects
        let updatedPosition = { ...pos };
        
        // Handle nested optionDetails updates separately to preserve all fields
        if (updates.optionDetails && pos.optionDetails) {
          updatedPosition.optionDetails = {
            ...pos.optionDetails,
            ...updates.optionDetails
          };
        }
        
        // Apply all other updates
        Object.keys(updates).forEach(key => {
          if (key !== 'optionDetails') {
            (updatedPosition as any)[key] = (updates as any)[key];
          }
        });
        
        // Ensure option details are properly structured after updates
        return fixOptionDetails(updatedPosition);
      }
      return pos;
    });
    
    updateNodeData(nodeId, { 
      positions: updatedPositions,
      _lastUpdated: Date.now() // Force React to detect changes
    });
    
    console.log('Updated positions:', updatedPositions);
  }, [nodeId, nodeData.positions, updateNodeData]);

  // Handler for adding a new position
  const handleAddPosition = useCallback(() => {
    const newPosition = createDefaultPosition();
    
    console.log("Adding new position:", newPosition);
    
    // Create a fresh array with all existing positions plus the new one
    const updatedPositions = [...(nodeData.positions || []), newPosition];
    
    updateNodeData(nodeId, { 
      positions: updatedPositions,
      _lastUpdated: Date.now() // Force update
    });
    
    // Log for debugging
    console.log('Added new position:', newPosition);
    console.log('Updated positions:', updatedPositions);
    
    return newPosition;
  }, [nodeId, nodeData.positions, updateNodeData]);

  // Handler for deleting a position
  const handleDeletePosition = useCallback((positionVpi: string) => {
    if (!nodeData.positions) return;
    
    const updatedPositions = nodeData.positions.filter(pos => pos.vpi !== positionVpi);
    
    // Update with empty positions array - no need to create a default one
    updateNodeData(nodeId, { 
      positions: updatedPositions,
      _lastUpdated: Date.now()
    });
    
    toast({
      title: "Position deleted",
      description: "Position has been removed from this action node."
    });
  }, [nodeId, nodeData.positions, updateNodeData]);

  return {
    selectedPosition,
    setSelectedPosition,
    handlePositionChange,
    handleAddPosition,
    handleDeletePosition,
    createDefaultPosition
  };
};
