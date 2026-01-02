
import React from 'react';
import { ArrowUpCircle, X, AlertTriangle } from 'lucide-react';
import { FormField } from '../shared';

interface ActionTypeSelectorProps {
  actionType?: 'entry' | 'exit' | 'alert';
  onActionTypeChange: (value: string) => void;
}

const ActionTypeSelector: React.FC<ActionTypeSelectorProps> = ({
  actionType,
  onActionTypeChange
}) => {
  return (
    <FormField label="Action Type" className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div 
          className={`group flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
            actionType === 'entry' 
              ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 shadow-lg shadow-emerald-200/50 dark:shadow-emerald-800/20' 
              : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20'
          }`}
          onClick={() => onActionTypeChange('entry')}
        >
          <div className={`p-2 rounded-full mb-2 transition-colors ${
            actionType === 'entry' 
              ? 'bg-emerald-500 text-white shadow-md' 
              : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white'
          }`}>
            <ArrowUpCircle className="h-5 w-5" />
          </div>
          <span className={`text-sm font-medium ${
            actionType === 'entry' 
              ? 'text-emerald-700 dark:text-emerald-300' 
              : 'text-gray-600 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
          }`}>
            Entry Order
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">Open positions</span>
        </div>
        
        <div 
          className={`group flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
            actionType === 'exit' 
              ? 'border-red-500 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 shadow-lg shadow-red-200/50 dark:shadow-red-800/20' 
              : 'border-gray-200 dark:border-gray-700 hover:border-red-300 hover:bg-red-50/50 dark:hover:bg-red-950/20'
          }`}
          onClick={() => onActionTypeChange('exit')}
        >
          <div className={`p-2 rounded-full mb-2 transition-colors ${
            actionType === 'exit' 
              ? 'bg-red-500 text-white shadow-md' 
              : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 group-hover:bg-red-500 group-hover:text-white'
          }`}>
            <X className="h-5 w-5" />
          </div>
          <span className={`text-sm font-medium ${
            actionType === 'exit' 
              ? 'text-red-700 dark:text-red-300' 
              : 'text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400'
          }`}>
            Exit Order
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">Close positions</span>
        </div>
        
        <div 
          className={`group flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
            actionType === 'alert' 
              ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 shadow-lg shadow-amber-200/50 dark:shadow-amber-800/20' 
              : 'border-gray-200 dark:border-gray-700 hover:border-amber-300 hover:bg-amber-50/50 dark:hover:bg-amber-950/20'
          }`}
          onClick={() => onActionTypeChange('alert')}
        >
          <div className={`p-2 rounded-full mb-2 transition-colors ${
            actionType === 'alert' 
              ? 'bg-amber-500 text-white shadow-md' 
              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white'
          }`}>
            <AlertTriangle className="h-5 w-5" />
          </div>
          <span className={`text-sm font-medium ${
            actionType === 'alert' 
              ? 'text-amber-700 dark:text-amber-300' 
              : 'text-gray-600 dark:text-gray-400 group-hover:text-amber-600 dark:group-hover:text-amber-400'
          }`}>
            Alert Only
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">Notify only</span>
        </div>
      </div>
    </FormField>
  );
};

export default ActionTypeSelector;
