import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@clerk/clerk-react';
import { tradelayoutClient } from '@/lib/supabase/tradelayout-client';
import { 
  Search, 
  RefreshCw, 
  Users, 
  Edit, 
  RotateCcw, 
  Plus,
  AlertTriangle
} from 'lucide-react';

interface UserPlan {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  billing_cycle?: string;
  backtests_used: number;
  backtests_used_today: number;
  live_executions_used: number;
  paper_trading_used: number;
  paper_trading_used_today: number;
  addon_backtests: number;
  addon_live_executions: number;
  expires_at?: string;
  admin_notes?: string;
  updated_at?: string;
  user_email?: string;
}

export const UserPlansManager: React.FC = () => {
  const { user: adminUser } = useUser();
  const { toast } = useToast();
  
  const [plans, setPlans] = useState<UserPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Edit dialog state
  const [editingPlan, setEditingPlan] = useState<UserPlan | null>(null);
  const [editForm, setEditForm] = useState({
    plan: 'FREE',
    status: 'active',
    backtests_used: 0,
    backtests_used_today: 0,
    live_executions_used: 0,
    paper_trading_used: 0,
    paper_trading_used_today: 0,
    addon_backtests: 0,
    addon_live_executions: 0,
    admin_notes: ''
  });
  
  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch user plans
      const { data: plansData, error: plansError } = await tradelayoutClient
        .from('user_plans' as any)
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (plansError) throw plansError;
      
      // Fetch user profiles to get emails
      const { data: profilesData, error: profilesError } = await tradelayoutClient
        .from('user_profiles' as any)
        .select('id, email, first_name, last_name');
      
      if (profilesError) throw profilesError;
      
      // Create a lookup map for emails
      const emailMap = new Map<string, string>();
      (profilesData || []).forEach((profile: any) => {
        emailMap.set(profile.id, profile.email);
      });
      
      // Merge email into plans
      const plansWithEmail = (plansData || []).map((plan: any) => ({
        ...plan,
        user_email: emailMap.get(plan.user_id) || plan.user_id
      }));
      
      setPlans(plansWithEmail as UserPlan[]);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch user plans',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);
  
  const handleEditPlan = (plan: UserPlan) => {
    setEditingPlan(plan);
    setEditForm({
      plan: plan.plan,
      status: plan.status,
      backtests_used: plan.backtests_used || 0,
      backtests_used_today: plan.backtests_used_today || 0,
      live_executions_used: plan.live_executions_used || 0,
      paper_trading_used: plan.paper_trading_used || 0,
      paper_trading_used_today: plan.paper_trading_used_today || 0,
      addon_backtests: plan.addon_backtests || 0,
      addon_live_executions: plan.addon_live_executions || 0,
      admin_notes: plan.admin_notes || ''
    });
  };
  
  const handleSaveEdit = async () => {
    if (!editingPlan || !adminUser?.id) return;
    
    try {
      const { error } = await tradelayoutClient
        .from('user_plans' as any)
        .update({
          plan: editForm.plan,
          status: editForm.status,
          backtests_used: editForm.backtests_used,
          backtests_used_today: editForm.backtests_used_today,
          live_executions_used: editForm.live_executions_used,
          paper_trading_used: editForm.paper_trading_used,
          paper_trading_used_today: editForm.paper_trading_used_today,
          addon_backtests: editForm.addon_backtests,
          addon_live_executions: editForm.addon_live_executions,
          admin_notes: editForm.admin_notes,
          updated_at: new Date().toISOString(),
          updated_by: adminUser.id
        })
        .eq('user_id', editingPlan.user_id);
      
      if (error) throw error;
      
      toast({
        title: 'Plan Updated',
        description: 'User plan has been updated successfully'
      });
      
      setEditingPlan(null);
      fetchPlans();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update plan',
        variant: 'destructive'
      });
    }
  };
  
  const handleResetUsage = async (plan: UserPlan) => {
    if (!adminUser?.id) return;
    
    try {
      const { error } = await tradelayoutClient
        .from('user_plans' as any)
        .update({
          backtests_used: 0,
          backtests_used_today: 0,
          live_executions_used: 0,
          paper_trading_used: 0,
          paper_trading_used_today: 0,
          usage_reset_date: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString(),
          updated_by: adminUser.id,
          admin_notes: `${plan.admin_notes || ''}\n[${new Date().toISOString()}] Usage reset by admin`
        })
        .eq('user_id', plan.user_id);
      
      if (error) throw error;
      
      toast({
        title: 'Usage Reset',
        description: 'User usage has been reset to zero'
      });
      
      fetchPlans();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reset usage',
        variant: 'destructive'
      });
    }
  };
  
  const filteredPlans = plans.filter(plan => {
    const query = searchQuery.toLowerCase();
    return (
      plan.user_email?.toLowerCase().includes(query) ||
      plan.user_id?.toLowerCase().includes(query) ||
      plan.plan?.toLowerCase().includes(query) ||
      plan.status?.toLowerCase().includes(query)
    );
  });
  
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'trial': return 'secondary';
      case 'expired':
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };
  
  const getPlanVariant = (plan: string) => {
    switch (plan) {
      case 'ENTERPRISE': return 'destructive';
      case 'PRO': return 'default';
      case 'LAUNCH': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Plans & Usage
            </CardTitle>
            <CardDescription>
              View and manage user plan assignments and usage counters
            </CardDescription>
          </div>
          <Button onClick={fetchPlans} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email, plan, or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Email</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Backtests (Today/Total)</TableHead>
                <TableHead className="text-center">Live Exec</TableHead>
                <TableHead className="text-center">Paper (Today/Total)</TableHead>
                <TableHead className="text-center">Add-ons</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : filteredPlans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No user plans found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPlans.map((plan) => (
                  <TableRow key={plan.user_id}>
                    <TableCell className="text-sm max-w-[200px] truncate" title={plan.user_email || plan.user_id}>
                      {plan.user_email || plan.user_id}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPlanVariant(plan.plan)}>{plan.plan}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(plan.status)}>{plan.status}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-primary font-medium">{plan.backtests_used_today || 0}</span>
                      <span className="text-muted-foreground"> / {plan.backtests_used || 0}</span>
                    </TableCell>
                    <TableCell className="text-center">{plan.live_executions_used || 0}</TableCell>
                    <TableCell className="text-center">
                      <span className="text-primary font-medium">{plan.paper_trading_used_today || 0}</span>
                      <span className="text-muted-foreground"> / {plan.paper_trading_used || 0}</span>
                    </TableCell>
                    <TableCell className="text-center text-xs">
                      <div>BT: {plan.addon_backtests || 0}</div>
                      <div>LE: {plan.addon_live_executions || 0}</div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {plan.updated_at ? new Date(plan.updated_at).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditPlan(plan)}
                          title="Edit plan & usage"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleResetUsage(plan)}
                          title="Reset all usage"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      
      {/* Edit Dialog */}
      <Dialog open={!!editingPlan} onOpenChange={() => setEditingPlan(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Edit User Plan - Dispute Resolution
            </DialogTitle>
            <DialogDescription>
              Manually adjust user plan and usage values. Use for dispute resolution.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Plan Type</Label>
                <Select value={editForm.plan} onValueChange={(v) => setEditForm({ ...editForm, plan: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FREE">FREE</SelectItem>
                    <SelectItem value="LAUNCH">LAUNCH</SelectItem>
                    <SelectItem value="PRO">PRO</SelectItem>
                    <SelectItem value="ENTERPRISE">ENTERPRISE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
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
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Usage Counters (Editable for disputes)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Backtests Used (Monthly)</Label>
                  <Input
                    type="number"
                    value={editForm.backtests_used}
                    onChange={(e) => setEditForm({ ...editForm, backtests_used: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Backtests Used (Today)</Label>
                  <Input
                    type="number"
                    value={editForm.backtests_used_today}
                    onChange={(e) => setEditForm({ ...editForm, backtests_used_today: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Live Executions Used</Label>
                  <Input
                    type="number"
                    value={editForm.live_executions_used}
                    onChange={(e) => setEditForm({ ...editForm, live_executions_used: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Paper Trading Used (Monthly)</Label>
                  <Input
                    type="number"
                    value={editForm.paper_trading_used}
                    onChange={(e) => setEditForm({ ...editForm, paper_trading_used: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Paper Trading Used (Today)</Label>
                  <Input
                    type="number"
                    value={editForm.paper_trading_used_today}
                    onChange={(e) => setEditForm({ ...editForm, paper_trading_used_today: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Add-ons</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Addon Backtests</Label>
                  <Input
                    type="number"
                    value={editForm.addon_backtests}
                    onChange={(e) => setEditForm({ ...editForm, addon_backtests: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Addon Live Executions</Label>
                  <Input
                    type="number"
                    value={editForm.addon_live_executions}
                    onChange={(e) => setEditForm({ ...editForm, addon_live_executions: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Admin Notes</Label>
              <Textarea
                value={editForm.admin_notes}
                onChange={(e) => setEditForm({ ...editForm, admin_notes: e.target.value })}
                placeholder="Document the reason for changes..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPlan(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
