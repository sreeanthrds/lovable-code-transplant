import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MultilevelDropdownProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  useFullPath?: boolean;
  customDisplayText?: string; // Custom display text to show instead of value
  levels: {
    id: string;
    label: string;
    options: Array<{
      value: string;
      label: string;
      children?: Array<{
        value: string;
        label: string;
        children?: Array<{
          value: string;
          label: string;
        }>;
      }>;
    }>;
  }[];
}

interface SubmenuProps {
  options: Array<{
    value: string;
    label: string;
    children?: Array<{
      value: string;
      label: string;
      children?: Array<{
        value: string;
        label: string;
      }>;
    }>;
  }>;
  onSelect: (value: string, path: string[]) => void;
  path: string[];
  level: number;
}

const Submenu: React.FC<SubmenuProps> = ({ options, onSelect, path, level }) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearHoverTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleMouseEnter = (value: string) => {
    clearHoverTimeout();
    setHoveredItem(value);
  };

  const handleMouseLeave = () => {
    clearHoverTimeout();
    timeoutRef.current = setTimeout(() => {
      setHoveredItem(null);
    }, 200); // Increased delay for better UX
  };

  const handleSubmenuMouseEnter = (value: string) => {
    clearHoverTimeout();
    setHoveredItem(value);
  };

  const handleSubmenuMouseLeave = () => {
    clearHoverTimeout();
    timeoutRef.current = setTimeout(() => {
      setHoveredItem(null);
    }, 200);
  };

  useEffect(() => {
    return () => {
      clearHoverTimeout();
    };
  }, []);

  return (
    <div className="py-2">
      {options.map((option) => (
        <div
          key={option.value}
          className="relative"
          onMouseEnter={() => handleMouseEnter(option.value)}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className={cn(
              "flex items-center justify-between mx-2 px-3 py-2.5 text-sm cursor-pointer rounded-md transition-all duration-200 group border border-transparent",
              "hover:bg-background/60 hover:border-border hover:shadow-sm",
              hoveredItem === option.value && "bg-background/60 border-border shadow-sm"
            )}
            onClick={() => {
              if (!option.children || option.children.length === 0) {
                onSelect(option.value, [...path, option.value]);
              }
            }}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-2 h-2 rounded-full bg-primary/60 group-hover:bg-primary group-hover:scale-110 transition-all duration-200" />
              <span className="font-medium text-foreground truncate">
                {option.label}
              </span>
            </div>
            {option.children && option.children.length > 0 && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <span className="text-xs opacity-60">more</span>
                <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </div>
            )}
          </div>
          
          {/* Submenu */}
          {option.children && option.children.length > 0 && hoveredItem === option.value && (
            <div 
              className="absolute left-full top-0 z-50 min-w-max bg-popover border border-border rounded-lg shadow-xl ml-2"
              style={{ 
                filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.1))',
                animationDuration: '200ms',
                animationFillMode: 'both',
                animationName: 'slideInRight'
              }}
              onMouseEnter={() => handleSubmenuMouseEnter(option.value)}
              onMouseLeave={handleSubmenuMouseLeave}
            >
              <div className="p-1">
                <Submenu
                  options={option.children}
                  onSelect={onSelect}
                  path={[...path, option.value]}
                  level={level + 1}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const MultilevelDropdown: React.FC<MultilevelDropdownProps> = ({
  value,
  onValueChange,
  placeholder = "Select...",
  useFullPath = true,
  customDisplayText,
  levels
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (selectedValue: string, path: string[]) => {
    const finalValue = useFullPath ? path.join('.') : selectedValue;
    onValueChange(finalValue);
    setIsOpen(false);
  };

  const getDisplayValue = () => {
    if (!value) return placeholder;
    // Use custom display text if provided, otherwise use the default path display
    if (customDisplayText) return customDisplayText;
    return value.split('.').join(' → ');
  };

  // Render breadcrumb-style display for selected value
  const renderBreadcrumbs = () => {
    if (!value) return null;
    
    const parts = value.split('.');
    if (parts.length < 3) return null; // Only show breadcrumbs for full paths
    
    const [instrumentType, timeframe, indicator] = parts;
    const instrumentLabel = instrumentType === 'TI' ? 'Trading Instrument' : 'Support Instrument';
    
    return (
      <div className="flex items-center gap-1 flex-wrap">
        <div className="flex items-center bg-primary/10 text-primary rounded-md px-2 py-1 text-xs font-medium border border-primary/20">
          {instrumentLabel}
        </div>
        <ChevronRight className="h-3 w-3 text-muted-foreground" />
        <div className="flex items-center bg-background/80 text-foreground rounded-md px-2 py-1 text-xs font-medium border border-border">
          {timeframe}
        </div>
        <ChevronRight className="h-3 w-3 text-muted-foreground" />
        <div className="flex items-center bg-secondary text-secondary-foreground rounded-md px-2 py-1 text-xs font-medium">
          {customDisplayText || indicator}
        </div>
      </div>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className={cn(
          "flex min-h-[3rem] w-full items-center justify-between rounded-lg border border-input bg-background p-3 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-background/60 transition-colors",
          !value && "text-muted-foreground",
          value && "border-primary/30 bg-gradient-to-r from-background to-primary/5"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-1 text-left min-w-0">
          {value && renderBreadcrumbs() ? renderBreadcrumbs() : (
            <span className="truncate">{getDisplayValue()}</span>
          )}
        </div>
        <ChevronDown className={cn("h-4 w-4 shrink-0 opacity-50 transition-transform ml-2", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 min-w-max mt-2 bg-popover border border-border rounded-lg shadow-xl backdrop-blur-sm" 
             style={{ filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.15))' }}>
          <div className="p-1">
            <Submenu
              options={levels[0]?.options || []}
              onSelect={handleSelect}
              path={[]}
              level={0}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MultilevelDropdown;