
import React, { useState, useEffect } from 'react';
import { X, Search, Filter, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStrategyStore } from '@/hooks/use-strategy-store';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PositionData {
  positionId: string;
  positionTag?: string;
  nodeId: string;
  nodeLabel?: string;
  positionType: 'buy' | 'sell';
  orderType: string;
  quantity: number;
  productType: string;
  status: 'strategy-defined';
}

interface PositionStorePanelProps {
  onClose: () => void;
}

const PositionStorePanel: React.FC<PositionStorePanelProps> = ({ onClose }) => {
  const nodes = useStrategyStore((state) => state.nodes);
  const [positions, setPositions] = useState<PositionData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'strategy-defined'>('strategy-defined');

  // Extract positions from entry nodes and action nodes with entry type
  useEffect(() => {
    const extractedPositions: PositionData[] = [];
    
    nodes.forEach(node => {
      // Check entry nodes and action nodes with entry type
      if ((node.type === 'entryNode' || (node.type === 'actionNode' && node.data?.actionType === 'entry')) 
          && node.data?.positions) {
        
        // Type guard to ensure positions is an array
        const nodePositions = node.data.positions;
        if (Array.isArray(nodePositions)) {
          nodePositions.forEach((position: any) => {
            extractedPositions.push({
              positionId: String(position.vpi || 'Unknown'),
              positionTag: position.vpt ? String(position.vpt) : undefined,
              nodeId: node.id,
              nodeLabel: node.data?.label ? String(node.data.label) : `${node.type} ${node.id.slice(-4)}`,
              positionType: position.positionType || 'buy',
              orderType: position.orderType || 'market',
              quantity: Number(position.quantity) || 1,
              productType: position.productType || 'intraday',
              status: 'strategy-defined'
            });
          });
        }
      }
    });
    
    setPositions(extractedPositions);
  }, [nodes]);

  const filteredPositions = positions.filter(position => {
    const matchesSearch = searchTerm === '' || 
      position.positionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (position.positionTag && position.positionTag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      position.nodeLabel?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = position.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="h-full flex flex-col bg-background border-l">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Position Store</h3>
          <Badge variant="outline" className="text-xs">
            Strategy Preview
          </Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden p-4 space-y-4">
        {/* Info Alert */}
        <Alert variant="default" className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 text-sm">
            Visual reference showing positions defined in strategy nodes. 
            During live trading, this will actively update with real position data.
          </AlertDescription>
        </Alert>

        {/* Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search positions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value: 'strategy-defined') => setStatusFilter(value)}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="strategy-defined">Strategy Defined</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Positions Table */}
        <div className="flex-1 overflow-auto rounded-md border">
          {filteredPositions.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              <div className="text-center">
                <p className="text-sm mb-1">No positions found</p>
                <p className="text-xs">
                  {positions.length === 0 
                    ? 'Add entry nodes to see positions' 
                    : 'No positions match your search'
                  }
                </p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">ID</TableHead>
                  <TableHead className="w-16">Type</TableHead>
                  <TableHead className="w-20">Qty</TableHead>
                  <TableHead className="w-24">Order</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="w-20">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPositions.map((position, index) => (
                  <TableRow key={`${position.nodeId}-${position.positionId}-${index}`}>
                    <TableCell className="font-mono text-xs">
                      <div>
                        {position.positionId}
                        {position.positionTag && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {position.positionTag}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={position.positionType === 'buy' ? 'default' : 'destructive'} className="text-xs">
                        {position.positionType.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{position.quantity}</TableCell>
                    <TableCell className="text-sm">{position.orderType}</TableCell>
                    <TableCell className="text-sm">
                      <div>
                        {position.nodeLabel}
                        <div className="text-xs text-muted-foreground font-mono">
                          {position.nodeId}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {position.status.replace('-', ' ')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Footer */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          {positions.length} position(s) defined | {filteredPositions.length} showing
        </div>
      </div>
    </div>
  );
};

export default PositionStorePanel;
