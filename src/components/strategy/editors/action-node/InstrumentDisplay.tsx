
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface InstrumentDisplayProps {
  startNodeSymbol?: string;
  isSymbolMissing?: boolean;
}

const InstrumentDisplay: React.FC<InstrumentDisplayProps> = ({
  startNodeSymbol,
  isSymbolMissing
}) => {
  return (
    <div className="space-y-2">
      {isSymbolMissing && (
        <Alert variant="destructive" className="py-2 border-red-300 bg-red-50/50 dark:bg-red-950/20">
          <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
          <AlertDescription className="text-xs text-red-700 dark:text-red-300">
            Instrument unavailable in Start Node. Please configure an instrument.
          </AlertDescription>
        </Alert>
      )}
      
      <div className={`p-2 rounded border text-xs flex items-center justify-between ${
        isSymbolMissing 
          ? 'border-red-300 bg-red-50/50 dark:bg-red-950/20' 
          : 'border-blue-200 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/20'
      }`}>
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${
            startNodeSymbol ? 'bg-green-500' : 'bg-gray-400'
          }`} />
          <span className="text-blue-700 dark:text-blue-300 font-medium">Instrument:</span>
        </div>
        <span className={`text-xs ${
          startNodeSymbol 
            ? "font-semibold text-blue-900 dark:text-blue-100 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded" 
            : "text-gray-500 dark:text-gray-400 italic"
        }`}>
          {startNodeSymbol || 'Not selected'}
        </span>
      </div>
    </div>
  );
};

export default InstrumentDisplay;
