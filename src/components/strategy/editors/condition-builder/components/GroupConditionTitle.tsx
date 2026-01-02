
import React, { memo } from 'react';
import { Group, X } from 'lucide-react';
import { GroupCondition } from '../../../utils/conditionTypes';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface GroupConditionTitleProps {
  rootCondition: GroupCondition;
  level: number;
  allowRemove: boolean;
  updateGroupLogic: (value: string) => void;
  removeGroup: () => void;
}

const GroupConditionTitle: React.FC<GroupConditionTitleProps> = ({
  rootCondition,
  level,
  allowRemove,
  updateGroupLogic,
  removeGroup,
}) => {
  return (
    <div className="group-header">
      <div className="flex items-center gap-2">
        {level > 0 && (
          <Group className="h-4 w-4 text-muted-foreground" />
        )}
        
        <Select
          value={rootCondition.groupLogic}
          onValueChange={updateGroupLogic}
        >
          <SelectTrigger className="w-24 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AND">AND</SelectItem>
            <SelectItem value="OR">OR</SelectItem>
          </SelectContent>
        </Select>
        
        <span className="text-xs text-muted-foreground">
          {rootCondition.conditions.length} condition{rootCondition.conditions.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex items-center gap-1 ml-auto">
        {allowRemove && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={removeGroup}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4 text-destructive" />
          </Button>
        )}
      </div>
    </div>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(GroupConditionTitle);
