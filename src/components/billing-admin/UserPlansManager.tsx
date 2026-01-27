import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { tradelayoutClient } from '@/lib/supabase/tradelayout-client';
import { UserPlanEditDialog } from './UserPlanEditDialog';
import { 
  Search, 
  RefreshCw, 
  Users,
  Pencil
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

interface PlanLimits {
  backtests_daily_limit: number;
  backtests_monthly_limit: number;
  paper_trading_daily_limit: number;
  paper_trading_monthly_limit: number;
  live_executions_monthly_limit: number;
}

const PLAN_TABS = ['FREE', 'LAUNCH', 'PRO', 'ENTERPRISE'] as const;

export const UserPlansManager: React.FC = () => {
  const { toast } = useToast();
  
  const [plans, setPlans] = useState<UserPlan[]>([]);
  const [planDefinitions, setPlanDefinitions] = useState<Record<string, PlanLimits>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPlan, setEditingPlan] = useState<UserPlan | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('FREE');
  
  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch user plans, plan definitions, and all user profiles in parallel
      const [plansResult, definitionsResult, profilesResult] = await Promise.all([
        tradelayoutClient.from('user_plans' as any).select('*').order('updated_at', { ascending: false }),
        tradelayoutClient.from('plan_definitions' as any).select('code, backtests_daily_limit, backtests_monthly_limit, paper_trading_daily_limit, paper_trading_monthly_limit, live_executions_monthly_limit'),
        tradelayoutClient.from('user_profiles' as any).select('id, email, first_name, last_name')
      ]);
      
      if (plansResult.error) throw plansResult.error;
      if (definitionsResult.error) throw definitionsResult.error;
      if (profilesResult.error) throw profilesResult.error;
      
      // Create lookup maps
      const emailMap = new Map<string, string>();
      const allProfiles = profilesResult.data || [];
      allProfiles.forEach((profile: any) => {
        emailMap.set(profile.id, profile.email);
      });
      
      const limitsMap: Record<string, PlanLimits> = {};
      (definitionsResult.data || []).forEach((def: any) => {
        limitsMap[def.code] = {
          backtests_daily_limit: def.backtests_daily_limit,
          backtests_monthly_limit: def.backtests_monthly_limit,
          paper_trading_daily_limit: def.paper_trading_daily_limit,
          paper_trading_monthly_limit: def.paper_trading_monthly_limit,
          live_executions_monthly_limit: def.live_executions_monthly_limit
        };
      });
      
      setPlanDefinitions(limitsMap);
      
      // Get all plans from database
      const allPlans = plansResult.data || [];
      
      // Separate paid plans and explicit FREE plans
      const paidPlans = allPlans.filter((plan: any) => 
        plan.status === 'active' && plan.plan !== 'FREE'
      );
      const explicitFreePlans = allPlans.filter((plan: any) => 
        plan.plan === 'FREE'
      );
      
      // Get user IDs that have any plan record
      const usersWithPlans = new Set(allPlans.map((plan: any) => plan.user_id));
      
      // Create plans array with emails
      const paidPlansWithEmail = paidPlans.map((plan: any) => ({
        ...plan,
        user_email: emailMap.get(plan.user_id) || plan.user_id
      }));
      
      const explicitFreePlansWithEmail = explicitFreePlans.map((plan: any) => ({
        ...plan,
        user_email: emailMap.get(plan.user_id) || plan.user_id
      }));
      
      // Users without any plan record are implicitly on FREE
      const implicitFreeUsers = allProfiles
        .filter((profile: any) => !usersWithPlans.has(profile.id))
        .map((profile: any) => ({
          id: `free-${profile.id}`,
          user_id: profile.id,
          plan: 'FREE',
          status: 'active',
          backtests_used: 0,
          backtests_used_today: 0,
          live_executions_used: 0,
          paper_trading_used: 0,
          paper_trading_used_today: 0,
          addon_backtests: 0,
          addon_live_executions: 0,
          user_email: profile.email
        }));
      
      setPlans([...paidPlansWithEmail, ...explicitFreePlansWithEmail, ...implicitFreeUsers] as UserPlan[]);
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
  
  const getFilteredPlans = (planType: string) => {
    const query = searchQuery.toLowerCase();
    return plans.filter(plan => {
      const matchesPlan = plan.plan === planType;
      const matchesSearch = !query || 
        plan.user_email?.toLowerCase().includes(query) ||
        plan.user_id?.toLowerCase().includes(query) ||
        plan.status?.toLowerCase().includes(query);
      return matchesPlan && matchesSearch;
    });
  };
  
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'trial': return 'secondary';
      case 'expired':
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };
  
  const formatLimit = (used: number, limit: number): string => {
    if (limit === -1) return `${used}/∞`;
    return `${used}/${limit}`;
  };
  
  const getValidTill = (plan: UserPlan): string => {
    if (plan.plan === 'FREE') return 'Unlimited';
    if (!plan.expires_at) return '-';
    return new Date(plan.expires_at).toLocaleDateString();
  };
  
  const getPlanLimits = (planCode: string): PlanLimits => {
    return planDefinitions[planCode] || {
      backtests_daily_limit: -1,
      backtests_monthly_limit: -1,
      paper_trading_daily_limit: -1,
      paper_trading_monthly_limit: -1,
      live_executions_monthly_limit: -1
    };
  };

  const renderPlanTable = (planType: string) => {
    const filteredPlans = getFilteredPlans(planType);
    const limits = getPlanLimits(planType);
    
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Backtests (Today/Total)</TableHead>
              <TableHead className="text-center">Paper Trading (Today/Total)</TableHead>
              <TableHead className="text-center">Live Executions</TableHead>
              <TableHead className="text-center">Reset By</TableHead>
              <TableHead>Valid Till</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filteredPlans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No users found on {planType} plan
                </TableCell>
              </TableRow>
            ) : (
              filteredPlans.map((plan) => (
                <TableRow key={plan.user_id}>
                  <TableCell className="text-sm max-w-[200px] truncate" title={plan.user_email || plan.user_id}>
                    {plan.user_email || plan.user_id}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(plan.status)}>{plan.status}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-medium">
                        {formatLimit(plan.backtests_used_today || 0, limits.backtests_daily_limit)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Monthly: {formatLimit(plan.backtests_used || 0, limits.backtests_monthly_limit)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-medium">
                        {formatLimit(plan.paper_trading_used_today || 0, limits.paper_trading_daily_limit)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Monthly: {formatLimit(plan.paper_trading_used || 0, limits.paper_trading_monthly_limit)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {formatLimit(plan.live_executions_used || 0, limits.live_executions_monthly_limit)}
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    12 AM Daily
                  </TableCell>
                  <TableCell className="text-sm">
                    {getValidTill(plan)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingPlan(plan);
                        setEditDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    );
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
              View user plan assignments and usage meters by plan type
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
            placeholder="Search by email or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            {PLAN_TABS.map((planType) => (
              <TabsTrigger key={planType} value={planType} className="flex items-center gap-2">
                {planType}
                <Badge variant="secondary" className="ml-1 text-xs">
                  {getFilteredPlans(planType).length}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {PLAN_TABS.map((planType) => (
            <TabsContent key={planType} value={planType} className="mt-4">
              {renderPlanTable(planType)}
            </TabsContent>
          ))}
        </Tabs>
        
        <UserPlanEditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          plan={editingPlan}
          onSuccess={fetchPlans}
        />
      </CardContent>
    </Card>
  );
};