
import React, { useState, useEffect, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import StrategyFlow from '@/components/strategy/StrategyFlow';
import AppLayout from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Menu, Layers, Copy, Grid3X3, Download, Upload, Variable, Edit2 } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { saveStrategy } from '@/hooks/strategy-store/supabase-persistence';
import { useStrategyStore } from '@/hooks/use-strategy-store';
import { Skeleton } from '@/components/ui/skeleton';
import { v4 as uuidv4 } from 'uuid';
import AutoSaveIndicator from '@/components/strategy/AutoSaveIndicator';
import ExportButton from '@/components/strategy/toolbars/bottom-toolbar/ExportButton';

import { EditableStrategyName } from '@/components/strategy/EditableStrategyName';
import BacktestButton from '@/components/strategy/toolbars/bottom-toolbar-buttons/BacktestButton';
import StrategyOverviewPanel from '@/components/strategy/StrategyOverviewPanel';


import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

console.log('DropdownMenu imported:', DropdownMenu);

const LoadingPlaceholder = () => (
  <div className="h-full w-full flex items-center justify-center bg-muted/20">
    <div className="flex flex-col items-center">
      <div className="h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
      <p className="text-lg font-medium">Loading Strategy Builder...</p>
    </div>
  </div>
);

// Helper function to validate if a string is a valid UUID
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

const StrategyBuilder = () => {
  console.log('🎯 StrategyBuilder component rendering...');
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isEditingName, setIsEditingName] = useState(false);
  const [showOverviewPanel, setShowOverviewPanel] = useState(false);
  const isMobile = useIsMobile();
  
  // Get ID from params and validate it
  const strategyIdFromParams = searchParams.get('id');
  const isValidId = strategyIdFromParams && isValidUUID(strategyIdFromParams);
  const newParam = searchParams.get('new');
  
  // Generate proper UUID if no ID provided or if ID is invalid
  const strategyId = isValidId ? strategyIdFromParams : uuidv4();
  const strategyNameRaw = searchParams.get('name') || 'Untitled Strategy';
  const strategyName = decodeURIComponent(strategyNameRaw);
  const isNewStrategy = newParam === 'true' || !isValidId;
  
  // Check for read-only mode from URL params
  const mode = searchParams.get('mode');
  const isReadOnly = mode === 'readonly';
  
  console.log('📊 Strategy Builder params:', {
    strategyIdFromParams,
    isValidId,
    strategyId,
    strategyName,
    isNewStrategy
  });
  
  const navigate = useNavigate();
  const { nodes, edges, globalVariables, resetNodes, handleAutoArrange } = useStrategyStore();
  const { toast } = useToast();
  

  // Handle double tap for mobile edit
  const handleHeaderDoubleClick = useCallback(() => {
    if (isMobile) {
      setIsEditingName(true);
    }
  }, [isMobile]);

  // Handle single click for overview
  const handleHeaderClick = useCallback(() => {
    if (isMobile && !isEditingName) {
      setShowOverviewPanel(true);
    }
  }, [isMobile, isEditingName]);
  
  // Handle strategy name change
  const handleStrategyNameChange = useCallback(async (newName: string) => {
    try {
      // First check for duplicate names by loading all strategies
      const { loadAllStrategies } = await import('@/hooks/strategy-store/supabase-persistence');
      const existingStrategies = await loadAllStrategies();
      
      // Check if the new name already exists (excluding current strategy)
      const isDuplicate = existingStrategies.some(
        strategy => strategy.id !== strategyId && 
        strategy.name.toLowerCase() === newName.trim().toLowerCase()
      );

      if (isDuplicate) {
        toast({
          title: "Duplicate Name",
          description: "A strategy with this name already exists. Please choose a different name.",
          variant: "destructive",
        });
        throw new Error("Duplicate strategy name");
      }

      // Save the strategy with the new name
      await saveStrategy(nodes, edges, strategyId, newName);
      
      // Update URL parameters
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('name', encodeURIComponent(newName));
      setSearchParams(newSearchParams, { replace: true });
      
      console.log(`📝 Strategy name updated to: ${newName}`);
    } catch (error) {
      console.error('❌ Failed to update strategy name:', error);
      if (error instanceof Error && error.message === "Duplicate strategy name") {
        throw error; // Re-throw duplicate name errors
      }
      throw error; // Re-throw to let the component handle the error
    }
  }, [nodes, edges, strategyId, searchParams, setSearchParams, toast]);
  
  console.log('Strategy Builder - Current state:', { 
    nodesCount: nodes.length, 
    edgesCount: edges.length 
  });
  
  // Update URL if we had to generate a new UUID
  useEffect(() => {
    if (strategyIdFromParams && !isValidUUID(strategyIdFromParams)) {
      console.log(`Invalid UUID detected in URL: ${strategyIdFromParams}, replacing with: ${strategyId}`);
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('id', strategyId);
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [strategyIdFromParams, strategyId, searchParams, setSearchParams]);
  
  
  // Simplified initialization
  useEffect(() => {
    console.log(`🔄 StrategyBuilder initializing with ID: ${strategyId}, isNew: ${isNewStrategy}, readOnly: ${isReadOnly}`);
    
    // Check if we need to load strategy data from session storage (from decryption tool)
    const sessionStorageKey = `strategy_${strategyId}`;
    const sessionStrategyData = sessionStorage.getItem(sessionStorageKey);
    
    if (sessionStrategyData) {
      try {
        const strategyData = JSON.parse(sessionStrategyData);
        console.log('📥 Loading strategy from session storage:', strategyData.name);
        
        // Import the strategy data into the store
        const { importStrategy } = require('@/hooks/strategy-management/useStrategyImport');
        if (strategyData.nodes && strategyData.edges) {
          // Clear session storage after loading
          sessionStorage.removeItem(sessionStorageKey);
          
          // Use a different approach - directly update store
          const { useStrategyStore } = require('@/hooks/use-strategy-store');
          const store = useStrategyStore.getState();
          store.setNodes(strategyData.nodes);
          store.setEdges(strategyData.edges);
          
          console.log('✅ Strategy loaded from session storage');
        }
      } catch (error) {
        console.error('❌ Failed to load strategy from session storage:', error);
        sessionStorage.removeItem(sessionStorageKey);
      }
    }
    
    // Set loaded after a brief delay to ensure component stability
    const timeoutId = setTimeout(() => {
      setIsLoaded(true);
      console.log('✅ StrategyBuilder loaded successfully');
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [strategyId, isNewStrategy, isReadOnly]);
  
  // Auto-save functionality with change detection (disabled in read-only mode)
  useEffect(() => {
    if (isLoaded && nodes.length > 0 && !isReadOnly) {
      // Create a hash of current state to detect changes
      const currentStateHash = JSON.stringify({ nodes, edges, globalVariables });
      
      // Get previous state hash from ref or localStorage
      const previousStateKey = `strategy_state_${strategyId}`;
      const previousStateHash = localStorage.getItem(previousStateKey);
      
      // Only save if state has actually changed
      if (currentStateHash !== previousStateHash) {
        // CRITICAL: Block auto-save if edges are empty but connected nodes exist
        // This prevents data loss from race conditions during initialization/operations
        const nonStartNodes = nodes.filter(n => n.type !== 'startNode' && !n.data?.isVirtual && !n.data?.isStrategyOverview);
        if (edges.length === 0 && nonStartNodes.length > 0) {
          console.warn('🚫 Auto-save BLOCKED: Edges array is empty but connected nodes exist!', {
            nodeCount: nodes.length,
            nonStartNodeCount: nonStartNodes.length,
            edgeCount: edges.length
          });
          // Don't save - wait for edges to be properly loaded
          return;
        }
        
        console.log('🔍 Auto-save check - State changed, saving:', {
          storeNodesCount: nodes.length,
          storeEdgesCount: edges.length,
          edgeDetails: edges.map(e => ({ id: e.id, source: e.source, target: e.target }))
        });
        
        const autoSaveTimer = setTimeout(async () => {
          try {
            const saved = await saveStrategy(nodes, edges, strategyId, strategyName, globalVariables);
            if (saved) {
              // Store current state hash after successful save
              localStorage.setItem(previousStateKey, currentStateHash);
              console.log(`💾 Auto-saved strategy: ${strategyId}`);
            }
          } catch (error) {
            console.error('❌ Auto-save failed:', error);
          }
        }, 2000); // Reduced delay
        
        return () => clearTimeout(autoSaveTimer);
      } else {
        console.log('🔍 Auto-save check - No changes detected, skipping save');
      }
    } else if (isReadOnly) {
      console.log('📖 Read-only mode - Auto-save disabled');
    }
  }, [nodes, edges, isLoaded, strategyId, strategyName, isReadOnly]);

  console.log('🎨 StrategyBuilder render state:', { isLoaded, nodesCount: nodes.length });

  return (
    <AppLayout>
      {/* Darker Background */}
      <div className="h-[calc(100vh-4rem)] w-full relative overflow-hidden"
           style={{
             background: 'linear-gradient(135deg, hsl(220, 25%, 8%) 0%, hsl(220, 23%, 10%) 50%, hsl(220, 25%, 8%) 100%)'
           }}>
        {/* Subtle Ambient Glow */}
        <div className="absolute inset-0 pointer-events-none"
             style={{
               background: 'radial-gradient(circle at 20% 30%, hsl(211, 100%, 50%) 0%, transparent 40%), radial-gradient(circle at 80% 70%, hsl(180, 100%, 50%) 0%, transparent 40%)',
               opacity: 0.03
             }}></div>
        {/* Mobile Header - Frosted Glass Style */}
        {isMobile ? (
          <div className="absolute top-2 left-2 right-2 z-50 flex items-center justify-between rounded-3xl px-3 py-2"
               style={{
                 background: 'linear-gradient(135deg, hsl(var(--glass-bg) / 0.6) 0%, hsl(var(--glass-bg) / 0.4) 100%)',
                 backdropFilter: 'blur(48px) saturate(200%)',
                 WebkitBackdropFilter: 'blur(48px) saturate(200%)',
                 border: '1px solid hsl(var(--glass-border) / 0.3)',
                 boxShadow: '0 12px 48px -12px hsl(var(--glass-shadow) / 0.6), 0 1px 3px 0 hsl(var(--glass-highlight) / 0.1) inset'
               }}>
            {/* Left: Back + Menu */}
            <div className="flex items-center gap-2">
              <Link to="/app/strategies">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-8 h-8 p-0 rounded-full transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    background: 'hsl(var(--accent) / 0.1)',
                    color: 'hsl(var(--accent))'
                  }}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Strategy Objects"
                    className="w-8 h-8 p-0 rounded-full transition-all duration-300 hover:-translate-y-0.5"
                    style={{
                      background: 'hsl(var(--accent) / 0.1)',
                      color: 'hsl(var(--accent))'
                    }}
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem>
                    <Layers className="h-4 w-4 mr-2" />
                    All Nodes ({nodes.length})
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('globalAutoArrange', { 
                        detail: { layoutType: 'symmetricTree' }
                      }));
                    }}
                  >
                    <Grid3X3 className="h-4 w-4 mr-2" />
                    Auto-Arrange
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <div className="w-full">
                      <ExportButton />
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Center: Strategy Name (Click for overview, Double-tap for edit) */}
            <div className="flex-1 text-center">
              {isEditingName ? (
                <EditableStrategyName 
                  name={strategyName}
                  onNameChange={async (newName) => {
                    try {
                      await handleStrategyNameChange(newName);
                      setIsEditingName(false);
                    } catch (error) {
                      // EditableStrategyName will handle the error display
                    }
                  }}
                  className="text-sm font-medium"
                />
              ) : (
                <EditableStrategyName 
                  name={strategyName}
                  onNameChange={handleStrategyNameChange}
                  className="text-sm font-medium"
                />
              )}
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                title="Strategy Variables"
                className="w-8 h-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('openGlobalVariables'));
                }}
              >
                <Variable className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              </Button>
            </div>
          </div>
        ) : (
          /* Desktop Header */
          <>
            {/* Floating back button and tools */}
            <div className="absolute top-4 left-4 z-50 flex gap-2">
              <Link to="/app/strategies">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center justify-center w-10 h-10 bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl border border-white/20 dark:border-gray-600/20 hover:bg-blue-50/20 dark:hover:bg-blue-900/20 hover:border-blue-300/30 dark:hover:border-blue-400/30 transition-all duration-300 rounded-xl shadow-lg"
                >
                  <ArrowLeft className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </Button>
              </Link>
              
              <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl border border-white/20 dark:border-gray-600/20 rounded-xl shadow-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  title="Strategy Variables"
                  className="flex items-center justify-center w-10 h-10 hover:bg-blue-50/20 dark:hover:bg-blue-900/20 hover:border-blue-300/30 dark:hover:border-blue-400/30 transition-all duration-300"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('openGlobalVariables'));
                  }}
                >
                  <Variable className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </Button>
              </div>
              
              <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl border border-white/20 dark:border-gray-600/20 rounded-xl shadow-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  title="Auto-Arrange"
                  className="flex items-center justify-center w-10 h-10 hover:bg-green-50/20 dark:hover:bg-green-900/20 hover:border-green-300/30 dark:hover:border-green-400/30 transition-all duration-300"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('globalAutoArrange', { 
                      detail: { layoutType: 'symmetricTree' }
                    }));
                  }}
                >
                  <Grid3X3 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </Button>
              </div>
            </div>

            {/* Floating strategy name */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
              <EditableStrategyName 
                name={strategyName}
                onNameChange={handleStrategyNameChange}
                className="flex items-center"
              />
            </div>
          </>
        )}
        
        {/* Auto-save indicator */}
        <AutoSaveIndicator />
        
        {/* Mobile Overview Panel */}
        {isMobile && showOverviewPanel && (
          <div className="absolute inset-0 z-[60] bg-background">
            <div className="h-full w-full">
              <StrategyOverviewPanel onClose={() => setShowOverviewPanel(false)} />
            </div>
          </div>
        )}
        
        {/* Full-height Strategy Flow Container */}
        <div className={`w-full h-full flex flex-col ${isMobile ? 'pt-14 px-2 pb-2' : 'p-4'}`}>
          <div className="h-full w-full overflow-hidden rounded-3xl border-2 border-white/40 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-xl shadow-2xl relative">
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
            
            {isLoaded ? (
              <StrategyFlow isNew={isNewStrategy} isReadOnly={isReadOnly} />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <div className="flex flex-col items-center space-y-6">
                  <div className="relative">
                    <div className="h-16 w-16 border-4 border-blue-500/30 border-t-blue-500 dark:border-blue-400/30 dark:border-t-blue-400 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 h-16 w-16 border-4 border-purple-500/20 border-b-purple-500 dark:border-purple-400/20 dark:border-b-purple-400 rounded-full animate-spin animate-reverse"></div>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                      Loading Strategy Builder
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      Preparing your visual trading environment...
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default StrategyBuilder;
