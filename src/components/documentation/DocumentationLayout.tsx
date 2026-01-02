
import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import DocNavigation from './DocNavigation';
import Introduction from './sections/Introduction';
import StrategyBuilderDoc from './sections/StrategyBuilderDoc';
import NodeTypesDoc from './sections/NodeTypesDoc';
import SignalNodesDoc from './sections/SignalNodesDoc';
import ActionNodesDoc from './sections/ActionNodesDoc';
import BacktestingDoc from './sections/BacktestingDoc';
import ReportsDoc from './sections/ReportsDoc';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const DocumentationLayout: React.FC = () => {
  const [activeSection, setActiveSection] = useState('introduction');
  const [open, setOpen] = useState(false);

  const renderContent = () => {
    switch(activeSection) {
      case 'introduction':
        return <Introduction />;
      case 'strategy-builder':
        return <StrategyBuilderDoc />;
      case 'node-types':
        return <NodeTypesDoc />;
      case 'signal-nodes':
        return <SignalNodesDoc />;
      case 'action-nodes':
        return <ActionNodesDoc />;
      case 'backtesting':
        return <BacktestingDoc />;
      case 'reports':
        return <ReportsDoc />;
      default:
        return <Introduction />;
    }
  };

  return (
    <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
      {/* Mobile Documentation Menu */}
      <div className="flex items-center md:hidden mb-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="mr-2">
              <Menu className="h-4 w-4 mr-2" />
              <span>Documentation Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[280px]">
            <div className="py-4">
              <DocNavigation 
                activeSection={activeSection} 
                setActiveSection={(section) => {
                  setActiveSection(section);
                  setOpen(false);
                }} 
              />
            </div>
          </SheetContent>
        </Sheet>
        <div className="text-sm font-medium">
          {activeSection.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
        </div>
      </div>
      
      {/* Desktop Sidebar */}
      <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
        <ScrollArea className="h-full py-6 pr-6">
          <DocNavigation activeSection={activeSection} setActiveSection={setActiveSection} />
        </ScrollArea>
      </aside>
      
      <Separator className="md:hidden mb-4" />
      
      {/* Main Content - Fixed the height and scrolling issues */}
      <main className="relative py-0 lg:gap-10 lg:py-8 w-full max-h-[calc(100vh-3.5rem)] overflow-y-auto">
        <div className="prose prose-slate dark:prose-invert max-w-none pb-10">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default DocumentationLayout;
