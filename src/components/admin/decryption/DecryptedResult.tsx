import React, { useState, lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Download, Eye, EyeOff, Play, Copy } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useStrategyImport } from '@/hooks/strategy-management/useStrategyImport';
import { v4 as uuidv4 } from 'uuid';

// Lazy load react-json-view to avoid SSR issues
const ReactJson = lazy(() => import('react-json-view'));
interface DecryptedResultProps {
  decryptedData: string;
  sourceUserId?: string; // ID of the user who owns this strategy
}

export const DecryptedResult: React.FC<DecryptedResultProps> = ({ decryptedData, sourceUserId }) => {
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted');
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { importStrategy } = useStrategyImport();
  
  // Get current user ID to check if they own this strategy
  const getCurrentUserId = () => {
    try {
      const clerk = (window as any).Clerk;
      if (clerk && clerk.user) {
        return clerk.user.id;
      }
      return null;
    } catch (error) {
      console.error('Error getting current user ID:', error);
      return null;
    }
  };
  
  const currentUserId = getCurrentUserId();
  const isOwner = currentUserId === sourceUserId;
  const canEdit = isOwner || !sourceUserId; // Allow editing if owner or if no source user specified
  
  const handleDownloadDecrypted = () => {
    if (!decryptedData) return;

    const blob = new Blob([decryptedData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'decrypted_strategy.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleLoadToBuilder = () => {
    try {
      const strategyData = JSON.parse(decryptedData);
      
      if (!strategyData.nodes || !strategyData.edges || !strategyData.name) {
        toast.error('Invalid strategy data format');
        return;
      }
      
      // If user doesn't own this strategy, they get read-only mode
      const strategyName = canEdit ? strategyData.name : `${strategyData.name} (Read-only)`;
      const strategyId = canEdit ? strategyData.id : uuidv4();
      
      // Navigate to strategy builder with the strategy data
      const params = new URLSearchParams({
        id: strategyId,
        name: strategyName,
        mode: canEdit ? 'edit' : 'readonly'
      });
      
      // Store the strategy data temporarily for the builder to pick up
      sessionStorage.setItem(`strategy_${strategyId}`, JSON.stringify(strategyData));
      
      navigate(`/app/strategy-builder?${params.toString()}`);
      toast.success(canEdit ? 'Strategy loaded for editing' : 'Strategy loaded in read-only mode');
    } catch (error) {
      console.error('Error loading strategy:', error);
      toast.error('Failed to load strategy data');
    }
  };

  const handleCloneStrategy = () => {
    try {
      const strategyData = JSON.parse(decryptedData);
      
      if (!strategyData.nodes || !strategyData.edges || !strategyData.name) {
        toast.error('Invalid strategy data format');
        return;
      }
      
      // Create a new strategy with current user as owner
      const clonedName = `${strategyData.name} (Copy)`;
      
      if (importStrategy(strategyData, clonedName)) {
        toast.success('Strategy cloned successfully');
        // Navigate to the cloned strategy
        navigate('/app/strategies');
      } else {
        toast.error('Failed to clone strategy');
      }
    } catch (error) {
      console.error('Error cloning strategy:', error);
      toast.error('Failed to clone strategy');
    }
  };

  let parsedData = null;
  let isValidStrategy = false;
  try {
    parsedData = JSON.parse(decryptedData);
    isValidStrategy = parsedData && parsedData.nodes && parsedData.edges && parsedData.name;
  } catch (error) {
    // If parsing fails, show raw text
    parsedData = null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Decrypted Strategy Data
        </CardTitle>
        <div className="flex flex-wrap gap-2">
          {/* Strategy Builder Actions - Only show if valid strategy */}
          {isValidStrategy && (
            <>
              <Button
                onClick={handleLoadToBuilder}
                className="flex items-center gap-2"
                size="sm"
              >
                <Play className="w-4 h-4" />
                {canEdit ? 'Edit in Builder' : 'View in Builder'}
              </Button>
              {!canEdit && (
                <Button
                  variant="outline"
                  onClick={handleCloneStrategy}
                  className="flex items-center gap-2"
                  size="sm"
                >
                  <Copy className="w-4 h-4" />
                  Clone to My Strategies
                </Button>
              )}
            </>
          )}
          
          {/* Regular Actions */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadDecrypted}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(decryptedData);
            }}
          >
            Copy to Clipboard
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'formatted' ? 'raw' : 'formatted')}
            className="flex items-center gap-2"
          >
            {viewMode === 'formatted' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {viewMode === 'formatted' ? 'Raw View' : 'Formatted View'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === 'formatted' && parsedData ? (
          <div className="border rounded p-4 bg-card overflow-auto max-h-[600px]">
            <Suspense fallback={<div className="text-muted-foreground">Loading JSON viewer...</div>}>
              <ReactJson
                src={parsedData}
                theme={theme === 'dark' ? 'tomorrow' : 'rjv-default'}
                displayDataTypes={false}
                enableClipboard={true}
                collapsed={2}
                style={{ 
                  backgroundColor: 'transparent',
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: '0.875rem'
                }}
              />
            </Suspense>
          </div>
        ) : (
          <Textarea
            value={decryptedData}
            readOnly
            rows={20}
            className="font-mono text-sm"
          />
        )}
      </CardContent>
    </Card>
  );
};