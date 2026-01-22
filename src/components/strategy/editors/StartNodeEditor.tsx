import React from 'react';
import { Node } from '@xyflow/react';
import { useStartNodeForm } from './start-node/useStartNodeForm';
import { useStartNodeLock } from './start-node/hooks/useStartNodeLock';
import { ConditionClipboardProvider } from './condition-builder/providers/ConditionClipboardProvider';
import BasicSettingsTab from './start-node/BasicSettingsTab';
import ExchangeSelector from './start-node/components/ExchangeSelector';
import StartNodeLockedBanner from './start-node/components/StartNodeLockedOverlay';
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

  // Check if the start node is locked (has descendants)
  const { isLocked, descendantCount, isIndicatorUsed, isTimeframeUsed } = useStartNodeLock(node.id);

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

  // Content JSX - avoid inline component function to prevent hook order issues
  const editorContent = (
    <div className="bg-white/[0.03] dark:bg-white/[0.02] rounded-lg border-2 border-blue-400/40 dark:border-blue-500/30 shadow-[inset_0_0_20px_rgba(59,130,246,0.1),0_4px_24px_rgba(0,0,0,0.6),0_8px_32px_rgba(59,130,246,0.15)] backdrop-blur-[10px] p-3 space-y-3">
      {isLocked && <StartNodeLockedBanner descendantCount={descendantCount} />}
      
      <div className={isLocked ? 'pointer-events-none' : ''}>
        <ExchangeSelector
          exchange={exchange}
          onChange={(value) => handleInputChange('exchange', value)}
        />
        
        {showInstrumentTabs && (
          <Tabs defaultValue="trading" className="space-y-2 mt-3">
            <TabsList className={`w-full bg-white/[0.03] dark:bg-white/[0.02] h-auto min-h-5 border-2 border-blue-400/20 dark:border-blue-500/15 shadow-[0_1px_6px_rgba(0,0,0,0.3)] backdrop-blur-[6px] ${showSupportingTab ? 'grid grid-cols-2' : 'grid grid-cols-1'}`}>
              <TabsTrigger value="trading" className="text-sm px-1 py-1">
                <span className="truncate">{isMobile ? 'Trading' : 'Trading Instrument'}</span>
              </TabsTrigger>
              {showSupportingTab && (
                <TabsTrigger value="supporting" className="text-sm px-1 py-1">
                  <span className="truncate">{isMobile ? 'Supporting' : 'Supporting Instrument'}</span>
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
                isLocked={isLocked}
                isIndicatorUsed={isIndicatorUsed}
                isTimeframeUsed={isTimeframeUsed}
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
                  isLocked={isLocked}
                  isIndicatorUsed={isIndicatorUsed}
                  isTimeframeUsed={isTimeframeUsed}
                />
              </TabsContent>
            )}
          </Tabs>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <ConditionClipboardProvider>
        <ScrollArea className="h-full">
          <div className="space-y-2 p-2">
            {editorContent}
          </div>
        </ScrollArea>
      </ConditionClipboardProvider>
    );
  }

  return (
    <ConditionClipboardProvider>
      <ScrollArea className="h-full">
        {editorContent}
      </ScrollArea>
    </ConditionClipboardProvider>
  );
};

export default StartNodeEditor;