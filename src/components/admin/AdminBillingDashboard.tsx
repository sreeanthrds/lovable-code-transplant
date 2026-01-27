import React, { useState, useEffect } from 'react';
import { useAppAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wallet, Search, RefreshCw, Users, TrendingUp, Crown, 
  Zap, RotateCcw, Plus, Download, Filter, IndianRupee,
  AlertCircle, CheckCircle, XCircle, Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminService, UserWithPlan } from '@/lib/supabase/services/admin-service';
import { getAllPaymentHistory, PaymentHistory } from '@/lib/services/payment-service';
import UserPlanEditor from './UserPlanEditor';
import { UserPlan, PLAN_CONFIGS, PlanType, PlanStatusType } from '@/types/billing';
import { format } from 'date-fns';

const AdminBillingDashboard: React.FC = () => {
  const { user: adminUser } = useAppAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserWithPlan[]>([]);
  const [plans, setPlans] = useState<UserPlan[]>([]);
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('users');
  
  // Plan Editor
  const [planEditorOpen, setPlanEditorOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithPlan | null>(null);

  const loadData = async () => {
    if (!adminUser?.id) return;
    setLoading(true);
    try {
      const [usersData, plansData, paymentsData] = await Promise.all([
        adminService.getAllUsersWithPlans(adminUser.id),
        adminService.getAllUserPlans(),
        getAllPaymentHistory()
      ]);
      setUsers(usersData);
      setPlans(plansData);
      setPayments(paymentsData);
    } catch (error) {
      console.error('Failed to load billing data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load billing data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [adminUser?.id]);

  // Stats calculations
  const capturedPayments = payments.filter(p => p.status === 'captured');
  const stats = {
    totalUsers: users.length,
    activeSubscriptions: plans.filter(p => p.status === 'active' && p.plan !== 'FREE').length,
    freeUsers: users.filter(u => !u.plan || u.plan.plan === 'FREE').length,
    proUsers: plans.filter(p => p.plan === 'PRO').length,
    enterpriseUsers: plans.filter(p => p.plan === 'ENTERPRISE').length,
    expiringThisMonth: plans.filter(p => {
      if (!p.expires_at) return false;
      const expires = new Date(p.expires_at);
      const now = new Date();
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return expires <= monthEnd && expires >= now;
    }).length,
    totalRevenue: capturedPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
    totalPayments: payments.length,
    successfulPayments: capturedPayments.length,
    failedPayments: payments.filter(p => p.status === 'failed').length,
  };

  // Filtered users
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const userPlan = u.plan?.plan || 'FREE';
    const matchesPlan = planFilter === 'all' || userPlan === planFilter;
    
    const userStatus = u.plan?.status || 'active';
    const matchesStatus = statusFilter === 'all' || userStatus === statusFilter;
    
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const openPlanEditor = (user: UserWithPlan) => {
    setSelectedUser(user);
    setPlanEditorOpen(true);
  };

  const getPlanBadgeVariant = (plan?: PlanType): "default" | "secondary" | "destructive" | "outline" => {
    switch (plan) {
      case 'ENTERPRISE': return 'destructive';
      case 'PRO': return 'default';
      case 'LAUNCH': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status?: PlanStatusType) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'expired': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'trial': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-muted-foreground" />;
      default: return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const handleBulkAction = async (action: 'reset_usage' | 'expire_all_trials') => {
    if (!adminUser?.id) return;
    
    toast({
      title: 'Bulk Action',
      description: `${action} is not yet implemented`,
    });
  };

  const exportData = () => {
    const csvData = filteredUsers.map(u => ({
      email: u.email,
      name: `${u.first_name || ''} ${u.last_name || ''}`.trim(),
      plan: u.plan?.plan || 'FREE',
      status: u.plan?.status || 'active',
      expires_at: u.plan?.expires_at || '',
      amount_paid: u.plan?.amount_paid || 0,
      backtests_used: u.plan?.backtests_used || 0,
      live_executions_used: u.plan?.live_executions_used || 0,
    }));
    
    const headers = Object.keys(csvData[0] || {}).join(',');
    const rows = csvData.map(row => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `billing-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="w-6 h-6 text-primary" />
            Billing Management
          </h2>
          <p className="text-muted-foreground text-sm">Manage user plans, subscriptions, and billing</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Users</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.totalUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">PRO</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.proUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-muted-foreground">Enterprise</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.enterpriseUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Free</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.freeUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Active Subs</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.activeSubscriptions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-muted-foreground">Expiring</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.expiringThisMonth}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Revenue</span>
            </div>
            <p className="text-2xl font-bold mt-1">₹{stats.totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="users">User Plans</TabsTrigger>
          <TabsTrigger value="payments">Payment History ({payments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {/* Filters & Actions */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-4 flex-wrap items-center">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={planFilter} onValueChange={setPlanFilter}>
                    <SelectTrigger className="w-32">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Plans</SelectItem>
                      <SelectItem value="FREE">Free</SelectItem>
                      <SelectItem value="LAUNCH">Launch</SelectItem>
                      <SelectItem value="PRO">Pro</SelectItem>
                      <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={exportData}>
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Subscriptions ({filteredUsers.length})</CardTitle>
          <CardDescription>Click on a user to manage their plan</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Add-ons</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((userItem) => {
                  const plan = userItem.plan;
                  const planType = plan?.plan || 'FREE';
                  const planConfig = PLAN_CONFIGS[planType];
                  
                  return (
                    <TableRow 
                      key={userItem.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => openPlanEditor(userItem)}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {userItem.first_name || userItem.last_name 
                              ? `${userItem.first_name || ''} ${userItem.last_name || ''}`.trim()
                              : 'No name'
                            }
                          </div>
                          <div className="text-sm text-muted-foreground">{userItem.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPlanBadgeVariant(planType as PlanType)}>
                          {planConfig?.name || planType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(plan?.status)}
                          <span className="text-sm capitalize">{plan?.status || 'active'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {plan?.expires_at 
                          ? format(new Date(plan.expires_at), 'MMM dd, yyyy')
                          : <span className="text-muted-foreground">—</span>
                        }
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>BT: {plan?.backtests_used || 0}/{planConfig?.backtests_monthly_limit === -1 ? '∞' : planConfig?.backtests_monthly_limit || 5}</div>
                          <div className="text-muted-foreground">LE: {plan?.live_executions_used || 0}/{planConfig?.live_executions_limit === -1 ? '∞' : planConfig?.live_executions_limit || 0}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {(plan?.addon_backtests || 0) > 0 && (
                            <span className="text-green-600">+{plan?.addon_backtests} BT</span>
                          )}
                          {(plan?.addon_live_executions || 0) > 0 && (
                            <span className="text-green-600 ml-2">+{plan?.addon_live_executions} LE</span>
                          )}
                          {!(plan?.addon_backtests || plan?.addon_live_executions) && (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {plan?.amount_paid ? `₹${plan.amount_paid.toLocaleString()}` : '₹0'}
                        </span>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openPlanEditor(userItem)}
                            title="Manage plan"
                          >
                            <Crown className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Payments</CardTitle>
              <CardDescription>Transaction history across all users</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No payments recorded yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((payment) => {
                      const paymentUser = users.find(u => u.id === payment.user_id);
                      return (
                        <TableRow key={payment.id}>
                          <TableCell>
                            {format(new Date(payment.created_at), 'MMM dd, yyyy HH:mm')}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{paymentUser?.email || payment.user_id}</p>
                              <p className="text-xs text-muted-foreground">
                                {paymentUser?.first_name} {paymentUser?.last_name}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {payment.plan_type && (
                              <Badge variant={getPlanBadgeVariant(payment.plan_type as PlanType)}>
                                {PLAN_CONFIGS[payment.plan_type as PlanType]?.name || payment.plan_type}
                              </Badge>
                            )}
                            {payment.billing_cycle && (
                              <span className="text-xs text-muted-foreground ml-2 capitalize">
                                {payment.billing_cycle}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            ₹{payment.amount?.toLocaleString()}
                            {payment.refund_amount && (
                              <span className="text-xs text-yellow-500 ml-2">
                                (-₹{payment.refund_amount})
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {payment.status === 'captured' ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : payment.status === 'failed' ? (
                                <XCircle className="w-4 h-4 text-red-500" />
                              ) : (
                                <Clock className="w-4 h-4 text-muted-foreground" />
                              )}
                              <Badge variant={
                                payment.status === 'captured' ? 'default' :
                                payment.status === 'failed' ? 'destructive' :
                                payment.status === 'refunded' ? 'secondary' : 'outline'
                              }>
                                {payment.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {payment.payment_id?.slice(0, 16)}...
                            </code>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Plan Editor Dialog */}
      {selectedUser && (
        <UserPlanEditor
          isOpen={planEditorOpen}
          onClose={() => {
            setPlanEditorOpen(false);
            setSelectedUser(null);
          }}
          userId={selectedUser.id}
          userEmail={selectedUser.email}
          userName={`${selectedUser.first_name || ''} ${selectedUser.last_name || ''}`.trim()}
          currentPlan={selectedUser.plan}
          onPlanUpdated={loadData}
        />
      )}
    </div>
  );
};

export default AdminBillingDashboard;
