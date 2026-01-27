import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getAuthenticatedTradelayoutClient } from '@/lib/supabase/tradelayout-client';

interface UserPlan {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  backtests_used: number;
  backtests_used_today: number;
  live_executions_used: number;
  paper_trading_used: number;
  paper_trading_used_today: number;
  addon_backtests: number;
  addon_live_executions: number;
  user_email?: string;
}

interface UserPlanEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: UserPlan | null;
  onSuccess: () => void;
}

export const UserPlanEditDialog: React.FC<UserPlanEditDialogProps> = ({
  open,
  onOpenChange,
  plan,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    backtests_used_today: 0,
    backtests_used: 0,
    paper_trading_used_today: 0,
    paper_trading_used: 0,
    live_executions_used: 0,
  });

  useEffect(() => {
    if (plan) {
      setFormData({
        backtests_used_today: plan.backtests_used_today || 0,
        backtests_used: plan.backtests_used || 0,
        paper_trading_used_today: plan.paper_trading_used_today || 0,
        paper_trading_used: plan.paper_trading_used || 0,
        live_executions_used: plan.live_executions_used || 0,
      });
    }
  }, [plan]);

  const handleSave = async () => {
    if (!plan) return;
    
    setSaving(true);
    try {
      const authClient = await getAuthenticatedTradelayoutClient();
      
      // Check if this is an implicit free user (id starts with "free-")
      const isImplicitFree = plan.id.startsWith('free-');
      
      if (isImplicitFree) {
        // Insert a new user_plans record for this free user
        const { error } = await (authClient as any)
          .from('user_plans')
          .insert({
            user_id: plan.user_id,
            plan: 'FREE',
            status: 'active',
            ...formData,
            updated_at: new Date().toISOString(),
          });
        
        if (error) throw error;
      } else {
        // Update existing record
        const { error } = await (authClient as any)
          .from('user_plans')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', plan.id);
        
        if (error) throw error;
      }
      
      toast({
        title: 'Success',
        description: 'Usage counters updated successfully',
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating user plan:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update usage counters',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    const numValue = parseInt(value, 10);
    setFormData(prev => ({
      ...prev,
      [field]: isNaN(numValue) ? 0 : numValue,
    }));
  };

  if (!plan) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Usage Counters</DialogTitle>
          <DialogDescription>
            Adjust usage counters for {plan.user_email || plan.user_id}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="backtests_used_today">Backtests Today</Label>
              <Input
                id="backtests_used_today"
                type="number"
                min="0"
                value={formData.backtests_used_today}
                onChange={(e) => handleInputChange('backtests_used_today', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="backtests_used">Backtests Monthly</Label>
              <Input
                id="backtests_used"
                type="number"
                min="0"
                value={formData.backtests_used}
                onChange={(e) => handleInputChange('backtests_used', e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paper_trading_used_today">Paper Trading Today</Label>
              <Input
                id="paper_trading_used_today"
                type="number"
                min="0"
                value={formData.paper_trading_used_today}
                onChange={(e) => handleInputChange('paper_trading_used_today', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paper_trading_used">Paper Trading Monthly</Label>
              <Input
                id="paper_trading_used"
                type="number"
                min="0"
                value={formData.paper_trading_used}
                onChange={(e) => handleInputChange('paper_trading_used', e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="live_executions_used">Live Executions (Monthly)</Label>
            <Input
              id="live_executions_used"
              type="number"
              min="0"
              value={formData.live_executions_used}
              onChange={(e) => handleInputChange('live_executions_used', e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
