
import { useState, useEffect } from 'react';
import { useStrategiesList } from './useStrategiesList';
import { useStrategyCreation } from './useStrategyCreation';
import { useStrategyOperations } from './useStrategyOperations';
import { useStrategyImport } from './useStrategyImport';
import { Strategy } from './types';

export type { Strategy } from './types';

export const useStrategyManagement = () => {
  const {
    strategies,
    isLoading,
    loadStrategies,
    refreshStrategies,
    setStrategies
  } = useStrategiesList();

  const { createStrategy } = useStrategyCreation(strategies);
  
  const { openStrategy, deleteStrategy } = useStrategyOperations(setStrategies);
  
  const { importStrategy } = useStrategyImport();

  return {
    strategies,
    isLoading,
    createStrategy,
    openStrategy,
    deleteStrategy,
    refreshStrategies,
    loadStrategies,
    importStrategy
  };
};
