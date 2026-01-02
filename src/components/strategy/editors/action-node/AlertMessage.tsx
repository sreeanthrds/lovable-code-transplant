
import React from 'react';
import { InfoBox } from '../shared';
import { AlertTriangle } from 'lucide-react';

const AlertMessage: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-2 border-amber-200 dark:border-amber-700 rounded-lg p-6 shadow-sm">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mr-4 border border-amber-200 dark:border-amber-700">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 animate-pulse" />
        </div>
        <div>
          <h4 className="font-semibold text-amber-700 dark:text-amber-300 text-lg">Alert Only Mode</h4>
          <p className="text-sm text-amber-600 dark:text-amber-400">No trades will be executed</p>
        </div>
      </div>
      <div className="bg-amber-100/50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200/50 dark:border-amber-700/30">
        <p className="text-amber-800 dark:text-amber-200 text-sm leading-relaxed">
          In Alert mode, the strategy will generate notifications but won't execute any trades. 
          Use this for testing strategies or when you want to be notified of signals before manually executing trades.
        </p>
        <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          <span>Strategy will send notifications only</span>
        </div>
      </div>
    </div>
  );
};

export default AlertMessage;
