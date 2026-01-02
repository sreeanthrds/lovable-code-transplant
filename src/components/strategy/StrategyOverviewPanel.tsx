
import React from 'react';
import { X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StrategyTextDisplay from './StrategyTextDisplay';

interface StrategyOverviewPanelProps {
  onClose: () => void;
}

const StrategyOverviewPanel: React.FC<StrategyOverviewPanelProps> = ({ onClose }) => {
  console.log('📋 StrategyOverviewPanel rendering');
  
  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header with gradient */}
      <div className="flex justify-between items-center p-4 border-b border-border/50 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Strategy Overview</h3>
            <p className="text-xs text-muted-foreground">Complete strategy breakdown</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-destructive/10 hover:text-destructive">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <StrategyTextDisplay />
      </div>
    </div>
  );
};

export default StrategyOverviewPanel;
