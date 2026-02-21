
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NodeVariable } from '../../../utils/conditions';

interface PositionBindingProps {
  variable: NodeVariable;
  positions: any[];
  onPositionBinding: (positionId: string) => void;
}

const PositionBinding: React.FC<PositionBindingProps> = ({
  variable,
  positions,
  onPositionBinding
}) => {
  if (positions.length === 0) {
    return null;
  }

  return (
    <>
      <div>
        <Label className="text-xs">Bind to Position</Label>
        <Select
          value={variable.positionBinding?.vpi || 'none'}
          onValueChange={onPositionBinding}
        >
          <SelectTrigger className="h-7 text-xs">
            <SelectValue placeholder="Select position" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No binding</SelectItem>
            {positions.map(position => (
              <SelectItem key={position.vpi} value={position.vpi}>
                <span>
                  {position.vpi} ({position.positionType})
                  {position.optionDetails && ` - ${position.optionDetails.optionType} ${position.optionDetails.strikeType}`}
                </span>
                <span className="text-muted-foreground text-xs ml-2">({position.sourceNodeId || 'Node ID'})</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {variable.positionBinding && (
        <div className="text-xs bg-accent/10 p-2 rounded">
          <div className="font-medium">Instrument Details:</div>
          <div>Type: {variable.positionBinding.instrumentDetails.instrumentType}</div>
          <div>VPI: {variable.positionBinding.instrumentDetails.vpi}</div>
          {variable.positionBinding.instrumentDetails.instrumentType === 'options' && (
            <>
              <div>Expiry: {variable.positionBinding.instrumentDetails.expiry}</div>
              <div>Strike: {variable.positionBinding.instrumentDetails.strikeType}</div>
              <div>Type: {variable.positionBinding.instrumentDetails.optionType}</div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default PositionBinding;
