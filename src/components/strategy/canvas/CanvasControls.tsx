
import React, { useState } from 'react';
import { Background, Controls, MiniMap } from '@xyflow/react';
import { Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CanvasControlsProps {
  nodeClassName: (node: any) => string;
}

const CanvasControls: React.FC<CanvasControlsProps> = ({ nodeClassName }) => {
  const [minimapVisible, setMinimapVisible] = useState(false);

  const toggleMinimap = () => {
    setMinimapVisible(prev => !prev);
  };

  return (
    <>
      <Background />
      <Controls />
      
      <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-1">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-7 w-7 bg-background/80 backdrop-blur-sm" 
          onClick={toggleMinimap}
          type="button"
        >
          {minimapVisible ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
        </Button>
        
        {minimapVisible && (
          <MiniMap 
            className="rounded-md overflow-hidden border border-border"
            nodeStrokeWidth={1}
            nodeColor={(node) => {
              switch (node.type) {
                case 'startNode': return 'rgba(72, 187, 178, 0.6)';
                case 'entryNode': return 'rgba(72, 187, 178, 0.6)';
                case 'signalNode': return 'rgba(255, 255, 255, 0.3)';
                case 'actionNode': return 'rgba(255, 255, 255, 0.3)';
                case 'exitNode': return 'rgba(255, 255, 255, 0.3)';
                case 'endNode': return 'rgba(239, 68, 68, 0.6)';
                case 'forceEndNode': return 'rgba(239, 68, 68, 0.6)';
                default: return 'rgba(255, 255, 255, 0.3)';
              }
            }}
            nodeClassName={nodeClassName}
          />
        )}
      </div>
    </>
  );
};

export default React.memo(CanvasControls);
