
import React, { memo } from 'react';
import { NodeProps, Position } from '@xyflow/react';
import BaseNodeTemplate from './templates/BaseNodeTemplate';
import { getNodeIcon } from '../utils/nodes/nodeIcons';

const ForceEndNode: React.FC<NodeProps> = ({ id, data, selected, isConnectable, type, zIndex, dragging, draggable, selectable, deletable, positionAbsoluteX, positionAbsoluteY }) => {
  // Ensure data is properly structured with defaults
  const nodeData = {
    label: data?.label as string || 'Force End',
    icon: getNodeIcon('forceEndNode'),
    description: 'Close All Positions'
  };

  return (
    <BaseNodeTemplate
      id={id}
      data={nodeData}
      selected={selected}
      isConnectable={isConnectable}
      showSourceHandle={false}
      targetHandlePosition={Position.Top}
      type={type || 'forceEndNode'}
      zIndex={zIndex || 0}
      dragging={dragging || false}
      draggable={draggable !== undefined ? draggable : true}
      selectable={selectable !== undefined ? selectable : true}
      deletable={deletable !== undefined ? deletable : true}
      positionAbsoluteX={positionAbsoluteX || 0}
      positionAbsoluteY={positionAbsoluteY || 0}
    />
  );
};

export default memo(ForceEndNode);
