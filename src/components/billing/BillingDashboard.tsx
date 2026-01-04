import React from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, ArrowUpRight, AlertCircle } from 'lucide-react';
import { useBilling } from '@/hooks/useBilling';
import { PlanStatusCard } from './PlanStatusCard';
import { UsageMeter } from './UsageMeter';
import { AddOnsWallet } from './AddOnsWallet';
import { PaymentsHistory } from './PaymentsHistory';

export const BillingDashboard: React.FC = () => {
  const { summary, payments, loading, error, refresh } = useBilling();

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-4">Unable to load billing information</p>
        <Button onClick={refresh} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  const { plan, usage, addons } = summary;
  const showUpgrade = plan.plan === 'FREE' || plan.plan === 'LAUNCH';

  return (
    <div className="space-y-6">
      {/* Error banner (non-blocking) */}
      {error && (
        <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 text-warning text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Billing</h2>
          <p className="text-muted-foreground text-sm">Manage your plan and usage</p>
        </div>
        <Button variant="ghost" size="icon" onClick={refresh} className="h-8 w-8">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Plan Status Card */}
      <PlanStatusCard plan={plan} />

      {/* Usage Meters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <UsageMeter
          title="Backtests"
          icon="backtest"
          used={usage.backtests.monthly_used}
          limit={usage.backtests.monthly_limit}
          addonsRemaining={usage.backtests.addons_remaining}
          resetInfo={`Resets in ${usage.backtests.resets_in_days} days`}
          showDaily={{
            used: usage.backtests.daily_used,
            limit: usage.backtests.daily_limit
          }}
        />
        <UsageMeter
          title="Live Executions"
          icon="live"
          used={usage.live_executions.monthly_used}
          limit={usage.live_executions.monthly_limit}
          addonsRemaining={usage.live_executions.addons_remaining}
          resetInfo={`Resets in ${usage.live_executions.resets_in_days} days`}
        />
        <UsageMeter
          title="Paper Trading"
          icon="paper"
          used={usage.paper_trading.daily_used}
          limit={usage.paper_trading.daily_limit}
          resetInfo={`Resets at ${usage.paper_trading.resets_at}`}
        />
      </div>

      {/* Add-ons Wallet */}
      <AddOnsWallet 
        addons={addons}
        onBuyAddons={() => {
          // TODO: Integrate with Razorpay
          console.log('Buy add-ons clicked');
        }}
      />

      {/* Payment History */}
      <PaymentsHistory payments={payments} />

      {/* Upgrade CTA - only for FREE/LAUNCH users */}
      {showUpgrade && (
        <div className="p-6 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Unlock More with PRO</h3>
              <p className="text-muted-foreground text-sm mt-1">
                100 backtests/month, 50 live executions, and priority support
              </p>
            </div>
            <Button className="gap-2 btn-primary-glow">
              Upgrade to PRO
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
