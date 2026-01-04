import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Calendar, RotateCcw, Plus, Save, Crown, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminService } from '@/lib/supabase/services/admin-service';
import { UserPlan, PlanType, PlanStatusType, BillingCycle, PLAN_CONFIGS } from '@/types/billing';
import { format } from 'date-fns';

interface UserPlanEditorProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail: string;
  userName: string;
  currentPlan?: UserPlan;
  onPlanUpdated: () => void;
}

const UserPlanEditor: React.FC<UserPlanEditorProps> = ({
  isOpen,
  onClose,
  userId,
  userEmail,
  userName,
  currentPlan,
  onPlanUpdated,
}) => {
  const { user: adminUser } = useUser();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [plan, setPlan] = useState<PlanType>('FREE');
  const [status, setStatus] = useState<PlanStatusType>('active');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [expiresAt, setExpiresAt] = useState('');
  const [amountPaid, setAmountPaid] = useState('0');
  const [adminNotes, setAdminNotes] = useState('');
  
  // Add-ons
  const [addBacktests, setAddBacktests] = useState('0');
  const [addLiveExecutions, setAddLiveExecutions] = useState('0');
  
  useEffect(() => {
    if (currentPlan) {
      setPlan(currentPlan.plan);
      setStatus(currentPlan.status);
      setBillingCycle(currentPlan.billing_cycle || 'monthly');
      setExpiresAt(currentPlan.expires_at ? currentPlan.expires_at.split('T')[0] : '');
      setAmountPaid(String(currentPlan.amount_paid || 0));
      setAdminNotes(currentPlan.admin_notes || '');
    } else {
      // Reset to defaults
      setPlan('FREE');
      setStatus('active');
      setBillingCycle('monthly');
      setExpiresAt('');
      setAmountPaid('0');
      setAdminNotes('');
    }
    setAddBacktests('0');
    setAddLiveExecutions('0');
  }, [currentPlan, isOpen]);
  
  const handleSavePlan = async () => {
    if (!adminUser?.id) return;
    setSaving(true);
    
    try {
      await adminService.upsertUserPlan(userId, {
        plan,
        status,
        billing_cycle: billingCycle,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        amount_paid: parseFloat(amountPaid) || 0,
        admin_notes: adminNotes,
      }, adminUser.id);
      
      toast({
        title: 'Plan Updated',
        description: `Successfully updated plan for ${userName || userEmail}`,
      });
      
      onPlanUpdated();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update plan',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleResetUsage = async () => {
    if (!adminUser?.id) return;
    setSaving(true);
    
    try {
      await adminService.resetUserUsage(userId, adminUser.id);
      
      toast({
        title: 'Usage Reset',
        description: `Successfully reset usage for ${userName || userEmail}`,
      });
      
      onPlanUpdated();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reset usage',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleAddAddons = async () => {
    if (!adminUser?.id) return;
    
    const backtests = parseInt(addBacktests) || 0;
    const liveExecutions = parseInt(addLiveExecutions) || 0;
    
    if (backtests === 0 && liveExecutions === 0) {
      toast({
        title: 'No Add-ons',
        description: 'Please enter add-on quantities',
        variant: 'destructive',
      });
      return;
    }
    
    setSaving(true);
    
    try {
      await adminService.addUserAddons(userId, {
        backtests: backtests > 0 ? backtests : undefined,
        live_executions: liveExecutions > 0 ? liveExecutions : undefined,
      }, adminUser.id);
      
      toast({
        title: 'Add-ons Added',
        description: `Added ${backtests} backtests, ${liveExecutions} live executions`,
      });
      
      setAddBacktests('0');
      setAddLiveExecutions('0');
      onPlanUpdated();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add add-ons',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };
  
  const getPlanBadgeVariant = (planType: PlanType) => {
    switch (planType) {
      case 'ENTERPRISE': return 'destructive';
      case 'PRO': return 'default';
      case 'LAUNCH': return 'secondary';
      default: return 'outline';
    }
  };
  
  const getStatusBadgeVariant = (statusType: PlanStatusType) => {
    switch (statusType) {
      case 'active': return 'default';
      case 'trial': return 'secondary';
      case 'expired':
      case 'cancelled': return 'destructive';
      case 'paused': return 'outline';
      default: return 'outline';
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Manage Plan & Billing
          </DialogTitle>
          <DialogDescription>
            <span className="font-medium">{userName || 'User'}</span>
            <span className="text-muted-foreground"> ({userEmail})</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Status */}
          {currentPlan && (
            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  Current Plan Status
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Plan</p>
                  <Badge variant={getPlanBadgeVariant(currentPlan.plan)}>
                    {PLAN_CONFIGS[currentPlan.plan]?.name || currentPlan.plan}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant={getStatusBadgeVariant(currentPlan.status)}>
                    {currentPlan.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Backtests Used</p>
                  <p className="font-medium">{currentPlan.backtests_used || 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Live Executions</p>
                  <p className="font-medium">{currentPlan.live_executions_used || 0}</p>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Separator />
          
          {/* Plan Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Plan Settings
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Plan Type</Label>
                <Select value={plan} onValueChange={(v) => setPlan(v as PlanType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PLAN_CONFIGS).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as PlanStatusType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Billing Cycle</Label>
                <Select value={billingCycle} onValueChange={(v) => setBillingCycle(v as BillingCycle)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="lifetime">Lifetime</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Expires At</Label>
                <Input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Amount Paid (₹)</Label>
                <Input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  min="0"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Admin Notes</Label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Internal notes about this user's plan..."
                rows={2}
              />
            </div>
            
            <Button onClick={handleSavePlan} disabled={saving} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Plan Changes'}
            </Button>
          </div>
          
          <Separator />
          
          {/* Add-ons */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Add-ons
            </h3>
            
            {currentPlan && (
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Current: {currentPlan.addon_backtests || 0} backtests</span>
                <span>•</span>
                <span>{currentPlan.addon_live_executions || 0} live executions</span>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Backtests</Label>
                <Input
                  type="number"
                  value={addBacktests}
                  onChange={(e) => setAddBacktests(e.target.value)}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Live Executions</Label>
                <Input
                  type="number"
                  value={addLiveExecutions}
                  onChange={(e) => setAddLiveExecutions(e.target.value)}
                  min="0"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleAddAddons} disabled={saving} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Actions */}
          <div className="flex gap-4">
            <Button 
              onClick={handleResetUsage} 
              disabled={saving || !currentPlan} 
              variant="outline"
              className="flex-1"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Usage
            </Button>
            <Button onClick={onClose} variant="ghost" className="flex-1">
              Close
            </Button>
          </div>
          
          {/* Last Updated */}
          {currentPlan?.updated_at && (
            <p className="text-xs text-muted-foreground text-center">
              Last updated: {format(new Date(currentPlan.updated_at), 'PPp')}
              {currentPlan.updated_by && ` by ${currentPlan.updated_by}`}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserPlanEditor;
