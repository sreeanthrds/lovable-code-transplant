import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Database, Zap, Info } from 'lucide-react';
import { format, parse } from 'date-fns';
import { cn } from '@/lib/utils';
import { useBrokerConnections, BrokerConnection, ClickHouseMetadata } from '@/hooks/use-broker-connections';
import { useToast } from '@/hooks/use-toast';

interface ClickHouseConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  editingConnection?: BrokerConnection | null;
}

const ClickHouseConnectionDialog: React.FC<ClickHouseConnectionDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  editingConnection
}) => {
  const [connectionName, setConnectionName] = useState('ClickHouse Simulation');
  const [simulationDate, setSimulationDate] = useState<Date | undefined>(new Date());
  const [speedMultiplier, setSpeedMultiplier] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  const { createConnection, updateConnection } = useBrokerConnections();
  const { toast } = useToast();

  const isEditMode = !!editingConnection;

  // Populate form with existing data when editing
  useEffect(() => {
    if (editingConnection) {
      setConnectionName(editingConnection.connection_name || 'ClickHouse Simulation');
      
      // Parse metadata from broker_metadata JSONB field
      const metadata = editingConnection.broker_metadata as ClickHouseMetadata | null;
      
      if (metadata?.simulation_date) {
        try {
          const parsedDate = parse(metadata.simulation_date, 'yyyy-MM-dd', new Date());
          if (!isNaN(parsedDate.getTime())) {
            setSimulationDate(parsedDate);
          }
        } catch (e) {
          console.error('Failed to parse simulation date:', e);
          setSimulationDate(new Date());
        }
      } else {
        setSimulationDate(new Date());
      }
      
      // Get speed multiplier from metadata
      if (metadata?.speed_multiplier) {
        setSpeedMultiplier(String(metadata.speed_multiplier));
      } else {
        setSpeedMultiplier('1');
      }
    } else {
      // Reset to defaults for new connection
      setConnectionName('ClickHouse Simulation');
      setSimulationDate(new Date());
      setSpeedMultiplier('1');
    }
  }, [editingConnection, open]);

  const handleSubmit = async () => {
    if (!simulationDate) {
      toast({
        title: 'Date Required',
        description: 'Please select a simulation date',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const metadata: ClickHouseMetadata = {
        type: 'clickhouse',
        simulation_date: format(simulationDate, 'yyyy-MM-dd'),
        speed_multiplier: parseInt(speedMultiplier, 10)
      };

      if (isEditMode && editingConnection) {
        // Update existing connection
        await updateConnection(editingConnection.id, {
          connection_name: connectionName,
          broker_metadata: metadata,
        });

        toast({
          title: 'Connection Updated',
          description: 'ClickHouse simulation settings have been saved'
        });
      } else {
        // Create new connection
        await createConnection({
          broker_type: 'clickhouse',
          connection_name: connectionName,
          broker_metadata: metadata,
          status: 'connected'
        });

        toast({
          title: 'Connection Created',
          description: 'ClickHouse simulation connection is ready'
        });
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save ClickHouse connection:', error);
      toast({
        title: 'Error',
        description: `Failed to ${isEditMode ? 'update' : 'create'} connection`,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 flex items-center justify-center">
              <Database className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <DialogTitle className="text-xl">
                {isEditMode ? 'Edit ClickHouse Simulation' : 'ClickHouse Simulation'}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {isEditMode ? 'Update simulation settings' : 'Historical data replay'}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Info Banner */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground">
              ClickHouse simulation replays historical tick data as if it were live trading. 
              Perfect for testing strategies without real market risk.
            </div>
          </div>

          {/* Connection Name */}
          <div className="space-y-2">
            <Label htmlFor="connection-name">Connection Name</Label>
            <Input
              id="connection-name"
              value={connectionName}
              onChange={(e) => setConnectionName(e.target.value)}
              placeholder="My Simulation"
            />
          </div>

          {/* Simulation Date */}
          <div className="space-y-2">
            <Label>Simulation Date</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !simulationDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {simulationDate ? format(simulationDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={simulationDate}
                  onSelect={(date) => {
                    setSimulationDate(date);
                    setCalendarOpen(false);
                  }}
                  disabled={(date) => date > new Date() || date < new Date('2020-01-01')}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">
              Select a past trading date to replay
            </p>
          </div>

          {/* Speed Multiplier */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              Speed Multiplier
            </Label>
            <Select value={speedMultiplier} onValueChange={setSpeedMultiplier}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">
                  <div className="flex items-center gap-2">
                    <span>1x</span>
                    <Badge variant="secondary" className="text-xs">Real-time</Badge>
                  </div>
                </SelectItem>
                <SelectItem value="4">
                  <div className="flex items-center gap-2">
                    <span>4x</span>
                    <Badge variant="secondary" className="text-xs">Fast</Badge>
                  </div>
                </SelectItem>
                <SelectItem value="10">
                  <div className="flex items-center gap-2">
                    <span>10x</span>
                    <Badge variant="secondary" className="text-xs">Very Fast</Badge>
                  </div>
                </SelectItem>
                <SelectItem value="50">
                  <div className="flex items-center gap-2">
                    <span>50x</span>
                    <Badge variant="secondary" className="text-xs">Turbo</Badge>
                  </div>
                </SelectItem>
                <SelectItem value="100">
                  <div className="flex items-center gap-2">
                    <span>100x</span>
                    <Badge variant="secondary" className="text-xs">Ultra Fast</Badge>
                  </div>
                </SelectItem>
                <SelectItem value="500">
                  <div className="flex items-center gap-2">
                    <span>500x</span>
                    <Badge variant="secondary" className="text-xs">Maximum</Badge>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Higher speed = faster simulation playback
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting 
              ? (isEditMode ? 'Saving...' : 'Creating...') 
              : (isEditMode ? 'Save Changes' : 'Create Connection')
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClickHouseConnectionDialog;
