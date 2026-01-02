import React from 'react';
import { Node } from '@xyflow/react';
import { useStartNodeForm } from './start-node/useStartNodeForm';
import { ConditionClipboardProvider } from './condition-builder/providers/ConditionClipboardProvider';
import BasicSettingsTab from './start-node/BasicSettingsTab';
import ExchangeSelector from './start-node/components/ExchangeSelector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface StartNodeEditorProps {
  node: Node;
  updateNodeData: (id: string, data: any) => void;
}

const StartNodeEditor = ({ node, updateNodeData }: StartNodeEditorProps) => {
  const {
    formData,
    handleInputChange,
    handleTradingInstrumentChange,
    handleUnderlyingTypeChange,
  } = useStartNodeForm({ node, updateNodeData });

  const startNodeInfo = `The Strategy Controller is the starting point of your trading strategy. Configure your trading instruments, timeframes, indicators, and position management settings here.`;

  // Check if we're on mobile with proper hook usage
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const exchange = formData.exchange || '';
  const showInstrumentTabs = exchange !== '';
  const showSupportingTab = exchange !== 'MCX' && showInstrumentTabs;

  if (isMobile) {
    return (
      <ConditionClipboardProvider>
        <ScrollArea className="h-full">
          <div className="space-y-2 p-2">
            <div className="bg-white/[0.03] dark:bg-white/[0.02] rounded-lg border-2 border-blue-400/40 dark:border-blue-500/30 shadow-[inset_0_0_20px_rgba(59,130,246,0.1),0_4px_24px_rgba(0,0,0,0.6),0_8px_32px_rgba(59,130,246,0.15)] backdrop-blur-[10px] p-3 space-y-3">
              <ExchangeSelector
                exchange={exchange}
                onChange={(value) => handleInputChange('exchange', value)}
              />
              
              {showInstrumentTabs && (
                <Tabs defaultValue="trading" className="space-y-2">
                  <TabsList className={`grid w-full bg-white/[0.03] dark:bg-white/[0.02] h-auto min-h-7 border-2 border-blue-400/20 dark:border-blue-500/15 shadow-[0_1px_6px_rgba(0,0,0,0.3)] backdrop-blur-[6px] ${showSupportingTab ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    <TabsTrigger value="trading" className="text-sm px-1 py-1.5">
                      <span className="truncate">Trading</span>
                    </TabsTrigger>
                    {showSupportingTab && (
                      <TabsTrigger value="supporting" className="text-sm px-1 py-1.5">
                        <span className="truncate">Supporting</span>
                      </TabsTrigger>
                    )}
                  </TabsList>
                  
                  <TabsContent value="trading" className="mt-2">
                    <BasicSettingsTab 
                      formData={formData}
                      handleInputChange={handleInputChange}
                      handleTradingInstrumentChange={handleTradingInstrumentChange}
                      handleUnderlyingTypeChange={handleUnderlyingTypeChange}
                      instrumentType="trading"
                    />
                  </TabsContent>
                  
                  {showSupportingTab && (
                    <TabsContent value="supporting" className="mt-2">
                      <BasicSettingsTab 
                        formData={formData}
                        handleInputChange={handleInputChange}
                        handleTradingInstrumentChange={handleTradingInstrumentChange}
                        handleUnderlyingTypeChange={handleUnderlyingTypeChange}
                        instrumentType="supporting"
                      />
                    </TabsContent>
                  )}
                </Tabs>
              )}
            </div>
          </div>
        </ScrollArea>
      </ConditionClipboardProvider>
    );
  }

  return (
    <ConditionClipboardProvider>
      <ScrollArea className="h-full">
        <div className="bg-white/[0.03] dark:bg-white/[0.02] rounded-lg border-2 border-blue-400/40 dark:border-blue-500/30 shadow-[inset_0_0_20px_rgba(59,130,246,0.1),0_4px_24px_rgba(0,0,0,0.6),0_8px_32px_rgba(59,130,246,0.15)] backdrop-blur-[10px] p-3 space-y-3">
          <ExchangeSelector
            exchange={exchange}
            onChange={(value) => handleInputChange('exchange', value)}
          />
          
          {showInstrumentTabs && (
            <Tabs defaultValue="trading" className="space-y-2">
              <TabsList className={`w-full bg-white/[0.03] dark:bg-white/[0.02] h-auto min-h-5 border-2 border-blue-400/20 dark:border-blue-500/15 shadow-[0_1px_6px_rgba(0,0,0,0.3)] backdrop-blur-[6px] ${showSupportingTab ? 'grid grid-cols-2' : 'grid grid-cols-1'}`}>
                <TabsTrigger value="trading" className="text-sm px-1 py-1">
                  <span className="truncate">Trading Instrument</span>
                </TabsTrigger>
                {showSupportingTab && (
                  <TabsTrigger value="supporting" className="text-sm px-1 py-1">
                    <span className="truncate">Supporting Instrument</span>
                  </TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="trading" className="mt-1">
                <BasicSettingsTab 
                  formData={formData}
                  handleInputChange={handleInputChange}
                  handleTradingInstrumentChange={handleTradingInstrumentChange}
                  handleUnderlyingTypeChange={handleUnderlyingTypeChange}
                  instrumentType="trading"
                />
              </TabsContent>
              
              {showSupportingTab && (
                <TabsContent value="supporting" className="mt-1">
                  <BasicSettingsTab 
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleTradingInstrumentChange={handleTradingInstrumentChange}
                    handleUnderlyingTypeChange={handleUnderlyingTypeChange}
                    instrumentType="supporting"
                  />
                </TabsContent>
              )}
            </Tabs>
          )}
        </div>
      </ScrollArea>
    </ConditionClipboardProvider>
  );
};

export default StartNodeEditor;