import React from 'react';
import { Node } from '@xyflow/react';
import { X, Settings, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface NodeConfigReadonlyPanelProps {
  node: Node | null;
  onClose: () => void;
}

export function NodeConfigReadonlyPanel({ node, onClose }: NodeConfigReadonlyPanelProps) {
  if (!node) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center text-muted-foreground">
          <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Click on a node to view its configuration</p>
        </div>
      </div>
    );
  }

  const nodeData = node.data as Record<string, unknown>;
  const label = (nodeData?.label as string) || node.type || 'Node';

  // Extract configuration fields from node data
  const getDisplayFields = () => {
    const fields: Array<{ label: string; value: string | number | boolean }> = [];
    
    // Add common fields
    if (node.type) {
      fields.push({ label: 'Node Type', value: node.type });
    }
    
    // Extract fields from node data
    Object.entries(nodeData || {}).forEach(([key, value]) => {
      // Skip internal/display fields
      if (['label', 'selected', 'dragging'].includes(key)) return;
      
      // Handle different value types
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        fields.push({ 
          label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
          value 
        });
      } else if (value && typeof value === 'object') {
        // For nested objects, stringify them nicely
        fields.push({
          label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
          value: JSON.stringify(value, null, 2)
        });
      }
    });
    
    return fields;
  };

  const displayFields = getDisplayFields();

  const renderValue = (value: string | number | boolean) => {
    if (typeof value === 'boolean') {
      return (
        <Badge variant={value ? 'default' : 'secondary'} className="text-xs">
          {value ? 'Yes' : 'No'}
        </Badge>
      );
    }
    
    if (typeof value === 'string' && value.startsWith('{')) {
      return (
        <pre className="text-xs bg-muted/50 p-2 rounded overflow-auto max-h-24 font-mono">
          {value}
        </pre>
      );
    }
    
    return <span className="text-sm text-foreground">{String(value)}</span>;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/30 bg-background/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground/80">Node Configuration</h3>
          <Badge variant="outline" className="text-[10px] gap-1">
            <Lock className="w-2.5 h-2.5" />
            Read Only
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Node Name */}
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Node Name</span>
            <p className="text-sm font-medium text-foreground">{label}</p>
          </div>

          <Separator />

          {/* Node ID */}
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Node ID</span>
            <p className="text-xs font-mono text-foreground/80 bg-muted/30 px-2 py-1 rounded">
              {node.id}
            </p>
          </div>

          {/* Configuration Fields */}
          {displayFields.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Configuration
                </span>
                {displayFields.map((field, index) => (
                  <div key={index} className="space-y-1">
                    <span className="text-xs text-muted-foreground">{field.label}</span>
                    <div>{renderValue(field.value)}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {displayFields.length === 0 && (
            <p className="text-xs text-muted-foreground italic">
              No configuration data available
            </p>
          )}

          {/* Position Info */}
          <Separator />
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Position X</span>
              <p className="text-sm font-mono text-foreground">{node.position?.x?.toFixed(0) ?? 0}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Position Y</span>
              <p className="text-sm font-mono text-foreground">{node.position?.y?.toFixed(0) ?? 0}</p>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
