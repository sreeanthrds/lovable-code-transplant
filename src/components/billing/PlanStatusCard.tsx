import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Rocket, Sparkles } from 'lucide-react';
import type { PlanInfo } from '@/types/billing';

interface PlanStatusCardProps {
  plan: PlanInfo;
}

const getPlanConfig = (planType: string) => {
  switch (planType.toUpperCase()) {
    case 'PRO':
      return {
        icon: Crown,
        gradient: 'from-primary to-info',
        badge: 'bg-primary/20 text-primary border-primary/30',
        glow: 'shadow-[0_0_30px_hsl(var(--primary)/0.3)]'
      };
    case 'LAUNCH':
      return {
        icon: Rocket,
        gradient: 'from-accent to-warning',
        badge: 'bg-accent/20 text-accent border-accent/30',
        glow: 'shadow-[0_0_30px_hsl(var(--accent)/0.3)]'
      };
    default:
      return {
        icon: Sparkles,
        gradient: 'from-muted-foreground to-muted-foreground',
        badge: 'bg-muted text-muted-foreground border-border',
        glow: ''
      };
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return { text: 'Active', class: 'bg-success/20 text-success border-success/30' };
    case 'expiring':
      return { text: 'Expiring Soon', class: 'bg-warning/20 text-warning border-warning/30' };
    case 'expired':
      return { text: 'Expired', class: 'bg-destructive/20 text-destructive border-destructive/30' };
    default:
      return { text: status, class: 'bg-muted text-muted-foreground' };
  }
};

export const PlanStatusCard: React.FC<PlanStatusCardProps> = ({ plan }) => {
  const config = getPlanConfig(plan.plan);
  const statusBadge = getStatusBadge(plan.status);
  const Icon = config.icon;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Card className={`glass-card overflow-hidden ${config.glow}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${config.gradient}`}>
              <Icon className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold">{plan.plan} Plan</h3>
                <Badge variant="outline" className={statusBadge.class}>
                  {statusBadge.text}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                {plan.plan_code}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            {plan.expires_date && plan.plan !== 'FREE' && (
              <>
                <p className="text-sm text-muted-foreground">Valid until</p>
                <p className="text-lg font-semibold">{formatDate(plan.expires_date)}</p>
                {plan.renews_at && plan.status === 'active' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Renews on {formatDate(plan.renews_at)}
                  </p>
                )}
              </>
            )}
            {plan.plan === 'FREE' && (
              <p className="text-sm text-muted-foreground">No expiry</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
