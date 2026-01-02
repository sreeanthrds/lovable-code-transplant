
import React from 'react';
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
import { UsageReference } from '../../utils/dependency-tracking/types';
import { AlertTriangle } from 'lucide-react';

interface RemoveIndicatorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  indicatorName: string;
  hasUsages: boolean;
  usages: UsageReference[];
}

const RemoveIndicatorDialog: React.FC<RemoveIndicatorDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  indicatorName,
  hasUsages,
  usages
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };
  
  const baseName = indicatorName.split('_')[0];
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Remove {baseName} Indicator
          </AlertDialogTitle>
          <AlertDialogDescription>
            {hasUsages ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-amber-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span>This indicator is used in {usages.length} location(s)</span>
                </div>
                <p>
                  Removing this indicator will affect the conditions in the following nodes:
                </p>
                <ul className="pl-5 text-xs space-y-1 list-disc">
                  {usages.map((usage, index) => (
                    <li key={index}>
                      <span className="font-medium">{usage.nodeName}</span> ({usage.nodeType})
                    </li>
                  ))}
                </ul>
                <p className="text-sm mt-2">
                  These conditions will be automatically removed or modified.
                  Are you sure you want to continue?
                </p>
              </div>
            ) : (
              <p>
                Are you sure you want to remove the {baseName} indicator?
                This action cannot be undone.
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} className={hasUsages ? "bg-amber-600 hover:bg-amber-700" : ""}>
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RemoveIndicatorDialog;
