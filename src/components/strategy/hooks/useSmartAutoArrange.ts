import { useCallback, useRef } from 'react';
import { Node, Edge } from '@xyflow/react';

interface UseSmartAutoArrangeProps {
  onAutoArrange: () => Promise<void>;
  enabled?: boolean;
}

/**
 * Triggers auto-arrange intelligently based on node size changes
 * Prevents excessive re-arrangements with debouncing and change detection
 */
export const useSmartAutoArrange = ({
  onAutoArrange,
  enabled = true
}: UseSmartAutoArrangeProps) => {
  const arrangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isArrangingRef = useRef(false);
  const lastArrangeTimeRef = useRef<number>(0);

  const triggerSmartArrange = useCallback(async (reason: string = 'unknown') => {
    if (!enabled || isArrangingRef.current) {
      console.log('🚫 Smart arrange blocked:', { enabled, isArranging: isArrangingRef.current });
      return;
    }

    // Prevent too frequent arrangements (min 2 seconds between)
    const now = Date.now();
    const timeSinceLastArrange = now - lastArrangeTimeRef.current;
    if (timeSinceLastArrange < 2000) {
      console.log('⏳ Smart arrange throttled, too soon since last arrange');
      return;
    }

    // Clear any pending arrangement
    if (arrangeTimeoutRef.current) {
      clearTimeout(arrangeTimeoutRef.current);
    }

    // Debounce the arrangement
    arrangeTimeoutRef.current = setTimeout(async () => {
      console.log('🎯 Triggering smart auto-arrange, reason:', reason);
      isArrangingRef.current = true;
      lastArrangeTimeRef.current = Date.now();

      try {
        await onAutoArrange();
        console.log('✅ Smart auto-arrange completed');
      } catch (error) {
        console.error('❌ Smart auto-arrange failed:', error);
      } finally {
        isArrangingRef.current = false;
      }
    }, 500); // 500ms debounce
  }, [onAutoArrange, enabled]);

  const cancelPendingArrange = useCallback(() => {
    if (arrangeTimeoutRef.current) {
      clearTimeout(arrangeTimeoutRef.current);
      arrangeTimeoutRef.current = null;
    }
  }, []);

  return {
    triggerSmartArrange,
    cancelPendingArrange
  };
};
