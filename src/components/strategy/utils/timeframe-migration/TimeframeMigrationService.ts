import { TimeframeConfig } from '../../editors/action-node/types';
import { Expression, GroupCondition, Condition } from '../conditions/types';
import { formatTimeframeDisplay } from '../../editors/start-node/utils/timeframeUtils';

interface MigrationResult {
  migrated: boolean;
  warnings: string[];
  createdTimeframes: TimeframeConfig[];
}

export class TimeframeMigrationService {
  /**
   * Migrates a strategy from string-based timeframes to ID-based timeframes
   */
  static migrateStrategy(strategyData: any): MigrationResult {
    const result: MigrationResult = {
      migrated: false,
      warnings: [],
      createdTimeframes: []
    };

    // Find the start node
    const startNode = strategyData.nodes?.find((node: any) => node.type === 'startNode');
    if (!startNode) {
      result.warnings.push('No start node found');
      return result;
    }

    // Get existing timeframes from start node
    const existingTimeframes = this.getExistingTimeframes(startNode);
    
    // Collect all timeframe strings used in the strategy
    const usedTimeframes = this.collectUsedTimeframes(strategyData);
    
    // First, migrate timeframe definitions in start node to have UUIDs and new structure
    const migratedTimeframes = this.migrateTimeframeDefinitions(existingTimeframes, result);
    
    // Update start node with new timeframe definitions
    if (migratedTimeframes.length > 0) {
      this.updateStartNodeTimeframes(startNode, migratedTimeframes);
    }
    
    // Create mapping from old timeframe strings/IDs to new UUIDs
    const timeframeMapping = this.createTimeframeMapping(migratedTimeframes, usedTimeframes, result);
    
    // If we have mappings to apply, migrate the strategy
    if (Object.keys(timeframeMapping).length > 0) {
      this.migrateStrategyData(strategyData, timeframeMapping);
      result.migrated = true;
    }

    return result;
  }

  private static getExistingTimeframes(startNode: any): TimeframeConfig[] {
    const timeframes: TimeframeConfig[] = [];
    
    // Get timeframes from trading instrument
    if (startNode.data?.tradingInstrumentConfig?.timeframes) {
      timeframes.push(...startNode.data.tradingInstrumentConfig.timeframes);
    }
    
    // Get timeframes from supporting instrument
    if (startNode.data?.supportingInstrumentConfig?.timeframes) {
      timeframes.push(...startNode.data.supportingInstrumentConfig.timeframes);
    }
    
    return timeframes;
  }

  private static migrateTimeframeDefinitions(existingTimeframes: TimeframeConfig[], result: MigrationResult): TimeframeConfig[] {
    return existingTimeframes.map(tf => {
      // Check if timeframe has old structure (number + unit) instead of new structure (timeframe)
      const hasOldStructure = (tf as any).number !== undefined && (tf as any).unit !== undefined;
      
      if (hasOldStructure) {
        const oldTf = tf as any;
        const unitMap: Record<string, string> = {
          'minutes': 'm',
          'hours': 'h', 
          'day': 'd',
          'week': 'w'
        };
        
        const timeframeValue = `${oldTf.number}${unitMap[oldTf.unit]}`;
        const { unit, number } = TimeframeMigrationService.parseTimeframe(timeframeValue);
        const newTimeframe: TimeframeConfig = {
          id: tf.id.includes('tf_') ? tf.id : `tf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timeframe: timeframeValue,
          indicators: tf.indicators || {},
          unit,
          number
        };
        
        result.migrated = true;
        return newTimeframe;
      }
      
      return tf;
    });
  }

  private static updateStartNodeTimeframes(startNode: any, migratedTimeframes: TimeframeConfig[]) {
    const unitMap: Record<string, string> = { 'minutes': 'm', 'hours': 'h', 'day': 'd', 'week': 'w' };
    
    if (startNode.data?.tradingInstrumentConfig?.timeframes) {
      // Convert old structure timeframes to new structure
      startNode.data.tradingInstrumentConfig.timeframes = startNode.data.tradingInstrumentConfig.timeframes.map((existing: any) => {
        if (existing.timeframe) {
          // Already in new structure
          return existing;
        } else {
          // Convert from old structure (number + unit) to new structure (timeframe)
          const timeframeValue = `${existing.number}${unitMap[existing.unit]}`;
          const matchingMigrated = migratedTimeframes.find(tf => tf.timeframe === timeframeValue);
          return {
            id: matchingMigrated?.id || existing.id,
            timeframe: timeframeValue,
            indicators: existing.indicators || {}
          };
        }
      });
    }
    
    if (startNode.data?.supportingInstrumentConfig?.timeframes) {
      // Convert old structure timeframes to new structure
      startNode.data.supportingInstrumentConfig.timeframes = startNode.data.supportingInstrumentConfig.timeframes.map((existing: any) => {
        if (existing.timeframe) {
          // Already in new structure
          return existing;
        } else {
          // Convert from old structure (number + unit) to new structure (timeframe)
          const timeframeValue = `${existing.number}${unitMap[existing.unit]}`;
          const matchingMigrated = migratedTimeframes.find(tf => tf.timeframe === timeframeValue);
          return {
            id: matchingMigrated?.id || existing.id,
            timeframe: timeframeValue,
            indicators: existing.indicators || {}
          };
        }
      });
    }
  }

  private static collectUsedTimeframes(strategyData: any): Set<string> {
    const usedTimeframes = new Set<string>();
    
    // Recursively scan all nodes for timeframe references
    if (strategyData.nodes) {
      for (const node of strategyData.nodes) {
        this.scanNodeForTimeframes(node, usedTimeframes);
      }
    }
    
    return usedTimeframes;
  }

  private static scanNodeForTimeframes(node: any, usedTimeframes: Set<string>) {
    // Scan conditions
    if (node.data?.entryConditions) {
      this.scanConditionsForTimeframes(node.data.entryConditions, usedTimeframes);
    }
    if (node.data?.exitConditions) {
      this.scanConditionsForTimeframes(node.data.exitConditions, usedTimeframes);
    }
    
    // Scan any other expressions in node data
    this.scanObjectForTimeframes(node.data, usedTimeframes);
    
    // Special check for startNode timeframe
    if (node.type === 'startNode' && node.data?.timeframe && typeof node.data.timeframe === 'string') {
      usedTimeframes.add(node.data.timeframe);
    }
  }

  private static scanConditionsForTimeframes(conditions: GroupCondition | Condition, usedTimeframes: Set<string>) {
    if ('groupLogic' in conditions && conditions.conditions) {
      for (const condition of conditions.conditions) {
        this.scanConditionsForTimeframes(condition, usedTimeframes);
      }
    } else if ('lhs' in conditions && 'rhs' in conditions) {
      this.scanExpressionForTimeframes(conditions.lhs, usedTimeframes);
      this.scanExpressionForTimeframes(conditions.rhs, usedTimeframes);
    }
  }

  private static scanExpressionForTimeframes(expression: Expression, usedTimeframes: Set<string>) {
    if (!expression) return;
    
    // Check for old timeframe property
    if (typeof (expression as any).timeframe === 'string') {
      usedTimeframes.add((expression as any).timeframe);
    }
    
    // Check for timeframeId that is a string (not UUID) - needs migration
    if (typeof (expression as any).timeframeId === 'string') {
      const timeframeId = (expression as any).timeframeId;
      // If it looks like an old format (e.g., "5m", "1h"), add it for migration
      if (/^(\d+[mhd]|[A-Z0-9_-]{2,10})$/.test(timeframeId) && !timeframeId.includes('tf_')) {
        usedTimeframes.add(timeframeId);
      }
    }
    
    // Recursively scan nested expressions
    if (expression.type === 'expression' && (expression as any).expressions) {
      for (const expr of (expression as any).expressions) {
        this.scanExpressionForTimeframes(expr, usedTimeframes);
      }
    }
  }

  private static scanObjectForTimeframes(obj: any, usedTimeframes: Set<string>) {
    if (!obj || typeof obj !== 'object') return;
    
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'timeframe' && typeof value === 'string') {
        usedTimeframes.add(value);
      } else if (key === 'timeframeId' && typeof value === 'string') {
        // If it looks like an old format (e.g., "5m", "1h"), add it for migration
        if (/^(\d+[mhd]|[A-Z0-9_-]{2,10})$/.test(value) && !value.includes('tf_')) {
          usedTimeframes.add(value);
        }
      } else if (typeof value === 'object') {
        this.scanObjectForTimeframes(value, usedTimeframes);
      }
    }
  }

  private static createTimeframeMapping(
    existingTimeframes: TimeframeConfig[], 
    usedTimeframes: Set<string>,
    result: MigrationResult
  ): Record<string, string> {
    const mapping: Record<string, string> = {};
    
    for (const timeframeStr of usedTimeframes) {
      // Try to find existing timeframe that matches this string or old ID
      const matchingTimeframe = existingTimeframes.find(tf => {
        // Check if it matches the display format or timeframe value
        const displayFormat = formatTimeframeDisplay(tf);
        return displayFormat === timeframeStr || 
               tf.timeframe === timeframeStr ||
               tf.id === timeframeStr;
      });
      
      if (matchingTimeframe) {
        mapping[timeframeStr] = matchingTimeframe.id;
      } else {
        // Create new timeframe config for this string
        const newTimeframe = this.createTimeframeFromString(timeframeStr);
        if (newTimeframe) {
          mapping[timeframeStr] = newTimeframe.id;
          result.createdTimeframes.push(newTimeframe);
        } else {
          result.warnings.push(`Could not parse timeframe: ${timeframeStr}`);
        }
      }
    }
    
    return mapping;
  }

  private static createTimeframeFromString(timeframeStr: string): TimeframeConfig | null {
    // Parse timeframe strings like "1m", "5m", "1h", "1d", "1w"
    const match = timeframeStr.match(/^(\d+)([mhdw])$/);
    if (!match) return null;
    
    const { unit, number } = TimeframeMigrationService.parseTimeframe(timeframeStr);
    return {
      id: timeframeStr,
      timeframe: timeframeStr,
      indicators: {},
      unit,
      number
    };
  }

  private static migrateStrategyData(strategyData: any, timeframeMapping: Record<string, string>) {
    if (strategyData.nodes) {
      for (const node of strategyData.nodes) {
        this.migrateNodeData(node, timeframeMapping);
      }
    }
  }

  private static migrateNodeData(node: any, timeframeMapping: Record<string, string>) {
    // Migrate conditions
    if (node.data?.entryConditions) {
      this.migrateConditions(node.data.entryConditions, timeframeMapping);
    }
    if (node.data?.exitConditions) {
      this.migrateConditions(node.data.exitConditions, timeframeMapping);
    }
    
    // Migrate any other expressions in node data
    this.migrateObjectTimeframes(node.data, timeframeMapping);
  }

  private static migrateConditions(conditions: GroupCondition | Condition, timeframeMapping: Record<string, string>) {
    if ('groupLogic' in conditions && conditions.conditions) {
      for (const condition of conditions.conditions) {
        this.migrateConditions(condition, timeframeMapping);
      }
    } else if ('lhs' in conditions && 'rhs' in conditions) {
      this.migrateExpression(conditions.lhs, timeframeMapping);
      this.migrateExpression(conditions.rhs, timeframeMapping);
    }
  }

  private static migrateExpression(expression: Expression, timeframeMapping: Record<string, string>) {
    if (!expression) return;
    
    // Migrate timeframe property to timeframeId
    if (typeof (expression as any).timeframe === 'string') {
      const timeframeStr = (expression as any).timeframe;
      const timeframeId = timeframeMapping[timeframeStr];
      
      if (timeframeId) {
        (expression as any).timeframeId = timeframeId;
        delete (expression as any).timeframe;
      }
    }
    
    // Migrate timeframeId that needs updating
    if (typeof (expression as any).timeframeId === 'string') {
      const currentTimeframeId = (expression as any).timeframeId;
      const newTimeframeId = timeframeMapping[currentTimeframeId];
      
      if (newTimeframeId) {
        (expression as any).timeframeId = newTimeframeId;
      }
    }
    
    // Recursively migrate nested expressions
    if (expression.type === 'expression' && (expression as any).expressions) {
      for (const expr of (expression as any).expressions) {
        this.migrateExpression(expr, timeframeMapping);
      }
    }
  }

  private static parseTimeframe(timeframe: string): { unit: string; number: number } {
    const match = timeframe.match(/^(\d+)([mhd])$/);
    if (!match) {
      return { unit: 'minutes', number: 1 };
    }
    
    const [, numberStr, unitChar] = match;
    const number = parseInt(numberStr, 10);
    
    const unitMap: Record<string, string> = {
      'm': 'minutes',
      'h': 'hours', 
      'd': 'days',
      'w': 'weeks'
    };
    
    return {
      unit: unitMap[unitChar] || 'minutes',
      number
    };
  }

  private static migrateObjectTimeframes(obj: any, timeframeMapping: Record<string, string>) {
    if (!obj || typeof obj !== 'object') return;
    
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'timeframe' && typeof value === 'string') {
        const timeframeId = timeframeMapping[value];
        if (timeframeId) {
          obj.timeframeId = timeframeId;
          delete obj.timeframe;
        }
      } else if (key === 'timeframeId' && typeof value === 'string') {
        const newTimeframeId = timeframeMapping[value];
        if (newTimeframeId) {
          obj.timeframeId = newTimeframeId;
        }
      } else if (typeof value === 'object') {
        this.migrateObjectTimeframes(value, timeframeMapping);
      }
    }
  }
}
