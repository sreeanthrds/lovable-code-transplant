
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ExpressionIcon from './ExpressionIcon';
import { cn } from '@/lib/utils';

interface IndicatorNameSelectorProps {
  indicatorName: string | undefined;
  availableIndicators: Array<{id: string, displayName: string}>;
  missingIndicator: boolean;
  required?: boolean;
  onChange: (value: string) => void;
  getDisplayName: (id: string) => string;
  disabled?: boolean;
}

const IndicatorNameSelector: React.FC<IndicatorNameSelectorProps> = ({
  indicatorName,
  availableIndicators,
  missingIndicator,
  required = false,
  onChange,
  getDisplayName,
  disabled = false
}) => {
  const isEmpty = !indicatorName;
  const showRequired = required && isEmpty;

  return (
    <div className="relative">
      {showRequired && (
        <span className="absolute -top-1 right-0 text-red-500 text-xs">*</span>
      )}
      <Select 
        value={indicatorName} 
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger className={cn(
          "h-8", 
          missingIndicator ? 'border-destructive' : '',
          showRequired && "border-red-300 focus:ring-red-200"
        )}>
          <SelectValue placeholder="Select indicator">
            {indicatorName && (
              <div className="flex items-center gap-2">
                <ExpressionIcon type="indicator" />
                <span>{getDisplayName(indicatorName)}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {availableIndicators.length > 0 ? (
            availableIndicators.map(({ id, displayName }) => (
              <SelectItem key={id} value={id}>
                <div className="flex items-center gap-2">
                  <ExpressionIcon type="indicator" />
                  <span>{displayName}</span>
                </div>
              </SelectItem>
            ))
          ) : (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              No indicators available
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default IndicatorNameSelector;
