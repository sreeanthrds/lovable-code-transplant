import { useState, useEffect } from 'react';
import { tradelayoutClient } from '@/lib/supabase/tradelayout-client';
import { useAppAuth } from '@/contexts/AuthContext';

interface PlanData {
  plan: string;
  plan_code: string;
  expires?: number | null;
  expires_date?: string | null;
}

interface UserPlanRow {
  plan: string;
  status: string;
  expires_at: string | null;
}

export const usePlan = () => {
  const { userId } = useAppAuth();
  const [planData, setPlanData] = useState<PlanData>({
    plan: 'FREE',
    plan_code: 'FREE',
    expires: null,
    expires_date: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchPlan();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const fetchPlan = async () => {
    if (!userId) return;
    
    console.log('🔍 usePlan: Fetching plan from Supabase for user:', userId);
    try {
      // Use TradeLayout client for user_plans table
      const { data, error } = await tradelayoutClient
        .from('user_plans' as any)
        .select('plan, status, expires_at')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('🔍 usePlan: Supabase error:', error);
        return;
      }

      const planRow = data as unknown as UserPlanRow | null;
      
      if (planRow) {
        console.log('🔍 usePlan: Plan data received:', planRow);
        const expiresDate = planRow.expires_at ? new Date(planRow.expires_at).toLocaleDateString() : null;
        setPlanData({
          plan: planRow.plan || 'FREE',
          plan_code: planRow.plan || 'FREE',
          expires: planRow.expires_at ? new Date(planRow.expires_at).getTime() / 1000 : null,
          expires_date: expiresDate
        });
      } else {
        console.log('🔍 usePlan: No active plan found, defaulting to FREE');
      }
    } catch (error) {
      console.error('🔍 usePlan: Failed to fetch plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshPlan = () => {
    setLoading(true);
    fetchPlan();
  };

  return { planData, loading, refreshPlan };
};
