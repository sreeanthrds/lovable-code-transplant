import { useState, useEffect, useCallback } from 'react';
import { planDefinitionsService } from '@/lib/supabase/services/plan-definitions-service';
import { PLAN_CONFIGS } from '@/types/billing';
import type { 
  PlanDefinition, 
  CreatePlanInput, 
  UpdatePlanInput,
  DEFAULT_FREE_PLAN 
} from '@/types/plan-definitions';
import { useAppAuth } from '@/contexts/AuthContext';

interface UsePlanDefinitions {
  plans: PlanDefinition[];
  loading: boolean;
  error: Error | null;
  createPlan: (data: CreatePlanInput) => Promise<PlanDefinition>;
  updatePlan: (id: string, data: UpdatePlanInput) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
  archivePlan: (id: string) => Promise<void>;
  duplicatePlan: (id: string, newCode: string) => Promise<PlanDefinition>;
  getPlanByCode: (code: string) => PlanDefinition | undefined;
  getPlanById: (id: string) => PlanDefinition | undefined;
  refreshPlans: () => Promise<void>;
  isUsingFallback: boolean;
}

// Convert hardcoded PLAN_CONFIGS to PlanDefinition format for fallback
function convertPlanConfigsToDefinitions(): PlanDefinition[] {
  const now = new Date().toISOString();
  
  return Object.entries(PLAN_CONFIGS).map(([code, config], index) => ({
    id: `fallback-${code.toLowerCase()}`,
    code,
    name: config.name,
    description: null,
    tier_level: index,
    is_active: true,
    is_public: true,
    
    duration_type: 'subscription' as const,
    duration_days: config.duration_months ? config.duration_months * 30 : null,
    trial_days: 0,
    grace_period_days: 0,
    
    backtests_daily_limit: config.backtests_daily_limit,
    backtests_monthly_limit: config.backtests_monthly_limit,
    backtests_total_limit: -1,
    
    live_executions_monthly_limit: config.live_executions_limit,
    
    paper_trading_daily_limit: config.paper_trading_daily_limit,
    paper_trading_monthly_limit: config.paper_trading_monthly_limit,
    
    reset_type: 'calendar' as const,
    daily_reset_hour: 0,
    reset_timezone: 'Asia/Kolkata',
    
    price_monthly: config.price_monthly,
    price_yearly: config.price_yearly,
    currency: 'INR',
    discount_percentage: 0,
    
    can_buy_addons: config.can_buy_addons,
    feature_flags: {},
    ui_color: config.color,
    ui_icon: null,
    
    sort_order: index,
    created_at: now,
    updated_at: now,
    created_by: null,
    updated_by: null,
  }));
}

export function usePlanDefinitions(): UsePlanDefinitions {
  const [plans, setPlans] = useState<PlanDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const { user } = useAppAuth();

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await planDefinitionsService.getAllPlans();
      
      if (data.length === 0) {
        // Fallback to hardcoded PLAN_CONFIGS
        console.log('📋 Using fallback PLAN_CONFIGS');
        setPlans(convertPlanConfigsToDefinitions());
        setIsUsingFallback(true);
      } else {
        setPlans(data);
        setIsUsingFallback(false);
      }
    } catch (err) {
      console.error('Error fetching plan definitions:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch plans'));
      // Fallback on error
      setPlans(convertPlanConfigsToDefinitions());
      setIsUsingFallback(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const createPlan = useCallback(async (data: CreatePlanInput): Promise<PlanDefinition> => {
    const result = await planDefinitionsService.createPlan(data, user?.id);
    await fetchPlans(); // Refresh the list
    return result;
  }, [user?.id, fetchPlans]);

  const updatePlan = useCallback(async (id: string, data: UpdatePlanInput): Promise<void> => {
    await planDefinitionsService.updatePlan(id, data, user?.id);
    await fetchPlans();
  }, [user?.id, fetchPlans]);

  const deletePlan = useCallback(async (id: string): Promise<void> => {
    await planDefinitionsService.deletePlan(id);
    await fetchPlans();
  }, [fetchPlans]);

  const archivePlan = useCallback(async (id: string): Promise<void> => {
    await planDefinitionsService.archivePlan(id, user?.id);
    await fetchPlans();
  }, [user?.id, fetchPlans]);

  const duplicatePlan = useCallback(async (id: string, newCode: string): Promise<PlanDefinition> => {
    const result = await planDefinitionsService.duplicatePlan(id, newCode, user?.id);
    await fetchPlans();
    return result;
  }, [user?.id, fetchPlans]);

  const getPlanByCode = useCallback((code: string): PlanDefinition | undefined => {
    return plans.find(p => p.code.toUpperCase() === code.toUpperCase());
  }, [plans]);

  const getPlanById = useCallback((id: string): PlanDefinition | undefined => {
    return plans.find(p => p.id === id);
  }, [plans]);

  return {
    plans,
    loading,
    error,
    createPlan,
    updatePlan,
    deletePlan,
    archivePlan,
    duplicatePlan,
    getPlanByCode,
    getPlanById,
    refreshPlans: fetchPlans,
    isUsingFallback,
  };
}

// Hook for public pricing page - only returns active, public plans
export function usePublicPlans() {
  const [plans, setPlans] = useState<PlanDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivePlans() {
      try {
        const data = await planDefinitionsService.getActivePlans();
        
        if (data.length === 0) {
          // Fallback to hardcoded configs
          setPlans(convertPlanConfigsToDefinitions().filter(p => p.is_public));
        } else {
          setPlans(data);
        }
      } catch (error) {
        console.error('Error fetching active plans:', error);
        setPlans(convertPlanConfigsToDefinitions().filter(p => p.is_public));
      } finally {
        setLoading(false);
      }
    }

    fetchActivePlans();
  }, []);

  return { plans, loading };
}
