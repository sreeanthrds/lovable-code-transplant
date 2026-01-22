import React, { useState, memo } from 'react';
import { Button } from '@/components/ui/button';
import { X, AlertTriangle } from 'lucide-react';
import { flatIndicatorConfig } from '../../utils/categorizedIndicatorConfig';
import RemoveIndicatorDialog from './RemoveIndicatorDialog';

interface SelectedIndicatorProps {
  indicatorId: string;
  indicatorData: {
    display_name: string;
    indicator_name: string;
    [key: string]: any;
  };
  onUpdate: (newParams: any) => void;
  onRemove: () => void;
  onEdit?: () => void;
  deleteDisabled?: boolean;
}

const SelectedIndicator: React.FC<SelectedIndicatorProps> = ({
  indicatorId,
  indicatorData,
  onUpdate,
  onRemove,
  onEdit,
  deleteDisabled = false
}) => {
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  
  // Get indicator config
  const indicator = flatIndicatorConfig[indicatorData.indicator_name];
  
  if (!indicator) {
    return (
      <div className="flex items-center justify-between p-3 border rounded-md bg-muted/20">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <div className="text-sm font-medium">{indicatorData.display_name}</div>
          <span className="text-xs text-destructive">Config not found</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6" 
          onClick={onRemove}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }
  
  return (
    <div className="group relative inline-flex items-center bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-full px-4 py-2 hover:bg-green-200 dark:hover:bg-green-900/50 transition-all duration-200 cursor-pointer hover:scale-105">
      {/* Main clickable area for editing */}
      <div 
        className="flex items-center gap-2 flex-1 min-w-0"
        onClick={onEdit}
        title="Click to edit parameters"
      >
        <div className="text-sm font-medium text-green-800 dark:text-green-200 truncate">
          {indicatorData.display_name}
        </div>
        
        {/* Edit icon that appears on hover */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <svg className="h-3 w-3 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
      </div>
      
      {/* Remove button - only show if not disabled */}
      {!deleteDisabled && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 ml-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors opacity-60 hover:opacity-100" 
          onClick={(e) => {
            e.stopPropagation();
            setShowRemoveDialog(true);
          }}
          title="Remove indicator"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
      
      <RemoveIndicatorDialog
        isOpen={showRemoveDialog}
        onClose={() => setShowRemoveDialog(false)}
        onConfirm={onRemove}
        indicatorName={indicatorData.display_name}
        hasUsages={false}
        usages={[]}
      />
    </div>
  );
};

export default memo(SelectedIndicator);