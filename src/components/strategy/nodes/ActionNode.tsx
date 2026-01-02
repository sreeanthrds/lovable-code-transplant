
import React, { useMemo, memo } from 'react';
import { NodeProps } from '@xyflow/react';
import ActionNodeTemplate from './templates/ActionNodeTemplate';
import { getNodeIcon } from '../utils/nodes/nodeIcons';
import { useStartNodeSymbol } from './action-node/useStartNodeSymbol';

const ActionNode: React.FC<NodeProps> = ({ id, data, selected, isConnectable, type, zIndex, dragging, draggable, selectable, deletable, positionAbsoluteX, positionAbsoluteY }) => {
  const startNodeSymbol = useStartNodeSymbol();
  
  // Create a safe version of nodeData with default values for required fields
  const nodeData = useMemo(() => {
    const rawData = data as Record<string, unknown>;
    // Determine action type with a default
    const actionType = (rawData.actionType as 'entry' | 'exit' | 'alert' | 'modify') || 'entry';
    
    return {
      label: (rawData.label as string) || 'Action',
      actionType,
      positions: Array.isArray(rawData.positions) ? rawData.positions : [],
      requiresSymbol: rawData.requiresSymbol as boolean | undefined,
      symbol: rawData.symbol as string | undefined,
      icon: getNodeIcon(actionType),
      description: `${actionType.charAt(0).toUpperCase() + actionType.slice(1)} action`
    };
  }, [data]);

  return (
    <ActionNodeTemplate
      id={id}
      data={nodeData}
      selected={selected}
      isConnectable={isConnectable}
      type={type || 'actionNode'}
      zIndex={zIndex || 0}
      dragging={dragging || false}
    />
  );
};

export default memo(ActionNode);
