
import { useState, useEffect } from 'react';
import { Node } from '@xyflow/react';
import { useStrategyStore } from '@/hooks/use-strategy-store';
import { toast } from '@/hooks/use-toast';
import { Position, isPosition } from '@/components/strategy/types/position-types';

/**
 * Custom hook to manage the positions available for modification
 */
export function useModifyPositions(node: Node) {
  const nodes = useStrategyStore(state => state.nodes);
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(
    node.data.targetPositionId as string | null
  );
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);

  // Collect all positions from entry nodes
  useEffect(() => {
    const allPositions: Position[] = [];
    
    nodes.forEach(n => {
      if (n.type === 'entryNode' && Array.isArray(n.data.positions)) {
        n.data.positions.forEach((position: any) => {
          // Ensure the position has the required fields
          if (isPosition(position)) {
            const convertedPosition: Position = {
              vpi: position.vpi || '',
              
              priority: position.priority || 1,
              positionType: position.positionType || 'buy',
              orderType: position.orderType || 'market',
              limitPrice: position.limitPrice,
              quantity: position.quantity || 1,
              multiplier: position.multiplier || 1,
              productType: position.productType || 'intraday',
              sourceNodeId: n.id,
              // Handle optionDetails if present
              optionDetails: position.optionDetails ? {
                expiry: position.optionDetails.expiry || '',
                strikeType: position.optionDetails.strikeType || '',
                strikeValue: position.optionDetails.strikeValue,
                optionType: position.optionDetails.optionType || 'CE' // Default to CE
              } : undefined
            };
            allPositions.push(convertedPosition);
          }
        });
      }
    });
    
    setPositions(allPositions);
    
    // If we have a previously selected position, find and select it again
    if (node.data.targetPositionId) {
      const position = allPositions.find(p => p.vpi === node.data.targetPositionId);
      if (position) {
        setSelectedPosition(position);
      } else {
        // If the selected position no longer exists, reset the selection
        setSelectedPosition(null);
      }
    }
  }, [nodes, node.data.targetPositionId]);

  return {
    positions,
    selectedPosition,
    selectedPositionId,
    setSelectedPositionId,
    setSelectedPosition
  };
}

/**
 * Custom hook to handle position selection logic
 */
export function usePositionSelection(
  node: Node, 
  updateNodeData: (id: string, data: any) => void,
  positions: Position[],
  setSelectedPositionId: (id: string | null) => void,
  setSelectedPosition: (position: Position | null) => void
) {
  const handlePositionSelect = (positionVpi: string) => {
    const position = positions.find(p => p.vpi === positionVpi);
    
    if (position) {
      setSelectedPositionId(positionVpi);
      setSelectedPosition(position);
      
      // Update the node data with the selected position and source node
      updateNodeData(node.id, {
        targetPositionId: positionVpi,
        targetNodeId: position.sourceNodeId,
        selectedPosition: position // Store the selected position in node.data
      });
      
      toast({
        title: "Position selected",
        description: `Selected position ${position.vpi || ''} for modification`
      });
    }
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData(node.id, { label: e.target.value });
  };

  return {
    handlePositionSelect,
    handleLabelChange
  };
}
