import React from 'react';
import { Node } from '@xyflow/react';
import { X, Settings2, Info, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface LiveNodePanelProps {
  node: Node;
  onClose: () => void;
}

export function LiveNodePanel({ node, onClose }: LiveNodePanelProps) {
  const nodeData = node.data as Record<string, any>;

  const renderValue = (value: any): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">Not set</span>;
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (typeof value === 'object') {
      return (
        <pre className="text-xs bg-muted/50 p-2 rounded overflow-auto max-h-32">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }
    return String(value);
  };

  // Get commonly displayed fields based on node type
  const getDisplayFields = () => {
    const fields: { label: string; value: any }[] = [];
    
    // Common fields
    if (nodeData.label) {
      fields.push({ label: 'Name', value: nodeData.label });
    }
    
    // Strategy Controller fields
    if (node.type === 'strategyController' || nodeData.asset_type) {
      if (nodeData.asset_type) fields.push({ label: 'Asset Type', value: nodeData.asset_type });
      if (nodeData.timeframes) fields.push({ label: 'Timeframes', value: Array.isArray(nodeData.timeframes) ? nodeData.timeframes.join(', ') : nodeData.timeframes });
      if (nodeData.exchange) fields.push({ label: 'Exchange', value: nodeData.exchange });
      if (nodeData.symbol) fields.push({ label: 'Symbol', value: nodeData.symbol });
      if (nodeData.indicators) fields.push({ label: 'Indicators', value: nodeData.indicators });
    }
    
    // Entry/Exit Condition fields
    if (node.type === 'entryCondition' || node.type === 'exitCondition' || nodeData.condition) {
      if (nodeData.condition) fields.push({ label: 'Condition', value: nodeData.condition });
      if (nodeData.position_size) fields.push({ label: 'Position Size', value: nodeData.position_size });
    }
    
    // Square Off fields
    if (node.type === 'squareOff' || nodeData.exit_type) {
      if (nodeData.exit_type) fields.push({ label: 'Exit Type', value: nodeData.exit_type });
      if (nodeData.time) fields.push({ label: 'Time', value: nodeData.time });
    }

    // Add any remaining data fields
    Object.entries(nodeData).forEach(([key, value]) => {
      if (!['label', 'asset_type', 'timeframes', 'exchange', 'symbol', 'indicators', 'condition', 'position_size', 'exit_type', 'time'].includes(key)) {
        if (typeof value !== 'function' && key !== 'id') {
          fields.push({ label: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), value });
        }
      }
    });

    return fields;
  };

  const displayFields = getDisplayFields();

  return (
    <div className="h-full flex flex-col bg-background/50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Node Configuration</h3>
          <Badge variant="outline" className="text-xs flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Read-only
          </Badge>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Node Type Badge */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {node.type || 'Unknown Type'}
            </Badge>
            <span className="text-xs text-muted-foreground">ID: {node.id}</span>
          </div>

          <Separator className="bg-border/30" />

          {/* Configuration Fields */}
          <div className="space-y-3">
            {displayFields.length > 0 ? (
              displayFields.map((field, index) => (
                <div key={index} className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {field.label}
                  </label>
                  <div className="text-sm text-foreground bg-muted/30 px-3 py-2 rounded-lg border border-border/20">
                    {renderValue(field.value)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Info className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">No configuration data available</p>
              </div>
            )}
          </div>

          {/* Position Info */}
          <div className="mt-4 p-3 rounded-lg bg-muted/20 border border-border/20">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Position:</span> X: {node.position?.x?.toFixed(0) || 0}, Y: {node.position?.y?.toFixed(0) || 0}
            </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
