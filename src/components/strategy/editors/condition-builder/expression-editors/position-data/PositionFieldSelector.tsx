
import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import FieldTooltip from '../../../shared/FieldTooltip';

interface PositionFieldSelectorProps {
  field: string;
  updateField: (value: string) => void;
  required?: boolean;
}

const PositionFieldSelector: React.FC<PositionFieldSelectorProps> = ({
  field,
  updateField,
  required = false
}) => {
  // Field options for position data
  const positionFields = [
    { value: 'unrealizedPnl', label: 'Unrealized P&L', description: 'The current paper profit or loss of the position that has not been realized yet' },
    { value: 'realizedPnl', label: 'Realized P&L', description: 'The actual profit or loss that has been locked in through closing all or part of the position' },
    { value: 'quantity', label: 'Position Size', description: 'The number of shares, contracts, or units in the position' },
    { value: 'entryPrice', label: 'Entry Price', description: 'The average price at which the position was opened' },
    { value: 'marketValue', label: 'Market Value', description: 'The current total value of the position at market price' },
    { value: 'costBasis', label: 'Cost Basis', description: 'The original amount invested in the position, including fees' },
    { value: 'percentChange', label: 'Percent Change', description: 'The percentage change in value since the position was opened' },
  ];

  return (
    <div>
      <div className="flex items-center gap-1 mb-1">
        <Label htmlFor="position-field" className="text-xs">Position Field</Label>
        <FieldTooltip content="Select what data you want to access from the position" />
      </div>
      <Select 
        value={field || ''} 
        onValueChange={updateField}
      >
        <SelectTrigger 
          id="position-field" 
          className={cn("h-8", required && !field && "border-red-300 focus:ring-red-200")}
        >
          <SelectValue placeholder="Select field" />
        </SelectTrigger>
        <SelectContent>
          {positionFields.map(field => (
            <SelectItem key={field.value} value={field.value}>
              <div className="flex items-center gap-1">
                {field.label}
                <FieldTooltip content={field.description} />
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {required && !field && (
        <p className="text-xs text-destructive mt-1">This field is required</p>
      )}
    </div>
  );
};

export default PositionFieldSelector;
