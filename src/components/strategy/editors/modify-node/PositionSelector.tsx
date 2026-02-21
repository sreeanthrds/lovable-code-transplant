
import React from 'react';
import { Position } from '@/components/strategy/types/position-types';
import { AlertTriangle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PositionSelectorProps {
  positions: Position[];
  selectedPositionId: string;
  onSelect: (positionId: string) => void;
}

const PositionSelector: React.FC<PositionSelectorProps> = ({
  positions,
  selectedPositionId,
  onSelect
}) => {
  if (positions.length === 0) {
    return (
      <div className="flex items-center space-x-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md">
        <AlertTriangle className="h-5 w-5 text-amber-500" />
        <p className="text-sm text-amber-700 dark:text-amber-300">
          No positions found. Create a position in an Entry Node first.
        </p>
      </div>
    );
  }

  return (
    <Select
      value={selectedPositionId}
      onValueChange={onSelect}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a position to modify" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Available positions</SelectLabel>
          {positions.map((position) => (
            <SelectItem key={position.vpi} value={position.vpi}>
              <span>{position.vpi} - {position.positionType?.toUpperCase()} - {position.orderType}</span>
              <span className="text-muted-foreground text-xs ml-2">({position.sourceNodeId || 'Node ID'})</span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default PositionSelector;
