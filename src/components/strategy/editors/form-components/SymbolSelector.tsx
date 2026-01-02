import React, { useState, useMemo } from 'react';
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useIsMobile } from '@/hooks/use-mobile';

// Static symbol lists
const NSE_INDICES_LIST = [
  { value: "NIFTY", label: "Nifty 50" },
  { value: "BANKNIFTY", label: "Bank Nifty" },
  { value: "FINNIFTY", label: "Financial Services Nifty" },
  { value: "MIDCPNIFTY", label: "Midcap Nifty" },
];

const BSE_INDICES_LIST = [
  { value: "SENSEX", label: "Sensex" },
  { value: "BANKEX", label: "Bankex" },
  { value: "BSE100", label: "BSE 100" },
  { value: "BSE200", label: "BSE 200" },
];

const STOCKS_LIST = [
  { value: "RELIANCE", label: "Reliance Industries" },
  { value: "TCS", label: "Tata Consultancy Services" },
  { value: "INFY", label: "Infosys" },
  { value: "HDFC", label: "HDFC Bank" },
  { value: "ICICI", label: "ICICI Bank" },
  { value: "SBIN", label: "State Bank of India" },
  { value: "WIPRO", label: "Wipro Ltd" },
  { value: "HCLTECH", label: "HCL Technologies" },
  { value: "ITC", label: "ITC Ltd" },
  { value: "BHARTIARTL", label: "Bharti Airtel" },
];

const FNO_STOCKS_LIST = STOCKS_LIST.slice(0, 8);

interface SymbolSelectorProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  instrumentType?: 'stock' | 'futures' | 'options';
  underlyingType?: 'index' | 'indexFuture' | 'stock';
  className?: string;
  exchange?: 'NSE' | 'BSE' | 'MCX';
  symbolTypeFilter?: 'index' | 'stock';
}

const SymbolSelector: React.FC<SymbolSelectorProps> = ({
  value,
  onChange,
  id = "symbol-selector",
  placeholder = "Select symbol",
  disabled = false,
  instrumentType = 'stock',
  underlyingType,
  className,
  exchange = 'NSE',
  symbolTypeFilter
}) => {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const symbolList = useMemo(() => {
    // If symbolTypeFilter is provided, use it to determine the list
    if (symbolTypeFilter) {
      if (symbolTypeFilter === 'index') {
        return exchange === 'BSE' ? BSE_INDICES_LIST : NSE_INDICES_LIST;
      } else if (symbolTypeFilter === 'stock') {
        return STOCKS_LIST;
      }
    }
    
    // Otherwise use the old logic based on instrumentType
    switch (instrumentType) {
      case 'stock':
        return STOCKS_LIST;
      case 'futures':
        if (underlyingType === 'index') {
          return exchange === 'BSE' ? BSE_INDICES_LIST : NSE_INDICES_LIST;
        } else if (underlyingType === 'stock') {
          return FNO_STOCKS_LIST;
        }
        return exchange === 'BSE' ? BSE_INDICES_LIST : NSE_INDICES_LIST;
      case 'options':
        if (underlyingType === 'index' || underlyingType === 'indexFuture') {
          return exchange === 'BSE' ? BSE_INDICES_LIST : NSE_INDICES_LIST;
        } else if (underlyingType === 'stock') {
          return FNO_STOCKS_LIST;
        }
        return [];
      default:
        return STOCKS_LIST;
    }
  }, [instrumentType, underlyingType, exchange, symbolTypeFilter]);
  
  const selectedSymbol = symbolList.find(symbol => symbol.value === value);
  const isDropdownDisabled = disabled || (instrumentType === 'options' && !underlyingType);
  
  const handleSelectItem = (currentValue: string) => {
    if (isMobile) {
      setTimeout(() => {
        onChange(currentValue);
        setOpen(false);
      }, 100);
    } else {
      onChange(currentValue);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between h-9", className)}
          disabled={isDropdownDisabled}
          id={id}
          style={{
            background: 'rgba(255, 255, 255, 0.01)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)'
          }}
        >
          {selectedSymbol ? selectedSymbol.value : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-full p-1 border-2 border-primary/30 shadow-[0_8px_32px_rgba(0,0,0,0.8),0_0_0_1px_rgba(72,187,178,0.3)]" 
        align="start"
        style={{ 
          zIndex: 9999,
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(16px) saturate(80%)',
          WebkitBackdropFilter: 'blur(16px) saturate(80%)'
        }}
      >
        <Command 
          className="bg-transparent [&_[cmdk-input-wrapper]]:border-b [&_[cmdk-input-wrapper]]:px-3"
          style={{ 
            background: 'transparent',
            backdropFilter: 'none',
            WebkitBackdropFilter: 'none'
          }}
        >
          <CommandInput placeholder="Search symbol..." className="h-9"/>
          <CommandList className={isMobile ? "max-h-[40vh]" : "max-h-[300px]"}>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {symbolList.map((symbol) => (
                <CommandItem
                  key={symbol.value}
                  value={symbol.value}
                  onSelect={handleSelectItem}
                  className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-base outline-none border-2 border-transparent aria-selected:border-primary/80 aria-selected:bg-transparent data-[selected='true']:border-primary/80 data-[selected='true']:bg-transparent hover:border-primary/80 hover:bg-transparent"
                >
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <Check
                      className={cn(
                        "h-4 w-4",
                        value === symbol.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </span>
                  <span>{symbol.value}</span>
                  <span className="ml-2 text-muted-foreground text-xs">
                    - {symbol.label}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default SymbolSelector;
