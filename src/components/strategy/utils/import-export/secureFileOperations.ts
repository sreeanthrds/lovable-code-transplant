
import { Node, Edge } from '@xyflow/react';
import { encryptStrategyData, decryptStrategyData, isEncryptedData } from './encryptionUtils';
import { setSavingState } from '@/hooks/strategy-store/supabase-persistence';
import { getCurrentUserId } from './encryption/userIdUtils';
import { v4 as uuidv4 } from 'uuid';

interface StrategyData {
  id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
  created?: string;
  lastModified?: string;
  description?: string;
  // Added optional fields for export metadata
  userId?: string | null;
  strategyId?: string;
}

/**
 * Exports strategy as an encrypted .tls file
 */
export const exportSecureStrategy = (strategy: StrategyData) => {
  try {
    setSavingState(true, 'Preparing secure download...');
    
    // Include userId and strategyId in the encrypted payload
    const exportPayload: StrategyData = {
      ...strategy,
      userId: getCurrentUserId(),
      strategyId: strategy.id,
    };

    // Encrypt the strategy data
    const encryptedData = encryptStrategyData(exportPayload);
    
    // Create blob with encrypted data and custom MIME type for TradeLayout files
    const dataBlob = new Blob([encryptedData], { 
      type: 'application/x-tradelayout-strategy' 
    });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    
    // Use .tls extension for TradeLoyout Strategy files
    const fileName = `${strategy.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.tls`;
    link.download = fileName;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    console.log(`Strategy exported as secure file: ${fileName}`);
    
    // Add a small delay to show the download preparation state
    setTimeout(() => {
      setSavingState(false);
    }, 500);
    
  } catch (error) {
    console.error('Error exporting secure strategy:', error);
    setSavingState(false);
    throw error;
  }
};

/**
 * Imports strategy from either encrypted .tls files or legacy .json files
 */
export const importSecureStrategy = async (file: File): Promise<StrategyData | null> => {
  try {
    setSavingState(true, 'Importing strategy...');
    
    console.log('📁 Reading file content...');
    const text = await file.text();
    console.log('📄 File content length:', text.length);
    console.log('📄 First 100 chars:', text.substring(0, 100));
    let strategyData: StrategyData;
    
    // Check if the data is encrypted
    console.log('🔍 Checking if data is encrypted...');
    const isEncrypted = isEncryptedData(text);
    console.log('🔐 Is encrypted:', isEncrypted);
    
    if (isEncrypted) {
      console.log('🔓 Detected encrypted strategy file, decrypting...');
      try {
        strategyData = decryptStrategyData(text);
        console.log('✅ Decryption successful, data:', strategyData);
      } catch (decryptError) {
        console.error('❌ Decryption failed:', decryptError);
        throw decryptError;
      }
    } else {
      console.log('📝 Detected legacy JSON strategy file, importing directly...');
      try {
        strategyData = JSON.parse(text);
        console.log('✅ JSON parsing successful, data:', strategyData);
      } catch (parseError) {
        console.error('❌ JSON parsing failed:', parseError);
        throw parseError;
      }
    }
    
    // Validate the imported data structure
    if (!strategyData || typeof strategyData !== 'object') {
      throw new Error('Invalid file format');
    }
    
    if (!Array.isArray(strategyData.nodes) || !Array.isArray(strategyData.edges)) {
      throw new Error('Invalid strategy data: missing nodes or edges');
    }
    
    // Validate nodes structure
    const validNodes = strategyData.nodes.every((node: any) => 
      node && typeof node === 'object' && node.id && node.type && node.position
    );
    
    if (!validNodes) {
      throw new Error('Invalid node structure in imported data');
    }
    
    // Validate edges structure
    const validEdges = strategyData.edges.every((edge: any) => 
      edge && typeof edge === 'object' && edge.id && edge.source && edge.target
    );
    
    if (!validEdges) {
      throw new Error('Invalid edge structure in imported data');
    }
    
    console.log(`Successfully imported strategy with ${strategyData.nodes.length} nodes and ${strategyData.edges.length} edges`);
    
    // Return the validated strategy data with a new UUID to prevent overwriting
    const strategy: StrategyData = {
      id: uuidv4(), // Always generate new UUID to prevent overwriting existing strategies
      name: strategyData.name || 'Imported Strategy',
      nodes: strategyData.nodes,
      edges: strategyData.edges,
      created: new Date().toISOString(), // Set new creation time for imported strategy
      lastModified: new Date().toISOString(),
      description: strategyData.description || 'Imported strategy',
      // Clear any existing userId/strategyId to ensure fresh import
      userId: undefined,
      strategyId: undefined
    };
    
    setSavingState(false);
    return strategy;
    
  } catch (error) {
    console.error('Error importing strategy:', error);
    setSavingState(false);
    throw error;
  }
};
