
import { useReactFlow } from '@xyflow/react';
import { useCallback, useMemo, useRef } from 'react';
import { handleError } from '../../../utils/errorHandling';
import { findIndicatorUsages } from '../../../utils/dependency-tracking/usageFinder';
import { UsageReference } from '../../../utils/dependency-tracking/types';

/**
 * Hook to find indicator usages with superior memoization and caching
 */
export const useIndicatorUsage = () => {
  const { getNodes } = useReactFlow();
  const cacheRef = useRef<Map<string, {timestamp: number, usages: UsageReference[]}>>(new Map());
  const lastUpdateTimeRef = useRef<number>(Date.now());
  const nodesRef = useRef<any[]>([]);
  const nodeHashRef = useRef<string>('');
  const updateIntervalMs = 5000; // Only update cache every 5 seconds
  
  // Calculate a simple hash of nodes to detect real changes
  const getNodesHash = (nodes: any[]): string => {
    if (!nodes?.length) return '';
    return `${nodes.length}-${nodes[0]?.id ?? ''}-${nodes[nodes.length-1]?.id ?? ''}`;
  };
  
  // Get nodes only once per render and cache them with hash verification
  const nodes = useMemo(() => {
    try {
      const now = Date.now();
      
      // Only fetch new nodes if enough time has elapsed
      if (now - lastUpdateTimeRef.current > updateIntervalMs) {
        const freshNodes = getNodes();
        const newHash = getNodesHash(freshNodes);
        
        // Only update nodes reference if they've actually changed
        if (newHash !== nodeHashRef.current) {
          nodesRef.current = freshNodes;
          nodeHashRef.current = newHash;
          
          // Clear cache when nodes change meaningfully
          cacheRef.current.clear();
        }
        
        lastUpdateTimeRef.current = now;
        return freshNodes;
      }
      
      return nodesRef.current;
    } catch (error) {
      handleError(error, 'useIndicatorUsage.getNodes');
      return [];
    }
  }, [getNodes]);
  
  // Optimized version with TTL-based caching and memoization
  const findUsages = useCallback((indicatorName: string): UsageReference[] => {
    try {
      if (!indicatorName) return [];
      
      const now = Date.now();
      const cached = cacheRef.current.get(indicatorName);
      
      // Return cached result if still valid (within 5 seconds)
      if (cached && now - cached.timestamp < 5000) {
        return cached.usages;
      }
      
      // Compute new result and cache it
      const usages = findIndicatorUsages(indicatorName, nodes);
      cacheRef.current.set(indicatorName, {timestamp: now, usages});
      
      // Clean up old entries periodically
      if (cacheRef.current.size > 30) {
        for (const [key, value] of cacheRef.current.entries()) {
          if (now - value.timestamp > 10000) {
            cacheRef.current.delete(key);
          }
        }
      }
      
      return usages;
    } catch (error) {
      handleError(error, 'findUsages');
      return [];
    }
  }, [nodes]);

  return {
    findUsages
  };
};
