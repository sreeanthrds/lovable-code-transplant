
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Upload } from 'lucide-react';

import { useStrategyImport } from '@/hooks/strategy-management/useStrategyImport';
import { useAdminRole } from '@/hooks/useAdminRole';
import { useClerkUser } from '@/hooks/useClerkUser';
import { getStrategiesList } from '@/hooks/strategy-store/strategy-operations';
import { ImportConfirmationDialog } from './dialogs/ImportConfirmationDialog';

interface StrategiesHeaderProps {
  onRefresh: () => void;
  onCreateStrategy: () => void;
}

const StrategiesHeader = ({ onRefresh, onCreateStrategy }: StrategiesHeaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { importStrategy } = useStrategyImport();
  const { isAdmin } = useAdminRole();
  const { user } = useClerkUser();
  const [pendingImport, setPendingImport] = useState<{
    strategyData: any;
    file: File;
  } | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (!isAdmin && file.name.endsWith('.json')) {
        alert('Only .tls files are allowed for users. Please contact an admin to convert JSON to .tls.');
        return;
      }

      let strategyData;

      if (file.name.endsWith('.tls')) {
        const { importSecureStrategy } = await import('@/components/strategy/utils/import-export/secureFileOperations');
        strategyData = await importSecureStrategy(file);
        if (!strategyData) {
          alert('Failed to decrypt strategy file.');
          return;
        }
      } else {
        const text = await file.text();
        strategyData = JSON.parse(text);
      }

      // Validate strategy data
      if (!strategyData || !strategyData.nodes || !strategyData.edges || !strategyData.name) {
        alert('Invalid strategy file format.');
        return;
      }

      // Check for duplicate strategy name
      const existingStrategies = getStrategiesList();
      const duplicateStrategy = existingStrategies.find(
        strategy => strategy.name.toLowerCase() === strategyData.name.toLowerCase()
      );

      // Store pending import data
      setPendingImport({ strategyData, file });
      setShowImportDialog(true);

    } catch (error) {
      console.error('Error importing strategy:', error);
      alert('Failed to import strategy. Please check the selected file.');
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImportConfirm = async (finalName: string) => {
    if (!pendingImport) return;

    try {
      const { strategyData, file } = pendingImport;
      
      // Update strategy data with current user context
      const updatedStrategyData = {
        ...strategyData,
        name: finalName,
        // Ensure clean import by removing old IDs
        userId: user?.id, // Set current user ID
        strategyId: undefined // Will be generated new
      };

      if (file.name.endsWith('.tls')) {
        // For .tls files, use the Supabase persistence directly
        const { saveStrategy: persistSave } = await import('@/hooks/strategy-store/supabase-persistence');
        const normalized = {
          ...updatedStrategyData,
          created: updatedStrategyData.created || new Date().toISOString(),
          lastModified: new Date().toISOString(),
        };
        await persistSave(normalized.nodes as any, normalized.edges as any, normalized.id, finalName);
      } else {
        // For .json files, use the import hook
        importStrategy(updatedStrategyData, finalName);
      }
      
      onRefresh();
    } catch (error) {
      console.error('Error confirming import:', error);
      alert('Failed to import strategy.');
    } finally {
      setPendingImport(null);
      setShowImportDialog(false);
    }
  };

  const handleImportCancel = () => {
    setPendingImport(null);
    setShowImportDialog(false);
  };

  return (
    <>
      <div className="bg-white/[0.005] backdrop-blur-[4px] rounded-2xl p-4 border-2 border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.1),0_2px_6px_rgba(0,0,0,0.08)]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 dark:from-white dark:to-blue-200 bg-clip-text text-transparent">
              My Strategies
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Create, manage and backtest your trading strategies
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3 items-center">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleImportClick}
              title="Import strategy from JSON file"
              className="bg-white/50 dark:bg-white/5 border-blue-200/60 dark:border-blue-400/30 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-400/50 transition-all duration-300"
            >
              <Upload className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
              <span className="text-blue-700 dark:text-blue-300">Import</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={onRefresh}
              title="Refresh strategies list"
              className="bg-white/50 dark:bg-white/5 border-purple-200/60 dark:border-purple-400/30 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-400/50 transition-all duration-300"
            >
              <RefreshCw className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400" />
              <span className="text-purple-700 dark:text-purple-300">Refresh</span>
            </Button>
            
            <Button 
              onClick={onCreateStrategy} 
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span>New Strategy</span>
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept={isAdmin ? '.json,.tls' : '.tls'}
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      </div>

      <ImportConfirmationDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        strategyName={pendingImport?.strategyData?.name || ''}
        onConfirm={handleImportConfirm}
        onCancel={handleImportCancel}
      />
    </>
  );
};

export default StrategiesHeader;
