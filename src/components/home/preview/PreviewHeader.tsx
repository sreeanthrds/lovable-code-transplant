
import React from 'react';
import { Zap, BarChart3 } from 'lucide-react';

interface PreviewHeaderProps {
  showBacktest: boolean;
  onToggleBacktest: () => void;
}

const PreviewHeader: React.FC<PreviewHeaderProps> = ({ showBacktest, onToggleBacktest }) => {
  return (
    <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200/50 p-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-400"></div>
          <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
          <div className="h-3 w-3 rounded-full bg-green-400"></div>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <Zap className="w-5 h-5 text-green-500" />
          <span className="font-semibold">EMA Crossover Strategy</span>
        </div>
      </div>
      <button 
        onClick={onToggleBacktest}
        className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        <BarChart3 className="w-4 h-4" />
        Backtest Results
      </button>
    </div>
  );
};

export default PreviewHeader;
