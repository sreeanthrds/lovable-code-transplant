import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PnLDisplayProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  label?: string;
}

export function PnLDisplay({ value, size = 'md', showIcon = true, label }: PnLDisplayProps) {
  const isProfitable = value >= 0;
  
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl'
  };
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className="flex items-center gap-1.5">
      {showIcon && (
        isProfitable ? (
          <TrendingUp className={`${iconSizes[size]} text-green-400`} />
        ) : (
          <TrendingDown className={`${iconSizes[size]} text-red-400`} />
        )
      )}
      <div className="flex flex-col">
        {label && <span className="text-xs text-muted-foreground">{label}</span>}
        <span className={`font-bold ${sizeClasses[size]} ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
          {isProfitable ? '+' : ''}{value.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
