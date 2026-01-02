
import React from 'react';
import { Expression, ExternalTriggerExpression } from '../../../utils/conditionTypes';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ExternalTriggerExpressionEditorProps {
  expression: Expression;
  updateExpression: (expr: Expression) => void;
  required?: boolean;
}

const ExternalTriggerExpressionEditor: React.FC<ExternalTriggerExpressionEditorProps> = ({
  expression,
  updateExpression,
  required = false
}) => {
  if (expression.type !== 'external_trigger') {
    return null;
  }

  const triggerExpr = expression as ExternalTriggerExpression;
  
  // Trigger type options
  const triggerTypes = [
    { value: 'news', label: 'News Event' },
    { value: 'economicReport', label: 'Economic Report' },
    { value: 'earningsAnnouncement', label: 'Earnings Announcement' },
    { value: 'dividendEx', label: 'Ex-Dividend Date' },
    { value: 'marketHoliday', label: 'Market Holiday' },
    { value: 'volatilitySpike', label: 'Volatility Spike' },
    { value: 'customAlert', label: 'Custom Alert' },
  ];

  // Update the trigger type
  const updateTriggerType = (value: string) => {
    updateExpression({
      ...triggerExpr,
      triggerType: value,
      // Reset parameters when type changes
      parameters: {}
    });
  };

  // Update parameters for news events
  const updateNewsKeywords = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateExpression({
      ...triggerExpr,
      parameters: {
        ...triggerExpr.parameters,
        keywords: event.target.value
      }
    });
  };

  // Update parameters for economic reports
  const updateReportName = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateExpression({
      ...triggerExpr,
      parameters: {
        ...triggerExpr.parameters,
        reportName: event.target.value
      }
    });
  };

  // Render parameter inputs based on trigger type
  const renderParameterInputs = () => {
    switch (triggerExpr.triggerType) {
      case 'news':
        return (
          <div>
            <Label htmlFor="news-keywords" className="text-xs block mb-1">Keywords (comma separated)</Label>
            <Input
              id="news-keywords"
              className="h-8 text-xs"
              placeholder="e.g. earnings, acquisition, CEO"
              value={triggerExpr.parameters?.keywords || ''}
              onChange={updateNewsKeywords}
            />
          </div>
        );
      case 'economicReport':
      case 'earningsAnnouncement':
        return (
          <div>
            <Label htmlFor="report-name" className="text-xs block mb-1">Report Name</Label>
            <Input
              id="report-name"
              className="h-8 text-xs"
              placeholder="e.g. GDP, CPI, NFPR"
              value={triggerExpr.parameters?.reportName || ''}
              onChange={updateReportName}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="trigger-type" className="text-xs block mb-1">External Trigger Type</Label>
        <Select 
          value={triggerExpr.triggerType} 
          onValueChange={updateTriggerType}
        >
          <SelectTrigger 
            id="trigger-type" 
            className={cn("h-8", required && !triggerExpr.triggerType && "border-red-300 focus:ring-red-200")}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {triggerTypes.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {renderParameterInputs()}

      <div className="bg-muted/30 p-2 rounded-sm">
        <p className="text-xs text-muted-foreground">
          External triggers evaluate to "true" when the specified event occurs.
        </p>
      </div>
    </div>
  );
};

export default ExternalTriggerExpressionEditor;
