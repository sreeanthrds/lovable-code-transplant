import { useState, useEffect } from 'react';

interface PlanData {
  plan: string;
  plan_code: string;
  expires?: number;
  expires_date?: string;
}

export const usePlan = () => {
  const [planData, setPlanData] = useState<PlanData>({
    plan: 'FREE',
    plan_code: 'FREE',
    expires: null,
    expires_date: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlan();
  }, []);

  const fetchPlan = async () => {
    console.log('🔍 usePlan: Starting fetchPlan...');
    try {
      const response = await fetch('http://localhost:8000/api/v1/billing/plan');
      console.log('🔍 usePlan: Response status:', response.status);
      const data = await response.json();
      console.log('🔍 usePlan: Plan data received:', data);
      setPlanData(data);
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
