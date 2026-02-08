import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Crown, Zap, Calendar, TrendingUp, ArrowUpRight, RefreshCw, Wifi, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePaymentRealtime } from '@/hooks/usePaymentRealtime';
import { adminService } from '@/lib/supabase/services/admin-service';
import { initiatePayment } from '@/lib/services/payment-service';
import { UserPlan, PlanType, BillingCycle, PLAN_CONFIGS } from '@/types/billing';
import { usePlanDefinitions } from '@/hooks/usePlanDefinitions';
import { PlanDefinition } from '@/types/plan-definitions';
import { format } from 'date-fns';

// Helper to get plan config from database plans or fallback
function getPlanConfigFromDefinition(plan: PlanDefinition | undefined, fallbackCode: string) {
  if (plan) {
    return {
      name: plan.name,
      backtests_daily_limit: plan.backtests_daily_limit,
      backtests_monthly_limit: plan.backtests_monthly_limit,
      live_executions_limit: plan.live_executions_monthly_limit,
      paper_trading_daily_limit: plan.paper_trading_daily_limit,
      paper_trading_monthly_limit: plan.paper_trading_monthly_limit,
      price_monthly: plan.price_monthly,
      price_yearly: plan.price_yearly,
      can_buy_addons: plan.can_buy_addons,
      color: plan.ui_color,
    };
  }
  // Fallback to hardcoded config
  return PLAN_CONFIGS[fallbackCode as PlanType] || PLAN_CONFIGS.FREE;
}

const UserBillingTab: React.FC = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  
  // Fetch database-driven plan definitions
  const { plans, loading: plansLoading, getPlanByCode, isUsingFallback } = usePlanDefinitions();

  const loadPlan = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const plan = await adminService.getUserPlan(user.id);
      setUserPlan(plan);
    } catch (error) {
      console.error('Failed to load plan:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Setup realtime subscription for instant payment updates
  usePaymentRealtime({
    userId: user?.id,
    onPlanUpdated: loadPlan,
  });

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  const handleUpgrade = async (planCode: string, billingCycle: BillingCycle) => {
    if (!user) return;
    setUpgrading(true);

    const planDef = getPlanByCode(planCode);
    const planName = planDef?.name || planCode;

    try {
      await initiatePayment(
        user.id,
        user.emailAddresses[0]?.emailAddress || '',
        user.fullName || '',
        planCode as PlanType,
        billingCycle,
        () => {
          toast({
            title: 'Payment Successful! 🎉',
            description: `You've been upgraded to ${planName}!`,
          });
          loadPlan();
          setUpgrading(false);
        },
        (error) => {
          toast({
            title: 'Payment Failed',
            description: error,
            variant: 'destructive',
          });
          setUpgrading(false);
        },
        () => {
          // onPending callback - show processing toast
          toast({
            title: 'Payment Processing...',
            description: 'Please wait while we confirm your payment. This may take a moment for UPI/QR payments.',
          });
        }
      );
    } catch (error) {
      console.error('Payment error:', error);
      setUpgrading(false);
    }
  };

  // Get current plan from database or fallback
  const currentPlanCode = userPlan?.plan || 'FREE';
  const currentPlanDef = getPlanByCode(currentPlanCode);
  const planConfig = useMemo(() => 
    getPlanConfigFromDefinition(currentPlanDef, currentPlanCode),
    [currentPlanDef, currentPlanCode]
  );

  // Get available upgrade plans (active, public, higher tier than current)
  const upgradePlans = useMemo(() => {
    const currentTier = currentPlanDef?.tier_level ?? 0;
    return plans
      .filter(p => p.is_active && p.is_public && p.tier_level > currentTier && p.code !== 'FREE')
      .sort((a, b) => a.tier_level - b.tier_level);
  }, [plans, currentPlanDef]);

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    if (limit === 0) return 100;
    return Math.min((used / limit) * 100, 100);
  };

  if (loading || plansLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Realtime Status Indicator */}
      <div className="flex items-center gap-2 text-xs text-white/50">
        <Wifi className="w-3 h-3 text-green-500" />
        <span>Live updates enabled</span>
      </div>

      {/* Current Plan */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Crown className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-white/95">Current Plan</CardTitle>
                <CardDescription className="text-white/60">
                  Your subscription details
                </CardDescription>
              </div>
            </div>
            <Badge 
              variant={currentPlanCode === 'FREE' ? 'outline' : 'default'}
              className="text-lg px-4 py-1"
            >
              {planConfig.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-sm text-white/60 mb-1">Status</p>
              <div className="flex items-center gap-2">
                <Badge variant={userPlan?.status === 'active' ? 'default' : 'secondary'}>
                  {userPlan?.status || 'active'}
                </Badge>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-sm text-white/60 mb-1">Billing Cycle</p>
              <p className="font-medium text-white/90 capitalize">
                {userPlan?.billing_cycle || 'N/A'}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-sm text-white/60 mb-1">Renews At</p>
              <p className="font-medium text-white/90">
                {userPlan?.expires_at 
                  ? format(new Date(userPlan.expires_at), 'MMM dd, yyyy')
                  : 'Never'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white/95">
            <Zap className="w-5 h-5 text-primary" />
            Usage This Month
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-white/80">Backtests</span>
                <span className="text-sm text-white/60">
                  {userPlan?.backtests_used || 0} / {planConfig.backtests_monthly_limit === -1 ? '∞' : planConfig.backtests_monthly_limit}
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(userPlan?.backtests_used || 0, planConfig.backtests_monthly_limit)} 
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-white/80">Live Executions</span>
                <span className="text-sm text-white/60">
                  {userPlan?.live_executions_used || 0} / {planConfig.live_executions_limit === -1 ? '∞' : planConfig.live_executions_limit}
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(userPlan?.live_executions_used || 0, planConfig.live_executions_limit)} 
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-white/80">Paper Trading</span>
                <span className="text-sm text-white/60">
                  {userPlan?.paper_trading_used || 0} / {planConfig.paper_trading_monthly_limit === -1 ? '∞' : planConfig.paper_trading_monthly_limit}
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(userPlan?.paper_trading_used || 0, planConfig.paper_trading_monthly_limit)} 
                className="h-2"
              />
            </div>
          </div>

          {/* Add-ons */}
          {(userPlan?.addon_backtests || userPlan?.addon_live_executions) ? (
            <>
              <Separator className="bg-white/10" />
              <div className="flex gap-4">
                {userPlan?.addon_backtests ? (
                  <Badge variant="outline" className="gap-1">
                    +{userPlan.addon_backtests} Backtests
                  </Badge>
                ) : null}
                {userPlan?.addon_live_executions ? (
                  <Badge variant="outline" className="gap-1">
                    +{userPlan.addon_live_executions} Live Executions
                  </Badge>
                ) : null}
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      {/* Upgrade Options - Database Driven */}
      {upgradePlans.length > 0 && (
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white/95">
              <TrendingUp className="w-5 h-5 text-primary" />
              Upgrade Your Plan
            </CardTitle>
            <CardDescription className="text-white/60">
              Get more features and higher limits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upgradePlans.map((planDef) => {
                const isCurrentPlan = planDef.code === currentPlanCode;

                return (
                  <div
                    key={planDef.id}
                    className={`p-4 rounded-lg border ${
                      isCurrentPlan
                        ? 'border-primary bg-primary/10'
                        : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-white/95">{planDef.name}</h4>
                      {isCurrentPlan && <Badge>Current</Badge>}
                    </div>
                    <p className="text-2xl font-bold text-primary mb-1">
                      ₹{planDef.price_monthly}
                      <span className="text-sm font-normal text-white/60">/mo</span>
                    </p>
                    <p className="text-xs text-white/50 mb-4">
                      or ₹{planDef.price_yearly}/year (save 17%)
                    </p>
                    <ul className="text-sm text-white/70 space-y-1 mb-4">
                      <li>• {planDef.backtests_monthly_limit === -1 ? 'Unlimited' : planDef.backtests_monthly_limit} backtests/mo</li>
                      <li>• {planDef.live_executions_monthly_limit === -1 ? 'Unlimited' : planDef.live_executions_monthly_limit} live executions/mo</li>
                      <li>• {planDef.paper_trading_monthly_limit === -1 ? 'Unlimited' : planDef.paper_trading_monthly_limit} paper trades</li>
                    </ul>
                    {!isCurrentPlan && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleUpgrade(planDef.code, 'monthly')}
                          disabled={upgrading}
                        >
                          Monthly
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleUpgrade(planDef.code, 'yearly')}
                          disabled={upgrading}
                        >
                          Yearly
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserBillingTab;
