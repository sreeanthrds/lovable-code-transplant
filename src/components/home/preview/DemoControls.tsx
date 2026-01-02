
import React from 'react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

interface DemoControlsProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onPrevStep: () => void;
  onNextStep: () => void;
}

const DemoControls: React.FC<DemoControlsProps> = ({
  currentStep,
  totalSteps,
  isPlaying,
  onPlay,
  onPause,
  onReset,
  onPrevStep,
  onNextStep
}) => {
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-3 border border-gray-200/50 shadow-xl">
      <div className="flex items-center gap-4">
        <button
          onClick={onReset}
          className="p-2 rounded-lg bg-white/70 dark:bg-white/5 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-white/10 transition-colors"
          title="Reset Demo"
        >
          <RotateCcw className="w-4 h-4 text-gray-600" />
        </button>
        
        <button
          onClick={onPrevStep}
          disabled={currentStep === 0}
          className="p-2 rounded-lg bg-white/70 dark:bg-white/5 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Previous Step"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        
        <button
          onClick={isPlaying ? onPause : onPlay}
          className="p-2 rounded-lg bg-green-500 hover:bg-green-600 transition-colors"
          title={isPlaying ? "Pause Demo" : "Play Demo"}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-white" />
          ) : (
            <Play className="w-4 h-4 text-white" />
          )}
        </button>
        
        <button
          onClick={onNextStep}
          disabled={currentStep === totalSteps - 1}
          className="p-2 rounded-lg bg-white/70 dark:bg-white/5 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Next Step"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
        
        <div className="text-sm text-gray-600 ml-2">
          {currentStep + 1} / {totalSteps}
        </div>
      </div>
    </div>
  );
};

export default DemoControls;
