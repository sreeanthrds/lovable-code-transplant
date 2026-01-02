
import React from 'react';
import { Position } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Save } from 'lucide-react';
import PositionEditor from './PositionEditor';

interface PositionDialogProps {
  position: Position | null;
  isOpen: boolean;
  onClose: () => void;
  hasOptionTrading: boolean;
  isEntryNode?: boolean;
  exchange?: string;
  symbol?: string;
  onPositionChange: (updates: Partial<Position>) => void;
  onPositionTypeChange: (value: string) => void;
  onOrderTypeChange: (value: string) => void;
  onLimitPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onQuantityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMultiplierChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onProductTypeChange: (value: string) => void;
  onExpiryChange: (value: string) => void;
  onStrikeTypeChange: (value: string) => void;
  onStrikeValueChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOptionTypeChange: (value: string) => void;
}

const PositionDialog: React.FC<PositionDialogProps> = ({
  position,
  isOpen,
  onClose,
  hasOptionTrading,
  isEntryNode = false,
  exchange,
  symbol,
  onPositionChange,
  onPositionTypeChange,
  onOrderTypeChange,
  onLimitPriceChange,
  onQuantityChange,
  onMultiplierChange,
  onProductTypeChange,
  onExpiryChange,
  onStrikeTypeChange,
  onStrikeValueChange,
  onOptionTypeChange
}) => {
  if (!position) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-[500px] h-auto">
        <DialogHeader>
          <DialogTitle>
            {position.positionType === 'buy' ? 'Buy' : 'Sell'} Position {position.vpi}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh]">
          <div className="p-4">
            <PositionEditor
              position={position}
              hasOptionTrading={hasOptionTrading}
              isEntryNode={isEntryNode}
              exchange={exchange}
              symbol={symbol}
              onPositionChange={onPositionChange}
              onPositionTypeChange={onPositionTypeChange}
              onOrderTypeChange={onOrderTypeChange}
              onLimitPriceChange={onLimitPriceChange}
              onQuantityChange={onQuantityChange}
              onMultiplierChange={onMultiplierChange}
              onProductTypeChange={onProductTypeChange}
              onExpiryChange={onExpiryChange}
              onStrikeTypeChange={onStrikeTypeChange}
              onStrikeValueChange={onStrikeValueChange}
              onOptionTypeChange={onOptionTypeChange}
            />
          </div>
        </ScrollArea>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="gap-2">
            <X className="h-4 w-4" /> Cancel
          </Button>
          <Button onClick={onClose} className="gap-2">
            <Save className="h-4 w-4" /> Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PositionDialog;
