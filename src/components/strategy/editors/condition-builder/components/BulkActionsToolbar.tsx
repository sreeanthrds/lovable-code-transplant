import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Group, 
  Copy, 
  Trash2, 
  X, 
  MoveUp, 
  MoveDown,
  FolderOpen
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BulkActionsToolbarProps {
  selectedCount: number;
  onGroup: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onMoveToGroup: (groupPath: number[]) => void;
  onUngroup: () => void;
  onClearSelection: () => void;
  availableGroups: Array<{ path: number[]; label: string }>;
  canMoveUp: boolean;
  canMoveDown: boolean;
  hasGroupsSelected: boolean;
}

const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({
  selectedCount,
  onGroup,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onMoveToGroup,
  onUngroup,
  onClearSelection,
  availableGroups,
  canMoveUp,
  canMoveDown,
  hasGroupsSelected
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-background border border-border rounded-lg shadow-lg p-2 flex items-center gap-2">
        <span className="text-sm text-muted-foreground px-2">
          {selectedCount} selected
        </span>
        
        <div className="h-4 w-px bg-border" />
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onGroup}
          className="h-8"
          disabled={selectedCount < 2}
        >
          <Group className="h-4 w-4 mr-1" />
          Group
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onDuplicate}
          className="h-8"
        >
          <Copy className="h-4 w-4 mr-1" />
          Duplicate
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onMoveUp}
          className="h-8"
          disabled={!canMoveUp}
        >
          <MoveUp className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onMoveDown}
          className="h-8"
          disabled={!canMoveDown}
        >
          <MoveDown className="h-4 w-4" />
        </Button>

        {hasGroupsSelected && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onUngroup}
            className="h-8"
          >
            <FolderOpen className="h-4 w-4 mr-1" />
            Ungroup
          </Button>
        )}
        
        {availableGroups.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8">
                Move to Group
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {availableGroups.map((group, index) => (
                <DropdownMenuItem 
                  key={index}
                  onClick={() => onMoveToGroup(group.path)}
                >
                  {group.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        
        <div className="h-4 w-px bg-border" />
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onDelete}
          className="h-8 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClearSelection}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default BulkActionsToolbar;