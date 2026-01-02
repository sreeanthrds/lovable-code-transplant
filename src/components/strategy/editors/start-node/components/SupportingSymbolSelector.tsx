import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { getSupportingSymbolOptions, SymbolInfo } from '../utils/symbolRegistry';

interface SupportingSymbolSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  tradingInstrument: {
    type: 'stock' | 'futures' | 'options';
    underlyingType?: 'index' | 'indexFuture' | 'stock';
  };
  tradingSymbol: string;
  exchange: string;
}

const SupportingSymbolSelector: React.FC<SupportingSymbolSelectorProps> = ({
  value,
  onChange,
  placeholder = "Select symbol",
  disabled = false,
  tradingInstrument,
  tradingSymbol,
  exchange
}) => {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // Get the filtered symbol options based on trading instrument
  const symbolOptions = useMemo(() => {
    if (!tradingInstrument || !tradingSymbol || !exchange) {
      return [];
    }
    
    return getSupportingSymbolOptions(tradingInstrument, tradingSymbol, exchange);
  }, [tradingInstrument, tradingSymbol, exchange]);

  const handleSelectItem = (selectedValue: string) => {
    onChange(selectedValue);
    // Close with a slight delay on mobile to ensure touch events are handled properly
    setTimeout(() => setOpen(false), isMobile ? 100 : 0);
  };

  const selectedSymbol = symbolOptions.find(symbol => symbol.id === value);
  const isDropdownDisabled = disabled || symbolOptions.length === 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "justify-between h-9 text-left font-normal",
            !value && "text-muted-foreground"
          )}
          disabled={isDropdownDisabled}
        >
          <span className="text-left truncate">
            {selectedSymbol?.name || value || placeholder}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search symbols..." />
          <CommandList>
            <CommandEmpty>No symbols found.</CommandEmpty>
            <CommandGroup heading={getGroupHeading(tradingInstrument)}>
              {symbolOptions.map((symbol) => (
                <CommandItem
                  key={symbol.id}
                  value={symbol.id}
                  onSelect={() => handleSelectItem(symbol.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === symbol.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {symbol.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

function getGroupHeading(tradingInstrument: { type: string; underlyingType?: string }): string {
  switch (tradingInstrument.type) {
    case 'stock':
      return 'Available Indices';
    case 'futures':
      if (tradingInstrument.underlyingType === 'stock') {
        return 'Supporting Instruments';
      } else {
        return 'Underlying Index';
      }
    case 'options':
      if (tradingInstrument.underlyingType === 'stock') {
        return 'Supporting Instruments';
      } else {
        return 'Index Futures';
      }
    default:
      return 'Available Symbols';
  }
}

export default SupportingSymbolSelector;