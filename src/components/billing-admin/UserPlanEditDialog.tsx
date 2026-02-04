import React, { useState, useEffect, useMemo } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { getAuthenticatedTradelayoutClient } from '@/lib/supabase/tradelayout-client';
import { Calendar, Clock } from 'lucide-react';

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
  admin_notes?: string;
  user_email?: string;
  expires_at?: string;
}

interface UserPlanEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: UserPlan | null;
  onSuccess: () => void;
}

type ValidityMode = 'date' | 'days';

export const UserPlanEditDialog: React.FC<UserPlanEditDialogProps> = ({
  open,
  onOpenChange,
  plan,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [validityMode, setValidityMode] = useState<ValidityMode>('date');
  const [daysFromToday, setDaysFromToday] = useState<number>(30);
  
  const [formData, setFormData] = useState({
    backtests_used_today: 0,
    backtests_used: 0,
    paper_trading_used_today: 0,
    paper_trading_used: 0,
    live_executions_used: 0,
    admin_notes: '',
    expires_at: '',
  });

  // Calculate remaining days to expiry
  const remainingDays = useMemo(() => {
    if (!formData.expires_at) return null;
    const expiryDate = new Date(formData.expires_at);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, [formData.expires_at]);

  useEffect(() => {
    if (plan) {
      // Format expires_at for date input (YYYY-MM-DD)
      let expiresAtValue = '';
      if (plan.expires_at) {
        const date = new Date(plan.expires_at);
        expiresAtValue = date.toISOString().split('T')[0];
      }
      
      setFormData({
        backtests_used_today: plan.backtests_used_today || 0,
        backtests_used: plan.backtests_used || 0,
        paper_trading_used_today: plan.paper_trading_used_today || 0,
        paper_trading_used: plan.paper_trading_used || 0,
        live_executions_used: plan.live_executions_used || 0,
        admin_notes: plan.admin_notes || '',
        expires_at: expiresAtValue,
      });
      
      // Reset validity mode
      setValidityMode('date');
      setDaysFromToday(30);
    }
  }, [plan]);

  // Handle days input and calculate the date
  const handleDaysChange = (days: number) => {
    setDaysFromToday(days);
    if (days > 0) {
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + days);
      setFormData(prev => ({
        ...prev,
        expires_at: newDate.toISOString().split('T')[0],
      }));
    }
  };

  const handleSave = async () => {
    if (!plan) return;
    
    setSaving(true);
    try {
      const authClient = await getAuthenticatedTradelayoutClient();
      
      // Check if this is an implicit free user (id starts with "free-")
      const isImplicitFree = plan.id.startsWith('free-');
      
      // Prepare update data - only include admin_notes if it has content
      const updateData: Record<string, any> = {
        backtests_used_today: formData.backtests_used_today,
        backtests_used: formData.backtests_used,
        paper_trading_used_today: formData.paper_trading_used_today,
        paper_trading_used: formData.paper_trading_used,
        live_executions_used: formData.live_executions_used,
        updated_at: new Date().toISOString(),
      };
      
      // Include expires_at if set
      if (formData.expires_at) {
        updateData.expires_at = new Date(formData.expires_at).toISOString();
      } else {
        updateData.expires_at = null;
      }
      
      // Only include admin_notes if it has content (column may not exist yet)
      if (formData.admin_notes) {
        updateData.admin_notes = formData.admin_notes;
      }
      
      if (isImplicitFree) {
        // Upsert a user_plans record for this free user (insert or update if exists)
        const { error } = await (authClient as any)
          .from('user_plans')
          .upsert({
            user_id: plan.user_id,
            plan: 'FREE',
            status: 'active',
            ...updateData,
          }, { 
            onConflict: 'user_id',
            ignoreDuplicates: false 
          });
        
        if (error) throw error;
      } else {
        // Update existing record
        const { error } = await (authClient as any)
          .from('user_plans')
          .update(updateData)
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

  const getRemainingDaysDisplay = () => {
    if (remainingDays === null) return null;
    if (remainingDays < 0) {
      return (
        <span className="text-destructive font-medium">
          Expired {Math.abs(remainingDays)} day{Math.abs(remainingDays) !== 1 ? 's' : ''} ago
        </span>
      );
    }
    if (remainingDays === 0) {
      return <span className="text-warning font-medium">Expires today</span>;
    }
    return (
      <span className="text-muted-foreground">
        {remainingDays} day{remainingDays !== 1 ? 's' : ''} remaining
      </span>
    );
  };

  if (!plan) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
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
          
          {/* Plan Validity Section */}
          <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
            <Label className="text-base font-medium">Plan Validity</Label>
            
            <RadioGroup
              value={validityMode}
              onValueChange={(v) => setValidityMode(v as ValidityMode)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="date" id="validity-date" />
                <Label htmlFor="validity-date" className="flex items-center gap-1 cursor-pointer">
                  <Calendar className="h-4 w-4" />
                  Specific Date
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="days" id="validity-days" />
                <Label htmlFor="validity-days" className="flex items-center gap-1 cursor-pointer">
                  <Clock className="h-4 w-4" />
                  Days from Today
                </Label>
              </div>
            </RadioGroup>
            
            {validityMode === 'date' ? (
              <div className="space-y-2">
                <Input
                  id="expires_at"
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    id="days_from_today"
                    type="number"
                    min="1"
                    value={daysFromToday}
                    onChange={(e) => handleDaysChange(parseInt(e.target.value, 10) || 0)}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">days</span>
                </div>
                {formData.expires_at && (
                  <p className="text-xs text-muted-foreground">
                    Expires on: {new Date(formData.expires_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
            
            {/* Remaining Days Display */}
            <div className="flex items-center gap-2 pt-1 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              {formData.expires_at ? (
                getRemainingDaysDisplay()
              ) : (
                <span className="text-muted-foreground">No expiry set (unlimited)</span>
              )}
            </div>
            
            {formData.expires_at && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => setFormData(prev => ({ ...prev, expires_at: '' }))}
              >
                Clear expiry date
              </Button>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="admin_notes">Admin Notes</Label>
            <Textarea
              id="admin_notes"
              placeholder="Document reason for adjustment (e.g., billing dispute #1234)"
              value={formData.admin_notes}
              onChange={(e) => setFormData(prev => ({ ...prev, admin_notes: e.target.value }))}
              rows={3}
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