import React, { useState, useEffect, useCallback } from 'react';
import { useAppAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
  Wallet, 
  Search, 
  RefreshCw, 
  MoreHorizontal, 
  Edit, 
  RotateCcw, 
  Trash2, 
  Plus,
  Users,
  Crown,
  Zap,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminService } from '@/lib/supabase/services/admin-service';
import { tradelayoutSupabase } from '@/lib/supabase/services/admin-service';
import { UserPlan, PlanType, PlanStatusType, PLAN_CONFIGS } from '@/types/billing';
import { format } from 'date-fns';
import UserPlanEditor from './UserPlanEditor';

interface UserWithPlan {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  plan?: UserPlan;
}

const AdminUserPlansManager: React.FC = () => {
  const { user: adminUser } = useAppAuth();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<UserWithPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Editor state
  const [editingUser, setEditingUser] = useState<UserWithPlan | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  
  // Delete confirmation
  const [deletingPlan, setDeletingPlan] = useState<UserWithPlan | null>(null);
  
  const fetchUsers = useCallback(async () => {
    if (!adminUser?.id) return;
    setLoading(true);
    
    try {
      const data = await adminService.getAllUsersWithPlans(adminUser.id);
      setUsers(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [adminUser?.id, toast]);
  
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  const handleResetUsage = async (user: UserWithPlan) => {
    if (!adminUser?.id) return;
    
    try {
      await adminService.resetUserUsage(user.id, adminUser.id);
      toast({
        title: 'Usage Reset',
        description: `Reset usage for ${user.email}`,
      });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reset usage',
        variant: 'destructive',
      });
    }
  };
  
  const handleDeletePlan = async () => {
    if (!deletingPlan) return;
    
    try {
      const { error } = await tradelayoutSupabase
        .from('user_plans')
        .delete()
        .eq('user_id', deletingPlan.id);
      
      if (error) throw error;
      
      toast({
        title: 'Plan Deleted',
        description: `Deleted plan for ${deletingPlan.email}`,
      });
      setDeletingPlan(null);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete plan',
        variant: 'destructive',
      });
    }
  };
  
  const handleEditUser = (user: UserWithPlan) => {
    setEditingUser(user);
    setIsEditorOpen(true);
  };
  
  const handleCreatePlan = (user: UserWithPlan) => {
    setEditingUser(user);
    setIsEditorOpen(true);
  };
  
  const getPlanBadgeVariant = (planType?: PlanType) => {
    if (!planType) return 'outline';
    switch (planType) {
      case 'ENTERPRISE': return 'destructive';
      case 'PRO': return 'default';
      case 'LAUNCH': return 'secondary';
      default: return 'outline';
    }
  };
  
  const getStatusBadgeVariant = (status?: PlanStatusType) => {
    if (!status) return 'outline';
    switch (status) {
      case 'active': return 'default';
      case 'trial': return 'secondary';
      case 'expired':
      case 'cancelled': return 'destructive';
      case 'paused': return 'outline';
      default: return 'outline';
    }
  };
  
  // Filter users by search query
  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      user.email?.toLowerCase().includes(query) ||
      user.first_name?.toLowerCase().includes(query) ||
      user.last_name?.toLowerCase().includes(query) ||
      user.id?.toLowerCase().includes(query)
    );
  });
  
  // Summary stats
  const stats = {
    total: users.length,
    withPlans: users.filter(u => u.plan).length,
    active: users.filter(u => u.plan?.status === 'active').length,
    pro: users.filter(u => u.plan?.plan === 'PRO').length,
    enterprise: users.filter(u => u.plan?.plan === 'ENTERPRISE').length,
  };
  
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Plans</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withPlans}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.active}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pro Plans</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.pro}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enterprise</CardTitle>
            <Crown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.enterprise}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Table Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" />
                User Plans & Quotas
              </CardTitle>
              <CardDescription>
                View and manage all user plans, quotas, and billing
              </CardDescription>
            </div>
            <Button onClick={fetchUsers} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email, name, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Showing {filteredUsers.length} of {users.length} users
            </p>
          </div>
          
          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Backtests</TableHead>
                  <TableHead className="text-center">Live Exec</TableHead>
                  <TableHead className="text-center">Paper</TableHead>
                  <TableHead className="text-center">Add-ons</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                      <p className="mt-2 text-muted-foreground">Loading users...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {user.first_name || user.last_name 
                              ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                              : 'No name'}
                          </span>
                          <span className="text-sm text-muted-foreground">{user.email}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {user.plan ? (
                          <Badge variant={getPlanBadgeVariant(user.plan.plan)}>
                            {PLAN_CONFIGS[user.plan.plan]?.name || user.plan.plan}
                          </Badge>
                        ) : (
                          <Badge variant="outline">No Plan</Badge>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {user.plan ? (
                          <Badge variant={getStatusBadgeVariant(user.plan.status)}>
                            {user.plan.status}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      
                      <TableCell className="text-center">
                        {user.plan ? (
                          <div className="flex flex-col items-center">
                            <span className="font-medium">
                              {user.plan.backtests_used || 0}
                              {user.plan.backtests_limit && user.plan.backtests_limit > 0 
                                ? ` / ${user.plan.backtests_limit}` 
                                : ''}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Today: {user.plan.backtests_used_today || 0}
                            </span>
                          </div>
                        ) : '-'}
                      </TableCell>
                      
                      <TableCell className="text-center">
                        {user.plan ? (
                          <span className="font-medium">
                            {user.plan.live_executions_used || 0}
                            {user.plan.live_executions_limit && user.plan.live_executions_limit > 0 
                              ? ` / ${user.plan.live_executions_limit}` 
                              : ''}
                          </span>
                        ) : '-'}
                      </TableCell>
                      
                      <TableCell className="text-center">
                        {user.plan ? (
                          <div className="flex flex-col items-center">
                            <span className="font-medium">
                              {user.plan.paper_trading_used || 0}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Today: {user.plan.paper_trading_used_today || 0}
                            </span>
                          </div>
                        ) : '-'}
                      </TableCell>
                      
                      <TableCell className="text-center">
                        {user.plan ? (
                          <div className="flex flex-col items-center text-xs">
                            <span>BT: {user.plan.addon_backtests || 0}</span>
                            <span>LE: {user.plan.addon_live_executions || 0}</span>
                          </div>
                        ) : '-'}
                      </TableCell>
                      
                      <TableCell>
                        {user.plan?.expires_at ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(user.plan.expires_at), 'MMM d, yyyy')}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            
                            {user.plan ? (
                              <>
                                <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Plan
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleResetUsage(user)}>
                                  <RotateCcw className="w-4 h-4 mr-2" />
                                  Reset Usage
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => setDeletingPlan(user)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Plan
                                </DropdownMenuItem>
                              </>
                            ) : (
                              <DropdownMenuItem onClick={() => handleCreatePlan(user)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Plan
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Plan Editor Dialog */}
      {editingUser && (
        <UserPlanEditor
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingUser(null);
          }}
          userId={editingUser.id}
          userEmail={editingUser.email}
          userName={`${editingUser.first_name || ''} ${editingUser.last_name || ''}`.trim()}
          currentPlan={editingUser.plan}
          onPlanUpdated={fetchUsers}
        />
      )}
      
      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingPlan} onOpenChange={() => setDeletingPlan(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Plan?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the plan for{' '}
              <span className="font-medium">{deletingPlan?.email}</span>. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePlan} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUserPlansManager;
