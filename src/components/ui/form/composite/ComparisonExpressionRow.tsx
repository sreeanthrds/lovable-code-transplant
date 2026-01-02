
import React from 'react';
import ComparisonOperatorSelector from '../ComparisonOperatorSelector';
import type { ComparisonOperator } from '../ComparisonOperatorSelector';
import ExpressionWrapper from '../ExpressionWrapper';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComparisonExpressionRowProps {
  leftLabel?: string;
  rightLabel?: string;
  operator: ComparisonOperator;
  onOperatorChange: (value: ComparisonOperator) => void;
  leftComponent: React.ReactNode;
  rightComponent: React.ReactNode;
  onSwap?: () => void;
  className?: string;
  required?: boolean;
  showLabels?: boolean;
}

const ComparisonExpressionRow: React.FC<ComparisonExpressionRowProps> = ({
  leftLabel = "Left Side",
  rightLabel = "Right Side",
  operator,
  onOperatorChange,
  leftComponent,
  rightComponent,
  onSwap,
  className,
  required = false,
  showLabels = true
}) => {
  return (
    <div className={cn("expression-grid min-w-fit", className)}>
      <ExpressionWrapper
        label={leftLabel}
        required={required}
        showLabel={showLabels}
      >
        {leftComponent}
      </ExpressionWrapper>
      
      <div className="pt-6 shrink-0 flex flex-col items-center gap-2">
        <ComparisonOperatorSelector 
          value={operator}
          onValueChange={onOperatorChange}
          required={required}
        />
        {onSwap && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onSwap}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Swap left and right sides"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <ExpressionWrapper
        label={rightLabel}
        required={required}
        showLabel={showLabels}
      >
        {rightComponent}
      </ExpressionWrapper>
    </div>
  );
};

export default ComparisonExpressionRow;
