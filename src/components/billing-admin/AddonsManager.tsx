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
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@clerk/clerk-react';
import { tradelayoutClient } from '@/lib/supabase/tradelayout-client';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw
} from 'lucide-react';
import type { DurationType } from '@/types/plan-definitions';

interface AddonDefinition {
  id: string;
  code: string;
  name: string;
  description: string | null;
  tier_level: number;
  is_active: boolean;
  is_public: boolean;
  duration_type: DurationType;
  duration_days: number | null;
  backtests_daily_limit: number;
  backtests_monthly_limit: number;
  backtests_total_limit: number;
  live_executions_monthly_limit: number;
  paper_trading_daily_limit: number;
  paper_trading_monthly_limit: number;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  ui_color: string;
  created_at: string;
  updated_at: string;
}

const INITIAL_ADDON_FORM = {
  code: '',
  name: '',
  description: '',
  is_active: true,
  is_public: true,
  duration_type: 'fixed' as DurationType,
  duration_days: 30,
  backtests_total_limit: 10,
  live_executions_monthly_limit: 0,
  price_monthly: 99,
  currency: 'INR',
  ui_color: 'accent'
};

export const AddonsManager: React.FC = () => {
  const { user: adminUser } = useUser();
  const { toast } = useToast();
  
  const [addons, setAddons] = useState<AddonDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAddon, setEditingAddon] = useState<AddonDefinition | null>(null);
  const [addonForm, setAddonForm] = useState(INITIAL_ADDON_FORM);
  const [saving, setSaving] = useState(false);
  
  const fetchAddons = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch add-ons from plan_definitions where tier_level = -1 (addon marker)
      const { data, error } = await tradelayoutClient
        .from('plan_definitions' as any)
        .select('*')
        .eq('tier_level', -1)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      setAddons((data as unknown as AddonDefinition[]) || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch add-ons',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    fetchAddons();
  }, [fetchAddons]);
  
  const handleCreateAddon = async () => {
    if (!adminUser?.id) return;
    if (!addonForm.code || !addonForm.name) {
      toast({ title: 'Validation', description: 'Code and Name are required', variant: 'destructive' });
      return;
    }
    
    setSaving(true);
    try {
      const { error } = await tradelayoutClient
        .from('plan_definitions' as any)
        .insert({
          code: `ADDON_${addonForm.code.toUpperCase().replace(/[^A-Z0-9_]/g, '')}`,
          name: addonForm.name,
          description: addonForm.description || null,
          tier_level: -1, // Mark as addon
          is_active: addonForm.is_active,
          is_public: addonForm.is_public,
          duration_type: addonForm.duration_type,
          duration_days: addonForm.duration_days,
          trial_days: 0,
          grace_period_days: 0,
          backtests_daily_limit: 0,
          backtests_monthly_limit: 0,
          backtests_total_limit: addonForm.backtests_total_limit,
          live_executions_monthly_limit: addonForm.live_executions_monthly_limit,
          paper_trading_daily_limit: 0,
          paper_trading_monthly_limit: 0,
          reset_type: 'calendar',
          daily_reset_hour: 0,
          reset_timezone: 'Asia/Kolkata',
          price_monthly: addonForm.price_monthly,
          price_yearly: addonForm.price_monthly * 10, // 2 months free for yearly
          currency: addonForm.currency,
          discount_percentage: 0,
          can_buy_addons: false,
          feature_flags: {},
          ui_color: addonForm.ui_color,
          ui_icon: 'package',
          sort_order: 100,
          created_by: adminUser.id,
          updated_by: adminUser.id
        });
      
      if (error) throw error;
      
      toast({ title: 'Add-on Created', description: `${addonForm.name} has been created` });
      setIsCreateOpen(false);
      setAddonForm(INITIAL_ADDON_FORM);
      fetchAddons();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to create add-on', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };
  
  const handleUpdateAddon = async () => {
    if (!editingAddon || !adminUser?.id) return;
    
    setSaving(true);
    try {
      const { error } = await tradelayoutClient
        .from('plan_definitions' as any)
        .update({
          name: addonForm.name,
          description: addonForm.description || null,
          is_active: addonForm.is_active,
          is_public: addonForm.is_public,
          duration_type: addonForm.duration_type,
          duration_days: addonForm.duration_days,
          backtests_total_limit: addonForm.backtests_total_limit,
          live_executions_monthly_limit: addonForm.live_executions_monthly_limit,
          price_monthly: addonForm.price_monthly,
          price_yearly: addonForm.price_monthly * 10,
          currency: addonForm.currency,
          ui_color: addonForm.ui_color,
          updated_by: adminUser.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingAddon.id);
      
      if (error) throw error;
      
      toast({ title: 'Add-on Updated', description: `${addonForm.name} has been updated` });
      setEditingAddon(null);
      fetchAddons();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update add-on', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };
  
  const handleDeleteAddon = async (addon: AddonDefinition) => {
    if (!confirm(`Are you sure you want to delete "${addon.name}"?`)) return;
    
    try {
      const { error } = await tradelayoutClient
        .from('plan_definitions' as any)
        .delete()
        .eq('id', addon.id);
      
      if (error) throw error;
      
      toast({ title: 'Add-on Deleted', description: `${addon.name} has been deleted` });
      fetchAddons();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to delete add-on', variant: 'destructive' });
    }
  };
  
  const openEditDialog = (addon: AddonDefinition) => {
    setEditingAddon(addon);
    setAddonForm({
      code: addon.code.replace('ADDON_', ''),
      name: addon.name,
      description: addon.description || '',
      is_active: addon.is_active,
      is_public: addon.is_public,
      duration_type: addon.duration_type,
      duration_days: addon.duration_days || 30,
      backtests_total_limit: addon.backtests_total_limit,
      live_executions_monthly_limit: addon.live_executions_monthly_limit,
      price_monthly: addon.price_monthly,
      currency: addon.currency,
      ui_color: addon.ui_color
    });
  };
  
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(price);
  };
  
  const AddonFormFields = () => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Code *</Label>
          <Input
            value={addonForm.code}
            onChange={(e) => setAddonForm({ ...addonForm, code: e.target.value })}
            placeholder="BACKTEST_10"
            disabled={!!editingAddon}
          />
          <p className="text-xs text-muted-foreground">Will be prefixed with ADDON_</p>
        </div>
        <div className="space-y-2">
          <Label>Name *</Label>
          <Input
            value={addonForm.name}
            onChange={(e) => setAddonForm({ ...addonForm, name: e.target.value })}
            placeholder="10 Extra Backtests"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={addonForm.description}
          onChange={(e) => setAddonForm({ ...addonForm, description: e.target.value })}
          placeholder="Additional backtest quota..."
          rows={2}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Duration Type</Label>
          <Select 
            value={addonForm.duration_type} 
            onValueChange={(v) => setAddonForm({ ...addonForm, duration_type: v as DurationType })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">Fixed (One-time)</SelectItem>
              <SelectItem value="subscription">Subscription</SelectItem>
              <SelectItem value="lifetime">Lifetime</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Validity (Days)</Label>
          <Input
            type="number"
            value={addonForm.duration_days}
            onChange={(e) => setAddonForm({ ...addonForm, duration_days: parseInt(e.target.value) || 30 })}
            disabled={addonForm.duration_type === 'lifetime'}
          />
        </div>
      </div>
      
      <div className="border-t pt-4">
        <h4 className="font-medium mb-3">Quota Included</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Backtests (Total)</Label>
            <Input
              type="number"
              value={addonForm.backtests_total_limit}
              onChange={(e) => setAddonForm({ ...addonForm, backtests_total_limit: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-2">
            <Label>Live Executions (Monthly)</Label>
            <Input
              type="number"
              value={addonForm.live_executions_monthly_limit}
              onChange={(e) => setAddonForm({ ...addonForm, live_executions_monthly_limit: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>
      </div>
      
      <div className="border-t pt-4">
        <h4 className="font-medium mb-3">Pricing</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Price</Label>
            <Input
              type="number"
              value={addonForm.price_monthly}
              onChange={(e) => setAddonForm({ ...addonForm, price_monthly: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-2">
            <Label>Currency</Label>
            <Select value={addonForm.currency} onValueChange={(v) => setAddonForm({ ...addonForm, currency: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INR">INR</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-6 pt-2">
        <div className="flex items-center gap-2">
          <Switch
            checked={addonForm.is_active}
            onCheckedChange={(v) => setAddonForm({ ...addonForm, is_active: v })}
          />
          <Label>Active</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={addonForm.is_public}
            onCheckedChange={(v) => setAddonForm({ ...addonForm, is_public: v })}
          />
          <Label>Public</Label>
        </div>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Add-ons Configuration
            </CardTitle>
            <CardDescription>
              Manage purchasable add-on packages with pricing and validity
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={fetchAddons} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Add-on
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create New Add-on</DialogTitle>
                  <DialogDescription>
                    Define a purchasable add-on package with quota and pricing
                  </DialogDescription>
                </DialogHeader>
                <AddonFormFields />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreateAddon} disabled={saving}>
                    {saving ? 'Creating...' : 'Create Add-on'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Validity</TableHead>
                <TableHead className="text-center">Backtests</TableHead>
                <TableHead className="text-center">Live Exec</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : addons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No add-ons configured. Create your first add-on.
                  </TableCell>
                </TableRow>
              ) : (
                addons.map((addon) => (
                  <TableRow key={addon.id}>
                    <TableCell className="font-mono text-sm">{addon.code}</TableCell>
                    <TableCell className="font-medium">{addon.name}</TableCell>
                    <TableCell>
                      {addon.duration_type === 'lifetime' 
                        ? 'Lifetime' 
                        : `${addon.duration_days || 30} days`}
                    </TableCell>
                    <TableCell className="text-center">{addon.backtests_total_limit}</TableCell>
                    <TableCell className="text-center">{addon.live_executions_monthly_limit}</TableCell>
                    <TableCell>{formatPrice(addon.price_monthly, addon.currency)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Badge variant={addon.is_active ? 'default' : 'secondary'}>
                          {addon.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {addon.is_public && <Badge variant="outline">Public</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(addon)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteAddon(addon)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
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
      <Dialog open={!!editingAddon} onOpenChange={() => setEditingAddon(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Add-on</DialogTitle>
            <DialogDescription>
              Modify the add-on configuration
            </DialogDescription>
          </DialogHeader>
          <AddonFormFields />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingAddon(null)}>Cancel</Button>
            <Button onClick={handleUpdateAddon} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
