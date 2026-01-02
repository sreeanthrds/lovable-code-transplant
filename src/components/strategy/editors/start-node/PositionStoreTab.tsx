
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStrategyStore } from '@/hooks/use-strategy-store';
import { Badge } from '@/components/ui/badge';
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
  entryPrice?: number;
  exitPrice?: number;
  entryTime?: string;
  exitTime?: string;
  underlyingPriceAtEntry?: number;
  underlyingPriceAtExit?: number;
}

const PositionStoreTab: React.FC = () => {
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
              status: 'strategy-defined',
              entryPrice: position.entryPrice || undefined,
              exitPrice: position.exitPrice || undefined,
              entryTime: position.entryTime || undefined,
              exitTime: position.exitTime || undefined,
              underlyingPriceAtEntry: position.underlyingPriceAtEntry || undefined,
              underlyingPriceAtExit: position.underlyingPriceAtExit || undefined,
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

  const formatPrice = (price?: number) => {
    return price ? price.toFixed(2) : '-';
  };

  const formatTime = (time?: string) => {
    return time || '-';
  };

  return (
    <div className="space-y-4">
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
      <div className="rounded-md border max-h-96 overflow-auto">
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
                <TableHead className="w-20">ID</TableHead>
                <TableHead className="w-16">Type</TableHead>
                <TableHead className="w-16">Qty</TableHead>
                <TableHead className="w-20">Order</TableHead>
                <TableHead className="w-20">Entry Price</TableHead>
                <TableHead className="w-20">Exit Price</TableHead>
                <TableHead className="w-24">Entry Time</TableHead>
                <TableHead className="w-24">Exit Time</TableHead>
                <TableHead className="w-24">Underlying@Entry</TableHead>
                <TableHead className="w-24">Underlying@Exit</TableHead>
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
                  <TableCell className="font-mono text-sm">{formatPrice(position.entryPrice)}</TableCell>
                  <TableCell className="font-mono text-sm">{formatPrice(position.exitPrice)}</TableCell>
                  <TableCell className="text-xs">{formatTime(position.entryTime)}</TableCell>
                  <TableCell className="text-xs">{formatTime(position.exitTime)}</TableCell>
                  <TableCell className="font-mono text-sm">{formatPrice(position.underlyingPriceAtEntry)}</TableCell>
                  <TableCell className="font-mono text-sm">{formatPrice(position.underlyingPriceAtExit)}</TableCell>
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
  );
};

export default PositionStoreTab;
