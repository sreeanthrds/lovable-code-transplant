
import React from 'react';

interface EmptyStateViewProps {
  onCreateStrategy: () => void;
}

const EmptyStateView = ({ onCreateStrategy }: EmptyStateViewProps) => {
  return (
    <div className="col-span-full text-center py-12 border border-dashed rounded-lg bg-muted/20">
      <p className="text-muted-foreground mb-4">You haven't created any strategies yet</p>
      <button 
        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2"
        onClick={onCreateStrategy}
      >
        Create Your First Strategy
      </button>
    </div>
  );
};

export default EmptyStateView;
