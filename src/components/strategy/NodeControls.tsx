
import React, { useState, useCallback, memo } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Node } from '@xyflow/react';

interface NodeControlsProps {
  node: Node | { id: string; type: string; data: any; position?: { x: number; y: number } };
  onDelete: (nodeId: string) => void;
}

const NodeControls = ({ node, onDelete }: NodeControlsProps) => {
  const [open, setOpen] = useState(false);
  
  // Don't allow deletion of start nodes
  if (node.type === 'startNode') {
    return null;
  }

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(node.id);
    setOpen(false);
  }, [node.id, onDelete]);

  const getNodeTypeName = useCallback(() => {
    switch (node.type) {
      case 'signalNode': return 'Signal';
      case 'entrySignalNode': return 'Entry Condition';
      case 'exitSignalNode': return 'Exit Condition';
      case 'actionNode': return 'Action';
      case 'endNode': return 'End';
      case 'forceEndNode': return 'Force End';
      case 'entryNode': return 'Entry';
      case 'exitNode': return 'Exit';
      case 'alertNode': return 'Alert';
      case 'modifyNode': return 'Modify';
      case 'retryNode': return 'Re-Entry';
      case 'reEntrySignalNode': return 'Re-Entry Condition';
      default: return 'Node';
    }
  }, [node.type]);

  return (
    <div className="absolute right-0 top-0 -mt-5 -mr-1.5 z-20 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            size="icon"
            className="h-5 w-5 rounded-full shadow-md"
            onClick={(e) => e.stopPropagation()}
            title="Delete node"
          >
            <X className="h-2.5 w-2.5" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {getNodeTypeName()} Node</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {getNodeTypeName().toLowerCase()} node? 
              This action cannot be undone and will remove any connections to and from this node.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default memo(NodeControls);
