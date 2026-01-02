
import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

interface BaseNodeTemplateProps {
  id: string;
  data: {
    label: string;
    icon?: React.ReactNode;
    description?: string;
    [key: string]: any;
  };
  selected: boolean;
  isConnectable: boolean;
  type: string;
  zIndex: number;
  dragging: boolean;
  draggable: boolean;
  selectable: boolean;
  deletable: boolean;
  positionAbsoluteX: number;
  positionAbsoluteY: number;
  showSourceHandle?: boolean;
  showTargetHandle?: boolean;
  sourceHandlePosition?: Position;
  targetHandlePosition?: Position;
}

const BaseNodeTemplate = ({
  id,
  data,
  selected,
  isConnectable,
  type,
  zIndex = 0,
  dragging,
  draggable,
  selectable,
  deletable,
  positionAbsoluteX,
  positionAbsoluteY,
  showSourceHandle = true,
  showTargetHandle = true,
  sourceHandlePosition = Position.Bottom,
  targetHandlePosition = Position.Top,
}: BaseNodeTemplateProps) => {
  // Calculate opacity based on z-index (higher z-index = more transparent)
  const calculateOpacity = () => {
    const baseOpacity = 1;
    const opacityReduction = Math.min(zIndex * 0.05, 0.7);
    return Math.max(baseOpacity - opacityReduction, 0.3);
  };

  return (
    <>
      {showTargetHandle && (
        <Handle
          type="target"
          position={targetHandlePosition}
          isConnectable={isConnectable}
          style={{ visibility: isConnectable ? 'visible' : 'hidden' }}
        />
      )}
      
      <div 
        className="px-3 py-2 rounded-md transition-all duration-200"
        style={{ opacity: calculateOpacity() }}
      >
        <div className="flex items-center space-x-2">
          {data.icon && <div className="flex-shrink-0 text-warning">{data.icon}</div>}
          
          <div className="flex-1">
            <div className="font-medium text-info">{data.label}</div>
            {data.description && (
              <div className="text-xs text-primary/90">
                {data.description}
              </div>
            )}
          </div>
        </div>
        
        <div className="text-[9px] text-success/80 mt-1 text-right">
          ID: {id}
        </div>
      </div>
      
      {showSourceHandle && (
        <Handle
          type="source"
          position={sourceHandlePosition}
          isConnectable={isConnectable}
          style={{ visibility: isConnectable ? 'visible' : 'hidden' }}
        />
      )}
    </>
  );
};

export default memo(BaseNodeTemplate);
