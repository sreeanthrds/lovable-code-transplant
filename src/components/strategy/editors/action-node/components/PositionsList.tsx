
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, X } from 'lucide-react';
import { Position } from '../types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface PositionsListProps {
  positions: Position[];
  selectedPosition: Position | null;
  onSelectPosition: (position: Position) => void;
  onAddPosition: () => void;
  onDeletePosition: (vpi: string) => void;
}

const PositionsList: React.FC<PositionsListProps> = ({
  positions,
  selectedPosition,
  onSelectPosition,
  onAddPosition,
  onDeletePosition
}) => {
  const sortedPositions = [...positions].sort((a, b) => a.priority - b.priority);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-lg border border-purple-200/50 dark:border-purple-700/30">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-purple-500 rounded-full shadow-sm" />
          <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-300">Trading Positions</h3>
          <Badge variant="outline" className="text-xs bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700">
            {sortedPositions.length} position{sortedPositions.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onAddPosition}
          className="h-8 px-3 flex items-center gap-2 border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-200 hover:scale-105"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add Position</span>
        </Button>
      </div>
      
      {sortedPositions.length === 0 ? (
        <div className="text-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950/30 dark:to-slate-950/30">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <PlusCircle className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">No positions configured</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Click "Add Position" to create your first trading position</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
          {sortedPositions.map((position, index) => (
            <div 
              key={position.vpi} 
              className={`group p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                selectedPosition?.vpi === position.vpi
                  ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 shadow-lg shadow-indigo-200/50 dark:shadow-indigo-800/20' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20'
              }`}
              onClick={() => onSelectPosition(position)}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                    selectedPosition?.vpi === position.vpi
                      ? 'bg-indigo-500 text-white shadow-md'
                      : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white'
                  } transition-colors`}>
                    P{position.priority}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={position.positionType === 'buy' ? 'default' : 'destructive'} 
                        className={`text-xs font-medium ${
                          position.positionType === 'buy' 
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700' 
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700'
                        }`}
                      >
                        {position.positionType === 'buy' ? '▲ BUY' : '▼ SELL'}
                      </Badge>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {position.quantity || 1} unit{(position.quantity || 1) > 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="mt-2 flex gap-2 text-xs">
                      {position.vpi && (
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded border border-blue-200 dark:border-blue-700 font-mono">
                          VPI: {position.vpi}
                        </span>
                      )}
                      {position.vpt && (
                        <span className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-2 py-1 rounded border border-violet-200 dark:border-violet-700">
                          Tag: {position.vpt}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 opacity-60 hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 hover:scale-110" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletePosition(position.vpi);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="border-t border-purple-200/50 dark:border-purple-700/30 pt-2">
        <p className="text-xs text-purple-600 dark:text-purple-400 text-center">Click on a position to configure its details</p>
      </div>
    </div>
  );
};

export default PositionsList;
