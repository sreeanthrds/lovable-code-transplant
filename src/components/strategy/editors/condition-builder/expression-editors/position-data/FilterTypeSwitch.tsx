
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import FieldTooltip from '../../../shared/FieldTooltip';

interface FilterTypeSwitchProps {
  useVpiFilter: boolean;
  onChange: (checked: boolean) => void;
}

const FilterTypeSwitch: React.FC<FilterTypeSwitchProps> = ({
  useVpiFilter,
  onChange
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <Label className="text-xs">Filter By</Label>
          <FieldTooltip content="Choose how to identify positions - by their unique ID or by their tag group" />
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-xs font-semibold ${useVpiFilter ? 'text-muted-foreground' : 'text-indigo-500'}`}>
            Tag
          </span>
          <Switch
            checked={useVpiFilter}
            onCheckedChange={onChange}
            id="filter-type-switch"
            className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-indigo-500"
          />
          <span className={`text-xs font-semibold ${useVpiFilter ? 'text-blue-500' : 'text-muted-foreground'}`}>
            ID
          </span>
        </div>
      </div>
    </div>
  );
};

export default FilterTypeSwitch;
