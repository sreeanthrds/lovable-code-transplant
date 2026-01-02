import { tradelayoutClient as supabase } from '@/lib/supabase/tradelayout-client';
import { strategyService } from './services/strategy-service';
import { versionHistoryService } from './services/version-history-service';

// Re-export for compatibility
export { supabase, strategyService, versionHistoryService };
