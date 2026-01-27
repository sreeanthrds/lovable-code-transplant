import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Copy, 
  Archive, 
  Trash2, 
  Infinity,
  AlertTriangle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { usePlanDefinitions } from '@/hooks/usePlanDefinitions';
import { PlanCreatorForm } from './PlanCreatorForm';
import { PlanDefinition, CreatePlanInput } from '@/types/plan-definitions';
import { toast } from '@/hooks/use-toast';

function formatLimit(value: number): React.ReactNode {
  if (value === -1) return <Infinity className="h-4 w-4 inline" />;
  if (value === 0) return <span className="text-muted-foreground">-</span>;
  return value;
}

function getCurrencySymbol(currency: string): string {
  switch (currency) {
    case 'INR': return '₹';
    case 'USD': return '$';
    case 'EUR': return '€';
    default: return currency;
  }
}

export function PlanDefinitionsManager() {
  const { 
    plans, 
    loading, 
    error, 
    createPlan, 
    updatePlan, 
    deletePlan, 
    archivePlan,
    duplicatePlan,
    refreshPlans,
    isUsingFallback 
  } = usePlanDefinitions();

  const [searchQuery, setSearchQuery] = useState('');
  const [showCreator, setShowCreator] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanDefinition | null>(null);
  const [duplicateDialogPlan, setDuplicateDialogPlan] = useState<PlanDefinition | null>(null);
  const [newDuplicateCode, setNewDuplicateCode] = useState('');
  const [deleteDialogPlan, setDeleteDialogPlan] = useState<PlanDefinition | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredPlans = plans.filter(plan => 
    plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreatePlan = async (data: CreatePlanInput) => {
    try {
      setIsSubmitting(true);
      await createPlan(data);
      setShowCreator(false);
      toast({
        title: 'Plan created',
        description: `${data.name} has been created successfully.`,
      });
    } catch (err) {
      toast({
        title: 'Error creating plan',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePlan = async (data: CreatePlanInput) => {
    if (!editingPlan) return;
    
    try {
      setIsSubmitting(true);
      await updatePlan(editingPlan.id, data);
      setEditingPlan(null);
      toast({
        title: 'Plan updated',
        description: `${data.name} has been updated successfully.`,
      });
    } catch (err) {
      toast({
        title: 'Error updating plan',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDuplicate = async () => {
    if (!duplicateDialogPlan || !newDuplicateCode) return;
    
    try {
      setIsSubmitting(true);
      await duplicatePlan(duplicateDialogPlan.id, newDuplicateCode);
      setDuplicateDialogPlan(null);
      setNewDuplicateCode('');
      toast({
        title: 'Plan duplicated',
        description: `Created ${newDuplicateCode} from ${duplicateDialogPlan.code}.`,
      });
    } catch (err) {
      toast({
        title: 'Error duplicating plan',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchive = async (plan: PlanDefinition) => {
    try {
      await archivePlan(plan.id);
      toast({
        title: 'Plan archived',
        description: `${plan.name} has been archived.`,
      });
    } catch (err) {
      toast({
        title: 'Error archiving plan',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteDialogPlan) return;
    
    try {
      setIsSubmitting(true);
      await deletePlan(deleteDialogPlan.id);
      setDeleteDialogPlan(null);
      toast({
        title: 'Plan deleted',
        description: `${deleteDialogPlan.name} has been permanently deleted.`,
      });
    } catch (err) {
      toast({
        title: 'Error deleting plan',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show creator/editor form
  if (showCreator || editingPlan) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {editingPlan ? `Edit Plan: ${editingPlan.code}` : 'Create New Plan'}
          </h2>
        </div>
        <PlanCreatorForm
          initialPlan={editingPlan || undefined}
          onSubmit={editingPlan ? handleUpdatePlan : handleCreatePlan}
          onCancel={() => {
            setShowCreator(false);
            setEditingPlan(null);
          }}
          isSubmitting={isSubmitting}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Plan Definitions</h2>
          <p className="text-sm text-muted-foreground">
            Manage subscription plans and their configurations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={refreshPlans}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => setShowCreator(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Plan
          </Button>
        </div>
      </div>

      {/* Fallback Warning */}
      {isUsingFallback && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-600">Using Fallback Configuration</p>
            <p className="text-sm text-muted-foreground">
              The plan_definitions table is not available. Displaying hardcoded PLAN_CONFIGS. 
              Run the database migration to enable dynamic plan management.
            </p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative w-full md:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search plans..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-destructive">
          Error loading plans: {error.message}
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {searchQuery ? 'No plans match your search.' : 'No plans configured yet.'}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Backtests</TableHead>
                <TableHead>Live</TableHead>
                <TableHead>Paper</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{plan.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {plan.code}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {plan.tier_level}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    <div className="space-y-0.5">
                      <div>{formatLimit(plan.backtests_daily_limit)}/day</div>
                      <div className="text-muted-foreground">
                        {formatLimit(plan.backtests_monthly_limit)}/mo
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {formatLimit(plan.live_executions_monthly_limit)}/mo
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    <div className="space-y-0.5">
                      <div>{formatLimit(plan.paper_trading_daily_limit)}/day</div>
                      <div className="text-muted-foreground">
                        {formatLimit(plan.paper_trading_monthly_limit)}/mo
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {plan.price_monthly === 0 ? (
                      <span className="text-primary font-medium">Free</span>
                    ) : (
                      <div className="font-mono">
                        {getCurrencySymbol(plan.currency)}
                        {plan.price_monthly}
                        <span className="text-muted-foreground">/mo</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {plan.is_active ? (
                        <Badge variant="default" className="text-xs">Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Inactive</Badge>
                      )}
                      {plan.is_public && (
                        <Badge variant="outline" className="text-xs">Public</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingPlan(plan)}
                        disabled={isUsingFallback}
                        title={isUsingFallback ? "Run database migration to enable editing" : "Edit plan"}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={isUsingFallback}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover z-50">
                          <DropdownMenuItem onClick={() => setEditingPlan(plan)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              setDuplicateDialogPlan(plan);
                              setNewDuplicateCode(`${plan.code}_COPY`);
                            }}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleArchive(plan)}>
                            <Archive className="h-4 w-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteDialogPlan(plan)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Duplicate Dialog */}
      <Dialog 
        open={!!duplicateDialogPlan} 
        onOpenChange={(open) => !open && setDuplicateDialogPlan(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate Plan</DialogTitle>
            <DialogDescription>
              Create a copy of {duplicateDialogPlan?.name} with a new code.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Plan Code</Label>
              <Input
                value={newDuplicateCode}
                onChange={(e) => setNewDuplicateCode(e.target.value.toUpperCase())}
                placeholder="e.g., PRO_V2"
                className="font-mono uppercase"
              />
              <p className="text-xs text-muted-foreground">
                The new plan will be created as inactive.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDuplicateDialogPlan(null)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDuplicate}
              disabled={!newDuplicateCode || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Duplicating...
                </>
              ) : (
                'Duplicate'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog 
        open={!!deleteDialogPlan} 
        onOpenChange={(open) => !open && setDeleteDialogPlan(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Plan?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete{' '}
              <strong>{deleteDialogPlan?.name}</strong>? This action cannot be undone.
              Users currently on this plan will need to be migrated to a different plan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
