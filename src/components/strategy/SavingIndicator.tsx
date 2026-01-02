
import React, { useState, useEffect } from 'react';
import { subscribeSavingState } from '@/hooks/strategy-store/supabase-persistence';

const SavingIndicator = () => {
  const [savingState, setSavingState] = useState<{ isSaving: boolean; message: string }>({ 
    isSaving: false, 
    message: 'Saving...' 
  });

  useEffect(() => {
    const unsubscribe = subscribeSavingState(setSavingState);
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  if (!savingState.isSaving) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg px-3 py-2 flex items-center gap-2">
      <div className="h-3 w-3 border-2 border-primary/30 border-t-primary rounded-full"></div>
      <span className="text-sm text-muted-foreground">{savingState.message}</span>
    </div>
  );
};

export default SavingIndicator;
