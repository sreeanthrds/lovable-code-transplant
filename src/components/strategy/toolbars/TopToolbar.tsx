
import React from 'react';
import { Panel } from '@xyflow/react';
import { Undo, Redo, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStrategyStore } from '@/hooks/use-strategy-store';

interface TopToolbarProps {
  onAutoArrange?: () => void;
}

const TopToolbar: React.FC<TopToolbarProps> = ({ onAutoArrange }) => {
  const strategyStore = useStrategyStore();
  
  return (
    <Panel position="top-center">
      <div className="flex gap-2 bg-background/90 p-2 rounded-md shadow-md">
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => strategyStore.undo()}
          disabled={strategyStore.historyIndex <= 0}
        >
          <Undo className="h-4 w-4" />
          <span className="sr-only">Undo</span>
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => strategyStore.redo()}
          disabled={strategyStore.historyIndex >= strategyStore.history.length - 1}
        >
          <Redo className="h-4 w-4" />
          <span className="sr-only">Redo</span>
        </Button>
        {onAutoArrange && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={onAutoArrange}
            title="Auto arrange nodes"
          >
            <Grid3X3 className="h-4 w-4" />
            <span className="sr-only">Auto Arrange</span>
          </Button>
        )}
      </div>
    </Panel>
  );
};

export default TopToolbar;
