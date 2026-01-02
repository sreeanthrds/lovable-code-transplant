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
    const timeframe = this.timeframeCache.get(timeframeId);
    if (timeframe) {
      return formatTimeframeDisplay(timeframe);
    }
    
    // Fallback for backward compatibility - if timeframeId looks like a display value, return it
    if (typeof timeframeId === 'string' && /^(\d+)([mhd])$/.test(timeframeId)) {
      return timeframeId;
    }
    
    console.warn('⚠️ TimeframeResolver: No timeframe found for ID:', timeframeId, 'Cache size:', this.timeframeCache.size);
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