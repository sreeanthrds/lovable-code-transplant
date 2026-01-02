
import React from 'react';
import { Separator } from '@/components/ui/separator';
import ResetButton from './bottom-toolbar/ResetButton';
import AlertConfigButton from './bottom-toolbar/AlertConfigButton';
import BacktestButton from './bottom-toolbar-buttons/BacktestButton';

const BottomToolbar: React.FC = () => {
  return (
    <div className="flex items-center justify-between p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center space-x-2">
        <ResetButton />
        <Separator orientation="vertical" className="h-6" />
        <BacktestButton />
      </div>
      
      <div className="flex items-center space-x-2">
        <AlertConfigButton />
      </div>
    </div>
  );
};

export default BottomToolbar;
