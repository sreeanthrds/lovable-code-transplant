
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

interface Strategy {
  id: string;
  name: string;
  description: string;
  lastModified: string;
  created: string;
}

interface CreateStrategyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (strategyName: string) => void;
  defaultName?: string;
  strategies?: Strategy[];
}

const CreateStrategyDialog = ({ 
  open, 
  onOpenChange, 
  onSubmit,
  defaultName = "My New Strategy",
  strategies = []
}: CreateStrategyDialogProps) => {
  const [strategyName, setStrategyName] = useState(defaultName);

  // Check for duplicate names in real-time
  const isDuplicate = useMemo(() => {
    const trimmedName = strategyName.trim();
    if (!trimmedName) return false;
    return strategies.some(
      strategy => strategy.name.toLowerCase() === trimmedName.toLowerCase()
    );
  }, [strategyName, strategies]);

  const isValidName = useMemo(() => {
    const trimmedName = strategyName.trim();
    return trimmedName.length > 0 && !isDuplicate;
  }, [strategyName, isDuplicate]);

  // Reset the strategy name when the dialog is opened
  useEffect(() => {
    if (open) {
      setStrategyName(defaultName);
    }
  }, [open, defaultName]);

  const handleSubmit = () => {
    console.log('🎯 CreateStrategyDialog - handleSubmit called', { strategyName, isValidName, isDuplicate });
    if (isValidName) {
      console.log('✅ CreateStrategyDialog - Calling onSubmit with name:', strategyName);
      onSubmit(strategyName);
    } else {
      console.log('❌ CreateStrategyDialog - Submit blocked', { isValidName, isDuplicate });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Name Your Strategy</DialogTitle>
          <DialogDescription>
            Give your strategy a unique, descriptive name.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Strategy Name</Label>
              <div className="relative">
                <Input
                  id="name"
                  value={strategyName}
                  onChange={(e) => setStrategyName(e.target.value)}
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
              {strategyName.trim() === "" && strategyName !== defaultName && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Strategy name cannot be empty
                </p>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValidName}>
            Create Strategy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateStrategyDialog;
