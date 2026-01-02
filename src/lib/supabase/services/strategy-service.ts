import { tradelayoutClient as supabase } from '@/lib/supabase/tradelayout-client';

export interface StrategyData {
  id: string;
  name: string;
  description?: string;
  nodes: any[];
  edges: any[];
  created: string;
  lastModified: string;
}

export const strategyService = {
  async saveStrategy(strategyData: StrategyData, userId: string) {
    try {
      console.log('🎯 Strategy service - saving strategy:', {
        id: strategyData.id,
        name: strategyData.name,
        userId: userId,
        nodeCount: strategyData.nodes?.length || 0,
        edgeCount: strategyData.edges?.length || 0
      });

      const strategyRecord = {
        id: strategyData.id,
        user_id: userId,
        name: strategyData.name,
        description: strategyData.description || 'Trading strategy created with TradeLayout',
        strategy: {
          nodes: strategyData.nodes || [],
          edges: strategyData.edges || [],
          metadata: {
            created: strategyData.created,
            lastModified: strategyData.lastModified
          }
        }
      };

      console.log('📡 Attempting upsert to Supabase:', JSON.stringify(strategyRecord, null, 2));

      const { data, error } = await supabase
        .from('strategies')
        .upsert(strategyRecord, {
          onConflict: 'id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase save error:', error);
        throw error;
      }

      console.log('✅ Successfully saved to Supabase:', data);
      return data;
    } catch (error) {
      console.error('💥 Strategy service save error:', error);
      throw error;
    }
  },

  async getStrategyById(strategyId: string, userId: string) {
    try {
      console.log('🔍 Strategy service - loading strategy:', { strategyId, userId });

      const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .eq('id', strategyId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ Supabase load error:', error);
        throw error;
      }

      if (!data) {
        console.log('❌ No strategy found for ID:', strategyId);
        return null;
      }

      console.log('✅ Successfully loaded from Supabase:', {
        id: data.id,
        name: data.name,
        hasStrategy: !!data.strategy
      });

      return data;
    } catch (error) {
      console.error('💥 Strategy service load error:', error);
      return null;
    }
  },

  async getStrategies(userId: string) {
    try {
      console.log('📚 Strategy service - loading all strategies for user:', userId);
      console.log('📚 User ID type:', typeof userId, 'length:', userId?.length);

      const { data, error, count } = await supabase
        .from('strategies')
        .select('id, name, description, created_at, updated_at, user_id', { count: 'exact' })
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('❌ Supabase load all error:', error);
        throw error;
      }

      console.log('✅ Successfully loaded all strategies:', {
        count: data?.length || 0,
        totalInDb: count,
        strategies: data?.map(s => ({ id: s.id, name: s.name, user_id: s.user_id }))
      });
      return data || [];
    } catch (error) {
      console.error('💥 Strategy service load all error:', error);
      return [];
    }
  },

  async deleteStrategy(strategyId: string, userId: string) {
    try {
      console.log('🗑️ Strategy service - deleting strategy:', { strategyId, userId });

      const { error } = await supabase
        .from('strategies')
        .delete()
        .eq('id', strategyId)
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Supabase delete error:', error);
        throw error;
      }

      console.log('✅ Successfully deleted from Supabase');
      return true;
    } catch (error) {
      console.error('💥 Strategy service delete error:', error);
      return false;
    }
  }
};