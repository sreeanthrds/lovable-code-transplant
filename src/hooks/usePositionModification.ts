
import { useState } from 'react';
import { Position } from '@/components/strategy/types/position-types';
import { Node } from '@xyflow/react';
import { toast } from '@/hooks/use-toast';

export function usePositionModification(
  node: Node,
  updateNodeData: (id: string, data: any) => void
) {
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);

  const handlePositionChange = (updates: Partial<Position>) => {
    if (!node.data.targetPositionId) return;
    
    // Create a basic updated position with the current values from node.data
    const currentPosition = node.data.selectedPosition as Position;
    if (!currentPosition) return;
    
    // First, create a basic updated position with the current values
    const updatedPosition: Position = {
      vpi: currentPosition.vpi || '',
      priority: currentPosition.priority || 1,
      positionType: currentPosition.positionType || 'buy',
      orderType: currentPosition.orderType || 'market',
      limitPrice: currentPosition.limitPrice,
      quantity: currentPosition.quantity || 1,
      multiplier: currentPosition.multiplier || 1,
      productType: currentPosition.productType || 'intraday',
      sourceNodeId: currentPosition.sourceNodeId,
      status: currentPosition.status,
      isRolledOut: currentPosition.isRolledOut,
      _lastUpdated: Date.now()
    };

    // Then apply each property from updates individually to avoid spread operator issues
    if (updates) {
      Object.keys(updates).forEach(key => {
        // Skip optionDetails as we handle it separately
        if (key !== 'optionDetails') {
          (updatedPosition as any)[key] = (updates as any)[key];
        }
      });
    }
    
    // Handle optionDetails separately - this avoids spreading potentially undefined values
    if (updates.optionDetails && currentPosition.optionDetails) {
      // Create a new optionDetails object without using spread operator
      updatedPosition.optionDetails = {
        expiry: currentPosition.optionDetails.expiry || '',
        strikeType: currentPosition.optionDetails.strikeType || '',
        strikeValue: currentPosition.optionDetails.strikeValue,
        optionType: currentPosition.optionDetails.optionType || 'CE'
      };
      
      // Copy each property individually from updates
      if (updates.optionDetails) {
        Object.keys(updates.optionDetails).forEach(key => {
          if (updatedPosition.optionDetails) {
            (updatedPosition.optionDetails as any)[key] = (updates.optionDetails as any)[key];
          }
        });
      }
    }
    
    // Update the selected position in the node data
    updateNodeData(node.id, {
      selectedPosition: updatedPosition
    });
    
    // Automatically save the modification to the node
    saveModifiedPosition(updatedPosition);
  };

  const saveModifiedPosition = (position: Position) => {
    if (!position) return;
    
    // Prepare modifications object to be saved in the modify node
    const modifications: Record<string, any> = {};
    
    // Create a new object for the modifications map
    if (node.data.modifications) {
      Object.keys(node.data.modifications).forEach(key => {
        modifications[key] = node.data.modifications[key];
      });
    }
    
    // Add or update the current position modification
    modifications[position.vpi] = {
      vpi: position.vpi || '',
      
      priority: position.priority || 1,
      positionType: position.positionType || 'buy',
      orderType: position.orderType || 'market',
      limitPrice: position.limitPrice,
      quantity: position.quantity || 1,
      multiplier: position.multiplier || 1,
      productType: position.productType || 'intraday',
      optionDetails: position.optionDetails,
      sourceNodeId: position.sourceNodeId,
      status: position.status,
      isRolledOut: position.isRolledOut,
      _lastUpdated: position._lastUpdated || Date.now()
    };

    // Update the node with modifications data
    updateNodeData(node.id, {
      modifications,
      _lastUpdated: Date.now()
    });
  };

  return {
    currentPosition,
    handlePositionChange
  };
}
