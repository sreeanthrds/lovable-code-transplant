import { TimeframeConfig } from '../../editors/action-node/types';
import { formatTimeframeDisplay } from '../../editors/start-node/utils/timeframeUtils';

export class TimeframeResolver {
  private static timeframeCache = new Map<string, TimeframeConfig>();
  
  /**
   * Initialize the resolver with available timeframes from start node
   */
  static initialize(timeframes: TimeframeConfig[]) {
    this.timeframeCache.clear();
    console.log('🔄 TimeframeResolver: Initializing with timeframes:', timeframes);
    timeframes.forEach(tf => {
      this.timeframeCache.set(tf.id, tf);
      console.log('📝 TimeframeResolver: Added to cache:', { id: tf.id, timeframe: tf.timeframe });
    });
    console.log('✅ TimeframeResolver: Cache initialized with', this.timeframeCache.size, 'timeframes');
  }
  
  /**
   * Resolve a timeframe ID to its display value (e.g., "1m", "5m")
   */
  static getDisplayValue(timeframeId: string): string {
    // First check cache for exact match
    const timeframe = this.timeframeCache.get(timeframeId);
    if (timeframe) {
      return formatTimeframeDisplay(timeframe);
    }
    
    // Fallback for backward compatibility - if timeframeId looks like a display value, return it
    if (typeof timeframeId === 'string' && /^(\d+)([mhd])$/.test(timeframeId)) {
      return timeframeId;
    }
    
    // Handle tf_ prefixed IDs - search cache by ID (don't parse the ID, as it may not match the actual timeframe)
    if (typeof timeframeId === 'string' && timeframeId.startsWith('tf_')) {
      // Search for matching entry in cache by ID
      for (const [cachedId, cachedTimeframe] of this.timeframeCache.entries()) {
        if (cachedId === timeframeId) {
          return formatTimeframeDisplay(cachedTimeframe);
        }
      }
      
      // If not found in cache, try partial ID match (for IDs like "tf_1m_default" matching "tf_1m_default_xyz")
      for (const [cachedId, cachedTimeframe] of this.timeframeCache.entries()) {
        if (timeframeId.startsWith(cachedId) || cachedId.startsWith(timeframeId)) {
          return formatTimeframeDisplay(cachedTimeframe);
        }
      }
    }
    
    console.warn('⚠️ TimeframeResolver: No timeframe found for ID:', timeframeId, 'Cache entries:', Array.from(this.timeframeCache.keys()));
    return timeframeId || 'Unknown';
  }
  
  /**
   * Resolve a timeframe ID to the full TimeframeConfig object
   */
  static getTimeframeConfig(timeframeId: string): TimeframeConfig | null {
    return this.timeframeCache.get(timeframeId) || null;
  }
  
  /**
   * Get all available timeframes
   */
  static getAllTimeframes(): TimeframeConfig[] {
    return Array.from(this.timeframeCache.values());
  }
  
  /**
   * Check if a timeframe ID exists
   */
  static exists(timeframeId: string): boolean {
    return this.timeframeCache.has(timeframeId);
  }
  
  /**
   * Resolve timeframe for backward compatibility
   * Handles both old string values and new ID values
   */
  static resolveTimeframe(timeframeValue: string): string {
    // If it's already a valid timeframe ID, return display value
    if (this.exists(timeframeValue)) {
      return this.getDisplayValue(timeframeValue);
    }
    
    // If it looks like a display value (1m, 5m, etc.), return as-is
    if (/^(\d+)([mhd])$/.test(timeframeValue)) {
      return timeframeValue;
    }
    
    return timeframeValue || 'Unknown';
  }
}