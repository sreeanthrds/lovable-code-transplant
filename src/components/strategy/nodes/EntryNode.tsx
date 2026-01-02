
import React, { useMemo, memo } from 'react';
import { NodeProps } from '@xyflow/react';
import ActionNodeTemplate from './templates/ActionNodeTemplate';
import { getNodeIcon } from '../utils/nodes/nodeIcons';
import { useStartNodeSymbol } from './action-node/useStartNodeSymbol';
import { ExitNodeData } from '../editors/action-node/exit-node/types';

const EntryNode: React.FC<NodeProps> = ({ id, data, selected, isConnectable, type, zIndex, dragging, draggable, selectable, deletable, positionAbsoluteX, positionAbsoluteY }) => {
  const startNodeSymbol = useStartNodeSymbol();
  
  // Create a safe version of nodeData with default values for required fields
  const nodeData = useMemo(() => {
    const rawData = data as Record<string, unknown>;
    return {
      label: (rawData.label as string) || 'Entry Order',
      actionType: 'entry' as const,
      positions: Array.isArray(rawData.positions) ? rawData.positions : [],
      requiresSymbol: rawData.requiresSymbol as boolean | undefined,
      symbol: rawData.symbol as string | undefined,
      startNodeSymbol, // Pass the start node symbol for instrument checking
      icon: getNodeIcon('entry'),
      description: 'Enter new positions',
      // Add exit node data to support post-execution features
      exitNodeData: rawData.exitNodeData as ExitNodeData | undefined
    };
  }, [data, startNodeSymbol]);

  return (
    <ActionNodeTemplate
      id={id}
      data={nodeData}
      selected={selected}
      isConnectable={isConnectable}
      type={type || 'entryNode'}
      zIndex={zIndex || 0}
      dragging={dragging || false}
    />
  );
};

export default memo(EntryNode);
