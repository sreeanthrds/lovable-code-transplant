
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface IndicatorMissingAlertProps {
  indicatorName: string;
  displayName: string;
}

const IndicatorMissingAlert: React.FC<IndicatorMissingAlertProps> = ({
  indicatorName,
  displayName
}) => {
  if (!indicatorName) return null;
  
  return (
    <Alert variant="destructive" className="py-2">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="text-xs">
        Indicator <strong>{displayName}</strong> is no longer 
        available in the Start Node. Please select a different indicator.
      </AlertDescription>
    </Alert>
  );
};

export default IndicatorMissingAlert;
