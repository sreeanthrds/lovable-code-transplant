import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Position, ConditionInfo, NodeVariables, NodeVariableValue } from '@/lib/api/backtest-api';
import { cn } from '@/lib/utils';
import { ArrowRight, Clock, TrendingUp, Variable, Activity } from 'lucide-react';

interface TradeDetailProps {
  position: Position;
}

const TradeDetail: React.FC<TradeDetailProps> = ({ position }) => {
  // Render condition info with original and substituted values
  const renderConditionInfo = (conditionInfo: ConditionInfo | undefined, type: 'entry' | 'exit') => {
    if (!conditionInfo) {
      return <p className="text-sm text-muted-foreground">No conditions data available</p>;
    }

    const bgColor = type === 'entry' ? 'from-emerald-500/10 to-teal-500/5' : 'from-rose-500/10 to-orange-500/5';
    const borderColor = type === 'entry' ? 'border-emerald-500/20' : 'border-rose-500/20';
    const iconColor = type === 'entry' ? 'text-emerald-500' : 'text-rose-500';

    return (
      <div className={cn('rounded-xl border p-4 bg-gradient-to-br', bgColor, borderColor)}>
        {/* Original Expression */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className={cn('p-1.5 rounded-lg bg-background/50', iconColor)}>
              <Activity className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Original Expression
            </span>
          </div>
          <code className="block text-sm font-mono text-foreground/80 bg-background/40 rounded-lg p-3 break-all leading-relaxed">
            {conditionInfo.original}
          </code>
        </div>

        {/* Substituted Values */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className={cn('p-1.5 rounded-lg bg-background/50', iconColor)}>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Evaluated Values
            </span>
          </div>
          <code className="block text-sm font-mono bg-background/60 rounded-lg p-3 break-all leading-relaxed">
            <span className={cn('font-semibold', type === 'entry' ? 'text-emerald-400' : 'text-rose-400')}>
              {conditionInfo.substituted}
            </span>
          </code>
        </div>
      </div>
    );
  };

  // Helper to check if value is NodeVariableValue with original/substituted
  const isNodeVariableValue = (value: any): value is NodeVariableValue => {
    if (typeof value !== 'object' || value === null) return false;
    return 'original' in value && 'substituted' in value;
  };

  // Render node variables in a modern flat list format with original/substituted display
  const renderNodeVariables = (
    nodeVariables: NodeVariables | undefined,
    type: 'entry' | 'exit'
  ) => {
    if (!nodeVariables || Object.keys(nodeVariables).length === 0) {
      return <p className="text-sm text-muted-foreground">No node variables available</p>;
    }

    const accentColor = type === 'entry' ? 'text-emerald-400' : 'text-rose-400';
    const dotColor = type === 'entry' ? 'bg-emerald-500' : 'bg-rose-500';
    const bgColor = type === 'entry' ? 'from-emerald-500/10 to-teal-500/5' : 'from-rose-500/10 to-orange-500/5';
    const borderColor = type === 'entry' ? 'border-emerald-500/20' : 'border-rose-500/20';

    // Flatten all variables for display - use 'any' to handle various value formats
    const flatVariables: { nodeId: string; varName: string; value: any }[] = [];
    Object.entries(nodeVariables).forEach(([nodeId, variables]) => {
      if (typeof variables === 'object' && variables !== null) {
        Object.entries(variables).forEach(([varName, value]) => {
          flatVariables.push({ nodeId, varName, value });
        });
      }
    });

    // Debug: log the actual data structure
    console.log('Node Variables Debug:', JSON.stringify(nodeVariables, null, 2));
    console.log('Flat Variables:', flatVariables);

    return (
      <div className={cn('rounded-xl border p-4 bg-gradient-to-br', bgColor, borderColor)}>
        <div className="space-y-4">
          {flatVariables.map(({ nodeId, varName, value }, idx) => {
            // Debug each value
            console.log(`Variable ${varName}:`, value, 'Type:', typeof value, 'Has original:', value && typeof value === 'object' && 'original' in value);
            
            const hasOriginalSubstituted = value && typeof value === 'object' && 'original' in value && 'substituted' in value;
            
            return (
              <div key={idx} className="space-y-2">
                {/* Variable Name Header */}
                <div className="flex items-center gap-2">
                  <div className={cn('w-2 h-2 rounded-full', dotColor)} />
                  <code className="text-sm font-semibold">
                    <span className={accentColor}>{varName}</span>
                  </code>
                  <span className="text-xs text-muted-foreground">({nodeId})</span>
                </div>

                {hasOriginalSubstituted ? (
                  <div className="ml-4 space-y-3 bg-background/30 rounded-lg p-3">
                    {/* Original Expression */}
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground uppercase tracking-wide block">
                        Expression Preview
                      </span>
                      <code className="text-sm font-mono text-foreground/90 bg-background/50 rounded px-2 py-1 block break-all">
                        {(value as NodeVariableValue).original}
                      </code>
                    </div>
                    {/* Evaluated Value */}
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground uppercase tracking-wide block">
                        Evaluated Value
                      </span>
                      <code className={cn('text-sm font-mono font-semibold bg-background/50 rounded px-2 py-1 block', accentColor)}>
                        {typeof (value as NodeVariableValue).substituted === 'number' 
                          ? ((value as NodeVariableValue).substituted as number).toFixed(2) 
                          : String((value as NodeVariableValue).substituted)}
                      </code>
                    </div>
                  </div>
                ) : (
                  /* Fallback for simple numeric values */
                  <div className="ml-4 bg-background/30 rounded-lg p-3">
                    <span className="text-xs text-muted-foreground uppercase tracking-wide block mb-1">Evaluated Value</span>
                    <span className={cn('font-mono font-semibold', accentColor)}>
                      {typeof value === 'number' ? value.toFixed(2) : JSON.stringify(value)}
                    </span>
                  </div>
                )}

                {/* Separator between variables */}
                {idx < flatVariables.length - 1 && (
                  <div className="border-t border-border/30 mt-3" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render spot price info
  const renderSpotPrice = (spotPrice: number | undefined, type: 'entry' | 'exit') => {
    if (spotPrice === undefined) return null;

    const bgColor = type === 'entry' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20';
    const iconColor = type === 'entry' ? 'text-emerald-500' : 'text-rose-500';

    return (
      <div className={cn('flex items-center justify-between p-4 rounded-xl border', bgColor)}>
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg bg-background/50', iconColor)}>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Spot Price</p>
            <p className="text-lg font-semibold">{spotPrice.toFixed(2)}</p>
          </div>
        </div>
      </div>
    );
  };

  // Render time info
  const renderTimeInfo = (time: string | undefined, type: 'entry' | 'exit') => {
    if (!time) return null;

    const bgColor = type === 'entry' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20';
    const iconColor = type === 'entry' ? 'text-emerald-500' : 'text-rose-500';

    const formattedTime = new Date(time).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'medium'
    });

    return (
      <div className={cn('flex items-center justify-between p-4 rounded-xl border', bgColor)}>
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg bg-background/50', iconColor)}>
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{type === 'entry' ? 'Entry' : 'Exit'} Time</p>
            <p className="text-sm font-medium">{formattedTime}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderEntrySection = () => {
    return (
      <div className="space-y-4">
        {/* Time and Spot Price Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderTimeInfo(position.entry_time, 'entry')}
          {renderSpotPrice(position.nifty_spot_at_entry, 'entry')}
        </div>

        {/* Entry Conditions */}
        <Card className="border-emerald-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              Entry Conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderConditionInfo(position.entry_conditions, 'entry')}
          </CardContent>
        </Card>

        {/* Node Variables */}
        <Card className="border-emerald-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Variable className="w-4 h-4 text-emerald-500" />
              Node Variables at Entry
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderNodeVariables(position.node_variables_display || position.node_variables, 'entry')}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderExitSection = () => {
    return (
      <div className="space-y-4">
        {/* Time and Spot Price Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderTimeInfo(position.exit_time, 'exit')}
          {renderSpotPrice(position.nifty_spot_at_exit, 'exit')}
        </div>

        {/* Exit Conditions */}
        <Card className="border-rose-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-500" />
              Exit Conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderConditionInfo(position.exit_conditions, 'exit')}
          </CardContent>
        </Card>

        {/* Exit Node Variables */}
        <Card className="border-rose-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Variable className="w-4 h-4 text-rose-500" />
              Node Variables at Exit
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderNodeVariables(position.exit_node_variables_display || position.exit_node_variables, 'exit')}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="p-4">
      {/* Trade Summary Header */}
      <div className="mb-6 p-4 bg-gradient-to-r from-background to-muted/30 rounded-xl border">
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Position ID</span>
            <p className="font-mono text-sm font-medium">{position.position_id}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Status</span>
            <div className="mt-0.5">
              <Badge 
                variant={position.status === 'CLOSED' ? 'secondary' : 'default'} 
                className="font-medium"
              >
                {position.status}
              </Badge>
            </div>
          </div>
          <div>
            <span className="text-xs text-muted-foreground uppercase tracking-wide">P&L</span>
            <p className={cn(
              'text-lg font-bold',
              position.pnl > 0 ? 'text-emerald-500' : position.pnl < 0 ? 'text-rose-500' : 'text-foreground'
            )}>
              ₹{position.pnl.toFixed(2)}
              {position.pnl_percentage !== undefined && (
                <span className="text-sm font-normal ml-1 opacity-80">
                  ({position.pnl_percentage > 0 ? '+' : ''}{position.pnl_percentage.toFixed(2)}%)
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="entry" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="entry" className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            Entry Details
          </TabsTrigger>
          <TabsTrigger value="exit" className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-500" />
            Exit Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="entry" className="mt-0">
          {renderEntrySection()}
        </TabsContent>

        <TabsContent value="exit" className="mt-0">
          {renderExitSection()}
        </TabsContent>
      </Tabs>

      {/* Raw Data (collapsible) */}
      <details className="mt-6">
        <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
          View Raw Position Data
        </summary>
        <pre className="mt-3 p-4 bg-muted/30 rounded-xl text-xs overflow-x-auto max-h-96 border">
          {JSON.stringify(position, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default TradeDetail;