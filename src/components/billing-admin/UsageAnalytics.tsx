import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { tradelayoutClient } from '@/lib/supabase/tradelayout-client';
import { 
  BarChart3, 
  RefreshCw, 
  TrendingUp,
  Users,
  Zap,
  TestTube
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UsageStats {
  totalUsers: number;
  activeUsers: number;
  totalBacktests: number;
  totalLiveExecutions: number;
  totalPaperTrades: number;
  planBreakdown: Record<string, number>;
}

export const UsageAnalytics: React.FC = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await tradelayoutClient
        .from('user_plans' as any)
        .select('plan, status, backtests_used, live_executions_used, paper_trading_used');
      
      if (error) throw error;
      
      const plans = data || [];
      
      const planBreakdown: Record<string, number> = {};
      let totalBacktests = 0;
      let totalLiveExecutions = 0;
      let totalPaperTrades = 0;
      let activeUsers = 0;
      
      plans.forEach((p: any) => {
        planBreakdown[p.plan] = (planBreakdown[p.plan] || 0) + 1;
        totalBacktests += p.backtests_used || 0;
        totalLiveExecutions += p.live_executions_used || 0;
        totalPaperTrades += p.paper_trading_used || 0;
        if (p.status === 'active') activeUsers++;
      });
      
      setStats({
        totalUsers: plans.length,
        activeUsers,
        totalBacktests,
        totalLiveExecutions,
        totalPaperTrades,
        planBreakdown
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch usage stats',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);
  
  if (loading || !stats) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUsers} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Backtests</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBacktests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Executions</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLiveExecutions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paper Trades</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPaperTrades.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Plan Breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Plan Distribution
              </CardTitle>
              <CardDescription>
                User breakdown by plan type
              </CardDescription>
            </div>
            <Button onClick={fetchStats} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(stats.planBreakdown).map(([plan, count]) => {
              const percentage = Math.round((count / stats.totalUsers) * 100);
              return (
                <div key={plan} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{plan}</span>
                    <span className="text-muted-foreground">{count} users ({percentage}%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
