import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';
import { getStrategiesList } from '@/hooks/strategy-store/strategy-operations';

interface DuplicateStrategyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  existingStrategyName: string;
  onReplace: () => void;
  onRename: (newName: string) => void;
}

export const DuplicateStrategyDialog: React.FC<DuplicateStrategyDialogProps> = ({
  isOpen,
  onClose,
  existingStrategyName,
  onReplace,
  onRename,
}) => {
  const [newName, setNewName] = useState('');
  const [showRenameInput, setShowRenameInput] = useState(false);
  const [error, setError] = useState('');

  const handleRename = () => {
    const trimmedName = newName.trim();
    
    if (!trimmedName) {
      setError('Strategy name cannot be empty');
      return;
    }

    // Check if the new name already exists
    const existingStrategies = getStrategiesList();
    const isDuplicate = existingStrategies.some(
      strategy => strategy.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      setError('A strategy with this name already exists');
      return;
    }

    setError('');
    onRename(trimmedName);
    onClose();
  };

  const handleReplace = () => {
    onReplace();
    onClose();
  };

  const handleShowRename = () => {
    setShowRenameInput(true);
    setNewName(`${existingStrategyName} (Copy)`);
    setError('');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value);
    if (error) {
      setError('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
            <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <DialogTitle className="text-lg font-semibold">
            Strategy Already Exists
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            A strategy named "{existingStrategyName}" already exists. What would you like to do?
          </p>
        </DialogHeader>

        {showRenameInput && (
          <div className="space-y-2">
            <Label htmlFor="new-name">New Strategy Name</Label>
            <Input
              id="new-name"
              value={newName}
              onChange={handleNameChange}
              placeholder="Enter new strategy name"
              autoFocus
              className={error ? 'border-red-500' : ''}
            />
            {error && (
              <p className="text-sm text-red-500 mt-1">{error}</p>
            )}
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-col space-y-2">
          {!showRenameInput ? (
            <>
              <Button 
                variant="destructive" 
                onClick={handleReplace}
                className="w-full"
              >
                Replace Existing Strategy
              </Button>
              <Button 
                variant="default" 
                onClick={handleShowRename}
                className="w-full"
              >
                Create with Different Name
              </Button>
              <Button 
                variant="outline" 
                onClick={onClose}
                className="w-full"
              >
                Cancel Import
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={handleRename}
                disabled={!newName.trim()}
                className="w-full"
              >
                Import with New Name
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowRenameInput(false)}
                className="w-full"
              >
                Back
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};