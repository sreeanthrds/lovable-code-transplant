import { useState, useEffect, useCallback } from 'react';
import type { BillingSummary, PaymentRecord, PlanInfo, UsageQuotas, AddOns } from '@/types/billing';

const API_BASE = 'http://localhost:8000/api/v1/billing';

// Mock data for development when backend is unavailable
const mockPlanInfo: PlanInfo = {
  plan: 'PRO',
  plan_code: 'PRO_MONTHLY',
  expires: Date.now() / 1000 + 30 * 24 * 60 * 60,
  expires_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  renews_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  status: 'active'
};

const mockUsage: UsageQuotas = {
  backtests: {
    daily_used: 1,
    daily_limit: 2,
    monthly_used: 78,
    monthly_limit: 100,
    addons_remaining: 30,
    resets_in_days: 12
  },
  live_executions: {
    monthly_used: 40,
    monthly_limit: 50,
    addons_remaining: 15,
    resets_in_days: 12
  },
  paper_trading: {
    daily_used: 1,
    daily_limit: 2,
    resets_at: '12:00 AM'
  }
};

const mockAddOns: AddOns = {
  backtests: 30,
  live_executions: 15,
  referral_bonus: {
    backtests: 10
  }
};

const mockPayments: PaymentRecord[] = [
  {
    payment_id: 'pay_NxGr1234567890',
    order_id: 'order_NxGr0987654321',
    amount: 299900,
    status: 'captured',
    date: '2025-01-01',
    description: 'PRO Monthly Subscription'
  },
  {
    payment_id: 'pay_NxGr1234567891',
    order_id: 'order_NxGr0987654322',
    amount: 50000,
    status: 'captured',
    date: '2024-12-15',
    description: 'Add-on Pack'
  }
];

export const useBilling = () => {
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBillingData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to fetch from real API first
      const [planRes, summaryRes, paymentsRes] = await Promise.allSettled([
        fetch(`${API_BASE}/plan`),
        fetch(`${API_BASE}/summary`),
        fetch(`${API_BASE}/payments`)
      ]);

      let planData: PlanInfo = mockPlanInfo;
      let usageData: UsageQuotas = mockUsage;
      let addonsData: AddOns = mockAddOns;
      let paymentsData: PaymentRecord[] = mockPayments;

      // Parse plan data
      if (planRes.status === 'fulfilled' && planRes.value.ok) {
        const data = await planRes.value.json();
        planData = {
          plan: data.plan || 'FREE',
          plan_code: data.plan_code || 'FREE',
          expires: data.expires,
          expires_date: data.expires_date,
          renews_at: data.expires_date,
          status: data.expires && data.expires * 1000 > Date.now() ? 'active' : 'expired'
        };
      }

      // Parse summary data (includes usage)
      if (summaryRes.status === 'fulfilled' && summaryRes.value.ok) {
        const data = await summaryRes.value.json();
        if (data.usage) {
          usageData = data.usage;
        }
        if (data.addons) {
          addonsData = data.addons;
        }
      }

      // Parse payments data
      if (paymentsRes.status === 'fulfilled' && paymentsRes.value.ok) {
        const data = await paymentsRes.value.json();
        paymentsData = data.payments || [];
      }

      setSummary({
        plan: planData,
        usage: usageData,
        addons: addonsData
      });
      setPayments(paymentsData);
    } catch (err) {
      console.error('Billing fetch error:', err);
      // Fallback to mock data on error
      setSummary({
        plan: mockPlanInfo,
        usage: mockUsage,
        addons: mockAddOns
      });
      setPayments(mockPayments);
      setError('Using demo data - backend unavailable');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBillingData();
  }, [fetchBillingData]);

  const refresh = useCallback(() => {
    fetchBillingData();
  }, [fetchBillingData]);

  return {
    summary,
    payments,
    loading,
    error,
    refresh
  };
};
