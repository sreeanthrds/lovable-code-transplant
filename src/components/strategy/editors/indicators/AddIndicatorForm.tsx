
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, ChevronsUpDown } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { categorizedIndicators } from '../../utils/categorizedIndicatorConfig';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AddIndicatorFormProps {
  selectedIndicator: string;
  onSelectIndicator: (indicator: string) => void;
  onAddIndicator: () => void;
}

const AddIndicatorForm: React.FC<AddIndicatorFormProps> = ({
  selectedIndicator,
  onSelectIndicator,
  onAddIndicator
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const isMobile = useIsMobile();

  // Filter indicators based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return categorizedIndicators;
    }

    const query = searchQuery.toLowerCase();
    return categorizedIndicators
      .map(category => ({
        ...category,
        indicators: category.indicators.filter(indicator =>
          indicator.display_name.toLowerCase().includes(query) ||
          indicator.function_name.toLowerCase().includes(query) ||
          indicator.description.toLowerCase().includes(query)
        )
      }))
      .filter(category => category.indicators.length > 0);
  }, [searchQuery]);

  const handleSelectItem = (indicatorName: string) => {
    if (isMobile) {
      setTimeout(() => {
        onSelectIndicator(indicatorName);
        setOpen(false);
        setSearchQuery('');
      }, 100);
    } else {
      onSelectIndicator(indicatorName);
      setOpen(false);
      setSearchQuery('');
    }
  };
  
  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-9 border-2 border-border/40 hover:border-border/60 hover:bg-muted/50"
          >
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Add indicator</span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[420px] p-0 border-2 border-border/30 shadow-lg" 
          align="start"
          style={{ 
            zIndex: 9999,
            background: 'hsl(var(--background))',
          }}
        >
          <div className="p-3 border-b border-border/40">
            <Input 
              placeholder="Search indicators..." 
              className="h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <ScrollArea className={isMobile ? "h-[50vh]" : "h-[400px]"}>
            {filteredCategories.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No indicators found.
              </div>
            ) : (
              <Accordion type="multiple" className="w-full">
                {filteredCategories.map((category) => (
                  <AccordionItem key={category.category} value={category.category} className="border-b border-border/40">
                    <AccordionTrigger className="px-3 py-2 hover:bg-muted/50 hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-2">
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">
                          {category.category}
                        </span>
                        <span className="text-xs text-muted-foreground font-normal">
                          {category.indicators.length}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-0">
                      <div className="space-y-1 px-2 pb-2">
                        {category.indicators.map((indicator) => (
                          <div
                            key={indicator.function_name}
                            onClick={() => handleSelectItem(indicator.function_name)}
                            className="flex flex-col gap-1 px-3 py-2 cursor-pointer rounded-md hover:bg-muted/80 transition-colors"
                          >
                            <div className="font-medium text-sm">{indicator.display_name}</div>
                            <div className="text-xs text-muted-foreground line-clamp-1">{indicator.description}</div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default AddIndicatorForm;
