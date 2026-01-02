
import React, { Suspense, useState, useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './styles/index.css';
import './styles/mobile-fixes.css';
import './styles/menus.css';
import StrategyFlowContent from './StrategyFlowContent';
import VisualPositionStore from './vps/VisualPositionStore';

interface StrategyFlowProps {
  isNew?: boolean;
  isReadOnly?: boolean;
}

const LoadingIndicator = () => (
  <div className="h-full w-full flex items-center justify-center bg-background/50">
    <div className="flex flex-col items-center">
      <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-3"></div>
      <p className="text-sm text-muted-foreground">Loading strategy builder...</p>
    </div>
  </div>
);

const StrategyFlow = ({ isNew = false, isReadOnly = false }: StrategyFlowProps) => {
  console.log('🔄 StrategyFlow component mounting, isNew:', isNew);
  
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    console.log('🎯 StrategyFlow component mounted');
    
    // Immediate initialization for better responsiveness
    try {
      setIsReady(true);
      console.log('✅ StrategyFlow is ready to render ReactFlow');
    } catch (error) {
      console.error('❌ Error initializing StrategyFlow:', error);
      // Still set ready to prevent infinite loading
      setIsReady(true);
    }
  }, []);

  if (!isReady) {
    console.log('⏳ StrategyFlow not ready yet, showing loading indicator');
    return <LoadingIndicator />;
  }

  console.log('🚀 StrategyFlow rendering with ReactFlowProvider');

  return (
    <ReactFlowProvider>
      <Suspense fallback={<LoadingIndicator />}>
        <StrategyFlowContent isNew={isNew} isReadOnly={isReadOnly} />
        <VisualPositionStore />
      </Suspense>
    </ReactFlowProvider>
  );
};

export default StrategyFlow;
