import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { getStrategiesList } from '@/hooks/strategy-store/strategy-operations';

interface ImportConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  strategyName: string;
  onConfirm: (finalName: string) => void;
  onCancel: () => void;
}

export const ImportConfirmationDialog: React.FC<ImportConfirmationDialogProps> = ({
  isOpen,
  onClose,
  strategyName,
  onConfirm,
  onCancel,
}) => {
  const [newName, setNewName] = useState('');

  // Check for duplicate names in real-time (exactly like CreateStrategyDialog)
  const isDuplicate = React.useMemo(() => {
    const trimmedName = newName.trim();
    if (!trimmedName) return false;
    const existingStrategies = getStrategiesList();
    return existingStrategies.some(
      strategy => strategy.name.toLowerCase() === trimmedName.toLowerCase()
    );
  }, [newName]);

  const isValidName = React.useMemo(() => {
    const trimmedName = newName.trim();
    return trimmedName.length > 0 && !isDuplicate;
  }, [newName, isDuplicate]);

  const handleConfirm = () => {
    if (isValidName) {
      onConfirm(newName.trim());
      onClose();
    }
  };

  const handleCancel = () => {
    onCancel();
    onClose();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value);
  };

  // Initialize name when dialog opens (exactly like CreateStrategyDialog)
  React.useEffect(() => {
    if (isOpen) {
      setNewName(strategyName);
    }
  }, [isOpen, strategyName]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Import</DialogTitle>
          <DialogDescription>
            Please confirm or modify the strategy name before importing.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="strategy-name">Strategy Name</Label>
              <div className="relative">
                <Input
                  id="strategy-name"
                  value={newName}
                  onChange={handleNameChange}
                  placeholder="Enter strategy name"
                  autoFocus
                  className={isDuplicate ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                />
                {isDuplicate && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  </div>
                )}
              </div>
              {isDuplicate && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  A strategy with this name already exists
                </p>
              )}
              {newName.trim() === "" && newName !== strategyName && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Strategy name cannot be empty
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!isValidName}
          >
            Import Strategy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};