import { getAuthenticatedTradelayoutClient } from '@/lib/supabase/tradelayout-client';

export interface QueueData {
  user_id: string;
  strategy_id: string;
  broker_connection_id: string;
  scale: number;
  is_active: number;
  status: string;
}

export const queueService = {
  async addToQueue(strategyId: string, userId: string, brokerConnectionId?: string, scale: number = 1) {
    try {
      console.log('🎯 Queue service - adding strategy to queue:', {
        strategyId: strategyId,
        userId: userId,
        brokerConnectionId: brokerConnectionId || 'dummy-broker-connection',
        scale: scale
      });

      const queueRecord = {
        user_id: userId,
        strategy_id: strategyId,
        broker_connection_id: brokerConnectionId ? brokerConnectionId : 'dummy-broker-connection',
        scale: scale,
        is_active: 1,
        status: 'pending'
      };

      console.log('📡 Attempting upsert to Supabase:', JSON.stringify(queueRecord, null, 2));

      const client = await getAuthenticatedTradelayoutClient();
      
      const { data, error } = await (client as any)
        .from('multi_strategy_queue')
        .upsert(queueRecord, {
          onConflict: 'strategy_id,user_id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      console.log('🔍 Upsert result:', { data, error });

      if (error) {
        console.error('❌ Supabase queue insert error:', error);
        throw error;
      }

      console.log('✅ Successfully added to queue:', data);
      return data;
    } catch (error) {
      console.error('💥 Queue service add error:', error);
      throw error;
    }
  },

  async removeFromQueue(strategyId: string, userId: string) {
    try {
      console.log('🎯 Queue service - removing strategy from queue:', {
        strategyId: strategyId,
        userId: userId
      });

      const client = await getAuthenticatedTradelayoutClient();
      const { data, error } = await (client as any)
        .from('multi_strategy_queue')
        .update({ is_active: 0, status: 'inactive' })
        .eq('strategy_id', strategyId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase queue remove error:', error);
        throw error;
      }

      console.log('✅ Successfully removed from queue:', data);
      return data;
    } catch (error) {
      console.error('💥 Queue service remove error:', error);
      throw error;
    }
  },

  async getQueuedStrategies(userId: string) {
    try {
      console.log('🔍 Queue service - loading queued strategies:', { userId });

      const client = await getAuthenticatedTradelayoutClient();
      const { data, error } = await (client as any)
        .from('multi_strategy_queue')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', 1);

      if (error) {
        console.error('❌ Supabase queue load error:', error);
        throw error;
      }

      console.log('✅ Successfully loaded queued strategies:', data);
      return data || [];
    } catch (error) {
      console.error('💥 Queue service load error:', error);
      throw error;
    }
  }
};
