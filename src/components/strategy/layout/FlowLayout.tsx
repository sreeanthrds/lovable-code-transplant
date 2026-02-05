
import React from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

interface FlowLayoutProps {
  children: React.ReactNode;
  isPanelOpen: boolean;
  selectedNode: any;
  onClosePanel: () => void;
  nodePanelComponent: React.ReactNode;
}

const FlowLayout: React.FC<FlowLayoutProps> = ({
  children,
  isPanelOpen,
  selectedNode,
  nodePanelComponent,
}) => {
  return (
    <div className="h-full w-full strategy-flow-container">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Main flow area */}
        <ResizablePanel defaultSize={isPanelOpen ? 70 : 100} minSize={30}>
          {children}
        </ResizablePanel>
        
        {/* Resizable handle - only show when panel is open */}
        {isPanelOpen && (
          <ResizableHandle withHandle />
        )}
        
        {/* Side panel - resizable */}
        {isPanelOpen && (
          <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
            <div className="h-full border-l border-border bg-background shadow-lg">
              {nodePanelComponent || (
                <div className="p-4 text-center text-muted-foreground">
                  <p>Panel content loading...</p>
                  <p>Selected node: {selectedNode?.id}</p>
                  <p>Node type: {selectedNode?.type}</p>
                </div>
              )}
            </div>
          </ResizablePanel>
        )}
      </ResizablePanelGroup>
    </div>
  );
};

export default FlowLayout;
