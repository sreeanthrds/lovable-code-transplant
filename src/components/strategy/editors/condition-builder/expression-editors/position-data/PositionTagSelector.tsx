
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

interface PositionTagSelectorProps {
  vpt: string;
  updateVPT: (value: string) => void;
  vptOptions: string[];
}

const PositionTagSelector: React.FC<PositionTagSelectorProps> = ({
  vpt,
  updateVPT,
  vptOptions
}) => {
  return (
    <div>
      <div className="flex items-center gap-1 mb-1">
        <Label htmlFor="position-vpt" className="text-xs">Position Tag</Label>
        <FieldTooltip content="Filter positions by tag group. Tags can be shared by multiple positions." />
      </div>
      <Select
        value={vpt || '_any'}
        onValueChange={updateVPT}
      >
        <SelectTrigger 
          id="position-vpt" 
          className="h-8 text-xs"
        >
          <SelectValue placeholder="Select Position Tag" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_any">
            <div className="flex items-center gap-1">
              All Tags
              <FieldTooltip content="Apply this condition to positions with any tag" />
            </div>
          </SelectItem>
          {vptOptions.map(vpt => (
            <SelectItem key={vpt} value={vpt}>
              {vpt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PositionTagSelector;
