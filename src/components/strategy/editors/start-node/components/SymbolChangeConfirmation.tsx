
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { UsageReference } from '../../../utils/dependency-tracking/types';

interface SymbolChangeConfirmationProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  isPendingInstrumentTypeChange: boolean;
  pendingInstrumentType: string;
  currentSymbol: string;
  symbolUsages: UsageReference[];
  onConfirm: () => void;
}

const SymbolChangeConfirmation: React.FC<SymbolChangeConfirmationProps> = ({
  isOpen,
  onOpenChange,
  isPendingInstrumentTypeChange,
  pendingInstrumentType,
  currentSymbol,
  symbolUsages,
  onConfirm
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isPendingInstrumentTypeChange 
              ? "Change Trading Instrument Type?" 
              : "Change Trading Symbol?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isPendingInstrumentTypeChange 
              ? `Changing instrument type to ${pendingInstrumentType} will reset the current symbol ${currentSymbol}` 
              : `The current symbol ${currentSymbol} is being used in:`}
            
            <ul className="mt-2 space-y-1 text-sm">
              {symbolUsages.map((usage, index) => (
                <li key={index} className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <span>{usage.nodeName} ({usage.context})</span>
                </li>
              ))}
            </ul>
            <p className="mt-4">
              {isPendingInstrumentTypeChange
                ? "Changing the instrument type will affect all these nodes and reset the symbol. Do you want to continue?"
                : "Changing the symbol will affect all these nodes. Do you want to continue?"}
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SymbolChangeConfirmation;
