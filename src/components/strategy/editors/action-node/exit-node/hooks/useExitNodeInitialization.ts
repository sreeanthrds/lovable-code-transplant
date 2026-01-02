
import { useEffect } from 'react';
import { Node } from '@xyflow/react';
import { ExitNodeData, ReEntryConfig } from '../types';

interface UseExitNodeInitializationProps {
  node: Node;
  updateNodeData: (id: string, data: any) => void;
  initializedRef: React.MutableRefObject<boolean>;
  defaultExitNodeData: ExitNodeData;
}

export const useExitNodeInitialization = ({
  node,
  updateNodeData,
  initializedRef,
  defaultExitNodeData
}: UseExitNodeInitializationProps) => {
  // Initialize the exit node data structure if it doesn't exist yet
  useEffect(() => {
    if (initializedRef.current) return;
    
    const nodeData = node.data || {};
    
    // Check if exitNodeData exists and has required structure
    if (!nodeData.exitNodeData) {
      console.log('Initializing exit node data for:', node.id);
      
      // Create default structure for the exit node
      updateNodeData(node.id, {
        ...nodeData,
        exitNodeData: {
          ...defaultExitNodeData,
          // Add additional initialization if needed
          _initialized: true
        },
        _lastUpdated: Date.now()
      });
      
      initializedRef.current = true;
    } else {
      // Ensure reEntry config exists
      const exitNodeData = nodeData.exitNodeData as ExitNodeData;
      
      if (!exitNodeData.reEntryConfig) {
        updateNodeData(node.id, {
          ...nodeData,
          exitNodeData: {
            ...exitNodeData,
            reEntryConfig: defaultExitNodeData.reEntryConfig || {
              enabled: false,
              groupNumber: 1,
              maxReEntries: 1
            }
          },
          _lastUpdated: Date.now()
        });
      }
      
      initializedRef.current = true;
    }
  }, [node, updateNodeData, initializedRef, defaultExitNodeData]);
  
  return null;
};
