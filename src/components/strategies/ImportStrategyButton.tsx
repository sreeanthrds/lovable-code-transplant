import React, { useCallback, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { importSecureStrategy } from '@/components/strategy/utils/import-export/secureFileOperations';
import { saveStrategyToLocalStorage } from '@/components/strategy/utils/storage/operations/saveStrategy';
import { setSavingState } from '@/hooks/strategy-store/supabase-persistence';
import { useAdminRole } from '@/hooks/useAdminRole';
import { useClerkUser } from '@/hooks/useClerkUser';
import { v4 as uuidv4 } from 'uuid';
import { getStrategiesList } from '@/hooks/strategy-store/strategy-operations';
import { useNavigate } from 'react-router-dom';
import { ImportConfirmationDialog } from './dialogs/ImportConfirmationDialog';
import { toast } from '@/hooks/use-toast';

interface ImportStrategyButtonProps {
  onImportSuccess?: () => void;
}

const ImportStrategyButton: React.FC<ImportStrategyButtonProps> = ({ onImportSuccess }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isProcessingRef = useRef(false);
  const navigate = useNavigate();
  const { isAdmin } = useAdminRole();
  const { user } = useClerkUser();
  
  const [pendingImport, setPendingImport] = useState<any | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const processImport = useCallback(async (importedStrategy: any, finalName: string) => {
    try {
      setSavingState(true, 'Creating strategy...');
      
      const nodes = JSON.parse(JSON.stringify(importedStrategy.nodes));
      const edges = JSON.parse(JSON.stringify(importedStrategy.edges));
      
      const strategyId = uuidv4();
      const strategyName = finalName;
      
      console.log(`Saving imported strategy to localStorage with ID: ${strategyId}`);
      await saveStrategyToLocalStorage(nodes, edges, strategyId, strategyName);

      // Also persist to Supabase
      try {
        const { saveStrategy: persistSave } = await import('@/hooks/strategy-store/supabase-persistence');
        await persistSave(nodes as any, edges as any, strategyId, strategyName);
      } catch (e) {
        console.warn('Supabase save failed:', e);
      }
      
      toast({
        title: 'Strategy imported',
        description: `"${strategyName}" has been imported successfully.`,
      });
      
      onImportSuccess?.();
      
      // Navigate to the new imported strategy
      navigate(`/strategy?id=${strategyId}&name=${encodeURIComponent(strategyName)}`);
      
    } catch (error: any) {
      console.error('Process import error:', error);
      toast({
        title: 'Import failed',
        description: error.message || 'Failed to import strategy',
        variant: 'destructive',
      });
    } finally {
      setSavingState(false);
    }
  }, [navigate, onImportSuccess]);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isProcessingRef.current) {
      return;
    }

    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      isProcessingRef.current = true;
      setSavingState(true, 'Processing import...');
      
      let importedStrategy = null;
      
      if (file.name.endsWith('.tls')) {
        importedStrategy = await importSecureStrategy(file);
      } else if (file.name.endsWith('.json')) {
        if (!isAdmin) {
          throw new Error('Only .tls files are allowed. Please contact an admin to convert JSON to .tls.');
        }
        const text = await file.text();
        const strategyData = JSON.parse(text);
        
        if (!strategyData.nodes || !strategyData.edges) {
          throw new Error('Invalid strategy file: missing nodes or edges');
        }
        
        importedStrategy = {
          id: uuidv4(),
          name: strategyData.name || 'Imported Strategy',
          nodes: strategyData.nodes,
          edges: strategyData.edges,
          created: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          description: strategyData.description || 'Imported strategy'
        };
      } else {
        throw new Error('Unsupported file type. Please use .tls files.');
      }
      
      if (!importedStrategy) {
        throw new Error('No strategy data found in file');
      }

      // Check for duplicate strategy name and generate unique name
      const existingStrategies = getStrategiesList();
      let baseName = importedStrategy.name || 'Imported Strategy';
      let uniqueName = baseName;
      let counter = 1;
      
      while (existingStrategies.some(s => s.name.toLowerCase() === uniqueName.toLowerCase())) {
        uniqueName = `${baseName} (${counter})`;
        counter++;
      }
      
      importedStrategy.name = uniqueName;
      
      // Show confirmation dialog
      setPendingImport(importedStrategy);
      setShowConfirmDialog(true);
      
    } catch (error: any) {
      console.error('Import process error:', error);
      setSavingState(false);
      
      if (error.message.includes('Access denied')) {
        toast({
          title: 'Access Denied',
          description: 'You do not have permission to decrypt this strategy file.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Import failed',
          description: error.message,
          variant: 'destructive',
        });
      }
    } finally {
      isProcessingRef.current = false;
      setSavingState(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isAdmin]);

  const handleConfirmImport = useCallback(async (finalName: string) => {
    if (!pendingImport) return;
    await processImport(pendingImport, finalName);
    setPendingImport(null);
  }, [pendingImport, processImport]);

  const handleCancelImport = useCallback(() => {
    setPendingImport(null);
  }, []);

  const handleImportClick = useCallback(() => {
    if (isProcessingRef.current) return;
    fileInputRef.current?.click();
  }, []);

  return (
    <>
      <Button onClick={handleImportClick} variant="outline" size="lg">
        <Upload className="w-4 h-4 mr-2" />
        Import Strategy
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept={isAdmin ? '.json,.tls' : '.tls'}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      <ImportConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        strategyName={pendingImport?.name || ''}
        onConfirm={handleConfirmImport}
        onCancel={handleCancelImport}
      />
    </>
  );
};

export default ImportStrategyButton;
