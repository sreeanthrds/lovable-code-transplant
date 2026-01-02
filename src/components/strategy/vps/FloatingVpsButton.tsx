
import React from 'react';
import { Button } from '@/components/ui/button';
import { useVpsStore } from '@/hooks/useVpsStore';
import { Database } from 'lucide-react';

const FloatingVpsButton = () => {
  const { toggle, positions } = useVpsStore();
  const positionCount = positions.length;

  return (
    <Button
      onClick={toggle}
      className="fixed bottom-4 right-4 shadow-lg rounded-full p-3 h-auto"
      variant="default"
    >
      <Database className="h-5 w-5 mr-2" />
      <span>Positions</span>
      {positionCount > 0 && (
        <span className="ml-2 bg-primary-foreground text-primary rounded-full h-5 min-w-5 px-1 flex items-center justify-center text-xs font-medium">
          {positionCount}
        </span>
      )}
    </Button>
  );
};

export default FloatingVpsButton;
