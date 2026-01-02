
import React, { useCallback } from 'react';
import { Download } from 'lucide-react';
import { useStrategyStore } from '@/hooks/use-strategy-store';
import { useSearchParams } from 'react-router-dom';
import { exportSecureStrategy } from '../../utils/import-export/secureFileOperations';
import { setSavingState } from '@/hooks/strategy-store/supabase-persistence';
import { generateStrategyDescription } from '@/lib/utils/strategy-description';
import ToolbarButton from './ToolbarButton';

const ExportButton: React.FC = () => {
  const { edges, getExportableNodes } = useStrategyStore();
  const [searchParams] = useSearchParams();
  
  const strategyId = searchParams.get('id') || `strategy-${Date.now()}`;
  const strategyName = searchParams.get('name') || 'Untitled Strategy';
  
  // Get only exportable nodes (filters out virtual nodes)
  const exportableNodes = getExportableNodes();
  console.log('ExportButton - exportable nodes count:', exportableNodes.length);
  
  const handleExport = useCallback(async () => {
    setSavingState(true, 'Exporting strategy...');
    
    try {
      // Debug: Log node data to check trailing variables and regular variables
      console.log('🔍 Export Debug - Exportable nodes:', exportableNodes.map(node => ({
        id: node.id,
        type: node.type,
        hasVariables: !!node.data?.variables,
        variablesCount: Array.isArray(node.data?.variables) ? node.data.variables.length : 0,
        hasTrailingVariables: !!node.data?.trailingVariables,
        trailingVariablesCount: Array.isArray(node.data?.trailingVariables) ? node.data.trailingVariables.length : 0,
        variables: node.data?.variables,
        trailingVariables: node.data?.trailingVariables,
        allDataKeys: Object.keys(node.data || {})
      })));
      
      const strategy = {
        id: strategyId,
        name: strategyName,
        nodes: exportableNodes, // Use only exportable nodes
        edges,
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        description: generateStrategyDescription(exportableNodes)
      };
      
      // Export as encrypted .tls file
      await exportSecureStrategy(strategy);
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setSavingState(false);
    }
  }, [exportableNodes, edges, strategyId, strategyName]);

  return (
    <ToolbarButton
      icon={Download}
      label="Export"
      onClick={handleExport}
      disabled={false}
    />
  );
};

export default ExportButton;
