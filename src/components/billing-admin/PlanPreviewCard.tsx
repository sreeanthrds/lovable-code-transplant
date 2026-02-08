import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Infinity, Crown, Rocket, Star, Zap, Diamond } from 'lucide-react';
import type { PlanFormState } from '@/types/plan-definitions';

interface PlanPreviewCardProps {
  formState: PlanFormState;
}

function formatLimit(value: number, unlimited: boolean): React.ReactNode {
  if (unlimited || value === -1) {
    return <Infinity className="h-4 w-4 inline" />;
  }
  if (value === 0) {
    return <X className="h-4 w-4 inline text-destructive" />;
  }
  return value;
}

function getIconComponent(iconName: string) {
  switch (iconName) {
    case 'rocket': return <Rocket className="h-5 w-5" />;
    case 'star': return <Star className="h-5 w-5" />;
    case 'crown': return <Crown className="h-5 w-5" />;
    case 'diamond': return <Diamond className="h-5 w-5" />;
    case 'zap': return <Zap className="h-5 w-5" />;
    default: return null;
  }
}

function getBadgeVariant(color: string): "default" | "secondary" | "destructive" | "outline" {
  switch (color) {
    case 'secondary': return 'secondary';
    case 'destructive': return 'destructive';
    case 'outline': return 'outline';
    default: return 'default';
  }
}

function getCurrencySymbol(currency: string): string {
  switch (currency) {
    case 'INR': return '₹';
    case 'USD': return '$';
    case 'EUR': return '€';
    default: return currency;
  }
}

export function PlanPreviewCard({ formState }: PlanPreviewCardProps) {
  const currencySymbol = getCurrencySymbol(formState.currency);
  const hasActiveFeatures = Object.values(formState.feature_flags).some(v => v === true);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-br from-primary/10 to-primary/5 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {formState.ui_icon && getIconComponent(formState.ui_icon)}
            <CardTitle className="text-xl">{formState.name || 'Plan Name'}</CardTitle>
          </div>
          <div className="flex gap-2">
            <Badge variant={getBadgeVariant(formState.ui_color)}>
              {formState.code || 'CODE'}
            </Badge>
            {!formState.is_active && (
              <Badge variant="outline" className="text-muted-foreground">
                Inactive
              </Badge>
            )}
          </div>
        </div>
        {formState.description && (
          <p className="text-sm text-muted-foreground mt-2">{formState.description}</p>
        )}
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Pricing */}
        <div className="text-center pb-4 border-b">
          {formState.price_monthly === 0 && formState.price_yearly === 0 ? (
            <div className="text-3xl font-bold text-primary">Free</div>
          ) : (
            <>
              {(() => {
                const gstRate = (formState.gst_percentage || 0) / 100;
                const monthlyWithGst = formState.price_monthly * (1 + gstRate);
                const yearlyWithGst = formState.price_yearly * (1 + gstRate);
                
                return (
                  <>
                    <div className="text-3xl font-bold">
                      {currencySymbol}{monthlyWithGst.toFixed(0)}
                      <span className="text-sm font-normal text-muted-foreground">/month</span>
                    </div>
                    {formState.gst_percentage > 0 && (
                      <div className="text-xs text-muted-foreground">
                        incl. {formState.gst_percentage}% GST
                      </div>
                    )}
                    {formState.price_yearly > 0 && (
                      <div className="text-sm text-muted-foreground mt-1">
                        or {currencySymbol}{yearlyWithGst.toFixed(0)}/year
                        {formState.discount_percentage > 0 && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            Save {formState.discount_percentage}%
                          </Badge>
                        )}
                      </div>
                    )}
                  </>
                );
              })()}
            </>
          )}
        </div>

        {/* Limits Summary */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Limits</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
              <span className="text-muted-foreground">Backtests/day</span>
              <span className="font-mono font-medium">
                {formatLimit(formState.backtests_daily_limit, formState.backtests_daily_unlimited)}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
              <span className="text-muted-foreground">Backtests/mo</span>
              <span className="font-mono font-medium">
                {formatLimit(formState.backtests_monthly_limit, formState.backtests_monthly_unlimited)}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
              <span className="text-muted-foreground">Live/mo</span>
              <span className="font-mono font-medium">
                {formatLimit(formState.live_executions_monthly_limit, formState.live_executions_monthly_unlimited)}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
              <span className="text-muted-foreground">Paper/day</span>
              <span className="font-mono font-medium">
                {formatLimit(formState.paper_trading_daily_limit, formState.paper_trading_daily_unlimited)}
              </span>
            </div>
          </div>
        </div>

        {/* Feature Highlights (bullet points) */}
        {formState.features && formState.features.length > 0 && (
          <div className="space-y-3 pt-2 border-t">
            <h4 className="text-sm font-semibold">What's Included</h4>
            <div className="space-y-1">
              {formState.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feature Flags */}
        {hasActiveFeatures && (
          <div className="space-y-3 pt-2 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground">Feature Flags</h4>
            <div className="space-y-1">
              {Object.entries(formState.feature_flags)
                .filter(([_, enabled]) => enabled)
                .map(([key]) => (
                  <div key={key} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary/60" />
                    <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Validity Info */}
        <div className="text-xs text-muted-foreground pt-2 border-t space-y-1">
          <p>
            <span className="font-medium">Type:</span>{' '}
            {formState.duration_type === 'fixed'
              ? `Fixed (${formState.duration_days || 0} days)`
              : formState.duration_type === 'lifetime'
              ? 'Lifetime'
              : 'Subscription'}
          </p>
          <p>
            <span className="font-medium">Reset:</span>{' '}
            {formState.reset_type === 'calendar' ? 'Calendar (1st of month)' : 'Rolling'}
          </p>
          {formState.trial_days > 0 && (
            <p>
              <span className="font-medium">Trial:</span> {formState.trial_days} days
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
