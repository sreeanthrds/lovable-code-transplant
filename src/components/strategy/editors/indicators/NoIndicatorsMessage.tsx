
import React from 'react';
import { InfoIcon } from 'lucide-react';

const NoIndicatorsMessage: React.FC = () => {
  return (
    <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground bg-muted/40 rounded-md">
      <InfoIcon className="h-4 w-4 shrink-0" />
      <p>No indicators have been added. Use the dropdown above to add technical indicators to your strategy.</p>
    </div>
  );
};

export default NoIndicatorsMessage;
