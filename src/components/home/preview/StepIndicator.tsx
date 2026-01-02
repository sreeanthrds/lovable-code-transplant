
import React from 'react';
import { DemoStep } from './DemoStrategySteps';

interface StepIndicatorProps {
  currentStep: DemoStep;
  stepNumber: number;
  totalSteps: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  stepNumber,
  totalSteps
}) => {
  return (
    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-lg max-w-xs">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-medium">
          {stepNumber + 1}
        </div>
        <div className="text-xs text-gray-500">
          Step {stepNumber + 1} of {totalSteps}
        </div>
      </div>
      <h3 className="font-semibold text-gray-800 text-sm mb-1">
        {currentStep.title}
      </h3>
      <p className="text-xs text-gray-600 leading-relaxed">
        {currentStep.description}
      </p>
    </div>
  );
};

export default StepIndicator;
