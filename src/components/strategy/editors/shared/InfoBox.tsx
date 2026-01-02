
import React from 'react';
import { Info, AlertTriangle } from 'lucide-react';

type InfoBoxType = 'info' | 'warning' | 'error' | 'success';

interface InfoBoxProps {
  type?: InfoBoxType;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const InfoBox: React.FC<InfoBoxProps> = ({
  type = 'info',
  title,
  children,
  className = '',
}) => {
  const getTypeStyles = (): { bg: string; border: string; icon: JSX.Element } => {
    switch (type) {
      case 'warning':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/30',
          border: 'border-amber-200 dark:border-amber-800/50',
          icon: <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
        };
      case 'error':
        return {
          bg: 'bg-red-50 dark:bg-red-950/30',
          border: 'border-red-200 dark:border-red-800/50',
          icon: <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500 mt-0.5 mr-3 flex-shrink-0" />
        };
      case 'success':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/30',
          border: 'border-emerald-200 dark:border-emerald-800/50',
          icon: <Info className="h-5 w-5 text-emerald-600 dark:text-emerald-500 mt-0.5 mr-3 flex-shrink-0" />
        };
      case 'info':
      default:
        return {
          bg: 'bg-muted/40',
          border: 'border-border',
          icon: <Info className="h-5 w-5 text-muted-foreground mt-0.5 mr-3 flex-shrink-0" />
        };
    }
  };

  const { bg, border, icon } = getTypeStyles();

  return (
    <div className={`${bg} ${border} border rounded-md p-4 flex items-start ${className}`}>
      {icon}
      <div className="text-sm">
        {title && <p className="font-medium mb-1">{title}</p>}
        <div className="text-foreground/70">{children}</div>
      </div>
    </div>
  );
};

export default InfoBox;
