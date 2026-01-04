import React from 'react';
import { Link } from 'react-router-dom';
import { usePlan } from '@/hooks/usePlan';
import { Crown, Rocket, Sparkles } from 'lucide-react';

interface NavPlanBadgeProps {
  className?: string;
}

const NavPlanBadge: React.FC<NavPlanBadgeProps> = ({ className = '' }) => {
  const { planData, loading } = usePlan();

  if (loading) {
    return (
      <div className={`animate-pulse bg-muted rounded-full px-3 py-1 h-6 w-12 ${className}`} />
    );
  }

  const getPlanConfig = (plan: string) => {
    switch (plan?.toUpperCase()) {
      case 'PRO':
        return {
          label: 'PRO',
          icon: Crown,
          gradient: 'bg-gradient-to-r from-emerald-500 to-green-600',
          textColor: 'text-white',
          glow: 'shadow-lg shadow-emerald-500/30',
        };
      case 'LAUNCH':
        return {
          label: 'LO',
          icon: Rocket,
          gradient: 'bg-gradient-to-r from-amber-500 to-orange-500',
          textColor: 'text-white',
          glow: 'shadow-lg shadow-amber-500/30',
        };
      default:
        return {
          label: 'FREE',
          icon: Sparkles,
          gradient: 'bg-muted',
          textColor: 'text-muted-foreground',
          glow: '',
        };
    }
  };

  const config = getPlanConfig(planData.plan);
  const Icon = config.icon;

  return (
    <Link 
      to="/app/account?tab=billing" 
      className={`group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all hover:scale-105 ${config.gradient} ${config.textColor} ${config.glow} ${className}`}
    >
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </Link>
  );
};

export default NavPlanBadge;
