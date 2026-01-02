
import { useEffect, useRef } from 'react';
import { NodeData, Position } from '../types';

interface UseInitializeNodeDataProps {
  nodeData: NodeData;
  updateNodeData: (id: string, data: any) => void;
  nodeId: string;
}

export const useInitializeNodeData = ({ 
  nodeData, 
  updateNodeData, 
  nodeId 
}: UseInitializeNodeDataProps) => {
  const initializedRef = useRef(false);
  
  // Set default values if not present - this runs only once
  useEffect(() => {
    if (!initializedRef.current) {
      // Check if initialization is needed
      const needsInitialization = !nodeData?.actionType;
      
      if (needsInitialization) {
        // Create a clean defaultValues object only with the needed properties
        const defaultValues: Partial<NodeData> = {};
        
        // Add defaults only for missing values
        if (!nodeData?.actionType) defaultValues.actionType = 'entry';
        
        // Initialize empty positions array if it doesn't exist
        if (!nodeData?.positions) {
          defaultValues.positions = [];
        }
        
        // Only update if we have defaults to set
        if (Object.keys(defaultValues).length > 0) {
          updateNodeData(nodeId, defaultValues);
        }
      }
      
      // Mark as initialized to prevent future updates
      initializedRef.current = true;
    }
  }, [nodeId, nodeData, updateNodeData]); // Adding dependencies but using ref to prevent re-runs
};
