import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { SymbolConfig, TimeframeConfig } from '../../action-node/types';
import NSEBSEInstrumentConfig from './NSEBSEInstrumentConfig';
import MCXInstrumentConfig from './MCXInstrumentConfig';

interface InstrumentManagerProps {
  instrumentType: 'trading' | 'supporting';
  formData: any;
  handleInputChange: (field: string, value: any) => void;
  handleTradingInstrumentChange: (type: 'stock' | 'futures' | 'options') => void;
  handleUnderlyingTypeChange: (underlyingType: 'index' | 'indexFuture' | 'stock') => void;
}

const InstrumentManager: React.FC<InstrumentManagerProps> = ({
  instrumentType,
  formData,
  handleInputChange,
  handleTradingInstrumentChange,
  handleUnderlyingTypeChange
}) => {
  const isTrading = instrumentType === 'trading';
  const configKey = isTrading ? 'tradingInstrumentConfig' : 'supportingInstrumentConfig';
  const exchange = formData.exchange || '';
  
  // Default type based on exchange: MCX uses 'futures', others use 'stock'
  const defaultType = exchange === 'MCX' ? 'futures' : 'stock';
  const config: SymbolConfig = formData[configKey] || { symbol: '', type: defaultType, timeframes: [] };
  const supportingEnabled = formData.supportingInstrumentEnabled !== false;
  
  // Local state for UI selections (not persisted in config)
  const [symbolType, setSymbolType] = React.useState<'index' | 'stock'>('index');
  const [instrumentClass, setInstrumentClass] = React.useState<'equity' | 'futures' | 'options'>(() => {
    // Initialize based on config type if available
    if (config.type === 'stock') return 'equity';
    if (config.type === 'futures') return 'futures';
    if (config.type === 'options') return 'options';
    return 'options'; // default to options for NSE
  });
  
  // MCX instrument class state
  const [mcxInstrumentClass, setMcxInstrumentClass] = React.useState<'futures' | 'options'>(() => {
    if (config.type === 'options') return 'options';
    return 'futures';
  });

  const updateConfig = (updates: Partial<SymbolConfig>) => {
    const newConfig = { ...config, ...updates };
    handleInputChange(configKey, newConfig);
  };

  // Add default timeframe if none exist and ensure correct type for MCX
  React.useEffect(() => {
    const updates: Partial<SymbolConfig> = {};
    
    if (config.timeframes.length === 0) {
      updates.timeframes = [{ 
        timeframe: '1m', 
        id: '1m',
        indicators: {},
        unit: 'minutes',
        number: 1
      }];
    }
    
    // For MCX, ensure type is futures if it's currently stock
    if (exchange === 'MCX' && config.type === 'stock') {
      updates.type = 'futures';
      if (isTrading) {
        handleInputChange('tradingInstrument', { type: 'futures' });
      }
    }
    
    if (Object.keys(updates).length > 0) {
      updateConfig(updates);
    }
  }, [exchange]);

  const handleTimeframesChange = (timeframes: TimeframeConfig[]) => {
    updateConfig({ timeframes });
  };

  // NSE/BSE handlers
  const handleSymbolTypeChange = (type: 'index' | 'stock') => {
    setSymbolType(type);
    // Reset instrument class to appropriate default: index -> futures, stock -> equity
    const newInstrumentClass = type === 'index' ? 'futures' : 'equity';
    setInstrumentClass(newInstrumentClass);
    updateConfig({ symbol: '', type: newInstrumentClass === 'equity' ? 'stock' : newInstrumentClass }); // Reset symbol and type when symbolType changes
  };

  const handleInstrumentClassChange = (classType: 'equity' | 'futures' | 'options') => {
    setInstrumentClass(classType);
    
    // Update config type
    updateConfig({ type: classType === 'equity' ? 'stock' : classType });
    
    if (isTrading) {
      const instrumentType = classType === 'equity' ? 'stock' : classType;
      
      // Determine underlyingType based on symbolType and exchange
      let underlyingType: 'index' | 'stock' | 'futures' | undefined;
      
      if (classType === 'options') {
        if (exchange === 'MCX') {
          underlyingType = 'futures'; // MCX options are always on futures
        } else {
          underlyingType = symbolType === 'index' ? 'index' : 'stock';
        }
      } else if (classType === 'futures') {
        underlyingType = symbolType === 'index' ? 'index' : 'stock';
      }
      
      const tradingInstrumentData = { 
        type: instrumentType,
        ...(underlyingType && { underlyingType })
      };
      
      console.log('Setting tradingInstrument:', tradingInstrumentData);
      handleInputChange('tradingInstrument', tradingInstrumentData);
    }
  };

  const handleSymbolChange = (symbol: string) => {
    updateConfig({ symbol });
  };

  const handleContractMonthChange = (month: string) => {
    updateConfig({ contractMonth: month });
  };

  // MCX handlers
  const handleCommodityChange = (commodity: string) => {
    updateConfig({ symbol: commodity });
  };

  const handleMCXContractTypeChange = (type: 'current' | 'next') => {
    // Map contract type to expiry_type: current=M0, next=M1
    const expiryType = type === 'current' ? 'M0' : 'M1';
    updateConfig({ expiry_type: expiryType });
  };

  const handleMCXInstrumentClassChange = (classType: 'futures' | 'options') => {
    console.log('🔧 [MCX] Instrument class changed to:', classType);
    setMcxInstrumentClass(classType);
    updateConfig({ type: classType });
    if (isTrading) {
      const tradingInstrumentData = { 
        type: classType,
        underlyingType: classType === 'options' ? 'futures' : undefined
      };
      console.log('💾 [MCX] Saving tradingInstrument:', tradingInstrumentData);
      handleInputChange('tradingInstrument', tradingInstrumentData);
    }
  };

  if (isTrading) {
    return (
      <div className="h-full flex flex-col overflow-y-auto p-2">
        {exchange === 'NSE' || exchange === 'BSE' ? (
          <NSEBSEInstrumentConfig
            instrumentType="trading"
            config={config}
            exchange={exchange as 'NSE' | 'BSE'}
            symbolType={symbolType as 'index' | 'stock'}
            instrumentClass={instrumentClass as 'equity' | 'futures' | 'options'}
            onSymbolTypeChange={handleSymbolTypeChange}
            onInstrumentClassChange={handleInstrumentClassChange}
            onSymbolChange={handleSymbolChange}
            onTimeframesChange={handleTimeframesChange}
            onContractMonthChange={handleContractMonthChange}
            strategyType={formData.strategyType}
            onStrategyTypeChange={(value) => handleInputChange('strategyType', value)}
          />
        ) : exchange === 'MCX' ? (
          <MCXInstrumentConfig
            config={config}
            instrumentClass={mcxInstrumentClass}
            onCommodityChange={handleCommodityChange}
            onContractTypeChange={handleMCXContractTypeChange}
            onInstrumentClassChange={handleMCXInstrumentClassChange}
            onTimeframesChange={handleTimeframesChange}
            strategyType={formData.strategyType}
            onStrategyTypeChange={(value) => handleInputChange('strategyType', value)}
          />
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Please select an exchange first
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Supporting instrument (only for NSE/BSE)
  if (exchange === 'MCX') {
    return null; // No supporting instrument for MCX
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto p-2">
      <Card className="mb-3">
        <CardContent className="py-3 flex items-center justify-between">
          <span className="text-sm font-medium">Enable Supporting Instrument</span>
          <Switch
            checked={supportingEnabled}
            onCheckedChange={(checked) => handleInputChange('supportingInstrumentEnabled', checked)}
          />
        </CardContent>
      </Card>
      
      {supportingEnabled ? (
        <NSEBSEInstrumentConfig
          instrumentType="supporting"
          config={config}
          exchange={exchange as 'NSE' | 'BSE'}
          symbolType={symbolType as 'index' | 'stock'}
          instrumentClass={instrumentClass as 'equity' | 'futures' | 'options'}
          onSymbolTypeChange={handleSymbolTypeChange}
          onInstrumentClassChange={handleInstrumentClassChange}
          onSymbolChange={handleSymbolChange}
          onTimeframesChange={handleTimeframesChange}
          onContractMonthChange={handleContractMonthChange}
        />
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Enable supporting instrument to configure settings
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InstrumentManager;