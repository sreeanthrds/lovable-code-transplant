import React from 'react';

interface PlanBadgeProps {
  plan: string;
  expiresAt?: string;
}

export const PlanBadge: React.FC<PlanBadgeProps> = ({ plan, expiresAt }) => {
  const getPlanStyles = (plan: string) => {
    switch (plan.toUpperCase()) {
      case 'PRO':
        return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-600';
      case 'ENTERPRISE':
        return 'bg-gradient-to-r from-purple-500 to-violet-600 text-white border-purple-600';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan.toUpperCase()) {
      case 'PRO':
        return '⭐';
      case 'ENTERPRISE':
        return '🚀';
      default:
        return '🆓';
    }
  };

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPlanStyles(plan)}`}>
      <span className="mr-1">{getPlanIcon(plan)}</span>
      <span>{plan}</span>
      {expiresAt && plan.toUpperCase() !== 'FREE' && (
        <span className="ml-2 text-xs opacity-90">
          until {expiresAt}
        </span>
      )}
    </div>
  );
};
