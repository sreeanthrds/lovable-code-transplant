
import { useState, useEffect, useCallback, useRef } from 'react';
import { Node, useReactFlow } from '@xyflow/react';
import { GroupCondition, groupConditionToString } from '../../utils/conditions';

interface UseSignalNodeFormProps {
  node: Node;
  updateNodeData: (id: string, data: any) => void;
}

interface SignalNodeFormData {
  label: string;
  conditions: GroupCondition[];
  exitConditions: GroupCondition[];
  hasReEntryConditions: boolean;
  reEntryConditions: GroupCondition[];
  hasReEntryExitConditions: boolean;
  reEntryExitConditions: GroupCondition[];
}

interface SignalNodeData {
  label?: string;
  conditions?: GroupCondition[];
  exitConditions?: GroupCondition[];
  hasReEntryConditions?: boolean;
  reEntryConditions?: GroupCondition[];
  hasReEntryExitConditions?: boolean;
  reEntryExitConditions?: GroupCondition[];
  conditionsPreview?: string;
  exitConditionsPreview?: string;
  reEntryConditionsPreview?: string;
  reEntryExitConditionsPreview?: string;
  [key: string]: any;
}

export const useSignalNodeForm = ({ node, updateNodeData }: UseSignalNodeFormProps) => {
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdatesRef = useRef<Partial<SignalNodeData>>({});
  const { getNodes } = useReactFlow();

  // Safely cast node.data with default fallback
  const nodeData = (node.data || {}) as SignalNodeData;

  // Helper to generate condition preview string
  const generateConditionPreview = useCallback((conditions: GroupCondition[]): string => {
    if (!conditions || conditions.length === 0) return '';
    
    // Get start node for indicator parameters
    const allNodes = getNodes();
    const startNode = allNodes.find(n => n.type === 'startNode');
    const startNodeData = startNode?.data;
    
    try {
      return conditions
        .map(condition => groupConditionToString(condition, startNodeData))
        .filter(str => str && !str.includes('Error') && !str.includes('Incomplete'))
        .join(' | ');
    } catch (error) {
      console.error('Error generating condition preview:', error);
      return '';
    }
  }, [getNodes]);
  
  // Create initial conditions specific to this node
  const createInitialConditions = useCallback((): GroupCondition[] => [
    {
      id: `${node.id}-root`,
      groupLogic: 'AND',
      conditions: []
    }
  ], [node.id]);

  // Create initial exit conditions specific to this node
  const createInitialExitConditions = useCallback((): GroupCondition[] => [
    {
      id: `${node.id}-exit-root`,
      groupLogic: 'AND',
      conditions: []
    }
  ], [node.id]);

  // Initialize form data
  const [formData, setFormData] = useState<SignalNodeFormData>(() => {
    const initialConditions = Array.isArray(nodeData.conditions) && nodeData.conditions.length > 0
      ? nodeData.conditions
      : createInitialConditions();
    
    const initialExitConditions = Array.isArray(nodeData.exitConditions) && nodeData.exitConditions.length > 0
      ? nodeData.exitConditions
      : createInitialExitConditions();

    const initialReEntryConditions = Array.isArray(nodeData.reEntryConditions) && nodeData.reEntryConditions.length > 0
      ? nodeData.reEntryConditions
      : createInitialConditions();

    const initialReEntryExitConditions = Array.isArray(nodeData.reEntryExitConditions) && nodeData.reEntryExitConditions.length > 0
      ? nodeData.reEntryExitConditions
      : createInitialExitConditions();

    return {
      label: nodeData.label || `Signal ${node.id.split('-').pop()}`,
      conditions: initialConditions,
      exitConditions: initialExitConditions,
      hasReEntryConditions: nodeData.hasReEntryConditions || false,
      reEntryConditions: initialReEntryConditions,
      hasReEntryExitConditions: nodeData.hasReEntryExitConditions || false,
      reEntryExitConditions: initialReEntryExitConditions
    };
  });

  // Update form data when node data changes externally
  useEffect(() => {
    const safeNodeData = (node.data || {}) as SignalNodeData;
    
    const newConditions = Array.isArray(safeNodeData.conditions) && safeNodeData.conditions.length > 0
      ? safeNodeData.conditions
      : createInitialConditions();
    
    const newExitConditions = Array.isArray(safeNodeData.exitConditions) && safeNodeData.exitConditions.length > 0
      ? safeNodeData.exitConditions
      : createInitialExitConditions();

    const newReEntryConditions = Array.isArray(safeNodeData.reEntryConditions) && safeNodeData.reEntryConditions.length > 0
      ? safeNodeData.reEntryConditions
      : createInitialConditions();

    const newReEntryExitConditions = Array.isArray(safeNodeData.reEntryExitConditions) && safeNodeData.reEntryExitConditions.length > 0
      ? safeNodeData.reEntryExitConditions
      : createInitialExitConditions();

    setFormData(prev => ({
      ...prev,
      label: safeNodeData.label || `Signal ${node.id.split('-').pop()}`,
      conditions: newConditions,
      exitConditions: newExitConditions,
      hasReEntryConditions: safeNodeData.hasReEntryConditions || false,
      reEntryConditions: newReEntryConditions,
      hasReEntryExitConditions: safeNodeData.hasReEntryExitConditions || false,
      reEntryExitConditions: newReEntryExitConditions
    }));
  }, [node.data, node.id, createInitialConditions, createInitialExitConditions]);

  // Use ref to always get latest node data in debounced updates
  const nodeDataRef = useRef(nodeData);
  nodeDataRef.current = nodeData;

  // Debounced update function - accumulates pending updates to avoid losing changes
  const debouncedUpdate = useCallback((updates: Partial<SignalNodeData>) => {
    // Accumulate updates instead of overwriting
    pendingUpdatesRef.current = {
      ...pendingUpdatesRef.current,
      ...updates
    };
    
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      // Use ref to get latest nodeData, avoiding stale closure
      const currentNodeData = nodeDataRef.current;
      const accumulatedUpdates = pendingUpdatesRef.current;
      
      // Clear pending updates before the async operation
      pendingUpdatesRef.current = {};
      
      updateNodeData(node.id, { 
        ...currentNodeData,
        ...accumulatedUpdates,
        _lastUpdated: Date.now()
      });
      updateTimeoutRef.current = null;
    }, 300);
  }, [node.id, updateNodeData]);

  const handleLabelChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    setFormData(prev => ({
      ...prev,
      label: newValue
    }));
    
    debouncedUpdate({ label: newValue });
  }, [debouncedUpdate]);

  const updateConditions = useCallback((updatedCondition: GroupCondition) => {
    console.log(`Updating conditions for node ${node.id}:`, updatedCondition);
    
    const newConditions = [updatedCondition];
    const preview = generateConditionPreview(newConditions);
    
    setFormData(prev => ({
      ...prev,
      conditions: newConditions
    }));
    
    debouncedUpdate({ conditions: newConditions, conditionsPreview: preview });
  }, [node.id, debouncedUpdate, generateConditionPreview]);

  const updateExitConditions = useCallback((updatedCondition: GroupCondition) => {
    console.log(`Updating exit conditions for node ${node.id}:`, updatedCondition);
    
    const newConditions = [updatedCondition];
    const preview = generateConditionPreview(newConditions);
    
    setFormData(prev => ({
      ...prev,
      exitConditions: newConditions
    }));
    
    debouncedUpdate({ exitConditions: newConditions, exitConditionsPreview: preview });
  }, [node.id, debouncedUpdate, generateConditionPreview]);

  const updateReEntryConditions = useCallback((updatedCondition: GroupCondition) => {
    console.log(`Updating re-entry conditions for node ${node.id}:`, updatedCondition);
    
    const newConditions = [updatedCondition];
    const preview = generateConditionPreview(newConditions);
    
    setFormData(prev => ({
      ...prev,
      reEntryConditions: newConditions
    }));
    
    debouncedUpdate({ reEntryConditions: newConditions, reEntryConditionsPreview: preview });
  }, [node.id, debouncedUpdate, generateConditionPreview]);

  const updateReEntryExitConditions = useCallback((updatedCondition: GroupCondition) => {
    console.log(`Updating re-entry exit conditions for node ${node.id}:`, updatedCondition);
    
    const newConditions = [updatedCondition];
    const preview = generateConditionPreview(newConditions);
    
    setFormData(prev => ({
      ...prev,
      reEntryExitConditions: newConditions
    }));
    
    debouncedUpdate({ reEntryExitConditions: newConditions, reEntryExitConditionsPreview: preview });
  }, [node.id, debouncedUpdate, generateConditionPreview]);

  const handleReEntryToggle = useCallback((enabled: boolean) => {
    console.log(`Toggling re-entry conditions for node ${node.id}:`, enabled);
    
    setFormData(prev => ({
      ...prev,
      hasReEntryConditions: enabled
    }));
    
    debouncedUpdate({ hasReEntryConditions: enabled });
  }, [node.id, debouncedUpdate]);

  const handleReEntryExitToggle = useCallback((enabled: boolean) => {
    console.log(`Toggling re-entry exit conditions for node ${node.id}:`, enabled);
    
    setFormData(prev => ({
      ...prev,
      hasReEntryExitConditions: enabled
    }));
    
    debouncedUpdate({ hasReEntryExitConditions: enabled });
  }, [node.id, debouncedUpdate]);

  const copyInitialConditions = useCallback(() => {
    const newReEntryConditions = JSON.parse(JSON.stringify(formData.conditions));
    // Generate new IDs for the copied conditions
    const regenerateIds = (condition: any): any => {
      if (condition.groupLogic) {
        return {
          ...condition,
          id: `condition-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          conditions: condition.conditions.map(regenerateIds)
        };
      }
      return {
        ...condition,
        id: `condition-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
    };
    
    const processedConditions = newReEntryConditions.map(regenerateIds);
    
    setFormData(prev => ({
      ...prev,
      reEntryConditions: processedConditions
    }));
    
    debouncedUpdate({ reEntryConditions: processedConditions });
  }, [formData.conditions, debouncedUpdate]);

  const copyInitialExitConditions = useCallback(() => {
    const newReEntryExitConditions = JSON.parse(JSON.stringify(formData.conditions));
    // Generate new IDs for the copied conditions
    const regenerateIds = (condition: any): any => {
      if (condition.groupLogic) {
        return {
          ...condition,
          id: `condition-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          conditions: condition.conditions.map(regenerateIds)
        };
      }
      return {
        ...condition,
        id: `condition-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
    };
    
    const processedConditions = newReEntryExitConditions.map(regenerateIds);
    
    setFormData(prev => ({
      ...prev,
      reEntryExitConditions: processedConditions
    }));
    
    debouncedUpdate({ reEntryExitConditions: processedConditions });
  }, [formData.conditions, debouncedUpdate]);

  // Clean up timeouts and flush pending updates on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        
        // Flush any pending updates before unmounting
        const accumulatedUpdates = pendingUpdatesRef.current;
        if (Object.keys(accumulatedUpdates).length > 0) {
          const currentNodeData = nodeDataRef.current;
          updateNodeData(node.id, { 
            ...currentNodeData,
            ...accumulatedUpdates,
            _lastUpdated: Date.now()
          });
        }
      }
      pendingUpdatesRef.current = {};
    };
  }, [node.id, updateNodeData]);

  console.log(`useSignalNodeForm for node ${node.id} - current conditions:`, formData.conditions);

  return {
    formData,
    conditions: formData.conditions,
    exitConditions: formData.exitConditions,
    reEntryConditions: formData.reEntryConditions,
    reEntryExitConditions: formData.reEntryExitConditions,
    hasReEntryConditions: formData.hasReEntryConditions,
    hasReEntryExitConditions: formData.hasReEntryExitConditions,
    handleLabelChange,
    updateConditions,
    updateExitConditions,
    updateReEntryConditions,
    updateReEntryExitConditions,
    handleReEntryToggle,
    handleReEntryExitToggle,
    copyInitialConditions,
    copyInitialExitConditions
  };
};
