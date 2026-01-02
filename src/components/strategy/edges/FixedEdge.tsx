
import React, { memo } from 'react';
import { EdgeProps, getStraightPath } from '@xyflow/react';

// Custom edge that can optionally have fixed length
const FixedEdge = ({ 
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
  data,
  ...props 
}: EdgeProps & { data?: { fixedLength?: boolean; length?: number } }) => {
  // Default length if not specified
  const fixedLength = data?.fixedLength || false;
  const length = data?.length || 100;
  
  let adjustedTargetX = targetX;
  let adjustedTargetY = targetY;
  
  // If fixed length is enabled, adjust the target position
  if (fixedLength) {
    // Calculate the direction vector from source to target
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    
    // Normalize the vector
    const distance = Math.sqrt(dx * dx + dy * dy);
    const normalizedDx = dx / distance;
    const normalizedDy = dy / distance;
    
    // Calculate the new target position using the fixed length
    adjustedTargetX = sourceX + normalizedDx * length;
    adjustedTargetY = sourceY + normalizedDy * length;
  }
  
  // Use getStraightPath for a straight edge path
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX: adjustedTargetX,
    targetY: adjustedTargetY
  });
  
  // Define unique marker and gradient IDs for this edge
  const markerId = `fixedEdgeArrow-${id}`;
  const gradientId = `fixedEdgeGradient-${id}`;
  
  return (
    <>
      {/* SVG defs for gradient only */}
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" className="edge-gradient-start" />
          <stop offset="100%" className="edge-gradient-end" />
        </linearGradient>
      </defs>
      
      {/* Draw a straight edge with fixed length */}
      <path
        id={id}
        className="react-flow__edge-path fixed-edge-path"
        d={edgePath}
        style={{
          ...style,
          stroke: 'hsl(var(--primary))',
          strokeWidth: selected ? 6 : 5,
          filter: 'drop-shadow(0 2px 4px hsl(var(--primary) / 0.3))'
        }}
        markerEnd=""
      />
    </>
  );
};

export default memo(FixedEdge);
