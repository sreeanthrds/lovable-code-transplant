import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Copy, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useConditionClipboard } from '../condition-builder/hooks/useConditionClipboard';

interface ReEntryConditionsToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  onCopyFromInitial: () => void;
  title: string;
  description: string;
  infoTooltip?: string;
}

const ReEntryConditionsToggle: React.FC<ReEntryConditionsToggleProps> = ({
  enabled,
  onToggle,
  onCopyFromInitial,
  title,
  description,
  infoTooltip
}) => {
  const { pasteConditions, hasClipboardData } = useConditionClipboard();

  const handlePasteConditions = () => {
    const pastedConditions = pasteConditions();
    if (pastedConditions && pastedConditions.length > 0) {
      // For now, we'll just call the copy function since we need to modify SignalNodeContent
      // to handle pasted conditions properly
      console.log('Pasted conditions:', pastedConditions);
    }
  };

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-accent/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            id={`reentry-toggle-${title.replace(/\s+/g, '-').toLowerCase()}`}
            checked={enabled}
            onCheckedChange={onToggle}
          />
          <Label 
            htmlFor={`reentry-toggle-${title.replace(/\s+/g, '-').toLowerCase()}`}
            className="text-sm font-medium"
          >
            {title}
          </Label>
          {infoTooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-sm">{infoTooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        {enabled && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onCopyFromInitial}
              className="h-8"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy from Initial
            </Button>
            {hasClipboardData && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePasteConditions}
                className="h-8"
              >
                Paste
              </Button>
            )}
          </div>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
};

export default ReEntryConditionsToggle;