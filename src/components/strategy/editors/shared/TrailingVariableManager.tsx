import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import EnhancedNumberInput from '@/components/ui/form/enhanced/EnhancedNumberInput';
import EnhancedSelectField from '@/components/ui/form/enhanced/EnhancedSelectField';
import { TrailingConfig, TrailingVariable, Position } from '../../nodes/action-node/types';
import { v4 as uuidv4 } from 'uuid';

interface TrailingVariableManagerProps {
  nodeId: string;
  positions: Position[];
  trailingVariables: TrailingVariable[];
  onTrailingVariablesChange: (variables: TrailingVariable[]) => void;
  onPositionsChange: (positions: Position[]) => void;
}

const TrailingVariableManager: React.FC<TrailingVariableManagerProps> = ({
  nodeId,
  positions,
  trailingVariables,
  onTrailingVariablesChange,
  onPositionsChange
}) => {
  // Helper function to migrate old config format to new format
  const migrateTrailingConfig = (config: any): TrailingConfig => {
    if (config.units && config.trailType !== undefined) {
      // Already new format
      return config;
    }
    
    // Convert old format to new format
    return {
      enabled: config.enabled,
      priceMove: config.priceMove,
      trailPrice: config.trailPrice,
      units: config.movementType || config.trailType || 'points',
      trailType: config.trailType || 'position'
    };
  };

  // Check if position is options trading
  const isOptionsPosition = (position: Position): boolean => {
    return position.optionDetails !== undefined && position.optionDetails !== null;
  };

  // Create trailing variables for positions that have trailing enabled
  const updatedTrailingVariables = useMemo(() => {
    const currentVariables = [...trailingVariables];
    
    positions.forEach(position => {
      if (position.trailingConfig?.enabled) {
        // Create position price trailing variable
        const positionVariableName = `Trailing_${position.vpt || position.vpi}_Position`;
        let existingPositionVariable = currentVariables.find(v => 
          v.positionId === position.vpi && v.config.trailType === 'position'
        );
        
        if (!existingPositionVariable) {
          const newPositionVariable: TrailingVariable = {
            id: uuidv4(),
            name: positionVariableName,
            type: 'trailing',
            positionId: position.vpi,
            config: { ...migrateTrailingConfig(position.trailingConfig), trailType: 'position' }
          };
          currentVariables.push(newPositionVariable);
        } else {
          existingPositionVariable.config = { ...migrateTrailingConfig(position.trailingConfig), trailType: 'position' };
          existingPositionVariable.name = positionVariableName;
        }
        
        // Create underlying price trailing variable (only for options)
        if (isOptionsPosition(position)) {
          const underlyingVariableName = `Trailing_${position.vpt || position.vpi}_Underlying`;
        let existingUnderlyingVariable = currentVariables.find(v => 
          v.positionId === position.vpi && v.config.trailType === 'underlying'
          );
          
          if (!existingUnderlyingVariable) {
            const newUnderlyingVariable: TrailingVariable = {
              id: uuidv4(),
              name: underlyingVariableName,
              type: 'trailing',
              positionId: position.vpi,
              config: { ...migrateTrailingConfig(position.trailingConfig), trailType: 'underlying' }
            };
            currentVariables.push(newUnderlyingVariable);
          } else {
            existingUnderlyingVariable.config = { ...migrateTrailingConfig(position.trailingConfig), trailType: 'underlying' };
            existingUnderlyingVariable.name = underlyingVariableName;
          }
        }
      } else {
        // Remove trailing variables if trailing is disabled
        const indicesToRemove = [];
        currentVariables.forEach((variable, index) => {
          if (variable.positionId === position.vpi) {
            indicesToRemove.push(index);
          }
        });
        indicesToRemove.reverse().forEach(index => currentVariables.splice(index, 1));
      }
    });
    
    return currentVariables;
  }, [positions, trailingVariables]);

  // Update trailing variables when they change
  React.useEffect(() => {
    if (JSON.stringify(updatedTrailingVariables) !== JSON.stringify(trailingVariables)) {
      onTrailingVariablesChange(updatedTrailingVariables);
    }
  }, [updatedTrailingVariables, trailingVariables, onTrailingVariablesChange]);

  const handleTrailingToggle = (vpi: string, enabled: boolean) => {
    const position = positions.find(p => p.vpi === vpi);
    if (!position) return;

    const defaultConfig: TrailingConfig = {
      enabled,
      priceMove: 1.0,
      trailPrice: 0.5,
      units: 'points',
      trailType: 'position'
    };

    // Update position's trailing config
    const updatedPositions = positions.map(p => 
      p.vpi === vpi 
        ? { ...p, trailingConfig: enabled ? defaultConfig : undefined }
        : p
    );

    // Update positions in parent component
    onPositionsChange(updatedPositions);

    // The variables will be updated through the useMemo effect
  };

  const handleConfigUpdate = (vpi: string, updates: Partial<TrailingConfig>) => {
    // Update trailing variables
    const updatedVariables = trailingVariables.map(variable => {
      if (variable.positionId === vpi) {
        return {
          ...variable,
          config: { ...variable.config, ...updates }
        };
      }
      return variable;
    });
    
    // Also update the position's trailingConfig to keep them in sync
    const updatedPositions = positions.map(position => {
      if (position.vpi === vpi && position.trailingConfig) {
        return {
          ...position,
          trailingConfig: { ...position.trailingConfig, ...updates }
        };
      }
      return position;
    });
    
    onTrailingVariablesChange(updatedVariables);
    onPositionsChange(updatedPositions);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Trailing Variables</Label>
      </div>
      
      {positions.map(position => {
        const trailingVariable = trailingVariables.find(v => v.positionId === position.vpi);
        const isEnabled = !!position.trailingConfig?.enabled;
        const config = position.trailingConfig ? migrateTrailingConfig(position.trailingConfig) : (trailingVariable?.config ? migrateTrailingConfig(trailingVariable.config) : null);
        
        return (
          <Card key={position.vpi} className="border border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">
                  Variable: Trailing_{position.vpt || position.vpi}
                </CardTitle>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={(enabled) => handleTrailingToggle(position.vpi, enabled)}
                />
              </div>
            </CardHeader>
            
            {isEnabled && config && (
              <CardContent className="pt-0 space-y-4">
                {/* Show which variables will be created */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Variables Created:</Label>
                  <div className="text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span>Trailing_{position.vpt || position.vpi}_Position</span>
                    </div>
                    {isOptionsPosition(position) && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span>Trailing_{position.vpt || position.vpi}_Underlying</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs">Units</Label>
                  <EnhancedSelectField
                    label=""
                    value={config.units}
                    onChange={(value) => handleConfigUpdate(position.vpi, {
                      units: value as 'points' | 'percentage'
                    })}
                    options={[
                      { value: 'points', label: 'Points' },
                      { value: 'percentage', label: 'Percentage' }
                    ]}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Price Move</Label>
                    <EnhancedNumberInput
                      value={config.priceMove}
                      onChange={(value) => handleConfigUpdate(position.vpi, { priceMove: Math.max(0.01, value || 0.01) })}
                      placeholder="1.0"
                      min={0.01}
                      step={0.01}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">Trail Price</Label>
                    <EnhancedNumberInput
                      value={config.trailPrice}
                      onChange={(value) => handleConfigUpdate(position.vpi, { trailPrice: Math.max(0.01, value || 0.01) })}
                      placeholder="0.5"
                      min={0.01}
                      step={0.01}
                    />
                  </div>
                </div>
                
              </CardContent>
            )}
          </Card>
        );
      })}
      
      {positions.length === 0 && (
        <div className="text-sm text-muted-foreground text-center py-4">
          No positions defined. Add positions to configure trailing variables.
        </div>
      )}
    </div>
  );
};

export default TrailingVariableManager;