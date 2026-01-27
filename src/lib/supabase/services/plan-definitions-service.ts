import { tradelayoutClient as supabase, getAuthenticatedTradelayoutClient } from '@/lib/supabase/tradelayout-client';
import type { PlanDefinition, CreatePlanInput, UpdatePlanInput } from '@/types/plan-definitions';

// Note: Table "plan_definitions" needs to be created via migration
// Using 'any' cast since the table is not yet in the generated types

export const planDefinitionsService = {
  /**
   * Fetch all plan definitions
   */
  async getAllPlans(): Promise<PlanDefinition[]> {
    try {
      console.log('📋 Fetching all plan definitions...');
      
      const { data, error } = await (supabase as any)
        .from('plan_definitions')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        // If table doesn't exist, return empty array (fallback to PLAN_CONFIGS)
        if (error.code === '42P01') {
          console.warn('⚠️ plan_definitions table does not exist. Using fallback.');
          return [];
        }
        console.error('❌ Error fetching plan definitions:', error);
        throw error;
      }

      console.log('✅ Fetched plan definitions:', data?.length || 0);
      return (data as PlanDefinition[]) || [];
    } catch (error) {
      console.error('💥 Plan definitions service error:', error);
      return [];
    }
  },

  /**
   * Fetch active plans (for public display)
   */
  async getActivePlans(): Promise<PlanDefinition[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('plan_definitions')
        .select('*')
        .eq('is_active', true)
        .eq('is_public', true)
        .order('sort_order', { ascending: true });

      if (error) {
        if (error.code === '42P01') {
          return [];
        }
        throw error;
      }

      return (data as PlanDefinition[]) || [];
    } catch (error) {
      console.error('💥 Error fetching active plans:', error);
      return [];
    }
  },

  /**
   * Fetch a single plan by code
   */
  async getPlanByCode(code: string): Promise<PlanDefinition | null> {
    try {
      console.log('🔍 Fetching plan by code:', code);
      
      const { data, error } = await (supabase as any)
        .from('plan_definitions')
        .select('*')
        .eq('code', code.toUpperCase())
        .maybeSingle();

      if (error) {
        if (error.code === '42P01') {
          return null;
        }
        console.error('❌ Error fetching plan by code:', error);
        throw error;
      }

      return data as PlanDefinition | null;
    } catch (error) {
      console.error('💥 Error fetching plan by code:', error);
      return null;
    }
  },

  /**
   * Fetch a single plan by ID
   */
  async getPlanById(id: string): Promise<PlanDefinition | null> {
    try {
      const { data, error } = await (supabase as any)
        .from('plan_definitions')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        if (error.code === '42P01') {
          return null;
        }
        throw error;
      }

      return data as PlanDefinition | null;
    } catch (error) {
      console.error('💥 Error fetching plan by ID:', error);
      return null;
    }
  },

  /**
   * Create a new plan definition
   */
  async createPlan(input: CreatePlanInput, adminId?: string): Promise<PlanDefinition> {
    try {
      console.log('➕ Creating new plan:', input.code);
      
      const planData = {
        ...input,
        code: input.code.toUpperCase(),
        created_by: adminId || null,
        updated_by: adminId || null,
      };

      const { data, error } = await (supabase as any)
        .from('plan_definitions')
        .insert(planData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating plan:', error);
        throw error;
      }

      console.log('✅ Plan created successfully:', data.id);
      return data as PlanDefinition;
    } catch (error) {
      console.error('💥 Error creating plan:', error);
      throw error;
    }
  },

  /**
   * Update an existing plan definition
   */
  async updatePlan(id: string, input: UpdatePlanInput, adminId?: string): Promise<PlanDefinition> {
    try {
      console.log('✏️ Updating plan:', id);
      
      // Use authenticated client for write operations
      const authClient = await getAuthenticatedTradelayoutClient();
      
      const updateData: Record<string, any> = {
        ...input,
        updated_at: new Date().toISOString(),
      };

      // Remove undefined values and excluded fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });
      // Remove created_by/updated_by to avoid UUID type mismatch with Clerk string IDs
      delete updateData.created_by;
      delete updateData.updated_by;

      const { data, error } = await (authClient as any)
        .from('plan_definitions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating plan:', error);
        throw error;
      }

      console.log('✅ Plan updated successfully:', data.id);
      return data as PlanDefinition;
    } catch (error) {
      console.error('💥 Error updating plan:', error);
      throw error;
    }
  },

  /**
   * Delete a plan definition (soft delete by setting is_active = false)
   */
  async archivePlan(id: string, adminId?: string): Promise<void> {
    try {
      console.log('📦 Archiving plan:', id);
      
      const { error } = await (supabase as any)
        .from('plan_definitions')
        .update({ 
          is_active: false, 
          updated_by: adminId || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        console.error('❌ Error archiving plan:', error);
        throw error;
      }

      console.log('✅ Plan archived successfully');
    } catch (error) {
      console.error('💥 Error archiving plan:', error);
      throw error;
    }
  },

  /**
   * Hard delete a plan definition (admin only, use with caution)
   */
  async deletePlan(id: string): Promise<void> {
    try {
      console.log('🗑️ Deleting plan:', id);
      
      const { error } = await (supabase as any)
        .from('plan_definitions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting plan:', error);
        throw error;
      }

      console.log('✅ Plan deleted successfully');
    } catch (error) {
      console.error('💥 Error deleting plan:', error);
      throw error;
    }
  },

  /**
   * Duplicate an existing plan with a new code
   */
  async duplicatePlan(id: string, newCode: string, adminId?: string): Promise<PlanDefinition> {
    try {
      console.log('📋 Duplicating plan:', id, '→', newCode);
      
      // Fetch the original plan
      const original = await this.getPlanById(id);
      if (!original) {
        throw new Error('Original plan not found');
      }

      // Create new plan with modified values
      const newPlan: CreatePlanInput = {
        code: newCode.toUpperCase(),
        name: `${original.name} (Copy)`,
        description: original.description,
        tier_level: original.tier_level,
        is_active: false, // Start as inactive
        is_public: false,
        
        duration_type: original.duration_type,
        duration_days: original.duration_days,
        trial_days: original.trial_days,
        grace_period_days: original.grace_period_days,
        
        backtests_daily_limit: original.backtests_daily_limit,
        backtests_monthly_limit: original.backtests_monthly_limit,
        backtests_total_limit: original.backtests_total_limit,
        
        live_executions_monthly_limit: original.live_executions_monthly_limit,
        
        paper_trading_daily_limit: original.paper_trading_daily_limit,
        paper_trading_monthly_limit: original.paper_trading_monthly_limit,
        
        reset_type: original.reset_type,
        daily_reset_hour: original.daily_reset_hour,
        reset_timezone: original.reset_timezone,
        
        price_monthly: original.price_monthly,
        price_yearly: original.price_yearly,
        currency: original.currency,
        discount_percentage: original.discount_percentage,
        
        can_buy_addons: original.can_buy_addons,
        feature_flags: original.feature_flags,
        ui_color: original.ui_color,
        ui_icon: original.ui_icon,
        
        sort_order: original.sort_order + 1,
      };

      return await this.createPlan(newPlan, adminId);
    } catch (error) {
      console.error('💥 Error duplicating plan:', error);
      throw error;
    }
  },

  /**
   * Check if a plan code already exists
   */
  async codeExists(code: string): Promise<boolean> {
    try {
      const { count, error } = await (supabase as any)
        .from('plan_definitions')
        .select('*', { count: 'exact', head: true })
        .eq('code', code.toUpperCase());

      if (error) {
        if (error.code === '42P01') {
          return false;
        }
        throw error;
      }

      return (count || 0) > 0;
    } catch (error) {
      console.error('💥 Error checking code existence:', error);
      return false;
    }
  },

  /**
   * Reorder plans by updating sort_order
   */
  async reorderPlans(orderedIds: string[]): Promise<void> {
    try {
      console.log('🔄 Reordering plans...');
      
      const updates = orderedIds.map((id, index) => ({
        id,
        sort_order: index,
        updated_at: new Date().toISOString(),
      }));

      for (const update of updates) {
        const { error } = await (supabase as any)
          .from('plan_definitions')
          .update({ sort_order: update.sort_order, updated_at: update.updated_at })
          .eq('id', update.id);

        if (error) {
          console.error('❌ Error reordering plan:', update.id, error);
          throw error;
        }
      }

      console.log('✅ Plans reordered successfully');
    } catch (error) {
      console.error('💥 Error reordering plans:', error);
      throw error;
    }
  },
};
