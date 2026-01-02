import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { flatIndicatorConfig } from '../../../utils/categorizedIndicatorConfig';

interface IndicatorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (indicatorData: any) => void;
  timeframeId: string;
  symbol: string;
}

const IndicatorDialog: React.FC<IndicatorDialogProps> = ({
  isOpen,
  onClose,
  onAdd,
  timeframeId,
  symbol
}) => {
  const [selectedIndicator, setSelectedIndicator] = useState<string>('');
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);

  const handleIndicatorChange = (indicatorKey: string) => {
    setSelectedIndicator(indicatorKey);
    setError(null);
    
    // Initialize parameters with defaults
    const indicator = flatIndicatorConfig[indicatorKey];
    if (indicator) {
      const defaultParams: Record<string, any> = {};
      indicator.parameters.forEach((param: any) => {
        defaultParams[param.name] = param.default;
      });
      setParameters(defaultParams);
    }
  };

  const handleParameterChange = (paramName: string, value: any) => {
    setParameters(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  const handleAdd = () => {
    if (!selectedIndicator) {
      setError('Please select an indicator');
      return;
    }

    try {
      const indicatorConfig_ = flatIndicatorConfig[selectedIndicator];
      const indicatorData = {
        function_name: indicatorConfig_.function_name,
        display_name: indicatorConfig_.display_name,
        parameters
      };

      onAdd(indicatorData);
      
      // Reset and close
      setSelectedIndicator('');
      setParameters({});
      setError(null);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add indicator');
    }
  };

  const selectedIndicatorConfig = selectedIndicator ? flatIndicatorConfig[selectedIndicator] : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Indicator</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Indicator Type</Label>
            <Select value={selectedIndicator} onValueChange={handleIndicatorChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select an indicator" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]" position="popper" sideOffset={4}>
                {Object.entries(flatIndicatorConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedIndicatorConfig && (
            <div className="space-y-3">
              <Label>Parameters</Label>
              {selectedIndicatorConfig.parameters.map((param: any) => (
                <div key={param.name} className="space-y-1">
                  <Label className="text-sm">{param.label}</Label>
                  {param.type === 'number' ? (
                    <Input
                      type="number"
                      value={parameters[param.name] || param.default}
                      onChange={(e) => handleParameterChange(param.name, parseInt(e.target.value) || param.default)}
                    />
                  ) : (
                    <Input
                      type="text"
                      value={parameters[param.name] || param.default}
                      onChange={(e) => handleParameterChange(param.name, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!selectedIndicator}>
            Add Indicator
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IndicatorDialog;