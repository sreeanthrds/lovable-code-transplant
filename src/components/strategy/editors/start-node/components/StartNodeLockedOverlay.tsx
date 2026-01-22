import React from 'react';
import { Lock } from 'lucide-react';

interface StartNodeLockedBannerProps {
  descendantCount: number;
}

const StartNodeLockedBanner: React.FC<StartNodeLockedBannerProps> = ({ descendantCount }) => {
  return (
    <div className="flex items-center gap-2 px-3 py-2 mb-3 rounded-md border border-amber-500/50 bg-amber-500/10 text-amber-200">
      <Lock className="h-4 w-4 shrink-0" />
      <span className="text-xs">
        Locked ({descendantCount} node{descendantCount > 1 ? 's' : ''}) — remove descendants to edit
      </span>
    </div>
  );
};

export default StartNodeLockedBanner;
