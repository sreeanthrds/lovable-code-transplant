import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowUpRight, Zap, Crown } from 'lucide-react';
import { QuotaInfo } from '@/hooks/useQuota';

interface QuotaExhaustedCardProps {
  quotaInfo: QuotaInfo;
}

const QuotaExhaustedCard: React.FC<QuotaExhaustedCardProps> = ({ quotaInfo }) => {
  const navigate = useNavigate();
  const { plan, planName, isExpired, canBuyAddons } = quotaInfo;

  const getContent = () => {
    if (isExpired) {
      return {
        title: 'Subscription Expired',
        description: 'Your subscription has expired. Renew to continue running backtests.',
        primaryAction: { label: 'Renew Plan', path: '/pricing' },
        secondaryAction: null,
      };
    }

    if (plan === 'FREE') {
      return {
        title: 'Daily Backtest Limit Reached',
        description: 'Free plan allows 2 backtests per day. Upgrade to unlock unlimited backtests and more features.',
        primaryAction: { label: 'View Plans', path: '/#pricing' },
        secondaryAction: null,
      };
    }

    if (plan === 'LAUNCH') {
      return {
        title: 'Backtest Quota Exhausted',
        description: 'Your Launch plan quota is used up. Upgrade to PRO for more backtests and advanced features.',
        primaryAction: { label: 'Upgrade to PRO', path: '/#pricing' },
        secondaryAction: null,
      };
    }

    if (plan === 'PRO') {
      return {
        title: 'Backtest Quota Exhausted',
        description: 'Your PRO plan monthly quota is used up. Purchase add-ons or upgrade to Enterprise for unlimited access.',
        primaryAction: canBuyAddons 
          ? { label: 'Buy Add-ons', path: '/app/account?tab=payments' }
          : { label: 'Upgrade Plan', path: '/#pricing' },
        secondaryAction: { label: 'Upgrade to Enterprise', path: '/#pricing' },
      };
    }

    // ENTERPRISE should never hit this
    return {
      title: 'Quota Issue',
      description: 'There seems to be an issue with your quota. Please contact support.',
      primaryAction: { label: 'Contact Support', path: '/support' },
      secondaryAction: null,
    };
  };

  const content = getContent();

  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardContent className="py-8">
        <div className="flex flex-col items-center text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          
          <h3 className="text-xl font-semibold mb-2">{content.title}</h3>
          <p className="text-muted-foreground mb-6">{content.description}</p>

          <div className="flex flex-wrap justify-center gap-3">
            {content.primaryAction.path.startsWith('/#') ? (
              <a href={content.primaryAction.path}>
                <Button className="gap-2">
                  {content.primaryAction.label.includes('Upgrade') || content.primaryAction.label.includes('View') ? (
                    <Crown className="w-4 h-4" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  {content.primaryAction.label}
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </a>
            ) : (
              <Button 
                onClick={() => navigate(content.primaryAction.path)}
                className="gap-2"
              >
                {content.primaryAction.label.includes('Upgrade') || content.primaryAction.label.includes('View') ? (
                  <Crown className="w-4 h-4" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                {content.primaryAction.label}
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            )}

            {content.secondaryAction && (
              content.secondaryAction.path.startsWith('/#') ? (
                <a href={content.secondaryAction.path}>
                  <Button variant="outline" className="gap-2">
                    {content.secondaryAction.label}
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </a>
              ) : (
                <Button 
                  variant="outline"
                  onClick={() => navigate(content.secondaryAction!.path)}
                  className="gap-2"
                >
                  {content.secondaryAction.label}
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              )
            )}
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            Currently on: <span className="font-medium capitalize">{planName}</span> plan
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuotaExhaustedCard;
