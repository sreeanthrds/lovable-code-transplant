
import React, { useState, useCallback, useEffect } from 'react';
import { ReactFlowProvider, ReactFlow, Node, Edge, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  Play, 
  TrendingUp, 
  ArrowRight, 
  LogOut, 
  AlertTriangle,
  BarChart3
} from 'lucide-react';
import StrategyNode from './preview/StrategyNode';
import BacktestResults from './preview/BacktestResults';
import PreviewHeader from './preview/PreviewHeader';
import DemoControls from './preview/DemoControls';
import StepIndicator from './preview/StepIndicator';
import { demoSteps } from './preview/DemoStrategySteps';

const nodeTypes = {
  strategyNode: StrategyNode,
};

const iconMap = {
  Play,
  TrendingUp,
  ArrowRight,
  LogOut,
  AlertTriangle
};

const InteractiveStrategyPreview = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showBacktest, setShowBacktest] = useState(false);

  const currentStep = demoSteps[currentStepIndex];

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying) {
      const timer = setTimeout(() => {
        if (currentStepIndex < demoSteps.length - 1) {
          setCurrentStepIndex(prev => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, 3000); // 3 seconds per step

      return () => clearTimeout(timer);
    }
  }, [isPlaying, currentStepIndex]);

  // Convert nodes to include proper icons
  const processedNodes: Node[] = currentStep.nodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      icon: iconMap[node.data.icon as keyof typeof iconMap] || Play
    }
  }));

  const onNodeClick = useCallback((event, node) => {
    // Demo nodes are not interactive
  }, []);

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleReset = () => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };
  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      setIsPlaying(false);
    }
  };
  const handleNextStep = () => {
    if (currentStepIndex < demoSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setIsPlaying(false);
    }
  };

  const backtestResults = {
    totalReturn: 245600,
    winRate: 73.2,
    totalTrades: 142,
    maxDrawdown: 8.2,
    sharpeRatio: 2.1,
    profitFactor: 1.8
  };

  return (
    <div className="relative group">
      {/* Enhanced background glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-green-500/15 via-emerald-500/10 to-blue-500/5 rounded-3xl blur-3xl opacity-60 group-hover:opacity-80 transition-opacity duration-700"></div>
      
      <div className="relative bg-gradient-to-br from-white/98 to-gray-50/98 backdrop-blur-xl overflow-hidden rounded-3xl shadow-2xl border border-white/40 transform transition-all duration-700 ease-out group-hover:scale-[1.01] group-hover:shadow-3xl">
        {/* Header */}
        <PreviewHeader 
          showBacktest={showBacktest}
          onToggleBacktest={() => setShowBacktest(!showBacktest)}
        />
        
        {/* Strategy Builder Canvas */}
        <div className="h-[400px] relative bg-gradient-to-br from-gray-50/30 to-white/30">
          <ReactFlowProvider>
            <ReactFlow
              nodes={processedNodes}
              edges={currentStep.edges}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              fitView
              minZoom={0.6}
              maxZoom={1.4}
              defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
              proOptions={{ hideAttribution: true }}
              className="bg-transparent"
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
            >
              <Background 
                color="#e5e7eb" 
                gap={24} 
                size={1} 
                style={{ opacity: 0.5 }}
              />
              <Controls 
                showInteractive={false} 
                position="bottom-right" 
                className="opacity-60 hover:opacity-100 transition-opacity" 
              />
            </ReactFlow>
          </ReactFlowProvider>
          
          {/* Step Indicator */}
          <StepIndicator 
            currentStep={currentStep}
            stepNumber={currentStepIndex}
            totalSteps={demoSteps.length}
          />
          
          {/* Demo Controls */}
          <DemoControls
            currentStep={currentStepIndex}
            totalSteps={demoSteps.length}
            isPlaying={isPlaying}
            onPlay={handlePlay}
            onPause={handlePause}
            onReset={handleReset}
            onPrevStep={handlePrevStep}
            onNextStep={handleNextStep}
          />
          
          {/* Backtesting Results Panel */}
          {showBacktest && <BacktestResults results={backtestResults} />}
        </div>
      </div>
    </div>
  );
};

export default InteractiveStrategyPreview;
