import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Wallet, ChevronDown, Gift, Plus } from 'lucide-react';
import type { AddOns } from '@/types/billing';

interface AddOnsWalletProps {
  addons: AddOns;
  onBuyAddons?: () => void;
}

export const AddOnsWallet: React.FC<AddOnsWalletProps> = ({ addons, onBuyAddons }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  const hasAddons = addons.backtests > 0 || addons.live_executions > 0;
  const hasReferralBonus = addons.referral_bonus && addons.referral_bonus.backtests > 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="glass-card">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/20 transition-colors rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10 text-accent">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-medium">Add-ons Wallet</CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {hasAddons ? 'Extra capacity available' : 'No add-ons purchased'}
                  </p>
                </div>
              </div>
              <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Add-ons balance */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <p className="text-sm text-muted-foreground">Backtests</p>
                <p className="text-2xl font-bold text-primary">{addons.backtests}</p>
                <p className="text-xs text-muted-foreground mt-1">No expiry</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <p className="text-sm text-muted-foreground">Live Executions</p>
                <p className="text-2xl font-bold text-accent">{addons.live_executions}</p>
                <p className="text-xs text-muted-foreground mt-1">No expiry</p>
              </div>
            </div>

            {/* Referral bonus */}
            {hasReferralBonus && (
              <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="h-4 w-4 text-success" />
                  <p className="text-sm font-medium text-success">Referral Bonus</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  +{addons.referral_bonus!.backtests} Backtests from referrals
                </p>
              </div>
            )}

            {/* Consumption order explanation */}
            <div className="p-3 rounded-lg bg-muted/20 text-sm text-muted-foreground">
              <p className="font-medium mb-1">Consumption Order:</p>
              <p>Monthly quota → Add-ons → Blocked</p>
            </div>

            {/* Buy add-ons button */}
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={onBuyAddons}
            >
              <Plus className="h-4 w-4" />
              Buy Add-ons (₹500 = 50 Backtests + 15 Live)
            </Button>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
