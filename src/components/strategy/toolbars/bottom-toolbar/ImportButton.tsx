
import React, { useCallback, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { useStrategyStore } from '@/hooks/use-strategy-store';
import { importSecureStrategy } from '../../utils/import-export/secureFileOperations';
import { saveStrategyToLocalStorage } from '../../utils/storage/operations/saveStrategy';
import ToolbarButton from './ToolbarButton';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { setSavingState } from '@/hooks/strategy-store/supabase-persistence';
import { useAdminRole } from '@/hooks/useAdminRole';
import { useClerkUser } from '@/hooks/useClerkUser';
import { v4 as uuidv4 } from 'uuid';
import { getStrategiesList } from '@/hooks/strategy-store/strategy-operations';
import { DuplicateStrategyDialog } from '../../dialogs/DuplicateStrategyDialog';

const ImportButton: React.FC = () => {
  const strategyStore = useStrategyStore();
  const { setNodes, setEdges, addHistoryItem, resetHistory } = strategyStore;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isProcessingRef = useRef(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAdmin } = useAdminRole();
  const { user } = useClerkUser();
  
  const currentStrategyId = searchParams.get('id') || '';
  const currentStrategyName = searchParams.get('name') || 'Untitled Strategy';
  
  const [pendingImport, setPendingImport] = useState<{
    strategy: any;
    file: File;
  } | null>(null);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isProcessingRef.current || !currentStrategyId) {
      return;
    }

    const file = event.target.files?.[0];
    if (!file) {
      console.error("No file selected for import");
      return;
    }

    try {
      isProcessingRef.current = true;
      setSavingState(true, 'Processing import...');
      
      console.log('Starting import process for strategy:', currentStrategyId);
      console.log('File selected:', file.name, 'Type:', file.type);
      console.log('File size:', file.size, 'bytes');
      
      let importedStrategy = null;
      
      if (file.name.endsWith('.tls')) {
        console.log('Importing encrypted strategy file...');
        console.log('File details:', { name: file.name, size: file.size, type: file.type });
        try {
          importedStrategy = await importSecureStrategy(file);
          console.log('✅ importSecureStrategy returned:', importedStrategy);
        } catch (importError) {
          console.error('❌ importSecureStrategy failed:', importError);
          throw importError;
        }
      } else if (file.name.endsWith('.json')) {
        if (!isAdmin) {
          throw new Error('Only .tls files are allowed for users. Please contact an admin to convert JSON to .tls.');
        }
        // Import plain JSON file directly
        console.log('Importing plain JSON strategy file...');
        const text = await file.text();
        const strategyData = JSON.parse(text);
        
        // Validate basic structure
        if (!strategyData.nodes || !strategyData.edges) {
          throw new Error('Invalid strategy file: missing nodes or edges');
        }
        
        importedStrategy = {
          id: uuidv4(), // Always generate new UUID for imported strategy
          name: strategyData.name || 'Imported Strategy',
          nodes: strategyData.nodes,
          edges: strategyData.edges,
          created: new Date().toISOString(), // Set new creation time
          lastModified: new Date().toISOString(),
          description: strategyData.description || 'Imported strategy'
        };
      } else {
        throw new Error('Unsupported file type. Please use .json or .tls files.');
      }
      
      if (!importedStrategy) {
        console.error('Import failed - no strategy data returned');
        setSavingState(false);
        alert('Import failed: No strategy data found in file');
        return;
      }

      console.log('Import successful, strategy data:', importedStrategy);
      console.log('Nodes count:', importedStrategy.nodes?.length || 0);
      console.log('Edges count:', importedStrategy.edges?.length || 0);
      
      // Check for duplicate strategy name
      const existingStrategies = getStrategiesList();
      const duplicateStrategy = existingStrategies.find(
        strategy => strategy.name === importedStrategy.name
      );
      
      if (duplicateStrategy) {
        console.log('Found duplicate strategy name:', importedStrategy.name);
        setPendingImport({ strategy: importedStrategy, file });
        setShowDuplicateDialog(true);
        setSavingState(false);
        return;
      }
      
      // Process the import without duplicate check (direct flow)
      await processImport(importedStrategy, file);
      
    } catch (error) {
      console.error('Import process error:', error);
      // Show user-friendly error message
      setSavingState(false);
      
      // Create a simple alert for access denied errors
      if (error.message.includes('Access denied')) {
        alert('Access Denied: You do not have permission to decrypt this strategy file. Contact the file owner or an administrator to grant you access.');
      } else {
        alert(`Import failed: ${error.message}`);
      }
    } finally {
      isProcessingRef.current = false;
      setSavingState(false);
      // Reset the file input to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [setNodes, setEdges, addHistoryItem, resetHistory, currentStrategyId, currentStrategyName, isAdmin, navigate]);

  const processImport = useCallback(async (importedStrategy: any, file: File, customName?: string) => {
    try {
      setSavingState(true, 'Processing import...');
      
      // Debug: Check if variables are preserved in imported nodes
      console.log('🔍 Import Debug - Node variables check:', importedStrategy.nodes?.map(node => ({
        id: node.id,
        type: node.type,
        hasVariables: !!node.data?.variables,
        variablesCount: Array.isArray(node.data?.variables) ? node.data.variables.length : 0,
        hasTrailingVariables: !!node.data?.trailingVariables,
        trailingVariablesCount: Array.isArray(node.data?.trailingVariables) ? node.data.trailingVariables.length : 0,
        allDataKeys: Object.keys(node.data || {})
      })) || []);

      // Deep clone to avoid reference issues
      const nodes = JSON.parse(JSON.stringify(importedStrategy.nodes));
      const edges = JSON.parse(JSON.stringify(importedStrategy.edges));
      
      // Generate new UUID for imported strategy to prevent overwriting
      const strategyId = uuidv4();
      const strategyName = customName || importedStrategy.name || "Imported Strategy";
      
      // Update imported strategy data to have current user context
      importedStrategy.userId = user?.id; // Set current user ID
      importedStrategy.strategyId = strategyId; // Set new strategy ID
      
      console.log("Setting imported nodes and edges directly");
      console.log("Current store state before import:", { 
        currentNodes: strategyStore.nodes.length, 
        currentEdges: strategyStore.edges.length 
      });
      
      // Set nodes and edges immediately
      console.log("Setting nodes:", nodes.length, "edges:", edges.length);
      
      // Update store first
      strategyStore.setNodes(nodes);
      strategyStore.setEdges(edges);
      
      // Then update React state
      setNodes(nodes);
      setEdges(edges);
      
      console.log("Store state after setting:", { 
        newNodes: strategyStore.nodes.length, 
        newEdges: strategyStore.edges.length 
      });
      
      // Reset history and add the imported state
      resetHistory();
      addHistoryItem(nodes, edges);
      
      // Force a complete refresh of the React Flow instance
      console.log("Forcing React Flow refresh...");
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
      
      // Save to localStorage
      console.log(`Saving imported strategy to localStorage with ID: ${strategyId}`);
      await saveStrategyToLocalStorage(nodes, edges, strategyId, strategyName);

      // Also persist to Supabase using unified save
      try {
        const { saveStrategy: persistSave } = await import('@/hooks/strategy-store/supabase-persistence');
        await persistSave(nodes as any, edges as any, strategyId, strategyName);
      } catch (e) {
        console.warn('Supabase save failed:', e);
      }
      
      // Trigger direct import to update React state immediately
      console.log("Triggering direct import event for immediate UI update");
      window.dispatchEvent(new CustomEvent('directImportTrigger', {
        detail: { nodes, edges }
      }));
      
      console.log("Import process completed successfully");
      
      // Navigate to the new imported strategy
      navigate(`/strategy?id=${strategyId}&name=${encodeURIComponent(strategyName)}`);
      
    } catch (error) {
      console.error('Process import error:', error);
      throw error;
    } finally {
      setSavingState(false);
    }
  }, [strategyStore, setNodes, setEdges, resetHistory, addHistoryItem, navigate]);

  const handleDuplicateReplace = useCallback(async () => {
    if (!pendingImport) return;
    
    try {
      // Find and delete the existing strategy
      const existingStrategies = getStrategiesList();
      const duplicateStrategy = existingStrategies.find(
        strategy => strategy.name === pendingImport.strategy.name
      );
      
      if (duplicateStrategy) {
        const { deleteStrategyFromStorage } = await import('@/hooks/strategy-store/strategy-operations');
        await deleteStrategyFromStorage(duplicateStrategy.id);
      }
      
      // Import with the original name
      await processImport(pendingImport.strategy, pendingImport.file);
      setPendingImport(null);
    } catch (error) {
      console.error('Replace duplicate error:', error);
      alert(`Replace failed: ${error.message}`);
    }
  }, [pendingImport, processImport]);

  const handleDuplicateRename = useCallback(async (newName: string) => {
    if (!pendingImport) return;
    
    try {
      // Import with the new name
      await processImport(pendingImport.strategy, pendingImport.file, newName);
      setPendingImport(null);
    } catch (error) {
      console.error('Rename duplicate error:', error);
      alert(`Rename failed: ${error.message}`);
    }
  }, [pendingImport, processImport]);

  const handleImport = useCallback(() => {
    if (isProcessingRef.current || !currentStrategyId) {
      console.warn('Cannot import: processing in progress or no strategy ID');
      return;
    }
    fileInputRef.current?.click();
  }, [currentStrategyId]);

  return (
    <>
      <ToolbarButton
        icon={Upload}
        label="Import"
        onClick={handleImport}
        disabled={isProcessingRef.current || !currentStrategyId}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept={isAdmin ? '.json,.tls' : '.tls'}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      <DuplicateStrategyDialog
        isOpen={showDuplicateDialog}
        onClose={() => {
          setShowDuplicateDialog(false);
          setPendingImport(null);
        }}
        existingStrategyName={pendingImport?.strategy?.name || ''}
        onReplace={handleDuplicateReplace}
        onRename={handleDuplicateRename}
      />
    </>
  );
};

export default ImportButton;
