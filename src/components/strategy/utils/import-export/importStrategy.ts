
import { Node, Edge } from '@xyflow/react';
import { setSavingState } from '@/hooks/strategy-store/supabase-persistence';
import { getCurrentUserId } from './encryption/userIdUtils';
import { v4 as uuidv4 } from 'uuid';

// Track import state to prevent storage sync during import
let importInProgress = false;
let lastImportTime = 0;

export const setImportInProgress = (value: boolean) => {
  importInProgress = value;
  if (value) {
    lastImportTime = Date.now();
  }
};

export const isImportInProgress = () => importInProgress;

export const isRecentImport = (threshold = 2000) => {
  return Date.now() - lastImportTime < threshold;
};

interface StrategyData {
  id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
  created?: string;
  lastModified?: string;
  description?: string;
  // Optional metadata for export
  userId?: string | null;
  strategyId?: string;
}

export const importStrategyFromFile = async (file: File): Promise<StrategyData | null> => {
  try {
    setImportInProgress(true);
    setSavingState(true, 'Importing strategy...');
    
    const text = await file.text();
    const data = JSON.parse(text);
    
    // Validate the imported data structure
    if (!data || typeof data !== 'object') {
      console.error('Invalid file format');
      throw new Error('Invalid file format');
    }
    
    if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
      console.error('Invalid strategy data: missing nodes or edges');
      throw new Error('Invalid strategy data: missing nodes or edges');
    }
    
    // Validate nodes structure
    const validNodes = data.nodes.every((node: any) => 
      node && typeof node === 'object' && node.id && node.type && node.position
    );
    
    if (!validNodes) {
      console.error('Invalid node structure in imported data');
      throw new Error('Invalid node structure in imported data');
    }
    
    // Validate edges structure
    const validEdges = data.edges.every((edge: any) => 
      edge && typeof edge === 'object' && edge.id && edge.source && edge.target
    );
    
    if (!validEdges) {
      console.error('Invalid edge structure in imported data');
      throw new Error('Invalid edge structure in imported data');
    }
    
    console.log(`Successfully parsed strategy with ${data.nodes.length} nodes and ${data.edges.length} edges`);
    
    // Return the validated strategy data with new UUID
    const strategy: StrategyData = {
      id: uuidv4(), // Always generate new UUID to prevent overwriting
      name: data.name || 'Imported Strategy',
      nodes: data.nodes,
      edges: data.edges,
      created: new Date().toISOString(), // Set new creation time for imported strategy
      lastModified: new Date().toISOString(),
      description: data.description || 'Imported strategy'
    };
    
    return strategy;
    
  } catch (error) {
    console.error('Error importing strategy:', error);
    setSavingState(false);
    throw error;
  } finally {
    // Reset import flag after a delay
    setTimeout(() => {
      setImportInProgress(false);
      setSavingState(false);
    }, 1000);
  }
};

export const exportStrategyToFile = (strategy: StrategyData) => {
  try {
    setSavingState(true, 'Preparing download...');
    
    // Add metadata fields
    const exportPayload = {
      ...strategy,
      userId: getCurrentUserId(),
      strategyId: strategy.id,
    };
    
    const dataStr = JSON.stringify(exportPayload, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${strategy.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    // Add a small delay to show the download preparation state
    setTimeout(() => {
      setSavingState(false);
    }, 500);
    
  } catch (error) {
    console.error('Error exporting strategy:', error);
    setSavingState(false);
  }
};
