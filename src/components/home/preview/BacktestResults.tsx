
import React from 'react';
import { Activity } from 'lucide-react';

interface BacktestResultsProps {
  results: {
    totalReturn: number;
    winRate: number;
    totalTrades: number;
    maxDrawdown: number;
    sharpeRatio: number;
    profitFactor: number;
  };
}

const BacktestResults: React.FC<BacktestResultsProps> = ({ results }) => {
  return (
    <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-xl w-80">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
          <Activity className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-gray-800">Backtest Results</span>
        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Live</span>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center text-sm">
        <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-green-300/40 dark:border-green-400/20">
          <div className="text-green-600 dark:text-green-400 font-bold text-lg">+₹{results.totalReturn.toLocaleString()}</div>
          <div className="text-gray-600 dark:text-gray-300 text-xs">Total P&L</div>
        </div>
        <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-blue-300/40 dark:border-blue-400/20">
          <div className="text-blue-600 dark:text-blue-400 font-bold text-lg">{results.winRate}%</div>
          <div className="text-gray-600 dark:text-gray-300 text-xs">Win Rate</div>
        </div>
        <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-purple-300/40 dark:border-purple-400/20">
          <div className="text-purple-600 dark:text-purple-400 font-bold text-lg">{results.totalTrades}</div>
          <div className="text-gray-600 dark:text-gray-300 text-xs">Trades</div>
        </div>
        <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-orange-300/40 dark:border-orange-400/20">
          <div className="text-orange-600 dark:text-orange-400 font-bold text-lg">{results.maxDrawdown}%</div>
          <div className="text-gray-600 dark:text-gray-300 text-xs">Max DD</div>
        </div>
        <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-teal-300/40 dark:border-teal-400/20">
          <div className="text-teal-600 dark:text-teal-400 font-bold text-lg">{results.sharpeRatio}</div>
          <div className="text-gray-600 dark:text-gray-300 text-xs">Sharpe</div>
        </div>
        <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-pink-300/40 dark:border-pink-400/20">
          <div className="text-pink-600 dark:text-pink-400 font-bold text-lg">{results.profitFactor}</div>
          <div className="text-gray-600 dark:text-gray-300 text-xs">Profit Factor</div>
        </div>
      </div>
    </div>
  );
};

export default BacktestResults;
