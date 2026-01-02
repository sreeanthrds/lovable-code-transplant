import React, { useState, useEffect } from 'react';
import { Check, Cloud, CloudOff } from 'lucide-react';
import { subscribeSavingState } from '@/hooks/strategy-store/supabase-persistence';

const AutoSaveIndicator = () => {
  const [savingState, setSavingState] = useState<{ isSaving: boolean; message: string }>({ 
    isSaving: false, 
    message: '' 
  });
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeSavingState((state) => {
      setSavingState(state);
      
      // When saving completes, show saved indicator and set last save time
      if (!state.isSaving && savingState.isSaving) {
        setLastSaveTime(new Date());
        setShowSavedIndicator(true);
        
        // Hide the saved indicator after 3 seconds
        setTimeout(() => {
          setShowSavedIndicator(false);
        }, 3000);
      }
    });
    
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [savingState.isSaving]);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="fixed bottom-4 right-4 z-30 flex items-center gap-2 text-xs text-muted-foreground">
      {savingState.isSaving ? (
        <div className="flex items-center gap-2">
          <Cloud className="h-3 w-3 animate-pulse text-blue-600" />
          <span className="text-gray-800 dark:text-gray-200 font-medium">Auto-saving...</span>
        </div>
      ) : showSavedIndicator ? (
        <div className="flex items-center gap-2">
          <Check className="h-3 w-3 text-green-600" />
          <span className="text-gray-800 dark:text-gray-200 font-medium">Saved</span>
        </div>
      ) : lastSaveTime ? (
        <div className="flex items-center gap-2">
          <CloudOff className="h-3 w-3 text-gray-600" />
          <span className="text-gray-700 dark:text-gray-300">Last saved {formatTimeAgo(lastSaveTime)}</span>
        </div>
      ) : null}
    </div>
  );
};

export default AutoSaveIndicator;