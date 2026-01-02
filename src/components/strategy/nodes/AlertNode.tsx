
import React, { useMemo, memo } from 'react';
import { NodeProps } from '@xyflow/react';
import ActionNodeTemplate from './templates/ActionNodeTemplate';
import { getNodeIcon } from '../utils/nodes/nodeIcons';
import { useStartNodeSymbol } from './action-node/useStartNodeSymbol';

const AlertNode: React.FC<NodeProps> = ({ id, data, selected, isConnectable, type, zIndex, dragging, draggable, selectable, deletable, positionAbsoluteX, positionAbsoluteY }) => {
  const startNodeSymbol = useStartNodeSymbol();
  
  // Create a safe version of nodeData with default values for required fields
  const nodeData = useMemo(() => {
    const rawData = data as Record<string, unknown>;
    return {
      label: (rawData.label as string) || 'Alert',
      actionType: 'alert' as const,
      positions: Array.isArray(rawData.positions) ? rawData.positions : [],
      requiresSymbol: rawData.requiresSymbol as boolean | undefined,
      symbol: rawData.symbol as string | undefined,
      icon: getNodeIcon('alert'),
      description: 'Send a notification',
      alertMessage: rawData.alertMessage as string || 'Strategy alert',
      alertType: rawData.alertType as string || 'info'
    };
  }, [data]);

  return (
    <ActionNodeTemplate
      id={id}
      data={nodeData}
      selected={selected}
      isConnectable={isConnectable}
      type={type || 'alertNode'}
      zIndex={zIndex || 0}
      dragging={dragging || false}
    />
  );
};

export default memo(AlertNode);
