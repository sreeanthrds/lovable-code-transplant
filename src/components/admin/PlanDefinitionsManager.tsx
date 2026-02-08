import React, { useState } from 'react';
import { usePlanDefinitions } from '@/hooks/usePlanDefinitions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Copy, RefreshCw, FileText, X, Loader2, AlertTriangle } from 'lucide-react';
import type { PlanDefinition, PlanFormState, CreatePlanInput } from '@/types/plan-definitions';
import { INITIAL_FORM_STATE, planToFormState, formStateToPlanInput } from '@/types/plan-definitions';

const formatLimit = (limit: number): string => {
  if (limit === -1) return 'Unlimited';
  if (limit === 0) return 'Disabled';
  return limit.toString();
};

const formatPrice = (amount: number, currency: string = 'INR') => {
  if (amount === 0) return 'Free';
  return currency === 'INR' ? `₹${amount.toLocaleString('en-IN')}` : `$${amount}`;
};

const PlanDefinitionsManager: React.FC = () => {
  const { 
    plans, 
    loading, 
    error, 
    createPlan, 
    updatePlan, 
    deletePlan, 
    duplicatePlan, 
    refreshPlans, 
    isUsingFallback 
  } = usePlanDefinitions();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanDefinition | null>(null);
  const [formState, setFormState] = useState<PlanFormState>(INITIAL_FORM_STATE);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmPlan, setDeleteConfirmPlan] = useState<PlanDefinition | null>(null);
  const [duplicateDialogPlan, setDuplicateDialogPlan] = useState<PlanDefinition | null>(null);
  const [duplicateCode, setDuplicateCode] = useState('');

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setFormState(INITIAL_FORM_STATE);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (plan: PlanDefinition) => {
    setEditingPlan(plan);
    setFormState(planToFormState(plan));
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPlan(null);
    setFormState(INITIAL_FORM_STATE);
  };

  const handleSubmit = async () => {
    if (!formState.code || !formState.name) {
      toast({
        title: 'Validation Error',
        description: 'Code and Name are required fields.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const input = formStateToPlanInput(formState);
      
      if (editingPlan) {
        await updatePlan(editingPlan.id, input);
        toast({
          title: 'Plan Updated',
          description: `Plan "${formState.name}" has been updated successfully.`,
        });
      } else {
        await createPlan(input);
        toast({
          title: 'Plan Created',
          description: `Plan "${formState.name}" has been created successfully.`,
        });
      }
      
      handleCloseForm();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to save plan',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmPlan) return;
    
    try {
      await deletePlan(deleteConfirmPlan.id);
      toast({
        title: 'Plan Deleted',
        description: `Plan "${deleteConfirmPlan.name}" has been deleted.`,
      });
      setDeleteConfirmPlan(null);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete plan',
        variant: 'destructive',
      });
    }
  };

  const handleDuplicate = async () => {
    if (!duplicateDialogPlan || !duplicateCode) return;
    
    try {
      await duplicatePlan(duplicateDialogPlan.id, duplicateCode);
      toast({
        title: 'Plan Duplicated',
        description: `Plan duplicated as "${duplicateCode}".`,
      });
      setDuplicateDialogPlan(null);
      setDuplicateCode('');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to duplicate plan',
        variant: 'destructive',
      });
    }
  };

  const updateFormField = <K extends keyof PlanFormState>(field: K, value: PlanFormState[K]) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const handleAddFeature = () => {
    setFormState(prev => ({
      ...prev,
      features: [...prev.features, ''],
    }));
  };

  const handleUpdateFeature = (index: number, value: string) => {
    setFormState(prev => {
      const newFeatures = [...prev.features];
      newFeatures[index] = value;
      return { ...prev, features: newFeatures };
    });
  };

  const handleRemoveFeature = (index: number) => {
    setFormState(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Plan Definitions
            </CardTitle>
            <CardDescription>
              Manage subscription plans, pricing, and limits
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isUsingFallback && (
              <Badge variant="outline" className="text-amber-600 border-amber-600">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Using Fallback
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={refreshPlans}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleOpenCreate}>
              <Plus className="h-4 w-4 mr-2" />
              New Plan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
              Error loading plans: {error.message}
            </div>
          )}
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Monthly Price</TableHead>
                  <TableHead>Daily Limit</TableHead>
                  <TableHead>Monthly Limit</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No plan definitions found. Create your first plan to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  plans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-mono font-medium">{plan.code}</TableCell>
                      <TableCell>{plan.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{plan.tier_level}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Badge variant={plan.is_active ? 'default' : 'outline'}>
                            {plan.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          {plan.is_public && (
                            <Badge variant="secondary">Public</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatPrice(plan.price_monthly, plan.currency)}</TableCell>
                      <TableCell>{formatLimit(plan.backtests_daily_limit)}</TableCell>
                      <TableCell>{formatLimit(plan.backtests_monthly_limit)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleOpenEdit(plan)}
                            disabled={isUsingFallback}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setDuplicateDialogPlan(plan);
                              setDuplicateCode(`${plan.code}_COPY`);
                            }}
                            disabled={isUsingFallback}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setDeleteConfirmPlan(plan)}
                            disabled={isUsingFallback}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
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
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? `Edit Plan: ${editingPlan.name}` : 'Create New Plan'}
            </DialogTitle>
            <DialogDescription>
              Configure plan settings, limits, and pricing.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="limits">Limits</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Plan Code *</Label>
                  <Input
                    id="code"
                    value={formState.code}
                    onChange={(e) => updateFormField('code', e.target.value.toUpperCase())}
                    placeholder="e.g., PREMIUM"
                    disabled={!!editingPlan}
                  />
                  <p className="text-xs text-muted-foreground">Unique identifier (cannot be changed)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name *</Label>
                  <Input
                    id="name"
                    value={formState.name}
                    onChange={(e) => updateFormField('name', e.target.value)}
                    placeholder="e.g., Premium Plan"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formState.description}
                  onChange={(e) => updateFormField('description', e.target.value)}
                  placeholder="Brief description of the plan"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tier_level">Tier Level</Label>
                  <Input
                    id="tier_level"
                    type="number"
                    value={formState.tier_level}
                    onChange={(e) => updateFormField('tier_level', parseInt(e.target.value) || 0)}
                    min={0}
                  />
                  <p className="text-xs text-muted-foreground">Higher = better tier</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration_type">Duration Type</Label>
                  <Select
                    value={formState.duration_type}
                    onValueChange={(v) => updateFormField('duration_type', v as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="subscription">Subscription</SelectItem>
                      <SelectItem value="fixed">Fixed Duration</SelectItem>
                      <SelectItem value="lifetime">Lifetime</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formState.duration_type === 'fixed' && (
                  <div className="space-y-2">
                    <Label htmlFor="duration_days">Duration (Days)</Label>
                    <Input
                      id="duration_days"
                      type="number"
                      value={formState.duration_days || ''}
                      onChange={(e) => updateFormField('duration_days', parseInt(e.target.value) || null)}
                      min={1}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formState.is_active}
                    onCheckedChange={(v) => updateFormField('is_active', v)}
                  />
                  <Label>Active</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formState.is_public}
                    onCheckedChange={(v) => updateFormField('is_public', v)}
                  />
                  <Label>Public (Visible on Pricing Page)</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formState.can_buy_addons}
                    onCheckedChange={(v) => updateFormField('can_buy_addons', v)}
                  />
                  <Label>Can Buy Add-ons</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="limits" className="space-y-4 mt-4">
              <div className="space-y-4">
                <h4 className="font-medium">Backtest Limits</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Daily Limit</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={formState.backtests_daily_unlimited ? '' : formState.backtests_daily_limit}
                        onChange={(e) => updateFormField('backtests_daily_limit', parseInt(e.target.value) || 0)}
                        disabled={formState.backtests_daily_unlimited}
                        min={0}
                      />
                      <div className="flex items-center gap-1">
                        <Switch
                          checked={formState.backtests_daily_unlimited}
                          onCheckedChange={(v) => updateFormField('backtests_daily_unlimited', v)}
                        />
                        <span className="text-xs">∞</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Monthly Limit</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={formState.backtests_monthly_unlimited ? '' : formState.backtests_monthly_limit}
                        onChange={(e) => updateFormField('backtests_monthly_limit', parseInt(e.target.value) || 0)}
                        disabled={formState.backtests_monthly_unlimited}
                        min={0}
                      />
                      <div className="flex items-center gap-1">
                        <Switch
                          checked={formState.backtests_monthly_unlimited}
                          onCheckedChange={(v) => updateFormField('backtests_monthly_unlimited', v)}
                        />
                        <span className="text-xs">∞</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Total Limit</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={formState.backtests_total_unlimited ? '' : formState.backtests_total_limit}
                        onChange={(e) => updateFormField('backtests_total_limit', parseInt(e.target.value) || 0)}
                        disabled={formState.backtests_total_unlimited}
                        min={0}
                      />
                      <div className="flex items-center gap-1">
                        <Switch
                          checked={formState.backtests_total_unlimited}
                          onCheckedChange={(v) => updateFormField('backtests_total_unlimited', v)}
                        />
                        <span className="text-xs">∞</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Paper Trading Limits</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Daily Limit</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={formState.paper_trading_daily_unlimited ? '' : formState.paper_trading_daily_limit}
                        onChange={(e) => updateFormField('paper_trading_daily_limit', parseInt(e.target.value) || 0)}
                        disabled={formState.paper_trading_daily_unlimited}
                        min={0}
                      />
                      <div className="flex items-center gap-1">
                        <Switch
                          checked={formState.paper_trading_daily_unlimited}
                          onCheckedChange={(v) => updateFormField('paper_trading_daily_unlimited', v)}
                        />
                        <span className="text-xs">∞</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Monthly Limit</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={formState.paper_trading_monthly_unlimited ? '' : formState.paper_trading_monthly_limit}
                        onChange={(e) => updateFormField('paper_trading_monthly_limit', parseInt(e.target.value) || 0)}
                        disabled={formState.paper_trading_monthly_unlimited}
                        min={0}
                      />
                      <div className="flex items-center gap-1">
                        <Switch
                          checked={formState.paper_trading_monthly_unlimited}
                          onCheckedChange={(v) => updateFormField('paper_trading_monthly_unlimited', v)}
                        />
                        <span className="text-xs">∞</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Live Executions</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Monthly Limit</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={formState.live_executions_monthly_unlimited ? '' : formState.live_executions_monthly_limit}
                        onChange={(e) => updateFormField('live_executions_monthly_limit', parseInt(e.target.value) || 0)}
                        disabled={formState.live_executions_monthly_unlimited}
                        min={0}
                      />
                      <div className="flex items-center gap-1">
                        <Switch
                          checked={formState.live_executions_monthly_unlimited}
                          onCheckedChange={(v) => updateFormField('live_executions_monthly_unlimited', v)}
                        />
                        <span className="text-xs">∞</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Reset Settings</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Reset Type</Label>
                    <Select
                      value={formState.reset_type}
                      onValueChange={(v) => updateFormField('reset_type', v as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="calendar">Calendar (fixed day)</SelectItem>
                        <SelectItem value="rolling">Rolling (24h)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Daily Reset Hour</Label>
                    <Input
                      type="number"
                      value={formState.daily_reset_hour}
                      onChange={(e) => updateFormField('daily_reset_hour', parseInt(e.target.value) || 0)}
                      min={0}
                      max={23}
                    />
                    <p className="text-xs text-muted-foreground">0-23 (e.g., 4 = 4 AM)</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Input
                      value={formState.reset_timezone}
                      onChange={(e) => updateFormField('reset_timezone', e.target.value)}
                      placeholder="Asia/Kolkata"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>GST Percentage</Label>
                <Input
                  type="number"
                  value={formState.gst_percentage}
                  onChange={(e) => updateFormField('gst_percentage', parseFloat(e.target.value) || 0)}
                  min={0}
                  max={100}
                />
                <p className="text-xs text-muted-foreground">Tax added on top of base price (default 18%)</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select
                    value={formState.currency}
                    onValueChange={(v) => updateFormField('currency', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Monthly Price</Label>
                  <Input
                    type="number"
                    value={formState.price_monthly}
                    onChange={(e) => updateFormField('price_monthly', parseFloat(e.target.value) || 0)}
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Yearly Price</Label>
                  <Input
                    type="number"
                    value={formState.price_yearly}
                    onChange={(e) => updateFormField('price_yearly', parseFloat(e.target.value) || 0)}
                    min={0}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Discount Percentage</Label>
                <Input
                  type="number"
                  value={formState.discount_percentage}
                  onChange={(e) => updateFormField('discount_percentage', parseFloat(e.target.value) || 0)}
                  min={0}
                  max={100}
                />
                <p className="text-xs text-muted-foreground">Display discount badge on pricing page</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>UI Color</Label>
                  <Select
                    value={formState.ui_color}
                    onValueChange={(v) => updateFormField('ui_color', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="primary">Primary</SelectItem>
                      <SelectItem value="secondary">Secondary</SelectItem>
                      <SelectItem value="accent">Accent</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="amber">Amber</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>UI Icon</Label>
                  <Input
                    value={formState.ui_icon}
                    onChange={(e) => updateFormField('ui_icon', e.target.value)}
                    placeholder="e.g., crown, star, rocket"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="features" className="space-y-4 mt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Feature List (Pricing Page Bullets)</Label>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddFeature}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Feature
                  </Button>
                </div>
                <div className="space-y-2">
                  {formState.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => handleUpdateFeature(index, e.target.value)}
                        placeholder={`Feature ${index + 1}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFeature(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {formState.features.length === 0 && (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      No features added. Click "Add Feature" to add bullet points for the pricing page.
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="space-y-2">
                  <Label>Trial Days</Label>
                  <Input
                    type="number"
                    value={formState.trial_days}
                    onChange={(e) => updateFormField('trial_days', parseInt(e.target.value) || 0)}
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Grace Period Days</Label>
                  <Input
                    type="number"
                    value={formState.grace_period_days}
                    onChange={(e) => updateFormField('grace_period_days', parseInt(e.target.value) || 0)}
                    min={0}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={handleCloseForm} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingPlan ? 'Update Plan' : 'Create Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmPlan} onOpenChange={() => setDeleteConfirmPlan(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirmPlan?.name}"? This action cannot be undone.
              Users currently on this plan may lose access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Duplicate Dialog */}
      <Dialog open={!!duplicateDialogPlan} onOpenChange={() => setDuplicateDialogPlan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate Plan</DialogTitle>
            <DialogDescription>
              Create a copy of "{duplicateDialogPlan?.name}" with a new code.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Label>New Plan Code</Label>
            <Input
              value={duplicateCode}
              onChange={(e) => setDuplicateCode(e.target.value.toUpperCase())}
              placeholder="e.g., PREMIUM_V2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDuplicateDialogPlan(null)}>
              Cancel
            </Button>
            <Button onClick={handleDuplicate} disabled={!duplicateCode}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlanDefinitionsManager;
