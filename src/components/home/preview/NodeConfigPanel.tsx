
import React from 'react';
import { Settings } from 'lucide-react';

const NodeConfigPanel: React.FC = () => {
  return (
    <div className="absolute top-6 right-6 bg-white/95 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/40 dark:border-white/20 shadow-lg w-72">
      <div className="flex items-center gap-2 mb-3">
        <Settings className="w-4 h-4 text-gray-400" />
        <span className="text-xs text-gray-500">Node Configuration</span>
        <span className="mx-1 text-gray-300">|</span>
        <span className="font-semibold text-green-600 text-sm">Strategy Controller</span>
      </div>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center p-3 bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-xl border-2 border-white/40 dark:border-white/20">
          <span className="text-gray-600 dark:text-gray-400">Node Type:</span>
          <span className="font-medium text-green-600 dark:text-green-400">Entry Signal</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-xl border-2 border-white/40 dark:border-white/20">
          <span className="text-gray-600 dark:text-gray-400">Condition:</span>
          <span className="font-medium text-gray-800 dark:text-gray-200">EMA Crossover</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-xl border-2 border-white/40 dark:border-white/20">
          <span className="text-gray-600 dark:text-gray-400">Timeframe:</span>
          <span className="font-medium text-gray-800 dark:text-gray-200">15 minutes</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-xl border-2 border-white/40 dark:border-white/20">
          <span className="text-gray-600 dark:text-gray-400">Symbol:</span>
          <span className="font-medium text-gray-800 dark:text-gray-200">RELIANCE</span>
        </div>
      </div>
    </div>
  );
};

export default NodeConfigPanel;
