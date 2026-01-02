import React from 'react';
import { EnhancedNumberInput } from '@/components/ui/form/enhanced';
import { InfoIcon, Lock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';

interface CompactReEntrySettingsProps {
  maxEntries: number;
  readOnly?: boolean;
  onMaxEntriesChange?: (value: number) => void;
}

export const CompactReEntrySettings: React.FC<CompactReEntrySettingsProps> = ({
  maxEntries,
  readOnly = false,
  onMaxEntriesChange
}) => {
  return (
    <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-md border">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium">Max Entries</span>
          {readOnly && <Lock className="h-3 w-3 text-muted-foreground" />}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-3 w-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{readOnly 
                  ? "Mirrored from the selected entry node's position" 
                  : "Maximum number of entries for this position"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="w-16">
          {readOnly ? (
            <Input 
              value={maxEntries} 
              readOnly 
              className="h-8 text-center bg-muted/50 cursor-not-allowed"
            />
          ) : (
            <EnhancedNumberInput
              value={maxEntries}
              onChange={(value) => onMaxEntriesChange?.(value || 1)}
              min={1}
              max={99}
              step={1}
              hideLabel={true}
            />
          )}
        </div>
      </div>
    </div>
  );
};