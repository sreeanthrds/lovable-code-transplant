import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { History, RotateCcw, Clock, Layers } from 'lucide-react';
import { versionHistoryService, StrategyVersion } from '@/lib/supabase/services/version-history-service';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface VersionHistoryPanelProps {
  strategyId: string;
  onRestore: (nodes: any[], edges: any[]) => void;
  trigger?: React.ReactNode;
}

export const VersionHistoryPanel: React.FC<VersionHistoryPanelProps> = ({
  strategyId,
  onRestore,
  trigger
}) => {
  const [versions, setVersions] = useState<StrategyVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const loadVersions = async () => {
    if (!strategyId) return;
    
    setLoading(true);
    try {
      const data = await versionHistoryService.getVersions(strategyId);
      setVersions(data);
    } catch (error) {
      console.error('Failed to load versions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load version history',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && strategyId) {
      loadVersions();
    }
  }, [open, strategyId]);

  const handleRestore = async (versionId: string) => {
    setRestoring(versionId);
    try {
      const restored = await versionHistoryService.restoreVersion(versionId);
      if (restored) {
        onRestore(restored.nodes, restored.edges);
        setOpen(false);
        toast({
          title: 'Version Restored',
          description: 'Strategy has been restored to the selected version',
        });
      } else {
        throw new Error('Failed to restore version');
      }
    } catch (error) {
      console.error('Failed to restore version:', error);
      toast({
        title: 'Restore Failed',
        description: 'Could not restore the selected version',
        variant: 'destructive',
      });
    } finally {
      setRestoring(null);
    }
  };

  const getVersionInfo = (version: StrategyVersion) => {
    const strategy = typeof version.strategy === 'string' 
      ? JSON.parse(version.strategy) 
      : version.strategy;
    
    return {
      nodeCount: strategy?.nodes?.length || 0,
      edgeCount: strategy?.edges?.length || 0
    };
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <History className="h-4 w-4" />
            Version History
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Version History
          </SheetTitle>
          <SheetDescription>
            View and restore previous versions of your strategy. Up to 10 versions are kept automatically.
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-180px)] mt-4 pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No version history available yet.</p>
              <p className="text-sm mt-1">Versions are saved automatically when you save your strategy.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((version, index) => {
                const info = getVersionInfo(version);
                const isLatest = index === 0;
                
                return (
                  <div
                    key={version.id}
                    className="p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Version {version.version_number}</span>
                          {isLatest && (
                            <Badge variant="secondary" className="text-xs">Latest</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Layers className="h-3 w-3" />
                            {info.nodeCount} nodes, {info.edgeCount} edges
                          </span>
                        </div>
                      </div>
                      
                      {!isLatest && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestore(version.id)}
                          disabled={restoring === version.id}
                          className="gap-1"
                        >
                          {restoring === version.id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                          ) : (
                            <RotateCcw className="h-3 w-3" />
                          )}
                          Restore
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
