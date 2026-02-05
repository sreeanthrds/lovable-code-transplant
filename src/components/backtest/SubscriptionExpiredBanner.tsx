import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowUpRight, RefreshCw } from 'lucide-react';

interface SubscriptionExpiredBannerProps {
  planName: string;
  expiredAt?: string;
}

const SubscriptionExpiredBanner: React.FC<SubscriptionExpiredBannerProps> = ({
  planName,
  expiredAt,
}) => {
  const formatExpiredDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Alert variant="destructive" className="border-warning bg-warning/10 border-warning/50">
      <AlertTriangle className="h-4 w-4 text-warning" />
      <AlertTitle className="text-warning-foreground font-semibold">
        Subscription Expired
      </AlertTitle>
      <AlertDescription className="flex flex-wrap items-center justify-between gap-4 mt-2">
        <span className="text-sm">
          Your <span className="font-medium capitalize">{planName}</span> subscription 
          {expiredAt && ` expired on ${formatExpiredDate(expiredAt)}`}. 
          Kindly renew to continue accessing premium features.
        </span>
        <div className="flex items-center gap-2">
          <a href="/#pricing">
            <Button size="sm" variant="default" className="gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              Renew Now
              <ArrowUpRight className="w-3 h-3" />
            </Button>
          </a>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default SubscriptionExpiredBanner;
