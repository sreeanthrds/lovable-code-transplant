
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Group } from 'lucide-react';

interface ConditionActionsProps {
  addCondition: () => void;
  addGroup: () => void;
}

const ConditionActions: React.FC<ConditionActionsProps> = ({
  addCondition,
  addGroup,
}) => {
  return (
    <div className="flex items-center gap-2 pt-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={addCondition}
        className="h-8"
      >
        <Plus className="h-3.5 w-3.5 mr-1" />
        Add Condition
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={addGroup}
        className="h-8"
      >
        <Group className="h-3.5 w-3.5 mr-1" />
        Add Group
      </Button>
    </div>
  );
};

export default ConditionActions;
