import React, { useState, useEffect, useRef } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { cn } from '@/lib/utils';

interface ResponsiveFlowLayoutProps {
  children: React.ReactNode;
  isPanelOpen: boolean;
  selectedNode: any;
  onClosePanel: () => void;
  nodePanelComponent: React.ReactNode;
}

const ResponsiveFlowLayout: React.FC<ResponsiveFlowLayoutProps> = ({
  children,
  isPanelOpen,
  selectedNode,
  nodePanelComponent,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [panelHeight, setPanelHeight] = useState(50); // Height as percentage of viewport
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(50);
  const dragRef = useRef<HTMLDivElement>(null);

  // Check screen size for mobile detection
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Reset panel height when panel closes or when a new node is selected
  useEffect(() => {
    if (!isPanelOpen) {
      setPanelHeight(50);
    }
  }, [isPanelOpen]);

  // Auto-expand panel when a new node is selected (for mobile)
  useEffect(() => {
    if (isPanelOpen && selectedNode && isMobile) {
      setPanelHeight(50);
    }
  }, [selectedNode, isPanelOpen, isMobile]);

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setStartY(clientY);
    setStartHeight(panelHeight);
  };

  // Handle drag move
  const handleDragMove = React.useCallback((e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaY = startY - clientY; // Inverted: dragging up increases height
    const deltaPercent = (deltaY / window.innerHeight) * 100;
    const newHeight = Math.max(10, Math.min(80, startHeight + deltaPercent));
    
    setPanelHeight(newHeight);
  }, [startY, startHeight]);

  // Handle drag end
  const handleDragEnd = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add event listeners when dragging starts
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      document.addEventListener('touchmove', handleDragMove, { passive: false });
      document.addEventListener('touchend', handleDragEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
        document.removeEventListener('touchmove', handleDragMove);
        document.removeEventListener('touchend', handleDragEnd);
      };
    }
  }, [isDragging, handleDragMove, handleDragEnd]);

  if (!isPanelOpen) {
    return (
      <div className="h-full w-full strategy-flow-container">
        {children}
      </div>
    );
  }

  // Mobile layout - bottom draggable panel
  if (isMobile) {
    return (
      <div className="h-full w-full strategy-flow-container relative">
        {/* Main flow area */}
        <div className="h-full w-full">
          {children}
        </div>
        
        {/* Bottom draggable panel overlay */}
        <div 
          className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-2xl"
          style={{ height: `${panelHeight}vh` }}
        >
          {/* Drag handle */}
          <div 
            ref={dragRef}
            className={cn(
              "flex items-center justify-center p-2 bg-gradient-to-r from-primary/5 to-blue-500/5 border-b border-border cursor-grab active:cursor-grabbing select-none",
              isDragging && "bg-primary/10"
            )}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
          >
            <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          </div>
          
          {/* Panel content */}
          <div className="h-full overflow-auto pb-6 px-1" style={{ fontSize: "0.7rem" }}>
            {nodePanelComponent || (
              <div className="p-1 text-center text-muted-foreground text-xs">
                No content
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout - right-side resizable panel (original behavior)
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
        
        {/* Right side panel - resizable */}
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

export default ResponsiveFlowLayout;