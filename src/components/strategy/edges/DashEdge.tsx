
import React, { memo } from 'react';
import { EdgeProps, getBezierPath } from '@xyflow/react';

// Custom edge with dashed line styling and arrow marker using bezier curve
const DashEdge = ({ 
  id, 
  sourceX, 
  sourceY, 
  targetX, 
  targetY, 
  source,
  target,
  style,
  selected,
  sourcePosition,
  targetPosition,
  animated,
  ...props 
}: EdgeProps) => {
  // Use getBezierPath for a curved edge path
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  });
  
  // Define unique marker and gradient IDs for this edge
  const markerId = `dashEdgeArrow-${id}`;
  const gradientId = `dashEdgeGradient-${id}`;
  
  const edgeStyle = {
    ...style,
    stroke: 'hsl(var(--primary))',
    strokeWidth: selected ? 6 : 5,
    filter: 'drop-shadow(0 2px 4px hsl(var(--primary) / 0.3))'
  };
  
  return (
    <>
      {/* SVG defs for gradient only */}
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" className="edge-gradient-start" />
          <stop offset="100%" className="edge-gradient-end" />
        </linearGradient>
      </defs>
      
      {/* Background path - subtle */}
      <path
        id={`${id}-bg`}
        className="react-flow__edge-path"
        d={edgePath}
        style={edgeStyle}
        markerEnd=""
        fill="none"
      />
      
      {/* Flowing dots animation */}
      <g className="flowing-dots">
        <circle r="3" fill="hsl(var(--primary))">
          <animateMotion
            dur="3s"
            repeatCount="indefinite"
            path={edgePath}
            begin="0s"
          />
        </circle>
        <circle r="2.5" fill="hsl(var(--accent))">
          <animateMotion
            dur="3s"
            repeatCount="indefinite"
            path={edgePath}
            begin="0.5s"
          />
        </circle>
        <circle r="2" fill="hsl(var(--primary) / 0.8)">
          <animateMotion
            dur="3s"
            repeatCount="indefinite"
            path={edgePath}
            begin="1s"
          />
        </circle>
        <circle r="2.5" fill="hsl(var(--secondary))">
          <animateMotion
            dur="3s"
            repeatCount="indefinite"
            path={edgePath}
            begin="1.5s"
          />
        </circle>
        <circle r="3" fill="hsl(var(--primary))">
          <animateMotion
            dur="3s"
            repeatCount="indefinite"
            path={edgePath}
            begin="2s"
          />
        </circle>
      </g>
      
      {/* Additional glow effect for selected edges */}
      {selected && (
        <path
          id={`${id}-glow`}
          className="react-flow__edge-path"
          d={edgePath}
          style={{
            stroke: 'hsl(var(--primary) / 0.6)',
            strokeWidth: 6,
            filter: 'blur(2px)'
          }}
          fill="none"
        />
      )}
    </>
  );
};

export default memo(DashEdge);
