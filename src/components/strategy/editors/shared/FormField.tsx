
import React from 'react';
import { Label } from '@/components/ui/label';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  description,
  className = '',
  children,
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-950/30 dark:to-gray-950/30 rounded-lg border border-slate-200/50 dark:border-slate-700/30">
        <div className="w-1.5 h-1.5 bg-slate-500 rounded-full shadow-sm" />
        <Label htmlFor={htmlFor} className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </Label>
        {description && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-help transition-all duration-200 hover:scale-110">
                  <HelpCircle className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                <p className="max-w-xs text-sm text-slate-700 dark:text-slate-300">{description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="pl-2">
        {children}
      </div>
    </div>
  );
};

export default FormField;
