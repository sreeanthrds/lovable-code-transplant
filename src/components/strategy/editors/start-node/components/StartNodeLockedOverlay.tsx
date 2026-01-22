import React from 'react';
import { Lock, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface StartNodeLockedOverlayProps {
  descendantCount: number;
}

const StartNodeLockedOverlay: React.FC<StartNodeLockedOverlayProps> = ({ descendantCount }) => {
  return (
    <div className="absolute inset-0 z-10 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
      <Alert className="mx-4 max-w-md border-amber-500/50 bg-amber-50/90 dark:bg-amber-950/50">
        <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertTitle className="text-amber-800 dark:text-amber-200 flex items-center gap-2">
          <span>Configuration Locked</span>
        </AlertTitle>
        <AlertDescription className="text-amber-700 dark:text-amber-300 space-y-2">
          <p>
            This Start node has <strong>{descendantCount}</strong> connected node{descendantCount > 1 ? 's' : ''}. 
            The configuration is frozen to protect strategy integrity.
          </p>
          <div className="flex items-start gap-2 mt-3 p-2 bg-amber-100/50 dark:bg-amber-900/30 rounded border border-amber-200 dark:border-amber-700">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs">
              To modify this configuration, first remove all descendant nodes from the strategy canvas.
            </p>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default StartNodeLockedOverlay;
