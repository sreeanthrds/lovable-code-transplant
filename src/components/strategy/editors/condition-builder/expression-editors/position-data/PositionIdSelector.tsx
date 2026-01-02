
import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import FieldTooltip from '../../../shared/FieldTooltip';

interface PositionIdSelectorProps {
  vpi: string;
  updateVPI: (value: string) => void;
  vpiOptions: string[];
}

const PositionIdSelector: React.FC<PositionIdSelectorProps> = ({
  vpi,
  updateVPI,
  vpiOptions
}) => {
  // Ensure we never have an empty string as the value
  const selectValue = vpi && vpi.trim() !== '' ? vpi : '_any';
  
  return (
    <div>
      <div className="flex items-center gap-1 mb-1">
        <Label htmlFor="position-vpi" className="text-xs">Position ID</Label>
        <FieldTooltip content="Select a specific position by its unique identifier (VPI). Each position has a unique ID." />
      </div>
      <Select
        value={selectValue}
        onValueChange={updateVPI}
      >
        <SelectTrigger 
          id="position-vpi" 
          className="h-8 text-xs"
        >
          <SelectValue placeholder="Select Position ID" />
        </SelectTrigger>
        <SelectContent>
          {vpiOptions.map(vpi => (
            <SelectItem key={vpi} value={vpi}>
              {vpi}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PositionIdSelector;
