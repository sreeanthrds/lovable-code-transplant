
import React from 'react';

interface StrategyNodeProps {
  data: {
    type: string;
    label: string;
    details: string[];
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    status?: string;
  };
  selected: boolean;
}

const StrategyNode: React.FC<StrategyNodeProps> = ({ data, selected }) => {
  const { type, label, details, icon: Icon, color, status } = data;
  
  return (
    <div className={`
      relative bg-white/90 dark:bg-white/10 backdrop-blur-xl border border-white/40 dark:border-white/20 rounded-2xl p-5 min-w-64 shadow-lg transition-all duration-300 hover:shadow-2xl
      ${selected ? 'border-green-500 shadow-green-500/20 ring-2 ring-green-500/10' : 'border-gray-200'}
      ${status === 'active' ? 'border-green-500 shadow-green-500/20' : ''}
      cursor-pointer group hover:border-gray-300
    `}>
      {/* Status indicator for active nodes */}
      {status === 'active' && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
      )}
      
      {/* Header with icon and label */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`
          w-10 h-10 rounded-xl ${color} flex items-center justify-center 
          shadow-sm group-hover:scale-105 transition-transform duration-200
        `}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight">{label}</h3>
          {status === 'active' && (
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span className="text-xs text-green-600 font-medium">Running</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Details section */}
      <div className="space-y-2">
        {details.map((detail, idx) => (
          <div key={idx} className="flex items-start gap-2 text-xs text-gray-600">
            <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
            <span className="leading-relaxed">{detail}</span>
          </div>
        ))}
      </div>
      
      {/* Bottom accent line */}
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${color.replace('bg-gradient-to-br', 'bg-gradient-to-r')} rounded-b-2xl opacity-60`}></div>
    </div>
  );
};

export default StrategyNode;
